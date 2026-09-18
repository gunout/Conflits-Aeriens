// server.js
import express from 'express';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import NodeCache from 'node-cache';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// CORS : autoriser GitHub Pages + localhost + Render
const io = new SocketIO(server, {
    cors: {
        origin: '*', // À restreindre en production
        methods: ['GET', 'POST']
    }
});

const cache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

/* ============================================================
   HELPERS
   ============================================================ */
async function cachedFetch(url, ttl = 60) {
    const key = 'c_' + Buffer.from(url).toString('base64').slice(0, 40);
    if (cache.has(key)) return cache.get(key);
    try {
        const r = await fetch(url, {
            headers: { 'User-Agent': 'RadarAerien/1.0 (veille open source)' }
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        cache.set(key, data, ttl);
        return data;
    } catch (e) {
        console.error('[fetch]', url.slice(0, 60), '→', e.message);
        return null;
    }
}

function normalizeAircraft(a, military = false) {
    return {
        icao24: a.hex,
        callsign: (a.flight || a.hex || '').trim() || '—',
        lon: a.lon,
        lat: a.lat,
        alt: typeof a.alt_baro === 'number' ? Math.round(a.alt_baro * 0.3048) : null,
        vel: typeof a.gs === 'number' ? Math.round(a.gs * 0.514444) : null,
        country: a.t || a.r || '—',
        military
    };
}

/* ============================================================
   AGRÉGATION
   ============================================================ */
async function collectAllData() {
    const [civils, military, quakesRaw, newsRaw] = await Promise.all([
        cachedFetch('https://api.adsb.lol/v2/point/48.85/2.35/250', 30),
        cachedFetch('https://api.adsb.lol/v2/mil', 120),
        cachedFetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson', 300),
        cachedFetch('https://api.gdeltproject.org/api/v2/doc/doc?query=aviation&mode=artlist&maxrecords=50&format=json&timespan=1d', 600)
    ]);

    const flights = (civils?.ac || [])
        .map(a => normalizeAircraft(a, false))
        .filter(f => f.lat != null && f.lon != null);

    const militaryFlights = (military?.ac || [])
        .map(a => normalizeAircraft(a, true))
        .filter(f => f.lat != null && f.lon != null);

    const quakes = (quakesRaw?.features || []).map(f => ({
        id: f.id,
        time: new Date(f.properties.time).toISOString(),
        mag: f.properties.mag,
        place: f.properties.place,
        lat: f.geometry.coordinates[1],
        lon: f.geometry.coordinates[0],
        url: f.properties.url
    })).sort((a, b) => new Date(b.time) - new Date(a.time));

    const news = (newsRaw?.articles || []).map((a, i) => ({
        id: 'n' + i,
        title: a.title || '—',
        url: a.url,
        source: a.domain || 'GDELT',
        country: a.sourcecountry || '—',
        seen: a.seendate
    }));

    return {
        timestamp: new Date().toISOString(),
        flights,
        military: militaryFlights,
        quakes,
        news,
        notams: [],   // Placeholder — PocketWorld peut être ajouté
        conflicts: [] // Calculé côté client pour l'instant
    };
}

/* ============================================================
   WEBSOCKET
   ============================================================ */
let broadcaster = null;

io.on('connection', (socket) => {
    console.log('[WS] Client connecté :', socket.id);

    collectAllData().then(data => socket.emit('data-update', data));

    if (!broadcaster) {
        broadcaster = setInterval(async () => {
            try {
                const data = await collectAllData();
                io.emit('data-update', data);
                console.log(`[WS] Diffusion : ${data.flights.length} civils, ${data.military.length} mil, ${data.quakes.length} séismes`);
            } catch (e) {
                console.error('[WS] Erreur diffusion :', e.message);
            }
        }, 15000);
    }

    socket.on('disconnect', () => {
        console.log('[WS] Client déconnecté :', socket.id);
    });
});

/* ============================================================
   ENDPOINTS REST
   ============================================================ */
app.get('/api/health', (req, res) => res.json({
    status: 'ok',
    clients: io.engine.clientsCount,
    cached: cache.keys().length,
    uptime: Math.round(process.uptime()) + 's'
}));

app.get('/api/all', async (req, res) => {
    const data = await collectAllData();
    res.json(data);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Radar Aérien France démarré sur http://localhost:${PORT}`);
    console.log(`   WebSocket : ws://localhost:${PORT}`);
    console.log(`   Health    : http://localhost:${PORT}/api/health`);
});

# 📡 Radar Aérien France

Outil tiers **non gouvernemental** de veille aérienne open source.
Aucune affiliation avec l'État français ou l'Armée de l'Air.

## ✨ Fonctionnalités

- 🛰️ Radar temps réel avec balayage animé (Canvas)
- ✈️ Détection ADS-B civils + flux militaire (`/v2/mil`)
- 🚫 Zones NOTAM et détection de conflits en temps réel
- 📊 Graphiques d'altitude, vitesse, séismes (Chart.js)
- 🌐 Filtres géographiques au clic sur la carte (Leaflet.draw)
- 📥 Export CSV structuré et PDF professionnel
- 🔌 WebSocket temps réel (mise à jour toutes les 15 s)
- 💾 Cache serveur 60 s pour éviter les rate-limits
- 🗺️ Historique de trajectoires (IndexedDB, 1 h glissante)

## 🚀 Installation locale

```bash
git clone https://github.com/VOTRE-USER/radar-aerien.git
cd radar-aerien
npm install
npm start
# → http://localhost:3000
```

## 📡 Sources de données

| Source | Type | Licence |
|---|---|---|
| [adsb.lol](https://adsb.lol) | ADS-B civils + militaires | Open data |
| [adsb.fi](https://adsb.fi) | Miroir ADS-B | Open data |
| [USGS](https://earthquake.usgs.gov) | Séismes mondiaux | Domaine public |
| [GDELT](https://www.gdeltproject.org) | Actualités | Domaine public |
| [OpenStreetMap](https://www.openstreetmap.org) | Fond de carte | ODbL |

## 🏗️ Architecture

```
┌─────────────┐    WebSocket     ┌──────────────┐
│  Frontend   │ ◄──────────────► │   Backend    │
│  (Canvas +  │   (Socket.io)    │  (Express +  │
│  Leaflet)   │                  │   Node.js)   │
└─────────────┘                  └──────┬───────┘
                                        │
                                        │ fetch + cache
                                        ▼
                          ┌──────────────────────────┐
                          │  adsb.lol · USGS · GDELT │
                          │  NOTAM · OpenStreetMap   │
                          └──────────────────────────┘
```

## ⚖️ Mentions légales

- **Ce projet n'est ni édité, ni approuvé, ni affilié à l'État français.**
- Aucune marque protégée n'est utilisée (Marianne, "République Française").
- La charte visuelle s'inspire du DSFR (licence MIT) sans reprendre ses marques.
- Les données ADS-B proviennent de réseaux communautaires ouverts.
- Les aéronefs militaires ne sont visibles que s'ils émettent un transpondeur ADS-B.

## 📄 Licence

Code sous MIT — voir [LICENSE](LICENSE).
Données sous leurs licences respectives.

--- 


<div align="center">

# 📡 Radar Aérien France

**Dashboard de veille aérienne open source — ADS-B + séismes en temps réel**

[![License: MIT](https://img.shields.io/badge/License-MIT-000091?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/HTML)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/fr/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/fr/docs/Web/CSS)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white)](https://gunout.github.io/Conflits-Aeriens/)
[![Zero Backend](https://img.shields.io/badge/Backend-Aucun-18753C?style=for-the-badge&logo=serverless&logoColor=white)](#-architecture)
[![No API Key](https://img.shields.io/badge/API%20Key-Aucune-E1000F?style=for-the-badge&logo=keycdn&logoColor=white)](#-sources-de-données)
[![Status](https://img.shields.io/badge/Status-Actif-00d4ff?style=for-the-badge&logo=statuspage&logoColor=white)](https://gunout.github.io/Conflits-Aeriens/)
[![PRs Welcome](https://img.shields.io/badge/PRs-Bienvenues-ff69b4?style=for-the-badge&logo=git&logoColor=white)](#-contribuer)
[![Made in France](https://img.shields.io/badge/Made%20in-France-000091?style=for-the-badge&logo=hexo&logoColor=white)](#-mentions-légales)

**🔗 [Accéder au dashboard](https://gunout.github.io/Conflits-Aeriens/)**

</div>

---

## 📖 Sommaire

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Sources de données](#-sources-de-données)
- [Installation locale](#-installation-locale)
- [Déploiement](#-déploiement)
- [Détection militaire](#-détection-militaire)
- [Structure du projet](#-structure-du-projet)
- [Limitations techniques](#-limitations-techniques)
- [Contribuer](#-contribuer)
- [Mentions légales](#-mentions-légales)
- [Licence](#-licence)

---

## 🎯 Aperçu

**Radar Aérien France** est un tableau de bord de surveillance aérienne **100 % open source** qui agrège en temps réel :

- ✈️ Les positions ADS-B des aéronefs au-dessus de la France métropolitaine
- 🚨 Une détection **probabiliste** des aéronefs militaires (OTAN, USAF, Armée de l'Air)
- 🌍 Les séismes mondiaux (M ≥ 2.5) des dernières 24 heures
- 🗺️ Une carte interactive avec filtre géographique au clic

Le tout dans une interface inspirée du **Système de Design de l'État (DSFR)**, entièrement hébergée sur **GitHub Pages**, sans backend, sans clé API, sans inscription.

> **⚠️ Outil tiers non gouvernemental** — Ce projet n'est ni édité, ni approuvé, ni affilié à l'État français ou à l'Armée de l'Air. Voir [Mentions légales](#-mentions-légales).

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 🛰️ **Radar animé** | Balayage radar Canvas avec blips proportionnels à l'altitude |
| 🔀 **Fusion multi-sources** | adsb.lol + adsb.fi interrogés **en parallèle**, dédoublonnés par ICAO24 |
| 🎯 **Détection militaire** | Classification par code type OTAN, immatriculation et base readsb (`dbFlags`) |
| 🗺️ **Carte interactive** | Leaflet + OpenStreetMap avec filtre géographique par rectangle |
| 📊 **Graphiques** | Histogrammes altitudes, vitesses, magnitudes sismiques (Chart.js) |
| 🔍 **Recherche & tri** | Tableau triable par indicatif, type, altitude, vitesse |
| 📥 **Export** | CSV structuré (3 blocs) et PDF professionnel (jsPDF + AutoTable) |
| 🔄 **Repli automatique** | Cascade de 6 proxys CORS si les sources natives échouent |
| 📱 **Responsive** | Interface adaptée mobile, tablette et desktop |
| ⚡ **Zéro dépendance backend** | Aucun serveur Node.js, aucune clé API, aucun compte |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     NAVIGATEUR (Client)                      │
│                                                              │
│   ┌─────────────┐  ┌────────────┐  ┌──────────────┐         │
│   │  Radar      │  │  Carte     │  │  Graphiques  │         │
│   │  (Canvas)   │  │  (Leaflet) │  │  (Chart.js)  │         │
│   └──────┬──────┘  └─────┬──────┘  └──────┬───────┘         │
│          │                │                │                 │
│          └────────────────┼────────────────┘                 │
│                           ▼                                  │
│              ┌────────────────────────┐                      │
│              │  fetchFlights()        │                      │
│              │  (fusion parallèle)    │                      │
│              └────────┬───────────────┘                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌──────────────┐
   │adsb.lol │    │ adsb.fi │    │ PocketWorld  │
   │(direct) │    │(direct) │    │  (repli)     │
   │ CORS ✅ │    │ CORS ✅ │    │ via 6 proxys │
   └─────────┘    └─────────┘    └──────────────┘
        │               │               │
        └───────────────┼───────────────┘
                        ▼
                 ┌─────────────┐
                 │  Fusion     │
                 │  par ICAO24 │
                 └──────┬──────┘
                        ▼
              ┌─────────────────────┐
              │  ~120 aéronefs      │
              │  uniques affichés   │
              └─────────────────────┘
```

**Aucun serveur intermédiaire** : tout se passe dans le navigateur de l'utilisateur. La déduplication, la détection militaire et la fusion sont effectuées côté client en JavaScript.

---

## 📡 Sources de données

| Source | Type | CORS | Clé API | Fréquence |
|---|---|---|---|---|
| [**adsb.lol**](https://adsb.lol) | ADS-B civils + militaires | ✅ Natif | ❌ Aucune | 45 s |
| [**adsb.fi**](https://adsb.fi) | Miroir ADS-B | ✅ Natif | ❌ Aucune | 45 s |
| [**PocketWorld**](https://pocketworld.org) | Agrégateur (repli) | ❌ Via proxy | ❌ Aucune | 45 s |
| [**USGS**](https://earthquake.usgs.gov) | Séismes mondiaux | ✅ Natif | ❌ Aucune | 45 s |

**Couverture géographique** : 5 cercles de 150 à 250 NM couvrent l'hexagone entier (Paris, Lyon, Bordeaux, Lille, Brest, Nice, Corse, Toulouse, Biarritz, Perpignan).

**Fréquence de rafraîchissement** : 45 secondes — un compromis raisonnable pour ne pas saturer les serveurs bénévoles.

---

## 🚀 Installation locale

### Prérequis

- Un navigateur moderne (Firefox, Chrome, Safari, Edge — versions 2022+)
- **Aucun** outil de build, **aucun** Node.js, **aucun** npm

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/gunout/Conflits-Aeriens.git
cd Conflits-Aeriens

# 2. Ouvrir le fichier dans le navigateur
# Option A — Directement
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows

# Option B — Avec un serveur local (recommandé pour éviter les CORS)
python3 -m http.server 8080
# → http://localhost:8080
```

C'est tout. Le dashboard est opérationnel.

---

## 🌐 Déploiement

### GitHub Pages (méthode utilisée)

1. Forkez ou clonez ce dépôt
2. Allez dans **Settings → Pages**
3. Source : `Deploy from a branch`
4. Branch : `main` — Folder : `/ (root)`
5. Cliquez sur **Save**

Votre dashboard sera disponible à l'adresse :

```
https://VOTRE-USER.github.io/Conflits-Aeriens/
```

> **💡 Astuce** : créez un fichier `.nojekyll` (vide) à la racine pour désactiver Jekyll et servir directement `index.html`.

### Autres options

| Plateforme | Méthode | Backend |
|---|---|---|
| **Vercel** | Import Git + deploy automatique | Non requis |
| **Netlify** | Glisser-déposer le dossier | Non requis |
| **Cloudflare Pages** | Import Git | Non requis |
| **Surge.sh** | `npx surge` | Non requis |

---

## 🎯 Détection militaire

La détection est **probabiliste** et repose sur 3 critères cumulés :

### 1. Base readsb (`dbFlags`)

Le bit 1 du champ `dbFlags` fourni par adsb.lol/adsb.fi marque directement les aéronefs connus comme militaires dans la base de données communautaire.

```js
military: !!((ac.dbFlags || 0) & 1)
```

### 2. Bloc d'adresses ICAO24 (US Military)

Le bloc `ADF7C7` → `AFFFFF` est réservé aux aéronefs militaires américains.

```js
function isUsMilitaryHex(hex) {
    const h = (hex || '').toUpperCase();
    return h.length === 6 && h >= 'ADF7C7' && h <= 'AFFFFF';
}
```

### 3. Codes type OTAN + Immatriculation

```js
const MILITARY_TYPECODES = new Set([
    'C17', 'C130', 'KC135', 'A400', 'F16', 'F35', 'RAFA', ...
]);
const MILITARY_REG_PREFIXES = ['FR', 'FU', 'FM']; // F-R (Air), F-U (Marine), F-M (ALAT)
```

> **⚠️ Précision importante** : le préfixe **F-G** correspond à l'aviation **civile** privée française (Cessna, DR400…) et **n'est pas** considéré comme militaire. Seuls F-R, F-U et F-M le sont.

### Limites

- ❌ Un aéronef militaire volant **transpondeur éteint** est invisible
- ❌ Un aéronef civil enregistré dans un bloc militaire (rare) peut générer un faux positif
- ❌ La classification n'est **pas officielle** — elle ne remplace pas les systèmes de défense

---

## 📂 Structure du projet

```
Conflits-Aeriens/
├── index.html              # Dashboard complet (HTML + CSS + JS)
├── README.md               # Ce fichier
├── LICENSE                 # Licence MIT
├── .nojekyll               # Désactive Jekyll sur GitHub Pages
└── .gitignore              # Fichiers exclus du dépôt
```

**Un seul fichier autonome** — aucune dépendance locale, aucun build.

### Dépendances CDN (chargées à la volée)

| Librairie | Version | Usage |
|---|---|---|
| Leaflet | 1.9.4 | Carte interactive |
| Leaflet.draw | 1.0.4 | Filtre géographique |
| Chart.js | 4.4.1 | Graphiques |
| jsPDF | 2.5.1 | Export PDF |
| jsPDF-AutoTable | 3.8.2 | Tableaux PDF |
| Font Awesome | 6.7.2 | Icônes |

---

## ⚠️ Limitations techniques

| Limitation | Cause | Impact |
|---|---|---|
| **Aéronefs militaires invisibles** | Transpondeur éteint ou mode non coopératif | Détection partielle |
| **Couverture dépendante des récepteurs** | Réseau bénévole ADS-B | Zones rurales moins couvertes |
| **Latence 5–15 s** | Propagation ADS-B → serveur → navigateur | Non temps réel strict |
| **Rate-limits possibles** | Quotas gratuits des APIs | Repli automatique |
| **Précision militaire** | Classification probabiliste | Faux positifs/négatifs possibles |

> Ce radar est un **outil de veille open source**, il **ne remplace pas** les systèmes officiels de surveillance aérienne (radar primaire, IFF, Link 16).

---

## 🤝 Contribuer

Les contributions sont **bienvenues** ! Voici comment procéder :

1. **Forkez** le projet
2. **Créez** une branche (`git checkout -b feature/amelioration`)
3. **Commitez** vos changements (`git commit -m "Ajout: nouvelle fonctionnalité"`)
4. **Poussez** la branche (`git push origin feature/amelioration`)
5. **Ouvrez** une Pull Request

### Idées d'améliorations

- [ ] Ajouter les NOTAM (zones d'exclusion)
- [ ] Intégrer les trajectoires historiques (IndexedDB)
- [ ] Filtrer par compagnie aérienne
- [ ] Mode sombre (DSFR `data-fr-scheme="dark"`)
- [ ] PWA avec Service Worker (hors ligne)
- [ ] Notifications push pour événements critiques
- [ ] Ajouter l'API EMSC (séismes Europe)
- [ ] Ajouter les volcans actifs (Smithsonian)

### Signaler un bug

Ouvrez une [issue](https://github.com/gunout/Conflits-Aeriens/issues) avec :

- La description du problème
- Le navigateur utilisé (Firefox/Chrome/etc.)
- Les logs de la console (F12)
- Une capture d'écran si possible

---

## ⚖️ Mentions légales

### Statut

**Radar Aérien France** est un **outil tiers indépendant**. Il n'est :

- ❌ **Ni édité** par l'État français ou un organisme public
- ❌ **Ni approuvé** par l'Armée de l'Air, la DGAC ou l'Aviation Civile
- ❌ **Ni affilié** à un quelconque service gouvernemental
- ❌ **Ni un système de défense** ou de surveillance officiel

### Design

La charte visuelle s'inspire du **Système de Design de l'État (DSFR)**, publié sous **licence MIT**. Aucun élément d'identité protégé n'est utilisé :

- ✅ Couleurs Bleu France (`#000091`) et Rouge Marianne (`#E1000F`) — libres d'usage
- ✅ Typographie Marianne — open source (SIL OFL)
- ❌ **Logo Marianne** — marque figurative de l'État, **non utilisée**
- ❌ **Bloc-marque "République Française"** — **non utilisé**

### Données

Les données affichées proviennent exclusivement de **sources publiques et ouvertes** :

- **ADS-B** : signaux émis volontairement par les aéronefs, captés par des réseaux communautaires bénévoles
- **USGS** : domaine public
- **OpenStreetMap** : ODbL

**Aucune donnée classifiée, confidentielle ou à caractère personnel n'est traitée.**

### Responsabilité

Ce dashboard est fourni **en l'état**, sans garantie d'exactitude, d'exhaustivité ou de disponibilité. Les auteurs ne sauraient être tenus responsables d'un usage inapproprié des informations affichées.

---

## 📄 Licence

Ce projet est sous **licence MIT** — voir [LICENSE](LICENSE).

```
MIT License

Copyright (c) 2026 Radar Aérien France

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Les **données** restent sous leurs licences respectives (domaine public pour USGS, ODbL pour OpenStreetMap, open data pour ADS-B).

---

<div align="center">

**📡 Radar Aérien France**

*Veille aérienne open source — Outil tiers non gouvernemental*

[![GitHub Stars](https://img.shields.io/github/stars/gunout/Conflits-Aeriens?style=social)](https://github.com/gunout/Conflits-Aeriens)
[![GitHub Forks](https://img.shields.io/github/forks/gunout/Conflits-Aeriens?style=social)](https://github.com/gunout/Conflits-Aeriens)
[![GitHub Issues](https://img.shields.io/github/issues/gunout/Conflits-Aeriens?style=social)](https://github.com/gunout/Conflits-Aeriens/issues)

**Fait en France — © 2026**

</div>

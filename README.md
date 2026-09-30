<div align="center">

# 🪐 Solar System Explorer

**An interactive 3D space exploration experience built for the modern web**

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r185-black?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.2-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Tests](https://img.shields.io/badge/Tests-50%20passing-brightgreen?style=flat-square)]()
[![License](https://img.shields.io/badge/License-Educational-blue?style=flat-square)]()

<br/>

*Explore our solar system and deep space through real-time WebGL rendering, custom GLSL shaders, and procedural astrophysical models — all running in your browser.*

<br/>

[**Live Demo**](https://solar-system-explorer-ten-phi.vercel.app/) · [**Report Bug**](https://github.com/rakeshkumar0804/Solar-System-Explorer/issues) · [**Request Feature**](https://github.com/rakeshkumar0804/Solar-System-Explorer/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Deep Space — Cosmic Atlas](#-deep-space--cosmic-atlas)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Getting Started](#-getting-started)
- [Keyboard Shortcuts](#%EF%B8%8F-keyboard-shortcuts)
- [Project Architecture](#-project-architecture)
- [Testing & Quality](#-testing--quality)
- [Attribution](#-attribution)

---

## 🔭 Overview

Solar System Explorer is a high-performance, WebGL-powered space exploration application that lets you orbit planets, compare celestial bodies, and journey into deep space — all from your browser window.

The app opens directly into an interactive 3D view of Earth and the Moon, with no loading screens or artificial delays. Every planet features physically-inspired materials with directional sunlight, and the experience extends beyond the solar system into an illustrated **Cosmic Atlas** with 11 deep-space destinations.

> **Note:** This is an educational visual explorer. Orbital sizes, distances, and timing are illustrative — this is not an ephemeris or physical simulation.

---

## ✨ Features

### Solar System

| Feature | Description |
|:---|:---|
| **11 Celestial Bodies** | Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto |
| **Earth Materials** | Day/night terminator · city lights at night · specular ocean reflections · animated cloud layer · Rayleigh atmospheric scattering |
| **Saturn Rings** | Double-sided textured rings with planet-on-ring and ring-on-planet shadow casting |
| **Free Camera** | Drag to orbit · scroll/pinch to zoom · click any planet to fly to it |
| **System Overview** | Compressed bird's-eye view with selectable planets, orbital paths, and labels |
| **Comparison Suite** | Side-by-side visual comparison with true astronomical diameter ratios and presets |
| **Guided Tour** | Automated cinematic tour cycling through major landmarks |
| **Display Settings** | High / Balanced / Low quality · atmosphere/cloud toggles · reduced-motion support |
| **Audio & Fullscreen** | Optional ambient space audio · native fullscreen toggle |
| **WebGL Fallback** | Clearly labelled static fallback UI if WebGL 2 is unavailable |

### Deep Space — Cosmic Atlas

| # | Destination | Type | Highlights |
|:---:|:---|:---|:---|
| 01 | **Milky Way** | Spiral Galaxy | Multi-arm disk · central bar/bulge · Solar System position marker |
| 02 | **Black Hole** | Gravitational Singularity | Luminous accretion disk · real-time gravitational lensing · Einstein ring |
| 03 | **Messier 13** | Globular Cluster | Dense spherical star distribution · Hercules Cluster |
| 04 | **Orion Nebula** | Stellar Nursery | Volumetric gas · dark dust · embedded young Trapezium stars |
| 05 | **Pulsar** | Neutron Star | Tilted magnetic dipole · sweeping radiation beams · slowed rotation |
| 06 | **Crab Nebula** | Supernova Remnant | Expanding filament shell · turbulent gas volume |
| 07 | **Andromeda** | Neighbour Galaxy | Broad stellar disk · galactic core · dark dust lanes |
| 08 | **TRAPPIST-1** | Exoplanet System | 7 planets orbiting an ultracool dwarf · imagined surfaces |
| 09 | **Comet** | Ice & Dust | Rough nucleus · coma · straight ion tail · curved dust tail |
| 10 | **Solar Frontiers** | Belt Systems | Main Asteroid Belt · Kuiper Belt · planetary landmarks |
| 11 | **Wormhole** | Theoretical | Embedding diagram · clearly labelled as hypothetical |

**Atlas Features:**
- Searchable destination browser with category filters (*Galaxies & Gravity · Life of Stars · Worlds & Frontiers · Theoretical*)
- Interactive field notes with model limitations and NASA source references for every scene
- Three camera perspectives (Home / Above / Edge) with zoom, reset, and pause controls
- Adaptive quality budgets that cap shader iterations and render resolution on high-DPI screens
- Lazy-loaded chapter — mounts one renderer at a time; returning restores your previous state

---

## 🛠️ Tech Stack

| Layer | Technologies |
|:---|:---|
| **Frontend** | React 19 · TypeScript 6 · Tailwind CSS 4 |
| **3D Engine** | Three.js r185 · React Three Fiber · React Three Drei |
| **Shaders** | Custom GLSL (volumetrics · raymarching · gravitational lensing · atmospheric scattering) |
| **State** | Zustand · React hooks |
| **Animation** | Framer Motion · requestAnimationFrame with delta-time |
| **Build** | Vite 8 · code-split lazy loading |
| **Testing** | Vitest 5 · Testing Library · Node test runner |
| **Linting** | Oxlint |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `^22.22.2` or `^24.15.0` or `>=26.0.0`
- **npm** `>=10.0.0`

### Installation

```bash
# Clone the repository
git clone https://github.com/rakeshkumar0804/Solar-System-Explorer.git

# Navigate to the project directory
cd Solar-System-Explorer

# Install dependencies
npm ci

# Start the development server
npm run dev
```

Open **http://localhost:5173** in your browser. Planetary textures are bundled locally — no external CDN required.

### Production Build

```bash
# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|:---:|:---|
| <kbd>Space</kbd> | Pause / resume animation |
| <kbd>←</kbd> <kbd>→</kbd> | Previous / next world or destination |
| <kbd>1</kbd>–<kbd>8</kbd> | Direct select Mercury through Neptune |
| <kbd>0</kbd> | Select Sun |
| <kbd>9</kbd> | Select Pluto |
| <kbd>C</kbd> | Open comparison suite |
| <kbd>O</kbd> | System overview |
| <kbd>R</kbd> | Reset camera |
| <kbd>Esc</kbd> | Close dialog / stop tour |

> Form fields and buttons retain their native keyboard behavior.

---

## 📁 Project Architecture

```
Solar-System-Explorer/
├── public/
│   └── textures/                    # 27 locally bundled planet maps & thumbnails
│       ├── earth.jpg                # Diffuse · night · clouds · normal · specular
│       ├── saturn-rings.png         # Translucent ring texture
│       └── thumbs/                  # Optimized WebP previews
│
├── src/
│   ├── App.tsx                      # Chapter router with lazy loading
│   ├── main.tsx                     # Entry point
│   │
│   ├── explorer/                    # ── Core Solar System ──────────────────
│   │   ├── SolarExplorer.tsx        # Main UI · navigation · settings · audio
│   │   ├── SolarScene.tsx           # R3F Canvas · lighting · camera · stars
│   │   ├── Planet.tsx               # Planet meshes · texture loading · materials
│   │   ├── Dialogs.tsx              # Comparison modal · info drawer · credits
│   │   ├── shaders.ts              # Earth day/night · atmosphere · ring GLSL
│   │   ├── catalog.ts              # Planet data · presentation · tour order
│   │   ├── math.ts                 # Scale factors · animation helpers
│   │   │
│   │   ├── deep/                    # ── Cosmic Atlas (Deep Space) ─────────
│   │   │   ├── DeepSpaceExplorer.tsx  # Atlas UI · destination strip · search
│   │   │   ├── DeepScene.tsx          # Core 3 scenes (galaxy · hole · cluster)
│   │   │   ├── ExpandedScenes.tsx     # 8 expansion scenes
│   │   │   ├── catalog.ts            # 11 destinations · quality budgets
│   │   │   ├── shaders.ts            # Galaxy · black hole · cluster GLSL
│   │   │   ├── expandedShaders.ts     # Nebula · pulsar · comet · wormhole GLSL
│   │   │   ├── particles.ts          # Point-cloud generators
│   │   │   └── deep.css              # Deep Space styling
│   │   │
│   │   └── __tests__/               # ── Test Suites ──────────────────────
│   │       ├── app.test.tsx           # 12 explorer interaction tests
│   │       ├── deep.test.tsx          # 19 deep space boundary tests
│   │       └── math.test.ts          # 8 numerical precision tests
│   │
│   ├── components/                  # Legacy 3D components (retained for reference)
│   ├── data/                        # Planet data · themes · spacecraft catalog
│   ├── types/                       # TypeScript type definitions
│   └── utils/                       # Audio · WebGL detection · comparison math
│
├── verification/                    # 13 model & shader verification screenshots
├── ASSET-CREDITS.md                 # Full NASA/USGS texture attribution
├── DEEP_SPACE_REVIEW.md            # Atlas audit & remaining checks
├── LOCAL_REVIEW.md                  # Solar explorer verification records
└── UPDATE-INSTRUCTIONS.md          # Patch application guide
```

---

## 🧪 Testing & Quality

```bash
# Run all tests (legacy Node runner + Vitest)
npm test

# Run linter
npm run lint

# Type-check + production build
npm run build
```

### Test Coverage

| Suite | Tests | Focus |
|:---|:---:|:---|
| `comparison.test.ts` | 11 | Diameter ratios · string encoding · WebGL state contracts |
| `math.test.ts` | 8 | Scale factors · coordinate transforms · ratio bounds |
| `app.test.tsx` | 12 | Direct mount · world selection · comparison presets · speed controls · dialog focus |
| `deep.test.tsx` | 19 | All 11 scene transitions · atlas search · geometry bounds · ray budget caps |
| **Total** | **50** | **All passing** ✅ |

---

## 📄 Attribution

All planetary textures and NASA mission data references are documented in [`ASSET-CREDITS.md`](ASSET-CREDITS.md). Visual models and deep-space shaders are illustrative educational models — not research-grade simulations.

Third-party imagery retains its respective NASA / USGS / public domain licensing.

---

<div align="center">

**Built with ❤️ by [Rakesh Kumar](https://github.com/rakeshkumar0804)**

⭐ Star this repo if you found it interesting!

</div>

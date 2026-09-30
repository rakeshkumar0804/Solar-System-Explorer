# Interactive Solar System Explorer & Cosmic Atlas

An immersive, high-performance 3D space exploration and cosmic atlas application built with **React 19**, **Three.js / React Three Fiber**, **TypeScript**, **Tailwind CSS**, and **Vite**.

Explore the Solar System with physically-inspired day/night planetary materials, real-time orbital visualization, celestial comparison tools, and an expanded **Cosmic Atlas** featuring 11 interactive deep-space destinations powered by custom GLSL shaders and procedural point-cloud engines.

---

## Key Features

### 1. Solar System Explorer
- **Direct Launch:** Opens directly into the interactive 3D explorer without artificial boot delay.
- **Detailed Planetary Materials:**
  - **Earth:** Dynamic day/night terminator shading, nighttime city lights, specular ocean reflection, realistic cloud layers, and Rayleigh atmospheric scattering glow.
  - **Saturn:** Double-sided textured ring system with accurate ring-on-planet and planet-on-ring shadowing.
  - **The Moon & Terrestrial / Gas Worlds:** High-resolution surface maps for the Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto.
- **Interactive Controls:** Free-orbit camera (drag to rotate, scroll/pinch to zoom), planet focus tracking, system overview mode, and animated orbital paths.
- **Guided Cosmic Tour:** Automated cinematic tour cycling across major celestial landmarks.
- **Planetary Comparison Suite:** Dual-body visual comparison accurately scaled to true astronomical diameter ratios.
- **Display & Quality Settings:** High / Balanced / Low performance modes, reduced-motion preferences, cloud and atmosphere toggles, and WebGL 2 fallback.

### 2. Cosmic Atlas (11 Deep Space Destinations)
Choose **Deep space** in the top navigation to explore eleven custom-rendered astrophysical illustrations and theoretical models:
1. **Milky Way:** Multi-layered spiral galaxy model with bulge stars, dust lanes, and solar position marker.
2. **Black Hole:** Non-rotating black hole with luminous accretion disk and real-time gravitational light deflection / Einstein ring effects.
3. **Messier 13:** Dense spherical globular star cluster model inspired by the Hercules Cluster.
4. **Orion Nebula:** Volumetric diffuse interstellar gas, dark dust clouds, and embedded young stars.
5. **Pulsar:** Rapidly rotating magnetized neutron star with tilted magnetic dipole field and illustrative radiation beams.
6. **Crab Nebula:** Supernova remnant featuring turbulent glowing gas volumes and expanding filament shells.
7. **Andromeda (M31):** Massive spiral disk, bright galactic core, and dark dust lanes.
8. **TRAPPIST-1:** The famous ultracool dwarf system with all 7 exoplanets on synchronized orbital planes.
9. **Comet:** Icy nucleus, expanding coma, straight blue ion tail, and curved white dust tail.
10. **Solar Frontiers:** Schematic overview of the Main Asteroid Belt, Kuiper Belt, and outer solar system boundaries.
11. **Wormhole:** Theoretical spacetime embedding diagram with dual-throat distortion visualization.

Each destination includes categorized filtering (Galaxies & Gravity, Life of Stars, Worlds & Frontiers, Theoretical), interactive field notes, model limitations, and NASA science references.

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| <kbd>Space</kbd> | Pause or resume animation |
| <kbd>←</kbd> / <kbd>→</kbd> | Navigate to previous / next world or destination |
| <kbd>1</kbd> – <kbd>8</kbd> | Direct select Mercury through Neptune |
| <kbd>0</kbd> / <kbd>9</kbd> | Direct select Sun / Pluto |
| <kbd>C</kbd> | Open Planetary Comparison Suite |
| <kbd>O</kbd> | Switch to System Overview |
| <kbd>R</kbd> | Reset camera orientation |
| <kbd>Esc</kbd> | Close active dialog / modal / atlas, or stop tour |

---

## Tech Stack & Architecture

- **Core Framework:** React 19, TypeScript 6
- **3D Graphics Engine:** Three.js, React Three Fiber (R3F), React Three Drei
- **Styling & UI:** Tailwind CSS 4, Lucide React icons
- **Shaders & Physics:** Custom GLSL vertex & fragment shaders (volumetrics, raymarching, gravitational lensing, atmospheric scattering)
- **Build Tool:** Vite 8
- **Testing & Quality:** Vitest 5, Testing Library, Oxlint

### Project Directory Structure

```text
├── public/
│   └── textures/             # Locally bundled planetary textures & thumbnails
│       └── thumbs/           # Optimized WebP preview thumbnails
├── src/
│   ├── explorer/             # Core Solar System & Cosmic Atlas Rebuild
│   │   ├── deep/             # Deep Space chapter (11 scenes, shaders, particles, atlas)
│   │   │   ├── DeepScene.tsx
│   │   │   ├── DeepSpaceExplorer.tsx
│   │   │   ├── ExpandedScenes.tsx
│   │   │   ├── catalog.ts
│   │   │   └── shaders.ts
│   │   ├── Planet.tsx        # Planetary meshes, textures, normal/specular maps
│   │   ├── SolarScene.tsx     # 3D R3F Canvas, lighting, camera controls
│   │   ├── SolarExplorer.tsx  # Main UI, navigation, settings, audio integration
│   │   ├── Dialogs.tsx       # Comparison modal, info drawer, credit dialogs
│   │   ├── shaders.ts        # Earth day/night, atmosphere, and ring shaders
│   │   └── __tests__/        # Vitest behavioral and mathematical unit tests
│   ├── App.tsx               # Top-level lazy-loaded chapter router
│   └── main.tsx              # Application entry point
├── verification/             # Model and shader verification captures
├── ASSET-CREDITS.md          # Full texture, imagery, and NASA source credits
├── DEEP_SPACE_REVIEW.md      # Deep Space chapter audit & test records
└── LOCAL_REVIEW.md           # Solar Explorer build & feature verification
```

---

## Getting Started

### Prerequisites
- **Node.js:** `^22.22.2` or `^24.15.0` (Node 24.x recommended)
- **npm:** `^10.0.0` or later

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/rakeshkumar0804/Solar-System-Explorer.git
   cd Solar-System-Explorer
   ```

2. **Install dependencies:**
   ```bash
   npm ci
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open **http://127.0.0.1:5173/** in your browser.

4. **Run tests:**
   ```bash
   npm test
   ```
   *(Executes all 50 unit and integration tests across both legacy and Vitest suites).*

5. **Build for production:**
   ```bash
   npm run build
   npm run preview
   ```

---

## Quality Assurance & Verification

- **50 / 50 Automated Tests Passing:**
  - `src/explorer/__tests__/math.test.ts`: Scale factor math, coordinate transformations, and ratio bounds.
  - `src/explorer/__tests__/app.test.tsx`: Direct mount, world selections, comparison swap/presets, speed controls, dialog focus trap.
  - `src/explorer/__tests__/deep.test.tsx`: Deep Space chapter boundaries, all 11 scene transitions, search filtering, ray budget bounding, geometry normal validation.
  - `src/utils/__tests__/comparison.test.ts`: Celestial diameter comparison precision and WebGL fallback contracts.
- **Static Analysis:** Clean pass with `oxlint`.
- **Bundle Optimization:** Code-split chunks for lazy-loaded chapters (`SolarScene`, `DeepSpaceExplorer`, `DeepScene`).

---

## Attribution & Credits

- All planetary map textures and NASA mission data references are locally bundled and credited in detail in [**ASSET-CREDITS.md**](ASSET-CREDITS.md).
- Visual models and deep-space shaders are illustrative educational models designed for scientific visualization and learning.

---

## License

This project is created for educational and interactive exploration purposes. Third-party texture maps and imagery retain their respective NASA / USGS / public domain licenses as documented in [ASSET-CREDITS.md](ASSET-CREDITS.md).

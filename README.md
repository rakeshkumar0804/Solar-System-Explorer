<div align="center">

# ?? Interactive Solar System Explorer

An immersive, high-performance 3D space exploration application built with **React 19**, **Three.js / React Three Fiber**, **TypeScript**, and **Tailwind CSS v4**. Explore our solar system, study planetary telemetry, compare celestial scales, and journey into deep-space cosmic phenomena.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20Deployment-7928CA?style=for-the-badge&logo=vercel&logoColor=white)](https://solar-system-explorer-rakesh.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rakeshkumar0804/Solar-System-Explorer)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

### ?? [**Launch Live Demo**](https://solar-system-explorer-rakesh.vercel.app) ? ?? [**Watch Cosmic Tour**](https://solar-system-explorer-rakesh.vercel.app) ? ?? [**Compare Celestial Bodies**](https://solar-system-explorer-rakesh.vercel.app)

</div>

---

## ? Key Features

### ?? 1. Accurate 3D Celestial Physics & Geometry
- **True 3D Spheres & Shader Materials**: Smooth physical materials with bump mapping, atmospheric luminescence, axial tilts, and real-time orbital rotations.
- **Sun Corona & Core**: Luminous emissive core surrounded by a soft volumetric solar halo with multi-layered point lighting.
- **Saturn & Uranus Rings**: Semi-transparent double-sided ring geometries with alpha particle maps.
- **Planetary Moons**: Orbiting satellite systems including Earth's Moon, Galilean satellites, and Titan.
- **Instanced Asteroid Belt**: 650+ unique procedural asteroids rotating within the Mars-Jupiter orbital gap.

### ?? 2. Deep-Space Objects & Astrophysical Phenomena
Explore 9 outer deep-space landmarks positioned across the perimeter:
1. **Supermassive Black Hole ("Gargantua")**: Relativistic accretion disk with photon sphere and event horizon void.
2. **Einstein-Rosen Bridge (Wormhole)**: Four-dimensional spacetime funnel with iridescent particle distortion.
3. **Vela Pulsar**: Rotating neutron star emitting twin relativistic magnetic beam flares.
4. **Halley's Comet**: Icy nucleus with active glowing dust and plasma tail.
5. **Stellar Nebula**: Volumetric molecular cloud of ionized hydrogen nursery particles.
6. **Globular Star Cluster**: Spherical cluster of tightly gravitationally bound ancient stars.
7. **Andromeda Galaxy (M31)**: Giant spiral galaxy spanning ~1 trillion stars.
8. **NGC 1365 (Great Barred Spiral Galaxy)**: Prominent central stellar bar with active galactic nucleus.
9. **Milky Way Core**: Spiral center housing Sagittarius A*.

### ?? 3. Dedicated Celestial Comparison Suite
- **Dual-Selector Interface**: Compare any two celestial bodies side-by-side (Sun, 8 Planets, Pluto, and Moon).
- **Proportional Visual Scale Preview**: Dynamic visual bubbles maintaining exact equatorial diameter ratios with color tints and ring accents.
- **Side-by-Side Telemetry Matrix**: Compares Classification, Mass, Diameter, Surface Gravity, Surface Temperature, Distance from Sun, Rotation Period (Day), Orbital Period (Year), Moons Count, and Atmospheric Composition.
- **One-Click Presets**:
  - `Earth vs. Mars`
  - `Earth vs. Venus (Twin Planet)`
  - `Jupiter vs. Saturn (Gas Giants)`
  - `Sun vs. Jupiter (Star Scale)`

### ?? 4. Circumstellar Goldilocks Habitable Zone
- Luminous emerald/cyan translucent volumetric band spanning the scaled liquid water zone (0.95 ? 1.37 AU).
- Complete with dashed boundary limit rings and minimal non-intrusive 3D telemetry badge.

### ?? 5. Automated Cinematic Cosmic Tour & Overview Reset
- **Cosmic Tour**: Automated cinematic fly-through stepping through key landmarks (`Sun` ? `Earth` ? `Saturn` ? `Black Hole` ? `Milky Way` ? `Andromeda Galaxy`) with smooth camera interpolation.
- **One-Click Overview**: Instantly glides back to the default wide-angle isometric bird's-eye perspective (`[0, 75, 125]` ? `[0, 0, 0]`).

### ?? 6. Single Source-of-Truth Raycaster Cursor Engine
- Default canvas cursor displays a standard arrow/grab cursor across empty space.
- Raycaster automatically activates the interactive **Hand Pointer** (`pointer`) whenever hovering over any planet, the Sun, moons, deep-space phenomena, or planetary orbit ring ribbons.

### ?? 7. Glassmorphic UI & Celestial Themes
- **Time Speed Control**: Granular slider from `-0.5x` (subtle rewind) to `+10.0x` (forward speed) with double-click reset.
- **4 Space Theme Presets**:
  - ?? *Cosmic Purple*
  - ?? *Deep Space Blue*
  - ?? *Emerald Nebula*
  - ?? *Solar Flare Amber*
- **Rich Telemetry Drawer**: 4 dedicated tabs per body (*Overview*, *Telemetry*, *Science / Geology*, *Facts & Trivia*).
- **Ambient Space Audio**: Procedural atmospheric audio synthesizer with mute toggle.

---

## ?? Keyboard Shortcuts

| Key | Action |
|---|---|
| <kbd>Space</kbd> | Toggle Time Progression / Pause |
| <kbd>Esc</kbd> | Reset View / Close Telemetry Drawer / Exit Compare |
| <kbd>C</kbd> | Toggle Celestial Body Comparison Modal |
| <kbd>0</kbd> | Focus on **The Sun** |
| <kbd>1</kbd> ? <kbd>8</kbd> | Focus on Planets (**Mercury** through **Neptune**) |
| <kbd>9</kbd> | Focus on **Pluto** |
| <kbd>O</kbd> | Toggle Planetary Orbit Lines |
| <kbd>L</kbd> | Toggle 3D Labels & Badges |
| <kbd>T</kbd> | Cycle Space Theme Presets |
| <kbd>M</kbd> | Toggle Ambient Audio |

---

## ??? Tech Stack & Architecture

- **Core Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics & WebGL**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://github.com/pmndrs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Camera Controls**: Drei native `<CameraControls />` (Kinematic damping & zero matrix corruption)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/) + Glassmorphic Backdrop Filters
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

---

## ?? Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rakeshkumar0804/Solar-System-Explorer.git
   cd Solar-System-Explorer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173/](http://localhost:5173/) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## ?? Project Structure

```
Solar-System-Explorer/
??? public/                     # Static assets
??? src/
?   ??? components/
?   ?   ??? 3d/
?   ?   ?   ??? AsteroidBelt.tsx      # Procedural instanced asteroid field
?   ?   ?   ??? CameraController.tsx  # Smooth CameraControls & focus target engine
?   ?   ?   ??? CursorManager.tsx     # Centralized Raycaster hover cursor detector
?   ?   ?   ??? HabitableZone.tsx     # Volumetric Goldilocks habitable band
?   ?   ?   ??? OrbitTrail.tsx        # Graphic orbit circles with hover ribbons
?   ?   ?   ??? Planet.tsx            # 3D planet spheres, rings, moons, and labels
?   ?   ?   ??? Scene.tsx             # Primary Three.js canvas scene hierarchy
?   ?   ?   ??? SpaceObjects.tsx      # 9 deep space objects with custom visuals
?   ?   ?   ??? Sun.tsx               # Glowing core Sun with volumetric halo
?   ?   ??? ui/
?   ?       ??? CompareModal.tsx      # Dual-selector comparison modal & scale ratio
?   ?       ??? ControlPanel.tsx      # Bottom-left glassmorphic control dock
?   ?       ??? ControlsOverlay.tsx   # Bottom-right navigation legend
?   ?       ??? InfoPanel.tsx         # Slide-out 4-tab astrophysical telemetry drawer
?   ?       ??? Navbar.tsx            # Top header, Overview, Cosmic Tour, & Fullscreen
?   ?       ??? SpaceObjectsMenu.tsx  # Cosmic phenomena toggle switches
?   ??? data/
?   ?   ??? planetsData.ts            # Solar system celestial bodies dataset
?   ?   ??? spaceObjects.ts           # 9 deep-space objects telemetry dataset
?   ?   ??? themes.ts                 # 4 cosmic color theme configurations
?   ??? types/
?   ?   ??? space.ts                  # TypeScript interfaces and data contracts
?   ??? utils/
?   ?   ??? audio.ts                  # Procedural space audio synthesizer
?   ?   ??? proceduralTextures.ts     # Procedural canvas textures & color maps
?   ?   ??? useHoverCursor.ts         # Cursor helper utilities
?   ??? App.tsx                       # Root state management & tour controller
?   ??? index.css                     # Tailwind CSS v4 imports & cursor rules
?   ??? main.tsx                      # Application entry point
??? package.json
??? tsconfig.json
??? vite.config.ts
??? README.md
```

---

## ?? License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ?? by Rakesh Kumar. Exploring the cosmos through interactive 3D WebGL.</sub>
</div>

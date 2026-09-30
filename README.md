# Solar System Explorer — local rebuild

A solar-system explorer and an illustrated cosmic atlas for Rakesh Kumar, built with React, TypeScript, Three.js, React Three Fiber, and Vite.

The opening view features Earth and the Moon. Planet surfaces use locally bundled imagery, with directional sunlight, a day/night Earth material, city lights, ocean highlights, clouds, a thin atmosphere, and Saturn ring shadows. A quieter dark interface keeps the selected world prominent.

## Run locally

Use **Node.js 24.15 or later in the 24.x line**. Node 22.22.2 or later in the 22.x line is also supported. Older Node 18/20 instructions from the original README do not apply to this dependency set.

For a fresh installation from the complete rebuild ZIP, open a terminal in the folder containing `package.json`, then run:

```bash
npm ci
npm run dev
```

Open **http://127.0.0.1:5173/**. Dependency installation needs an internet connection; planetary textures are bundled and served locally. Stop the server with Ctrl+C.

If you already have the working rebuild and are applying `Solar-Explorer-Cosmic-Atlas-Update.zip`, follow **UPDATE-INSTRUCTIONS.md**. Merge that patch into your existing project, then run `npm run dev`; this update adds no dependencies.

If port 5173 is already occupied, stop the other server or use `npm run dev -- --port 5174`. Both dev and preview servers bind to the local loopback address.

For the production build and local preview:

```bash
npm run build
npm run preview
```

The production preview runs at **http://127.0.0.1:4173/**. These commands do not deploy, commit, or push anything.

## Included experience

- Close views of the Sun, eight planets, Pluto, and the Moon; drag to orbit and scroll or pinch to zoom.
- A compressed solar-system overview with selectable planets, labels, and orbit paths.
- Earth with day/night shading, night lights, cloud shading, normal detail, ocean reflections, and atmospheric glow in Balanced/High quality.
- Saturn’s textured rings, including the planet’s shadow on its rings and the rings’ shadow on the planet in Balanced/High quality.
- Comparison selectors and presets, including a consistent Earth–Moon comparison. Circle diameters use the data’s actual diameter ratios.
- Pause/resume, animation speed, a timed guided tour, optional ambient audio, and fullscreen where supported.
- Three quality levels, atmosphere/cloud controls, reduced-motion support, keyboard controls, and a clearly labelled static fallback if WebGL 2 cannot start.

The overview’s sizes, orbital distances, positions, and timing are illustrative. Earth–Moon separation in the close view is also compressed. This is an educational visual explorer, not an ephemeris or physical simulation. Maps include enhanced colours and reconstructed regions; Pluto is a grayscale mosaic with incomplete coverage.

## Deep Space

Choose **Deep space** in the top navigation, then **All destinations** to browse or search eleven destinations:

- **Milky Way:** a layered spiral-galaxy model with representative stars, a dust layer, and an approximate Solar System marker.
- **Black hole:** an illustrative non-rotating black hole, a luminous accretion disk, and approximate light bending. Orbit it to inspect the distorted disk from different angles.
- **Messier 13:** a spherical star-cluster model inspired by the Hercules Cluster.
- **Orion Nebula:** a volume of illuminated gas, dark dust, and representative young stars.
- **Pulsar:** a neutron star with a slowly rotating tilted magnetic field and illustrated radiation beams.
- **Crab Nebula:** a supernova-remnant model combining a glowing volume and a shell of filaments.
- **Andromeda:** a broad stellar disk, central bulge, and approximate dust lanes.
- **TRAPPIST-1:** seven labelled planets moving around an ultracool dwarf, with imagined surfaces and compressed spacing.
- **Comet:** a rough nucleus, coma, straight ion tail, and curved dust tail.
- **Solar frontiers:** a separate schematic of the asteroid belt and Kuiper Belt, with planetary landmarks.
- **Wormhole:** a clearly labelled hypothetical embedding diagram. It does not represent an observed object or an established traversable portal.

Each destination includes field notes, model limitations, and a NASA source. These scenes are illustrations, not measured star maps or research-grade physics simulations. They introduce no third-party image assets or new npm dependencies.

The atlas groups destinations into Galaxies & gravity, Life of stars, Worlds & frontiers, and Theoretical. Search and category filters work together. The destination strip scrolls horizontally; previous/next controls also cycle through the collection.

The chapter loads on entry and mounts one renderer at a time. Returning restores the selected planet/overview, animation speed, pause state, and display settings. The solar tour stops and optional ambient audio is muted when entering Deep Space. Camera orientation and illustrative animation phase reset when a scene is remounted.

Deep Space supports three camera perspectives, zoom/reset, pause, quality controls, and reduced-motion preferences. Space pauses motion, left/right arrows change destinations, and R resets the camera. The atlas, field notes, and help pause the scene while open. Black-hole and volume views cap render resolution and shader iterations to bound work on large or high-DPI screens. Pulsar rotation is slowed and uses no rapid flashing.

See **DEEP_SPACE_REVIEW.md** for expansion verification and remaining browser checks.

## Keyboard controls

| Key | Action |
| --- | --- |
| Space | Pause or resume animation |
| Left / right arrow | Previous or next world |
| 1–8 | Mercury through Neptune |
| 0 / 9 | Sun / Pluto |
| C | Open comparison |
| O | Open system overview |
| Escape | Close a dialog or settings; stop the tour |

Form fields and buttons keep their native keyboard behavior. The Moon is available in the destination bar and through the next/previous controls.

## Checks and review

```bash
npm test
npm run lint
npm run build
```

See **LOCAL_REVIEW.md** for the original solar rebuild and **DEEP_SPACE_REVIEW.md** for the current atlas results and remaining localhost checks. The images in `verification/` are standalone shader/material checks, not browser screenshots or proof of the full interface layout.

## Source layout

- `src/App.tsx`: chapter navigation and lazy-loading boundary.
- `src/explorer/SolarExplorer.tsx`: preserved solar-system interface, state, playback, settings, and fallback UI.
- `src/explorer/deep/`: Deep Space interface, scenes, shaders, representative star distributions, and camera/quality budgets.
- `src/explorer/SolarScene.tsx`: lazy-loaded scene, camera controls, stars, and system overview.
- `src/explorer/Planet.tsx` and `shaders.ts`: planet geometry and materials.
- `src/explorer/Dialogs.tsx`: comparison, details, and credits.
- `src/explorer/catalog.ts` and `math.ts`: presentation data, Moon data, scales, and animation helpers.
- `src/explorer/explorer.css`: responsive interface styling.
- `public/textures/`: locally served planet imagery and thumbnails.
- `src/explorer/__tests__/`: behavior and numerical checks.

The previous `src/components/` implementation and legacy deep-space object sources are retained for reference, but are not mounted by the new application. The current atlas is implemented in `src/explorer/deep/`. Existing reference planet data, comparison helpers, and ambient audio are reused.

## Attribution

See **ASSET-CREDITS.md** for the imagery sources, licences, and adaptations. Credits also appear inside the app under Sources & about. Third-party imagery has its own licensing terms; this rebuild does not assign a new licence to the project’s source code.

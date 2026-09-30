# Initial solar rebuild review — 30 September 2026

For the subsequent Deep Space expansion, see **DEEP_SPACE_REVIEW.md**. The results below document the initial approved solar rebuild.

This is a local source rebuild. No commit, push, pull request, or deployment was made. The working repository remains at baseline commit `2b639d3d9d38b7f5be84f4ff4ccc6217cd925eb4`, with the rebuild present as uncommitted changes.

The uploaded files contained root configuration and documentation. Missing application sources were recovered from the repository linked by the uploaded README, and the supplied configuration was applied before rebuilding. The download contains the complete source, required textures, lockfile, and documentation. Install dependencies with `npm ci`; see README.md for the localhost commands.

## Completed checks

| Check | Result |
| --- | --- |
| Clean dependency install | `npm ci --no-audit --no-fund` passed using Node 24.19.0 / npm 11.9.0 |
| TypeScript and production build | `npm run build` passed |
| Existing comparison tests | 11 passed |
| New numerical, asset, and React DOM tests | 20 passed; total across both suites: **31 passed** |
| New interface and scene lint | `npx oxlint src/App.tsx src/explorer` passed without warnings |
| Whole-project lint | Exit 0, with 19 warnings in retained older components |
| Local HTTP serving | Dev server started at `http://127.0.0.1:5173/`; entry modules and every bundled texture/thumbnail returned HTTP 200 |
| Custom shader compilation | Five material programs compiled and linked in an offscreen software OpenGL context |
| Material inspection | Earth and Saturn offscreen renders inspected; included in `verification/` |
| Patch whitespace | `git diff --check` passed |

The React DOM tests cover world selection, Earth–Moon preset consistency, swapping and equal-body comparisons, very small diameter ratios, pause/speed behavior, keyboard form handling, modal playback suspension, overview navigation, no-WebGL fallback, retry, and display settings. Numerical tests cover every body-pair ratio, asset presence, deterministic stars, compressed orbital positions, and suspended-tab timing.

## What still needs browser review

**The complete application has not been visually verified in a browser.** The available browser environment blocked access to the workspace’s localhost with `net::ERR_BLOCKED_BY_CLIENT`. No public preview was created because review was requested on localhost.

React tests use jsdom and mock the 3D scene. They do not verify browser layout, native dialog focus trapping, WebGL rendering, touch controls, or frame rate. The offscreen material check uses actual project geometry, textures, and shader code with Three.js colour/tone-mapping chunks in a ModernGL/EGL context; it is not a browser/WebGL compatibility test. Its two PNG files are material checks, not full-interface screenshots.

On your machine, review these items after starting the server:

1. Open Earth in Balanced quality. Check surface detail, the day/night boundary, night lights, thin atmosphere, and the Moon. Drag, zoom, and reset the camera.
2. Select Saturn. Check the rings, their angle, and the shadows. Visit the other worlds, including the grayscale Pluto mosaic.
3. Open System view, select a planet, and try the orbit/label settings. Pause at 5× speed, then resume; pause should stop animation while camera controls still work.
4. Compare Earth–Moon, swap them, and select Sun–Pluto. Both selectors, circle sizes, and table headings should agree.
5. Try the tour, audio, fullscreen, Escape, and keyboard navigation. Check that dialogs keep keyboard focus and restore it when closed.
6. Review narrow phone widths and touch gestures. Check text, buttons, the destination bar, and comparison tables for clipping or overlap.
7. Compare Low, Balanced, and High on your GPU. Check the console for shader/runtime errors and watch smoothness over a few minutes. No FPS claim has been measured.

## Known limits

- Vite reports a large lazy-loaded 3D chunk: approximately 940 kB minified / 252 kB gzip. The initial interface chunk is approximately 247 kB / 80 kB gzip; CSS is approximately 23 kB / 6 kB gzip. Planet textures add image downloads as worlds are visited. These are build sizes, not measured load-time or FPS results.
- The 19 existing lint warnings are in `CursorManager`, `Scene`, `SpaceObjectsMenu`, `AsteroidBelt`, and `SpaceObjects`. The new app does not mount those components.
- Low quality reduces geometry and pixel density and omits the detailed Earth/Saturn surface shaders, clouds, and atmospheres.
- Planetary reference values are inherited from the existing dataset, with explicit Moon data added. Positions, rotation rates, orbital paths, and view distances are illustrative, not live astronomy data. The guide is a timed sequence of worlds, not narrated audio.
- Prior deep-space scenes and colour themes remain in the older source but are not in the new interface.
- Maps are 2K imagery-based textures, with some enhanced colours/reconstructed terrain. Pluto’s 1K grayscale map has incomplete southern coverage. Credit and licence details are in ASSET-CREDITS.md and the app’s Sources & about dialog.

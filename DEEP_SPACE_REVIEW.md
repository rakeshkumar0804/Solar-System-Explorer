# Cosmic Atlas expansion — local review

This update expands the approved three-destination Deep Space chapter to eleven destinations. It adds Orion Nebula, a pulsar, Crab Nebula, Andromeda, TRAPPIST-1, a comet, solar frontiers, and a hypothetical wormhole diagram. A searchable atlas organizes the collection into four categories.

No commits, pushes, pull requests, or deployments were made. This patch applies to the existing local rebuild with the first Deep Space update already installed.

## Preservation

The approved solar-system renderer, planet materials and shaders, solar interface, comparison dialog, planetary data, texture files, package manifest, and lockfile are unchanged by this expansion. The original Deep Space shader and particle modules are also unchanged. The patch contains only the new or modified atlas files, updated documentation, and eight offscreen model-check images.

The solar chapter retains its existing behavior: its interface stays mounted while its renderer is unmounted in Deep Space. Returning preserves the chosen planet or overview, speed, pause state, and display options. The tour stops and ambient audio is muted when leaving the solar chapter. Camera orientation and illustrative animation phase restart when a renderer is remounted.

## Completed verification

| Check | Outcome |
| --- | --- |
| TypeScript and production build | Passed |
| Existing Node tests | 11 passed |
| Vitest numerical and DOM integration tests | 39 passed |
| Combined test count | **50 passed** |
| Lint on `src/App.tsx` and `src/explorer/` | Passed without warnings |
| Patch whitespace | `git diff --check` passed |
| Local serving | Entry, solar and atlas modules, styles, and a planet texture served HTTP 200 on loopback |
| Shader compatibility check | 10 custom programs compiled and linked as GLSL ES 3.00 on Mesa OpenGL ES 3.2 through EGL |
| Model inspection | All eight new destinations rendered and inspected offscreen |

Integration coverage includes all eleven destinations, source links, entry/return and preservation of solar settings, one mounted renderer, keyboard controls, graphics fallback and retry, camera/quality controls, pause behavior, atlas search and collection filtering, empty-result recovery, and focus restoration after closing the atlas. Numerical checks cover deterministic finite point data, geometry bounds and normals, the seven exoplanet paths, camera limits, and rendering budgets.

DOM tests mock the renderers. They verify application behavior, not actual browser canvas output, native focus trapping, touch input, or layout.

## Rendering budgets

Only the selected destination's scene is mounted. Three-dimensional noise textures and generated geometries are disposed on unmount. The atlas, field notes, and help pause motion while open; a hidden tab stops its render loop. Camera interaction works while paused.

| Quality | Galaxy stars | Cluster stars | Black-hole steps / pixel cap | Volume steps / pixel cap | Belt points |
| --- | ---: | ---: | ---: | ---: | ---: |
| Low | 12,000 | 7,000 | 64 / 320,000 | 40 / 180,000 | 1,800 |
| Balanced | 28,000 | 16,000 | 88 / 650,000 | 64 / 350,000 | 4,500 |
| High | 48,000 | 26,000 | 112 / 1,200,000 | 88 / 700,000 | 8,000 |

Volume limits apply to Orion, Crab, and the comet. Background star fields in the other new scenes use 600 / 1,400 / 2,400 points. Black-hole and volume views cap DPR at 0.75 / 1 / 1.25; other scenes cap DPR at 1 / 1.25 / 1.5, with additional pixel limits. The backing resolution can fall below CSS resolution on large screens. These are workload bounds, not measured frame-rate guarantees.

No new dependency is required. Deep Space is lazy-loaded on entry. Current production output is approximately 248 kB / 80 kB gzip for initial application JS, 64 kB / 22 kB gzip across the Deep Space interface and scene chunks, and 18 kB / 5 kB gzip for Deep Space CSS. The shared Three.js/Fiber/controls chunk remains approximately 906 kB / 241 kB gzip and still triggers Vite's existing large-chunk advisory. Unused legacy components retain their existing lint warnings.

## What the images and shader checks establish

The eight new PNGs in `verification/` use the actual custom shader code, shared geometry, point distributions, and camera settings in a standalone ModernGL/EGL renderer with Three.js tone/color chunks. The comet's standard-lit nucleus is approximated with the project's rock shader for that check. HTML scene labels and the application interface are absent from these images.

They are **offscreen model checks, not browser screenshots**. The separate GLSL ES compilation check catches shader syntax and linking issues in that driver; it does not establish compatibility or performance on every browser/GPU.

The available browser environment blocked workspace localhost with `net::ERR_BLOCKED_BY_CLIENT`. The eight new scenes have therefore not been visually or performance-verified in that browser. No public preview was created. The previously approved three destinations were already reviewed locally by the user.

## Quick localhost review

1. Run `npm run dev` in the existing folder containing `package.json`. Open Deep space, then All destinations; confirm the count is 11.
2. Search for "nebula", try a collection, clear the search, and open each of the eight additions. Try orbit, reset, and the three camera perspectives.
3. Pause the pulsar and TRAPPIST-1. Try Low/Balanced detail on the nebulae and comet; check smoothness on your laptop.
4. Return to Solar system and confirm the selected planet and settings remain. Check phone-width layout and the browser console once.

## Scientific scope

This is a curated eleven-destination educational atlas, not a catalog of everything in space. Each scene includes model limitations and a NASA reference. Nebula volumes, galaxy and cluster points, small-body positions, brightness, colours, and exoplanet surfaces are illustrative. Distances and sizes are often compressed or enlarged for visibility.

The black-hole view uses approximate light bending, not a research-grade relativity solver. The wormhole is explicitly hypothetical and shown as an embedding-style diagram: it is neither an observed object nor an established traversable route. Pulsar rotation is slowed for viewing, without rapid flashing. Solar frontiers is a separate schematic; it does not alter the approved solar-system overview.

# Imagery credits

## Solar System Scope / INOVE

Source: https://www.solarsystemscope.com/textures/

Licence: **Creative Commons Attribution 4.0 International**, https://creativecommons.org/licenses/by/4.0/

These maps are supplied by Solar System Scope / INOVE and are based on NASA imagery, with enhanced colours and reconstructed regions. They are illustrative planetary textures, not live imagery or uniformly measured true-colour maps.

The original downloads are under `https://www.solarsystemscope.com/textures/download/`:

| Local file in `public/textures/` | Original download |
| --- | --- |
| `sun.jpg` | `2k_sun.jpg` |
| `mercury.jpg` | `2k_mercury.jpg` |
| `venus.jpg` | `2k_venus_atmosphere.jpg` |
| `earth.jpg` | `2k_earth_daymap.jpg` |
| `earth-night.jpg` | `2k_earth_nightmap.jpg` |
| `earth-clouds.jpg` | `2k_earth_clouds.jpg` |
| `earth-normal.jpg` | `2k_earth_normal_map.tif` |
| `earth-specular.jpg` | `2k_earth_specular_map.tif` |
| `moon.jpg` | `2k_moon.jpg` |
| `mars.jpg` | `2k_mars.jpg` |
| `jupiter.jpg` | `2k_jupiter.jpg` |
| `saturn.jpg` | `2k_saturn.jpg` |
| `saturn-rings.png` | `2k_saturn_ring_alpha.png` |
| `uranus.jpg` | `2k_uranus.jpg` |
| `neptune.jpg` | `2k_neptune.jpg` |

Adaptations: files are renamed locally. Earth’s normal and specular TIFF maps were converted to JPEG at quality 94. Destination thumbnails in `public/textures/thumbs/` were resized to 256 × 128 and converted to WebP. Runtime lighting, shading, colour adjustment, and spherical projection change the displayed appearance.

## Pluto — New Horizons mosaic

Source: https://www.usgs.gov/media/images/pluto-global-mosaic-new-horizons-july-2017

Credit: **NASA / Johns Hopkins University Applied Physics Laboratory / Southwest Research Institute / Lunar and Planetary Institute**, via USGS Astrogeology. The source identifies the image as public domain.

Direct source image: https://d9-wret.s3.us-west-2.amazonaws.com/assets/palladium/production/s3fs-public/thumbnails/image/Pluto_NewHorizons_Global_Mosaic_300m_Jul2017_1024.jpg

Local file: `public/textures/pluto.jpg`. Its thumbnail is resized and WebP-compressed. This is a grayscale mosaic, dated July 2017. Dark southern areas represent missing image coverage, not a measured black surface.

## Verification images

`verification/earth-material-check.png` and `verification/saturn-material-check.png` are offscreen renders of this project’s materials using the credited textures. They inherit the relevant imagery attribution requirements above. They are not screenshots of the running browser application.


## Deep Space expansion

All eleven Deep Space destinations use project-authored procedural geometry, particle distributions, shaders, and generated noise, with no downloaded deep-space imagery. This includes the Milky Way, black hole, Messier 13, Orion Nebula, pulsar, Crab Nebula, Andromeda, TRAPPIST-1, comet, solar frontiers, and hypothetical wormhole diagram. Their model-check PNGs in `verification/` are offscreen renders of those illustrations, not browser screenshots.

Educational reference sources:

- NASA, Solar System facts: https://science.nasa.gov/solar-system/solar-system-facts/
- NASA, Galaxies: https://science.nasa.gov/universe/galaxies/
- NASA, Black holes: https://science.nasa.gov/universe/black-holes/
- NASA / Hubble, Messier 13: https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-13/
- NASA / Hubble, Messier 42: https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/
- NASA / Hubble, Pulsars: https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-pulsars/
- NASA / Hubble, Messier 1: https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-1/
- NASA / Hubble, Andromeda: https://science.nasa.gov/missions/hubble/nasas-hubble-traces-hidden-history-of-andromeda-galaxy/
- NASA, TRAPPIST-1: https://science.nasa.gov/universe/exoplanets/seven-rocky-trappist-1-planets-may-be-made-of-similar-stuff/
- NASA, Comets and other Solar System bodies: https://science.nasa.gov/learn/basics-of-space-flight/chapter1-3/
- NASA, Kuiper Belt facts: https://science.nasa.gov/solar-system/kuiper-belt/facts/
- NASA / Goddard, Cosmicopia questions about spacetime and wormholes: https://science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sp_sl.html

No scientific catalog or measured image is reproduced by these procedural scenes. Each scene’s field notes explain its approximations.

import type { DeepDestination, DestinationId } from './catalog';

export type Collection = 'Galaxies & gravity' | 'Life of stars' | 'Worlds & frontiers' | 'Theoretical';
export const COLLECTIONS: Collection[] = ['Galaxies & gravity', 'Life of stars', 'Worlds & frontiers', 'Theoretical'];
export const DESTINATION_META: Record<DestinationId, { collection: Collection; label: string; note: string }> = {
  'milky-way': { collection: 'Galaxies & gravity', label: 'GALAXY', note: 'Representative stars · not a measured star map' },
  'black-hole': { collection: 'Galaxies & gravity', label: 'BLACK HOLE', note: 'Approximate lensing · illustrative emission' },
  'messier-13': { collection: 'Life of stars', label: 'STAR CLUSTER', note: 'Representative stars · not a measured star map' },
  'orion-nebula': { collection: 'Life of stars', label: 'STELLAR NURSERY', note: 'Imagined volume · colour enhanced for visibility' },
  pulsar: { collection: 'Life of stars', label: 'NEUTRON STAR', note: 'Magnified star · rotation slowed · beams illustrated' },
  'crab-nebula': { collection: 'Life of stars', label: 'SUPERNOVA REMNANT', note: 'Representative filaments · not a measured reconstruction' },
  andromeda: { collection: 'Galaxies & gravity', label: 'NEIGHBOUR GALAXY', note: 'Illustrative star distribution · dust structure approximate' },
  'trappist-1': { collection: 'Worlds & frontiers', label: 'EXOPLANET SYSTEM', note: 'Compressed orbits · sizes enlarged · surfaces imagined' },
  comet: { collection: 'Worlds & frontiers', label: 'ICE & DUST', note: 'Representative comet · nucleus greatly enlarged' },
  'solar-frontiers': { collection: 'Worlds & frontiers', label: 'ASTEROIDS & KUIPER BELT', note: 'Compressed distances · dots represent small bodies' },
  wormhole: { collection: 'Theoretical', label: 'THOUGHT EXPERIMENT', note: 'Hypothetical geometry · no observed wormhole' },
};

export const EXPANSION_DESTINATIONS: DeepDestination[] = [
  {
    id: 'orion-nebula', title: 'Orion Nebula', shortTitle: 'Orion Nebula', category: '04 / WHERE STARS BEGIN',
    subtitle: 'Light finding its way through a cloud.',
    description: 'Rose-coloured folds of gas surround a luminous blue cavity. Turn the cloud to explore its depth, young stars, and dark threads of dust.',
    accent: '#deb3c5', metrics: [['CATALOG', 'Messier 42'], ['DISTANCE', '≈1,500 ly'], ['TYPE', 'Stellar nursery']],
    facts: [
      { title: 'A nearby nursery', text: 'The Orion Nebula is a large region of ongoing star formation in our own galaxy. It is bright enough to glimpse without a telescope from a dark sky.' },
      { title: 'Stars illuminate their birthplace', text: 'Hot young stars in the Trapezium cluster illuminate the surrounding gas. Dense dust can hide stars and carve dark silhouettes across the glowing cloud.' },
    ],
    modelNote: 'An artistic three-dimensional interpretation inspired by Orion, not a reconstruction of its measured gas distribution. Cloud structure, depth, illumination, and colours are illustrative. The cloud itself stays still while you orbit; real nebulae do not billow visibly over seconds.',
    source: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-42/', sourceLabel: 'NASA / Hubble · Messier 42',
  },
  {
    id: 'pulsar', title: 'Pulsar', shortTitle: 'Pulsar', category: '05 / A STELLAR LIGHTHOUSE',
    subtitle: 'A dead star. A remarkably steady signal.',
    description: 'A compact neutron star turns beneath a tilted magnetic field. Two illustrated beams sweep through space as its magnetic poles circle the spin axis.',
    accent: '#99dce9', metrics: [['REMNANT', 'Neutron star'], ['SIGNAL', 'Sweeping beams'], ['ROTATION', 'Slowed for viewing']],
    facts: [
      { title: 'Why it seems to pulse', text: 'A pulsar is a rotating neutron star whose radiation beam crosses our line of sight. Like a lighthouse, its beam can create a repeating signal even though the star keeps rotating continuously.' },
      { title: 'Two different axes', text: 'The magnetic axis can be tilted relative to the rotation axis. The luminous curves here illustrate that magnetic field; neither the curves nor the beams would look like solid structures to a nearby observer.' },
    ],
    modelNote: 'A generic educational pulsar. The star is enlarged, rotation greatly slowed, and field lines and radiation beams made visible. This is not a simulation of a particular pulsar or of its detailed magnetosphere. No rapid flashing is used.',
    source: 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-pulsars/', sourceLabel: 'NASA / Hubble · Pulsars',
  },
  {
    id: 'crab-nebula', title: 'Crab Nebula', shortTitle: 'Crab Nebula', category: '06 / AFTER THE EXPLOSION',
    subtitle: 'The long afterglow of a star’s last act.',
    description: 'A tangled shell of warm filaments surrounds a cool inner glow. These are the remains of a stellar explosion, with a pulsar buried at their heart.',
    accent: '#ddb594', metrics: [['CATALOG', 'Messier 1'], ['EVENT RECORDED', '1054 CE'], ['TYPE', 'Supernova remnant']],
    facts: [
      { title: 'A guest star becomes a nebula', text: 'Astronomers recorded a bright new star in 1054. We now associate that event with the supernova that produced the Crab Nebula.' },
      { title: 'An engine at the center', text: 'The remnant contains a pulsar: the compact core left behind by the exploding star. Its activity energizes the surrounding nebula while the expelled material continues to expand.' },
    ],
    modelNote: 'Illustrative remnant inspired by the Crab Nebula. Filaments and the inner glow are generated, not measured. Colours emphasize different structures. Expansion is not animated; the view rotates to reveal the model’s depth.',
    source: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-1/', sourceLabel: 'NASA / Hubble · Messier 1',
  },
  {
    id: 'andromeda', title: 'Andromeda', shortTitle: 'Andromeda', category: '07 / ANOTHER ISLAND OF STARS',
    subtitle: 'Our nearest large galactic neighbour.',
    description: 'A warm stellar disk and bright central bulge are crossed by dark dust lanes. Change the viewing angle to reveal the flattened shape beneath the familiar tilted silhouette.',
    accent: '#d8c2a9', metrics: [['CATALOG', 'Messier 31'], ['DISTANCE', '≈2.5 million ly'], ['TYPE', 'Spiral galaxy']],
    facts: [
      { title: 'A galaxy beyond our own', text: 'Andromeda is the nearest large galaxy to the Milky Way. Its enormous stellar population includes bright young blue stars, older stars, star clusters, and obscuring dust.' },
      { title: 'A disk viewed at an angle', text: 'From Earth, Andromeda appears strongly tilted. This model allows other viewpoints that no telescope near Earth could provide directly.' },
    ],
    modelNote: 'Illustrative stellar distribution with a central bulge and annular dust lanes. Positions, arm structure, inclination, colours, and brightness are approximate. It is not the Hubble mosaic or a measured three-dimensional catalog.',
    source: 'https://science.nasa.gov/missions/hubble/nasas-hubble-traces-hidden-history-of-andromeda-galaxy/', sourceLabel: 'NASA / Hubble · Andromeda',
  },
  {
    id: 'trappist-1', title: 'TRAPPIST-1', shortTitle: 'TRAPPIST-1', category: '08 / WORLDS AROUND ANOTHER SUN',
    subtitle: 'Seven worlds. One small, cool star.',
    description: 'Explore a compact family of planets around an ultracool red dwarf. Seven labelled worlds trace nested paths, all far closer to their star than Earth is to the Sun.',
    accent: '#e8b398', metrics: [['KNOWN PLANETS', '7'], ['DISTANCE', '≈40 ly'], ['HOST STAR', 'Ultracool dwarf']],
    facts: [
      { title: 'A very compact family', text: 'TRAPPIST-1 hosts seven roughly Earth-size planets. All seven orbits would fit inside Mercury’s orbit in our Solar System.' },
      { title: 'Worlds detected through starlight', text: 'These planets were detected through transits: small dips in starlight as a planet passes in front of the star. The surfaces shown here are imagined; Earth-size does not establish Earth-like conditions or life.' },
    ],
    modelNote: 'An illustrative overview with circular paths, compressed orbital spacing, enlarged bodies, and accelerated motion. Relative angular speeds are approximate. Surface textures are artistic, not telescope images or predictions of confirmed oceans or atmospheres.',
    source: 'https://science.nasa.gov/universe/exoplanets/seven-rocky-trappist-1-planets-may-be-made-of-similar-stuff/', sourceLabel: 'NASA · The seven TRAPPIST-1 planets',
  },
  {
    id: 'comet', title: 'A passing comet', shortTitle: 'Comet', category: '09 / A TRAVELLER FROM THE COLD',
    subtitle: 'Ice, dust, and two very different tails.',
    description: 'A rough, dark nucleus sits inside a luminous coma. A narrow blue ion tail stretches away from the Sun, beside a broader, gently curved trail of dust.',
    accent: '#a6d4df', metrics: [['SOLID CORE', 'Nucleus'], ['GLOWING HEAD', 'Coma'], ['TAILS', 'Dust + ions']],
    facts: [
      { title: 'A small body with a vast appearance', text: 'As a comet approaches the Sun, warming releases gas and dust from its icy nucleus. This material forms a surrounding coma and can extend into long tails.' },
      { title: 'Tails respond to the Sun', text: 'The ion tail is shaped by the solar wind and points away from the Sun. The dust tail responds differently to sunlight and orbital motion, so it can curve. A comet’s tail does not simply point backward along its path.' },
    ],
    modelNote: 'A representative comet, not a reconstruction of a named object. The nucleus is enormously enlarged relative to its coma and tails. Tail colours, glow, size, and dust structure are artistic. Sunward direction is indicated in the model.',
    source: 'https://science.nasa.gov/learn/basics-of-space-flight/chapter1-3/', sourceLabel: 'NASA · Comets and their tails',
  },
  {
    id: 'solar-frontiers', title: 'Solar frontiers', shortTitle: 'Solar frontiers', category: '10 / BETWEEN AND BEYOND THE PLANETS',
    subtitle: 'The worlds between the worlds.',
    description: 'Trace two reservoirs of small bodies: the main asteroid belt between Mars and Jupiter, and the broad Kuiper Belt beyond Neptune. Their shared plane connects them to the planetary family.',
    accent: '#b5c9df', metrics: [['INNER RESERVOIR', 'Asteroid belt'], ['OUTER RESERVOIR', 'Kuiper Belt'], ['KUIPER MAIN REGION', '≈30–50 AU']],
    facts: [
      { title: 'Rocky bodies closer to the Sun', text: 'The main asteroid belt lies between Mars and Jupiter. The points represent a sampling of small bodies, with their sizes enlarged so they remain visible.' },
      { title: 'An icy frontier', text: 'The main Kuiper Belt extends from around Neptune’s orbit, about 30 astronomical units from the Sun, to roughly 50 AU. Pluto is one of its best-known members. One AU is approximately the Earth–Sun distance.' },
      { title: 'Plenty of space between objects', text: 'The dense-looking dots are a visualization choice. Neither belt is a solid ring or a crowded wall of tumbling rocks.' },
    ],
    modelNote: 'A separate schematic overview. Radial distances are strongly compressed; dots, the Sun, and planets are enlarged. Small-body positions and orbital inclinations are representative, not an ephemeris. The more distant Oort Cloud is outside this view.',
    source: 'https://science.nasa.gov/solar-system/kuiper-belt/facts/', sourceLabel: 'NASA · Kuiper Belt facts',
  },
  {
    id: 'wormhole', title: 'Wormhole', shortTitle: 'Wormhole', category: '11 / A THEORETICAL POSSIBILITY',
    subtitle: 'A geometry to imagine. Not a place we have found.',
    description: 'Two broad surfaces narrow toward a connecting throat. This spatial diagram explores the idea behind a bridge through spacetime, using a surface we can turn and inspect.',
    accent: '#bdb2e5', metrics: [['STATUS', 'Hypothetical'], ['VIEW', 'Embedding diagram'], ['TRAVERSABILITY', 'Not established']],
    facts: [
      { title: 'A mathematical idea', text: 'A wormhole is a hypothetical connection between separated regions of spacetime. No wormhole has been observed. The Einstein–Rosen bridge is one historical mathematical construction, not evidence for a usable cosmic shortcut.' },
      { title: 'Reading the diagram', text: 'This surface represents a simplified spatial slice. The extra direction used to draw the bridge is a visualization aid, not a discovered external dimension. The grid is a coordinate guide, not material walls.' },
    ],
    modelNote: 'An artistic embedding diagram, not an optical view of a real object or a numerical solution of Einstein’s equations. It does not depict travel, promise traversability, or equate ordinary black holes with portals.',
    source: 'https://science.gsfc.nasa.gov/attic/cosmicopia.gsfc.nasa.gov/qa_sp_sl.html', sourceLabel: 'NASA / Cosmicopia · Wormholes and spacetime',
  },
];

export function matchDestinations(items: DeepDestination[], query: string, collection: Collection | 'All') {
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return items.filter(item => (collection === 'All' || DESTINATION_META[item.id].collection === collection) && words.every(word => `${item.title} ${item.shortTitle} ${item.category} ${DESTINATION_META[item.id].label} ${item.description}`.toLowerCase().includes(word)));
}

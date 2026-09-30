import type { Quality } from '../catalog';
import { EXPANSION_DESTINATIONS } from './expansionCatalog';

export type DestinationId = 'milky-way' | 'black-hole' | 'messier-13' | 'orion-nebula' | 'pulsar' | 'crab-nebula' | 'andromeda' | 'trappist-1' | 'comet' | 'solar-frontiers' | 'wormhole';
export type CameraPreset = 'home' | 'above' | 'edge';
export interface DeepDestination {
  id: DestinationId;
  title: string;
  shortTitle: string;
  category: string;
  subtitle: string;
  description: string;
  accent: string;
  metrics: [string, string][];
  facts: { title: string; text: string }[];
  modelNote: string;
  source: string;
  sourceLabel: string;
}

export const DESTINATIONS: DeepDestination[] = [
  {
    id: 'milky-way', title: 'The Milky Way', shortTitle: 'Milky Way', category: '01 / OUR HOME GALAXY',
    subtitle: 'Every world we know. One small address.',
    description: 'A luminous disk of stars, threaded with dust and wrapped around a bright central bulge. Somewhere along an arm, our Sun is just one light among many.',
    accent: '#b7cddd', metrics: [['STRUCTURE', 'Barred spiral'], ['STELLAR DISK', '100,000+ ly'], ['OUR LOCATION', 'Orion Spur']],
    facts: [
      { title: 'A view we can only reconstruct', text: 'We live inside the Milky Way, so we cannot photograph it from the outside. This view represents its broad structure: a central bar and bulge, spiral arms, and a thin stellar disk.' },
      { title: 'Finding home', text: 'The Solar System lies in the Orion Spur, between the Sagittarius and Perseus arms. The marker places home approximately within this model; it is not a navigational coordinate.' },
    ],
    modelNote: 'Illustrative galaxy model. Stars are representative samples; arm geometry, dust, brightness, and the Solar System marker are approximate. View rotation is accelerated.',
    source: 'https://science.nasa.gov/solar-system/solar-system-facts/', sourceLabel: 'NASA · Our Solar System in the Milky Way',
  },
  {
    id: 'black-hole', title: 'Black hole', shortTitle: 'Black hole', category: '02 / GRAVITY & LIGHT',
    subtitle: 'The shape of an absence.',
    description: 'Hot material traces a brilliant disk around a dark central shadow. Light bends on its way to you, revealing parts of the disk that should be hidden behind it.',
    accent: '#edc69c', metrics: [['CENTRAL BOUNDARY', 'Event horizon'], ['LIGHT EFFECT', 'Gravitational lensing'], ['MODEL', 'Non-rotating']],
    facts: [
      { title: 'A shadow, not a surface', text: 'The event horizon is the boundary beyond which light cannot escape. The larger dark silhouette seen against surrounding emission is the black hole’s shadow.' },
      { title: 'Why the disk appears to bend', text: 'Gravity changes the paths taken by light. Emission from behind the black hole can appear above and below it. The disk is flat in this model; its image is distorted on the way to the camera.' },
      { title: 'Black holes are not portals', text: 'A black hole is not an established route to another universe. Wormholes are a separate theoretical concept; their entry in this collection is explicitly a hypothetical diagram.' },
    ],
    modelNote: 'Illustrative non-rotating black hole with approximate light bending and an idealized thin disk. Colour, brightness, disk structure, and motion are artistic choices. This is not a measured reconstruction or a research-grade relativity simulation.',
    source: 'https://science.nasa.gov/universe/black-holes/', sourceLabel: 'NASA · Black holes',
  },
  {
    id: 'messier-13', title: 'Messier 13', shortTitle: 'Hercules Cluster', category: '03 / GLOBULAR CLUSTER',
    subtitle: 'A city made entirely of stars.',
    description: 'A dense, nearly spherical gathering of stars in Hercules. Orbit the cluster to see its crowded heart give way to a scattered halo of individual lights.',
    accent: '#c8d5ea', metrics: [['DISTANCE', '≈25,000 ly'], ['CONSTELLATION', 'Hercules'], ['TYPE', 'Globular cluster']],
    facts: [
      { title: 'A crowded stellar neighbourhood', text: 'Messier 13 contains more than 100,000 stars. Its center is much more densely populated than the region around our Sun.' },
      { title: 'Depth beyond the photograph', text: 'A telescope image projects the cluster onto the sky. This three-dimensional model lets you inspect a representative spherical distribution, with more stars concentrated toward its center.' },
    ],
    modelNote: 'Illustrative model inspired by Messier 13. Rendered points are a representative sample, not a catalog of measured star positions. Star sizes and brightness are exaggerated for visibility; view rotation is accelerated.',
    source: 'https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-13/', sourceLabel: 'NASA / Hubble · Messier 13',
  },
  ...EXPANSION_DESTINATIONS,
];
export const getDestination = (id: DestinationId) => DESTINATIONS.find(item => item.id === id)!;
export const QUALITY_BUDGETS: Record<Quality, { galaxyStars: number; clusterStars: number; maxDpr: number; raySteps: number }> = {
  low: { galaxyStars: 12000, clusterStars: 7000, maxDpr: 1, raySteps: 64 },
  auto: { galaxyStars: 28000, clusterStars: 16000, maxDpr: 1.25, raySteps: 88 },
  high: { galaxyStars: 48000, clusterStars: 26000, maxDpr: 1.5, raySteps: 112 },
};

export const EXPANDED_BUDGETS = {
  low: { volumeSteps: 40, fieldStars: 600, beltBodies: 1800 },
  auto: { volumeSteps: 64, fieldStars: 1400, beltBodies: 4500 },
  high: { volumeSteps: 88, fieldStars: 2400, beltBodies: 8000 },
} as const;
export const VOLUME_DESTINATIONS: DestinationId[] = ['orion-nebula', 'crab-nebula', 'comet'];
export const CAMERA_LIMITS: Record<DestinationId, [number, number]> = {
  'milky-way': [12, 55], 'black-hole': [12, 45], 'messier-13': [8, 45],
  'orion-nebula': [15, 50], pulsar: [11, 40], 'crab-nebula': [14, 50], andromeda: [14, 55],
  'trappist-1': [17, 55], comet: [14, 45], 'solar-frontiers': [18, 58], wormhole: [13, 46],
};

export function cameraPosition(id: DestinationId, preset: CameraPreset, portrait = false): [number, number, number] {
  const distance = { 'milky-way': 28, 'black-hole': 22, 'messier-13': 20, 'orion-nebula': 27, pulsar: 24, 'crab-nebula': 26, andromeda: 30, 'trappist-1': 33, comet: 26, 'solar-frontiers': 34, wormhole: 27 }[id];
  const scale = portrait ? 1.4 : 1;
  const homeElevation = { 'milky-way': 0.62, 'black-hole': 0.16, 'messier-13': 0.25, 'orion-nebula': 0.08, pulsar: 0.16, 'crab-nebula': 0.12, andromeda: 0.29, 'trappist-1': 0.79, comet: 0.22, 'solar-frontiers': 0.77, wormhole: 0.38 }[id];
  const elevation = preset === 'above' ? 1.44 : preset === 'edge' ? 0.10 : homeElevation;
  return [0, Math.sin(elevation) * distance * scale, Math.cos(elevation) * distance * scale];
}

/** Bound fragment work on high-DPI/4K displays without changing CSS layout. */
export function graphicsDpr(id: DestinationId, quality: Quality, width: number, height: number, deviceDpr: number): number {
  const blackHole = id === 'black-hole';
  const volume = VOLUME_DESTINATIONS.includes(id);
  const pixels = volume ? { low: 180000, auto: 350000, high: 700000 }[quality] : blackHole ? { low: 320000, auto: 650000, high: 1200000 }[quality] : { low: 650000, auto: 1500000, high: 2500000 }[quality];
  const maximum = volume || blackHole ? { low: 0.75, auto: 1, high: 1.25 }[quality] : QUALITY_BUDGETS[quality].maxDpr;
  return Math.min(Math.max(0.1, deviceDpr), maximum, Math.sqrt(pixels / Math.max(1, width * height)));
}

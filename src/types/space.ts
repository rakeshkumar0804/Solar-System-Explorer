export type CelestialType = 'star' | 'planet' | 'dwarf' | 'moon' | 'space-object';
export type DeepSpaceType = 'black-hole' | 'pulsar' | 'nebula' | 'wormhole' | 'comet';

export interface RingConfig {
  innerRadius: number;
  outerRadius: number;
  color: string;
  opacity: number;
  textureType?: 'saturn' | 'uranus';
}

export interface MoonConfig {
  id: string;
  name: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: string;
}

export interface CelestialStats {
  mass: string;
  diameter: string;
  gravity: string;
  temperature: string;
  distanceFromSun: string;
  orbitalPeriod: string;
  rotationPeriod: string;
  moonsCount: number;
  atmosphere: string[];
}

export interface CelestialBody {
  id: string;
  name: string;
  type: CelestialType;
  category: string;
  tagline: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  axialTilt: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
  textureType: 'sun' | 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto' | 'moon';
  clouds?: {
    color: string;
    opacity: number;
    speed: number;
  };
  rings?: RingConfig;
  moons?: MoonConfig[];
  stats: CelestialStats;
  overview: string;
  geology: string;
  exploration: string[];
  funFacts: string[];
}

export interface DeepSpaceObject {
  id: string;
  name: string;
  type: DeepSpaceType;
  category: string;
  tagline: string;
  position: [number, number, number];
  scale: number;
  primaryColor: string;
  secondaryColor: string;
  rotationSpeed: number;
  stats: {
    distanceFromEarth: string;
    massOrSize: string;
    classification: string;
    temperatureOrEnergy: string;
    specialFeature: string;
  };
  overview: string;
  facts: string[];
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  bgSpace: string;
  ambientColor: string;
  ambientIntensity: number;
  sunCoronaColor: string;
  sunGlow: string;
  orbitColor: string;
  orbitOpacity: number;
  uiAccent: string;
  uiAccentLight: string;
  uiBadgeBg: string;
  uiBorder: string;
  particleColor: string;
}

export interface CosmicToggles {
  milkyWayCore: boolean;
  starClusters: boolean;
  wormhole: boolean;
  blackHole: boolean;
  comets: boolean;
  nebulae: boolean;
  pulsar: boolean;
  shootingStars: boolean;
  distantGalaxies: boolean;
  asteroidBelt: boolean;
  atmospheres: boolean;
}

export interface ExplorerSettings {
  timeSpeed: number;
  isPaused: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  showAsteroids: boolean;
  showDeepSpace: boolean;
  showAtmospheres: boolean;
  cosmicToggles: CosmicToggles;
  soundEnabled: boolean;
  activeThemeId: string;
  selectedBodyId: string | null;
  comparisonBodyId: string | null;
}

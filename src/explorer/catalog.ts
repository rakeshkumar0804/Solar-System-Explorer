import { ALL_CELESTIAL_BODIES } from '../data/planetsData';
import type { CelestialBody } from '../types/space';

export type Quality = 'auto' | 'high' | 'low';
export type ViewMode = 'planet' | 'overview';

export const MOON: CelestialBody = {
  id: 'moon', name: 'Moon', type: 'moon', category: 'Natural satellite',
  tagline: 'Our nearest celestial neighbour', size: 0.45, orbitRadius: 3.2,
  orbitSpeed: 0.08, rotationSpeed: 0.001, axialTilt: 6.68, color: '#b8b6ae', textureType: 'moon',
  stats: {
    mass: '7.342 × 10²² kg', diameter: '3,474 km', gravity: '1.62 m/s²',
    temperature: '−173 °C to 127 °C', distanceFromSun: 'About 149.6 million km',
    orbitalPeriod: '27.3 Earth days around Earth', rotationPeriod: '27.3 Earth days',
    moonsCount: 0, atmosphere: ['Extremely thin exosphere'],
  },
  overview: 'The Moon is Earth’s only natural satellite. Its ancient highlands and dark volcanic plains preserve a record of impacts stretching back billions of years.',
  geology: 'Bright, heavily cratered highlands surround darker basalt plains called maria. With almost no atmosphere or liquid water, footprints and impact craters can survive for extraordinarily long periods.',
  exploration: ['Apollo 11 made the first crewed lunar landing in 1969.', 'Lunar orbiters continue to map the surface and study ice near the poles.'],
  funFacts: ['The Moon keeps nearly the same face toward Earth because its rotation is tidally locked.', 'Its gravity drives much of the rise and fall of Earth’s ocean tides.'],
};

export const BODIES = [...ALL_CELESTIAL_BODIES, MOON];
export const PLANETS = BODIES.filter(body => body.type === 'planet');
export const getBody = (id: string) => BODIES.find(body => body.id === id) ?? BODIES.find(body => body.id === 'earth')!;

export interface Presentation {
  title: string;
  subtitle: string;
  description: string;
  eyebrow: string;
  accent: string;
  distance: string;
  year: string;
  day: string;
  atmosphere?: string;
}

export const PRESENTATION: Record<string, Presentation> = {
  sun: { title: 'The Sun', subtitle: 'The heart of it all.', description: 'A star that gives eight worlds their light. Explore the surface of our solar system’s gravitational anchor.', eyebrow: 'OUR STAR', accent: '#ebbf83', distance: '0 AU', year: '—', day: '25–35 days' },
  mercury: { title: 'Mercury', subtitle: 'A world of extremes.', description: 'Scarred by ancient impacts. Scorched by the Sun. The smallest planet holds a remarkably long history.', eyebrow: '01 / TERRESTRIAL PLANET', accent: '#c5b9ad', distance: '0.39 AU', year: '88 days', day: '58.6 days' },
  venus: { title: 'Venus', subtitle: 'Beneath the clouds.', description: 'A bright, cloud-wrapped world with a crushing atmosphere and a volcanic landscape hidden below.', eyebrow: '02 / TERRESTRIAL PLANET', accent: '#dfc49b', distance: '0.72 AU', year: '225 days', day: '243 days', atmosphere: '#caaa80' },
  earth: { title: 'Earth', subtitle: 'Our pale blue dot.', description: 'An ocean world beneath a thin blue atmosphere. The only place in the universe we know to call home.', eyebrow: '03 / TERRESTRIAL PLANET', accent: '#96c9df', distance: '1.00 AU', year: '365.25 days', day: '23 h 56 m', atmosphere: '#4486c3' },
  mars: { title: 'Mars', subtitle: 'The next horizon.', description: 'Rust-red deserts, ancient riverbeds, and the tallest volcano in the solar system. A world that keeps us looking forward.', eyebrow: '04 / TERRESTRIAL PLANET', accent: '#d99e82', distance: '1.52 AU', year: '687 days', day: '24 h 37 m', atmosphere: '#be8767' },
  jupiter: { title: 'Jupiter', subtitle: 'A giant in motion.', description: 'Vast cloud belts sweep around a world of extraordinary scale, shaped by storms that can outlast generations.', eyebrow: '05 / GAS GIANT', accent: '#d9b89c', distance: '5.20 AU', year: '11.86 years', day: '9 h 56 m', atmosphere: '#bdac99' },
  saturn: { title: 'Saturn', subtitle: 'A world apart.', description: 'Countless pieces of ice form delicate rings around a quiet-looking world of powerful winds and swirling clouds.', eyebrow: '06 / GAS GIANT', accent: '#d8c5a1', distance: '9.58 AU', year: '29.45 years', day: '10 h 42 m', atmosphere: '#c0b397' },
  uranus: { title: 'Uranus', subtitle: 'An unexpected tilt.', description: 'A pale cyan ice giant that rolls through its long orbit on its side, with seasons unlike those on any other planet.', eyebrow: '07 / ICE GIANT', accent: '#a4d0d3', distance: '19.2 AU', year: '84 years', day: '17 h 14 m', atmosphere: '#78b5bd' },
  neptune: { title: 'Neptune', subtitle: 'Beyond the familiar.', description: 'Cold, remote, and swept by powerful winds. The last major planet marks the edge of the planetary neighbourhood.', eyebrow: '08 / ICE GIANT', accent: '#95b9dc', distance: '30.1 AU', year: '164.8 years', day: '16 h 6 m', atmosphere: '#6b96bc' },
  pluto: { title: 'Pluto', subtitle: 'An icy frontier.', description: 'A small world with a surprisingly complex landscape of nitrogen ice, mountains, and ancient craters.', eyebrow: 'DWARF PLANET / KUIPER BELT', accent: '#c4b8a6', distance: '39.5 AU', year: '248 years', day: '6.4 days' },
  moon: { title: 'Moon', subtitle: 'A familiar companion.', description: 'Across the quiet distance, our nearest neighbour holds the story of ancient impacts and humanity’s first steps on another world.', eyebrow: 'EARTH’S NATURAL SATELLITE', accent: '#c9c8c2', distance: '~1.00 AU', year: '27.3 days¹', day: '27.3 days' },
};

export const texturePath = (id: string) => `/textures/${id}.jpg`;
export const TOUR = ['earth', 'moon', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'sun', 'mercury', 'venus', 'pluto'];
export const COMPARISON_PRESETS = [
  { label: 'Earth & Moon', a: 'earth', b: 'moon' },
  { label: 'Earth & Mars', a: 'earth', b: 'mars' },
  { label: 'Jupiter & Saturn', a: 'jupiter', b: 'saturn' },
  { label: 'Sun & Earth', a: 'sun', b: 'earth' },
];

import { seedRandom } from '../math';
import type { StarData } from './particles';

const allocate = (count: number): StarData => ({ positions: new Float32Array(count * 3), colours: new Float32Array(count * 3), sizes: new Float32Array(count), luminosities: new Float32Array(count) });

export function noiseVolume(side = 32) {
  const random = seedRandom(48117), bytes = new Uint8Array(side ** 3);
  for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(random() * 256);
  return bytes;
}

export function fieldStars(count: number): StarData {
  const result = allocate(count), random = seedRandom(77731);
  for (let i = 0; i < count; i++) {
    const angle = random() * Math.PI * 2, y = random() * 2 - 1, r = 48 + random() * 18;
    const h = Math.sqrt(1 - y * y), bright = random() > 0.977;
    result.positions.set([Math.cos(angle) * h * r, y * r, Math.sin(angle) * h * r], i * 3);
    result.colours.set(random() > 0.86 ? [1, 0.77, 0.55] : [0.64, 0.76, 1], i * 3);
    result.sizes[i] = bright ? 0.14 : 0.035 + random() * 0.035;
    result.luminosities[i] = bright ? 1.7 : 0.35 + random() * 0.3;
  }
  return result;
}

export function andromedaStars(count: number): StarData {
  const result = allocate(count), random = seedRandom(31193);
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(random(), 1e-8))) * Math.cos(random() * Math.PI * 2);
  for (let i = 0; i < count; i++) {
    const bulge = random() < 0.37;
    const radius = bulge ? Math.min(4.5, Math.abs(normal()) * 1.3) : 0.8 + Math.pow(random(), 0.76) * 10.6;
    const angle = random() * Math.PI * 2;
    const dust = !bulge && Math.sin(radius * 3.4 + Math.sin(angle * 2 + radius * 0.5) * 0.65) > 0.53;
    const young = !bulge && random() > 0.8;
    result.positions.set([Math.cos(angle) * radius, normal() * (bulge ? 0.52 : 0.16), Math.sin(angle) * radius], i * 3);
    result.colours.set(young ? [0.33, 0.57, 1] : [1, 0.76 + random() * 0.1, 0.49 + random() * 0.17], i * 3);
    result.sizes[i] = 0.026 + random() * 0.063;
    result.luminosities[i] = (dust ? 0.12 : 0.65) * (0.45 + random());
  }
  return result;
}

export function beltBodies(count: number): StarData {
  const result = allocate(count), random = seedRandom(305014);
  for (let i = 0; i < count; i++) {
    const inner = i < count * 0.34, radius = inner ? 3.8 + random() * 1.3 : 9.4 + random() * 3;
    const angle = random() * Math.PI * 2, y = (random() - 0.5) * (inner ? 0.26 : 0.9);
    result.positions.set([radius * Math.cos(angle), y, radius * Math.sin(angle)], i * 3);
    result.colours.set(inner ? [0.78, 0.57, 0.35] : [0.42, 0.66, 0.9], i * 3);
    result.sizes[i] = inner ? 0.028 + random() * 0.027 : 0.029 + random() * 0.043;
    result.luminosities[i] = 0.5 + random() * 0.45;
  }
  return result;
}

/** A network of representative filaments on an irregular ellipsoidal shell. */
export function remnantFilaments(count = 210, segments = 32) {
  const positions: number[] = [], colours: number[] = [], random = seedRandom(105411);
  for (let filament = 0; filament < count; filament++) {
    const azimuth = random() * Math.PI * 2, latitude = (random() - 0.5) * Math.PI;
    const stretch = 0.3 + random() * 0.9, phase = random() * 6.28;
    let previous: number[] | undefined;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments - 0.5;
      const a = azimuth + t * stretch, b = latitude + t * stretch * 0.45 + Math.sin(t * 13 + phase) * 0.045;
      const r = 1 + Math.sin(a * 7 + b * 5) * 0.09 + Math.sin(t * 26 + phase) * 0.017;
      const point = [Math.cos(a) * Math.cos(b) * 6.8 * r, Math.sin(b) * 5 * r, Math.sin(a) * Math.cos(b) * 4.7 * r];
      if (previous) {
        positions.push(...previous, ...point);
        const brightness = 0.32 + Math.sin(Math.PI * i / segments) * 0.36;
        for (let j = 0; j < 2; j++) colours.push(brightness, brightness * (0.36 + random() * 0.28), brightness * 0.28);
      }
      previous = point;
    }
  }
  return { positions: new Float32Array(positions), colours: new Float32Array(colours) };
}

export const TRAPPIST_PLANETS = [
  { letter: 'b', radius: 2.8, size: 0.27, period: 1.51, colour: '#b9826a', phase: 0.4 },
  { letter: 'c', radius: 3.9, size: 0.28, period: 2.42, colour: '#c4a98a', phase: 2.2 },
  { letter: 'd', radius: 5.0, size: 0.21, period: 4.05, colour: '#988d7c', phase: 4.4 },
  { letter: 'e', radius: 6.1, size: 0.24, period: 6.10, colour: '#929b9e', phase: 5.7 },
  { letter: 'f', radius: 7.3, size: 0.26, period: 9.21, colour: '#a6a0a3', phase: 3.7 },
  { letter: 'g', radius: 8.6, size: 0.29, period: 12.35, colour: '#adb9bd', phase: 1.5 },
  { letter: 'h', radius: 10.0, size: 0.20, period: 18.77, colour: '#c2c9d0', phase: 0.1 },
] as const;

export function orbitPoint(radius: number, phase: number, period: number, elapsed: number): [number, number, number] {
  const angle = phase + elapsed * 0.45 / period;
  return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius];
}

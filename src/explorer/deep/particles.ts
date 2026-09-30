import { seedRandom } from '../math';

export interface StarData { positions: Float32Array; colours: Float32Array; sizes: Float32Array; luminosities: Float32Array }
const dataFor = (count: number): StarData => ({ positions: new Float32Array(count * 3), colours: new Float32Array(count * 3), sizes: new Float32Array(count), luminosities: new Float32Array(count) });

/** Deterministic illustrative distributions; these are not measured star catalogs. */
export function galaxyStars(count: number): StarData {
  const result = dataFor(count), random = seedRandom(74192);
  const normal = () => Math.sqrt(-2 * Math.log(Math.max(1e-8, random()))) * Math.cos(random() * Math.PI * 2);
  for (let i = 0; i < count; i++) {
    const component = random();
    let x: number, y: number, z: number, radius: number;
    if (component < 0.23) {
      x = normal() * 1.35; z = normal() * 0.70; y = normal() * 0.36;
      radius = Math.hypot(x, z);
    } else {
      radius = 0.7 + Math.pow(random(), 0.72) * 9.4;
      const arm = Math.floor(random() * 4);
      const angle = component > 0.84 ? random() * Math.PI * 2 : arm * Math.PI / 2 + Math.log(radius + 0.8) * 2.65 + normal() * (0.13 + 0.15 / radius);
      x = Math.cos(angle) * radius + normal() * 0.1;
      z = Math.sin(angle) * radius + normal() * 0.1;
      y = normal() * (0.10 + 0.025 * radius);
    }
    result.positions.set([x, y, z], i * 3);
    const warm = Math.exp(-radius * 0.36);
    const giant = random() > 0.989;
    result.colours.set([0.43 + warm * 0.57, 0.58 + warm * 0.24, 0.9 - warm * 0.37], i * 3);
    result.sizes[i] = giant ? 0.14 + random() * 0.13 : 0.028 + random() * 0.053;
    result.luminosities[i] = giant ? 2.8 : 0.45 + random() * 0.85;
  }
  return result;
}

export function clusterStars(count: number): StarData {
  const result = dataFor(count), random = seedRandom(131714);
  for (let i = 0; i < count; i++) {
    let radius: number;
    do { const u = Math.max(1e-8, random()); radius = 1.12 / Math.sqrt(Math.pow(u, -2 / 3) - 1); } while (radius > 8.2);
    const azimuth = random() * Math.PI * 2, latitude = random() * 2 - 1;
    const horizontal = Math.sqrt(1 - latitude * latitude);
    result.positions.set([radius * horizontal * Math.cos(azimuth), radius * latitude, radius * horizontal * Math.sin(azimuth)], i * 3);
    const colour = random(), bright = random() > 0.983;
    result.colours.set(colour < 0.25 ? [1, 0.67, 0.34] : colour > 0.93 ? [0.40, 0.65, 1] : [0.82, 0.86, 1], i * 3);
    result.sizes[i] = bright ? 0.13 + random() * 0.13 : 0.025 + random() * 0.045;
    result.luminosities[i] = bright ? 2.5 : 0.45 + random() * 0.65;
  }
  return result;
}

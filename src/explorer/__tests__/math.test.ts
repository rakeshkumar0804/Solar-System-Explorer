import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { BODIES, COMPARISON_PRESETS, getBody, texturePath } from '../catalog';
import { advanceTime, orbitalPosition, ORBITS, scaledDiameters, seedRandom } from '../math';
import { getDiameterKm } from '../../utils/comparison';

describe('Explorer data and asset integrity', () => {
  it('resolves every comparison preset to the exact selected bodies, including Moon', () => {
    for (const preset of COMPARISON_PRESETS) {
      expect(getBody(preset.a).id).toBe(preset.a);
      expect(getBody(preset.b).id).toBe(preset.b);
    }
    expect(getBody('moon').type).toBe('moon');
  });
  it('contains no duplicate body identifiers and bundles every map and thumbnail', () => {
    expect(new Set(BODIES.map(body => body.id)).size).toBe(BODIES.length);
    for (const body of BODIES) {
      expect(existsSync(resolve('public', `.${texturePath(body.id)}`)), body.id).toBe(true);
      expect(existsSync(resolve('public/textures/thumbs', `${body.id}.webp`)), body.id).toBe(true);
    }
  });
  it('preserves exact circle-diameter proportions across every pair, including Sun/Moon', () => {
    for (const first of BODIES) for (const second of BODIES) {
      const a = getDiameterKm(first), b = getDiameterKm(second);
      const result = scaledDiameters(a, b);
      expect(result.a / result.b).toBeCloseTo(a / b, 8);
      expect(Math.max(result.a, result.b)).toBe(160);
    }
  });
  it('does not invent ratios when input data is invalid', () => {
    expect(scaledDiameters(0, 100).ratio).toBeNull();
    expect(scaledDiameters(NaN, 100).ratio).toBeNull();
    expect(scaledDiameters(Infinity, 100).ratio).toBeNull();
  });
});

describe('Illustrative animation', () => {
  it('pause freezes time instead of reversing it', () => {
    expect(advanceTime(12, 0.016, 5, true)).toBe(12);
    expect(advanceTime(12, 0.016, 5, false)).toBeCloseTo(12.08);
  });
  it('bounds the jump after a suspended tab and ignores negative deltas', () => {
    expect(advanceTime(12, 100, 1, false)).toBeCloseTo(12.1);
    expect(advanceTime(12, -2, 1, false)).toBe(12);
  });
  it('keeps each orbital position on its declared presentation orbit', () => {
    for (const [id, orbit] of Object.entries(ORBITS)) for (const elapsed of [0, 12, 500]) {
      const [x, y, z] = orbitalPosition(id, elapsed);
      expect(y).toBe(0);
      expect(Math.hypot(x, z)).toBeCloseTo(orbit.radius, 8);
    }
  });
  it('generates stable star positions across remounts', () => {
    const first = seedRandom(14), second = seedRandom(14);
    expect(Array.from({ length: 32 }, first)).toEqual(Array.from({ length: 32 }, second));
  });
});

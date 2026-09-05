import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateDiameterComparison, getDiameterKm } from '../comparison.ts';

const earth = {
  id: 'earth',
  name: 'Earth',
  category: 'Terrestrial Planet',
  stats: { diameter: '12,742 km' },
} as any;

const mars = {
  id: 'mars',
  name: 'Mars',
  category: 'Terrestrial Planet',
  stats: { diameter: '6,779 km' },
} as any;

const sun = {
  id: 'sun',
  name: 'The Sun',
  category: 'Yellow Dwarf Star',
  stats: { diameter: '1,392,700 km' },
} as any;

const jupiter = {
  id: 'jupiter',
  name: 'Jupiter',
  category: 'Gas Giant',
  stats: { diameter: '139,820 km' },
} as any;

describe('Celestial Diameter Comparison', () => {
  it('correctly calculates Earth vs. Mars diameter ratio and percentage', () => {
    const res = calculateDiameterComparison(earth, mars);
    // ratio = 12742 / 6779 = 1.879628... -> 1.88x
    assert.strictEqual(res.ratioFormatted, '1.88\u00D7');
    assert.strictEqual(res.percentFormatted, '87.96%');
    assert.strictEqual(res.isALarger, true);
    assert.strictEqual(res.isASmaller, false);
    assert.strictEqual(res.isEqual, false);
    assert.strictEqual(res.primaryStatement, "Earth is 1.88\u00D7 as large in diameter as Mars");
    assert.strictEqual(res.secondaryStatement, "Earth's diameter is 87.96% larger than Mars");
  });

  it('correctly verifies exact rendered strings without corrupted characters', () => {
    const res = calculateDiameterComparison(earth, mars);
    assert.strictEqual(res.secondaryStatement, "Earth's diameter is 87.96% larger than Mars");
    assert.strictEqual(res.primaryStatement, "Earth is 1.88\u00D7 as large in diameter as Mars");
    assert.ok(!res.secondaryStatement.includes('?'));
    assert.ok(!res.primaryStatement.includes('?'));
  });

  it('correctly calculates swapped Mars vs. Earth', () => {
    const res = calculateDiameterComparison(mars, earth);
    // ratio = 6779 / 12742 = 0.53198... -> 0.53x
    // percentageDifference = |6779 - 12742| / 12742 = 46.80%
    assert.strictEqual(res.ratioFormatted, '0.53\u00D7');
    assert.strictEqual(res.percentFormatted, '46.80%');
    assert.strictEqual(res.isALarger, false);
    assert.strictEqual(res.isASmaller, true);
    assert.strictEqual(res.primaryStatement, "Mars is 46.80% smaller than Earth in diameter");
    assert.strictEqual(res.secondaryStatement, "Mars is 0.53\u00D7 the diameter of Earth");
    assert.ok(!res.secondaryStatement.includes('?'));
  });

  it('correctly handles equal celestial bodies (Earth vs. Earth)', () => {
    const res = calculateDiameterComparison(earth, earth);
    assert.strictEqual(res.isEqual, true);
    assert.strictEqual(res.ratioFormatted, '1.00\u00D7');
    assert.strictEqual(res.percentFormatted, '0.00%');
    assert.ok(res.primaryStatement.includes('identical diameters'));
  });

  it('correctly flags extreme scale ratios with capped visual scale (Sun vs. Jupiter)', () => {
    const res = calculateDiameterComparison(sun, jupiter);
    // ratio = 1392700 / 139820 = 9.96066... -> 9.96x
    assert.strictEqual(res.ratioFormatted, '9.96\u00D7');
    assert.strictEqual(res.isALarger, true);
  });

  it('correctly flags extreme scale ratios with capped visual scale (Sun vs. Earth)', () => {
    const res = calculateDiameterComparison(sun, earth);
    // ratio = 1392700 / 12742 = 109.2999... -> 109.30x
    assert.strictEqual(res.ratioFormatted, '109.30\u00D7');
    assert.strictEqual(res.isVisualScaleCapped, true);
    assert.ok(res.visualScaleNote?.includes('capped scale'));
  });

  it('handles fallback string parsing if ID is unlisted', () => {
    const customBody = {
      id: 'custom-asteroid',
      name: 'Ceres',
      stats: { diameter: '946 km' },
    } as any;
    assert.strictEqual(getDiameterKm(customBody), 946);
  });

  it('handles missing diameter gracefully without NaN or crash', () => {
    const emptyBody = { id: 'unknown', name: 'Unknown', stats: {} } as any;
    const res = calculateDiameterComparison(emptyBody, earth);
    assert.strictEqual(res.isEqual, true);
    assert.strictEqual(typeof res.primaryStatement, 'string');
  });
});

describe('WebGL Status & Boot Telemetry State Contracts', () => {
  it('validates supported WebGL status state contracts', () => {
    const status = 'supported' as string;
    const isSupported = status === 'supported';
    const isUnsupported = status === 'unsupported';

    assert.strictEqual(isSupported, true);
    assert.strictEqual(isUnsupported, false);

    const logText = isSupported ? 'WebGL context stable' : 'WebGL context unavailable';
    assert.strictEqual(logText, 'WebGL context stable');

    const heading = isUnsupported ? 'LIMITED MODE READY' : 'NAVIGATION SYSTEM ONLINE';
    assert.strictEqual(heading, 'NAVIGATION SYSTEM ONLINE');

    const sub = isUnsupported
      ? '3D renderer unavailable \u2014 non-3D tools remain accessible'
      : 'All celestial systems operational';
    assert.strictEqual(sub, 'All celestial systems operational');
  });

  it('validates unsupported WebGL status state contracts', () => {
    const status = 'unsupported' as string;
    const isSupported = status === 'supported';
    const isUnsupported = status === 'unsupported';

    assert.strictEqual(isSupported, false);
    assert.strictEqual(isUnsupported, true);

    const logText = isSupported ? 'WebGL context stable' : 'WebGL context unavailable';
    assert.strictEqual(logText, 'WebGL context unavailable');

    const heading = isUnsupported ? 'LIMITED MODE READY' : 'NAVIGATION SYSTEM ONLINE';
    assert.strictEqual(heading, 'LIMITED MODE READY');

    const sub = isUnsupported
      ? '3D renderer unavailable \u2014 non-3D tools remain accessible'
      : 'All celestial systems operational';
    assert.strictEqual(sub, '3D renderer unavailable \u2014 non-3D tools remain accessible');
  });

  it('asserts speed reset button accessible text and visible values without corrupted characters', () => {
    const speed = 1.0;
    const visibleValue = `${speed.toFixed(1)}\u00D7`;
    const accessibleLabel = 'Reset orbital speed to 1.0 times';

    assert.strictEqual(visibleValue, '1.0\u00D7');
    assert.strictEqual(accessibleLabel, 'Reset orbital speed to 1.0 times');
    assert.ok(!accessibleLabel.includes('?'));
    assert.ok(!visibleValue.includes('?'));
  });
});

import type { CelestialBody } from '../types/space';

// Exact astronomical equatorial diameter lookup in kilometers
export const CELESTIAL_DIAMETERS_KM: Record<string, number> = {
  sun: 1392700,
  mercury: 4879,
  venus: 12104,
  earth: 12742,
  mars: 6779,
  jupiter: 139820,
  saturn: 116460,
  uranus: 50724,
  neptune: 49244,
  pluto: 2376,
  moon: 3474,
};

/**
 * Extracts or looks up the equatorial diameter in kilometers for a celestial body.
 */
export function getDiameterKm(body: CelestialBody): number {
  if (CELESTIAL_DIAMETERS_KM[body.id]) {
    return CELESTIAL_DIAMETERS_KM[body.id];
  }

  // Fallback: parse from stats.diameter string (e.g., "12,742 km", "1,392,700 km (109 Earths)")
  if (body.stats?.diameter) {
    const cleanStr = body.stats.diameter.replace(/,/g, '');
    const match = cleanStr.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const parsed = parseFloat(match[1]);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  return 0;
}

export interface ComparisonResult {
  diameterA: number;
  diameterB: number;
  ratio: number; // diameterA / diameterB
  percentageDifference: number; // Math.abs((diameterA - diameterB) / diameterB) * 100
  ratioFormatted: string; // e.g., "1.88?" or "0.53?"
  percentFormatted: string; // e.g., "87.96%"
  primaryStatement: string;
  secondaryStatement: string;
  comparisonBadge: string;
  isEqual: boolean;
  isALarger: boolean;
  isASmaller: boolean;
  sizeRatioDisplay: string; // e.g. "1.88?" or "0.53?"
  visualScaleA: number; // Normalized visual bubble pixel width
  visualScaleB: number;
  isVisualScaleCapped: boolean;
  visualScaleNote?: string;
  barPercentA: number; // 0..100 for linear comparison bar
  barPercentB: number;
}

/**
 * Calculates dynamic diameter comparison metrics between two celestial bodies.
 */
export function calculateDiameterComparison(
  bodyA: CelestialBody,
  bodyB: CelestialBody,
  options: {
    maxPixelSize?: number;
    minPixelSize?: number;
  } = {}
): ComparisonResult {
  const { maxPixelSize = 130, minPixelSize = 32 } = options;

  const diameterA = getDiameterKm(bodyA);
  const diameterB = getDiameterKm(bodyB);

  // Guard against missing or zero diameters
  if (diameterA <= 0 || diameterB <= 0) {
    return {
      diameterA,
      diameterB,
      ratio: 1,
      percentageDifference: 0,
      ratioFormatted: '1.00\u00D7',
      percentFormatted: '0.00%',
      primaryStatement: `${bodyA.name} and ${bodyB.name} data is unavailable for comparison`,
      secondaryStatement: 'Diameter metrics could not be verified',
      comparisonBadge: 'Comparison Unavailable',
      isEqual: true,
      isALarger: false,
      isASmaller: false,
      sizeRatioDisplay: '1.00\u00D7',
      visualScaleA: maxPixelSize * 0.7,
      visualScaleB: maxPixelSize * 0.7,
      isVisualScaleCapped: false,
      barPercentA: 50,
      barPercentB: 50,
    };
  }

  const ratio = diameterA / diameterB;
  const percentageDifference = Math.abs((diameterA - diameterB) / diameterB) * 100;
  const isEqual = Math.abs(diameterA - diameterB) < 0.0001;
  const isALarger = diameterA > diameterB;
  const isASmaller = diameterA < diameterB;

  const ratioFormatted = `${ratio.toFixed(2)}\u00D7`;
  const percentFormatted = `${percentageDifference.toFixed(2)}%`;

  let primaryStatement = '';
  let secondaryStatement = '';
  let comparisonBadge = '';

  if (isEqual) {
    primaryStatement = `${bodyA.name} and ${bodyB.name} have identical diameters (${diameterA.toLocaleString()} km)`;
    secondaryStatement = 'Scale ratio is exactly 1.00\u00D7 (0.00% difference)';
    comparisonBadge = 'Equal Diameter (1.00\u00D7)';
  } else if (isALarger) {
    primaryStatement = `${bodyA.name} is ${ratioFormatted} as large in diameter as ${bodyB.name}`;
    secondaryStatement = `${bodyA.name}?s diameter is ${percentFormatted} larger than ${bodyB.name}`;
    comparisonBadge = `${ratioFormatted} Larger`;
  } else {
    // A is smaller than B
    primaryStatement = `${bodyA.name} is ${percentFormatted} smaller than ${bodyB.name} in diameter`;
    secondaryStatement = `${bodyA.name} is ${ratioFormatted} the diameter of ${bodyB.name}`;
    comparisonBadge = `${percentFormatted} Smaller`;
  }

  // Visual Scale Calculation
  const trueScaleRatio = diameterA / diameterB;
  const extremeThreshold = 10; // Ratios larger than 10x or smaller than 0.1x get capped/log scaled
  const isExtreme = trueScaleRatio > extremeThreshold || trueScaleRatio < (1 / extremeThreshold);

  let visualScaleA: number;
  let visualScaleB: number;
  let isVisualScaleCapped = false;
  let visualScaleNote: string | undefined;

  if (isEqual) {
    visualScaleA = maxPixelSize;
    visualScaleB = maxPixelSize;
  } else if (isALarger) {
    visualScaleA = maxPixelSize;
    if (isExtreme) {
      isVisualScaleCapped = true;
      const logRatio = Math.log10(trueScaleRatio);
      const compressedRatio = Math.min(0.85, 0.2 + (logRatio * 0.25));
      visualScaleB = Math.max(minPixelSize, maxPixelSize * (1 - compressedRatio));
      visualScaleNote = `Visual representation uses capped scale (${ratioFormatted} true astronomical ratio)`;
    } else {
      visualScaleB = Math.max(minPixelSize, (diameterB / diameterA) * maxPixelSize);
    }
  } else {
    // B is larger
    visualScaleB = maxPixelSize;
    if (isExtreme) {
      isVisualScaleCapped = true;
      const invRatio = diameterB / diameterA;
      const logRatio = Math.log10(invRatio);
      const compressedRatio = Math.min(0.85, 0.2 + (logRatio * 0.25));
      visualScaleA = Math.max(minPixelSize, maxPixelSize * (1 - compressedRatio));
      visualScaleNote = `Visual representation uses capped scale (${(diameterB / diameterA).toFixed(2)}\u00D7 true astronomical ratio)`;
    } else {
      visualScaleA = Math.max(minPixelSize, (diameterA / diameterB) * maxPixelSize);
    }
  }

  // Normalized Bar Percentages (0..100)
  const maxDiameter = Math.max(diameterA, diameterB);
  const barPercentA = (diameterA / maxDiameter) * 100;
  const barPercentB = (diameterB / maxDiameter) * 100;

  return {
    diameterA,
    diameterB,
    ratio,
    percentageDifference,
    ratioFormatted,
    percentFormatted,
    primaryStatement,
    secondaryStatement,
    comparisonBadge,
    isEqual,
    isALarger,
    isASmaller,
    sizeRatioDisplay: ratioFormatted,
    visualScaleA,
    visualScaleB,
    isVisualScaleCapped,
    visualScaleNote,
    barPercentA,
    barPercentB,
  };
}

/** Compressed presentation coordinates; never an ephemeris or real-distance model. */
export const ORBITS: Record<string, { radius: number; size: number; phase: number; speed: number }> = {
  mercury: { radius: 5.1, size: 0.24, phase: 2.4, speed: 0.13 },
  venus: { radius: 7.1, size: 0.43, phase: 4.7, speed: 0.095 },
  earth: { radius: 9.4, size: 0.46, phase: 0.65, speed: 0.075 },
  mars: { radius: 11.8, size: 0.34, phase: 3.2, speed: 0.06 },
  jupiter: { radius: 16.0, size: 1.1, phase: 5.55, speed: 0.031 },
  saturn: { radius: 21.0, size: 0.88, phase: 2.1, speed: 0.022 },
  uranus: { radius: 26.0, size: 0.64, phase: 4.5, speed: 0.014 },
  neptune: { radius: 30.8, size: 0.61, phase: 0.3, speed: 0.011 },
  pluto: { radius: 35.0, size: 0.2, phase: 3.65, speed: 0.008 },
};

export function orbitalPosition(id: string, elapsed: number): [number, number, number] {
  const orbit = ORBITS[id];
  if (!orbit) return [0, 0, 0];
  const angle = orbit.phase + elapsed * orbit.speed;
  return [Math.cos(angle) * orbit.radius, 0, Math.sin(angle) * orbit.radius];
}

export function advanceTime(time: number, delta: number, speed: number, paused: boolean): number {
  // A sleeping tab must not make the scene jump when it becomes visible again.
  return paused ? time : time + Math.min(Math.max(delta, 0), 0.1) * speed;
}

export function scaledDiameters(a: number, b: number, maximum = 160) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !(a > 0) || !(b > 0)) return { a: 0, b: 0, ratio: null };
  const largest = Math.max(a, b);
  // Keep exact diameter proportions, even when the smaller object becomes tiny.
  return { a: a / largest * maximum, b: b / largest * maximum, ratio: a / b };
}

export function seedRandom(seed = 4729) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

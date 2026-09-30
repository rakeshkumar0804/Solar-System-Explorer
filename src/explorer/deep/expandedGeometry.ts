import * as THREE from 'three';

export function pulsarFieldGeometry() {
  const points: number[] = [];
  for (let meridian = 0; meridian < 12; meridian++) {
    const phi = meridian * Math.PI * 2 / 12;
    for (const extent of [3.3, 5.0]) for (let i = 0; i < 96; i++) {
      for (const index of [i, i + 1]) {
        const theta = 0.25 + index / 96 * (Math.PI - 0.5), radius = extent * Math.sin(theta) ** 2;
        points.push(radius * Math.sin(theta) * Math.cos(phi), radius * Math.cos(theta), radius * Math.sin(theta) * Math.sin(phi));
      }
    }
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3)); return geometry;
}

export function cometNucleusGeometry() {
  const geometry = new THREE.IcosahedronGeometry(0.40, 4), positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const roughness = 1 + 0.12 * Math.sin(x * 14 + z * 7) * Math.cos(y * 16) + Math.sin(z * 29 - x * 18) * 0.035;
    positions.setXYZ(i, x * roughness * 1.3, y * roughness * 0.8, z * roughness);
  }
  geometry.computeVertexNormals(); return geometry;
}

export function wormholeGeometry(low = false) {
  const rings = low ? 56 : 96, sides = low ? 72 : 128;
  const positions: number[] = [], uvs: number[] = [], indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const v = (i / rings - 0.5) * 4.4, radius = 1.2 * Math.cosh(v);
    for (let j = 0; j <= sides; j++) {
      const angle = j / sides * Math.PI * 2;
      positions.push(radius * Math.cos(angle), v * 2.1, radius * Math.sin(angle)); uvs.push(j / sides, i / rings);
      if (i < rings && j < sides) { const n = i * (sides + 1) + j; indices.push(n, n + sides + 1, n + 1, n + 1, n + sides + 1, n + sides + 2); }
    }
  }
  const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
}

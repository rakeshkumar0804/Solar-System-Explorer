import { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitTrailProps {
  radius: number;
  color: string;
  opacity?: number;
  segments?: number;
}

export function OrbitTrail({ radius, color: _color, opacity = 0.25, segments = 128 }: OrbitTrailProps) {
  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [radius, segments]);

  if (radius <= 0) return null;

  // Graphic subtle gray concentric circle line
  return (
    <primitive object={new THREE.Line(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#475569'),
        transparent: true,
        opacity: opacity,
        depthWrite: false,
      })
    )} />
  );
}

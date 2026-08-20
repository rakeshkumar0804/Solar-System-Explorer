import { useMemo } from 'react';
import * as THREE from 'three';

interface HabitableZoneProps {
  innerRadius?: number;
  outerRadius?: number;
}

export function HabitableZone({
  innerRadius = 21.5,
  outerRadius = 28.5,
}: HabitableZoneProps) {
  const innerPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(th) * innerRadius, 0, Math.sin(th) * innerRadius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [innerRadius]);

  const outerPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(th) * outerRadius, 0, Math.sin(th) * outerRadius));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, [outerRadius]);

  return (
    <group position={[0, -0.05, 0]}>
      {/* 1. Volumetric Luminous Habitable Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Inner Boundary Ring */}
      <primitive
        object={
          new THREE.Line(
            innerPoints,
            new THREE.LineBasicMaterial({
              color: '#34d399',
              transparent: true,
              opacity: 0.35,
              depthWrite: false,
            })
          )
        }
      />

      {/* 3. Outer Boundary Ring */}
      <primitive
        object={
          new THREE.Line(
            outerPoints,
            new THREE.LineBasicMaterial({
              color: '#06b6d4',
              transparent: true,
              opacity: 0.35,
              depthWrite: false,
            })
          )
        }
      />
    </group>
  );
}

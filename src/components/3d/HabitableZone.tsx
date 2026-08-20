import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { Sparkles } from 'lucide-react';

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

      {/* 4. Minimal, Non-Blocking 3D Outer Edge Badge */}
      <Html
        position={[0, 0, -(outerRadius + 0.8)]}
        center
        distanceFactor={80}
        zIndexRange={[0, 10]}
      >
        <div className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide text-emerald-300 bg-emerald-950/75 border border-emerald-500/35 shadow-[0_0_12px_rgba(16,185,129,0.25)] backdrop-blur-md whitespace-nowrap pointer-events-none select-none flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
          <span>Habitable Zone (0.95 - 1.37 AU)</span>
        </div>
      </Html>
    </group>
  );
}

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getProceduralTexture } from '../../utils/proceduralTextures';
import type { CelestialBody, ThemeConfig } from '../../types/space';
import { Html } from '@react-three/drei';

interface SunProps {
  data: CelestialBody;
  theme: ThemeConfig;
  timeSpeed: number;
  isSelected: boolean;
  showLabels: boolean;
  onSelect: (id: string) => void;
}

export function Sun({ data, theme: _theme, timeSpeed, isSelected, showLabels, onSelect }: SunProps) {
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const glowMeshRef = useRef<THREE.Mesh>(null);

  const sunTexture = useMemo(() => getProceduralTexture('sun'), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const speedMult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.5;

    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += data.rotationSpeed * speedMult * delta * 60;
    }
    if (glowMeshRef.current) {
      const pulse = 1.2 + Math.sin(time * 2.0) * 0.03;
      glowMeshRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Central Solar Point Lights */}
      <pointLight
        position={[0, 0, 0]}
        intensity={2.8}
        distance={320}
        decay={1.2}
        color="#fff6e5"
      />
      <pointLight
        position={[0, 0, 0]}
        intensity={1.5}
        distance={120}
        decay={0.8}
        color="#ffaa00"
      />

      {/* 1. Core Sun Sphere */}
      <mesh
        ref={sunMeshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(data.id);
        }}
      >
        <sphereGeometry args={[data.size, 64, 64]} />
        <meshBasicMaterial
          map={sunTexture}
          color="#ffaa00"
        />
      </mesh>

      {/* 2. Soft Spherical Radial Glow Halo */}
      <mesh ref={glowMeshRef} scale={1.2}>
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Selected Indicator Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.size * 1.45, data.size * 1.55, 64]} />
          <meshBasicMaterial
            color="#c084fc"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3D Clean Text Label */}
      {showLabels && (
        <Html position={[0, data.size + 1.8, 0]} center distanceFactor={70}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data.id);
            }}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-300 pointer-events-auto select-none backdrop-blur-md border ${
              isSelected
                ? 'bg-purple-900/60 text-amber-200 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-110'
                : 'bg-[#0a0515]/90 text-amber-300 border-purple-800/50 hover:border-amber-400 hover:bg-black/90'
            }`}
          >
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
}

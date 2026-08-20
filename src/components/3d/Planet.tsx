import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CelestialBody, ThemeConfig } from '../../types/space';
import { getProceduralTexture, getRingTexture } from '../../utils/proceduralTextures';
import { Html } from '@react-three/drei';

interface PlanetProps {
  data: CelestialBody;
  theme: ThemeConfig;
  timeSpeed: number;
  isSelected: boolean;
  showLabels: boolean;
  showAtmosphere: boolean;
  onSelect: (id: string) => void;
  onPositionUpdate?: (id: string, pos: THREE.Vector3) => void;
}

export function Planet({
  data,
  theme: _theme,
  timeSpeed,
  isSelected,
  showLabels,
  showAtmosphere,
  onSelect,
  onPositionUpdate,
}: PlanetProps) {
  const planetGroupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const moonRefs = useRef<(THREE.Mesh | null)[]>([]);

  const angleRef = useRef<number>(
    useMemo(() => {
      let hash = 0;
      for (let i = 0; i < data.id.length; i++) {
        hash = (hash << 5) - hash + data.id.charCodeAt(i);
      }
      return (Math.abs(hash) % 360) * (Math.PI / 180);
    }, [data.id])
  );

  const texture = useMemo(() => getProceduralTexture(data.textureType), [data.textureType]);
  const ringTexture = useMemo(
    () => (data.rings ? getRingTexture(data.rings.textureType || 'saturn') : null),
    [data.rings]
  );

  const axialTiltRad = (data.axialTilt * Math.PI) / 180;

  useFrame((_, delta) => {
    if (timeSpeed !== 0) {
      const speedMultiplier = timeSpeed * 0.4;
      angleRef.current += data.orbitSpeed * speedMultiplier * delta * 60;
    }

    const currentX = Math.cos(angleRef.current) * data.orbitRadius;
    const currentZ = Math.sin(angleRef.current) * data.orbitRadius;

    if (planetGroupRef.current) {
      planetGroupRef.current.position.set(currentX, 0, currentZ);
      if (onPositionUpdate) {
        onPositionUpdate(data.id, planetGroupRef.current.position);
      }
    }

    const rotSpeed = timeSpeed === 0 ? 0.05 : timeSpeed * 0.5;
    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed * rotSpeed * delta * 60;
    }
    if (cloudsRef.current && data.clouds) {
      cloudsRef.current.rotation.y += data.clouds.speed * rotSpeed * delta * 60;
    }
  });

  return (
    <group ref={planetGroupRef}>
      <group rotation={[axialTiltRad, 0, 0]}>
        {/* Primary Planet Mesh Sphere */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(data.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'var(--cursor-rocket)';
          }}
        >
          <sphereGeometry args={[data.size, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            roughness={data.roughness ?? 0.7}
            metalness={data.metalness ?? 0.1}
          />
        </mesh>

        {/* Dynamic Atmosphere Glow Mesh */}
        {showAtmosphere && (
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'var(--cursor-rocket)';
            }}
          >
            <sphereGeometry args={[data.size * 1.05, 32, 32]} />
            <meshBasicMaterial
              color={data.color}
              transparent
              opacity={0.12}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        )}

        {/* Dynamic Cloud Layer (Earth, Venus, Jupiter) */}
        {data.clouds && (
          <mesh
            ref={cloudsRef}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'var(--cursor-rocket)';
            }}
          >
            <sphereGeometry args={[data.size * 1.015, 32, 32]} />
            <meshStandardMaterial
              color={data.clouds.color}
              transparent
              opacity={data.clouds.opacity}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* 3D Planetary Rings (Saturn & Uranus) */}
        {data.rings && (
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'var(--cursor-rocket)';
            }}
          >
            <ringGeometry
              args={[
                data.rings.innerRadius,
                data.rings.outerRadius,
                64,
              ]}
            />
            <meshStandardMaterial
              map={ringTexture}
              color={data.rings.color}
              transparent
              opacity={data.rings.opacity}
              side={THREE.DoubleSide}
              roughness={0.8}
            />
          </mesh>
        )}

        {/* Selected Highlight Reticle Ring */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[data.size * 1.4, data.size * 1.5, 48]} />
            <meshBasicMaterial
              color="#a855f7"
              transparent
              opacity={0.9}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Planetary Moons */}
        {data.moons &&
          data.moons.map((moon, index) => (
            <mesh
              key={moon.id}
              ref={(el) => {
                moonRefs.current[index] = el;
              }}
              position={[moon.orbitRadius, 0, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(data.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'var(--cursor-rocket)';
              }}
            >
              <sphereGeometry args={[moon.size, 16, 16]} />
              <meshStandardMaterial color={moon.color} roughness={0.9} />
            </mesh>
          ))}
      </group>

      {/* 3D Drei HTML Planet Label Badge */}
      {showLabels && (
        <Html
          position={[0, data.size + 1.2, 0]}
          center
          distanceFactor={60}
          zIndexRange={[0, 10]}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'var(--cursor-rocket)';
            }}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border ${
              isSelected
                ? 'bg-purple-600/40 text-purple-100 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.6)] scale-110'
                : 'bg-black/75 text-purple-200 border-purple-900/50 hover:border-purple-400 hover:scale-105'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            {data.name}
          </div>
        </Html>
      )}
    </group>
  );
}

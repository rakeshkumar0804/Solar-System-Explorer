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

    if (meshRef.current) {
      const rotFactor = timeSpeed === 0 ? 0.002 : timeSpeed * 0.5;
      meshRef.current.rotation.y += data.rotationSpeed * rotFactor * delta * 60;
    }

    if (cloudsRef.current && data.clouds) {
      const cloudFactor = timeSpeed === 0 ? 0.001 : timeSpeed * 0.5;
      cloudsRef.current.rotation.y += data.clouds.speed * cloudFactor * delta * 60;
    }

    if (data.moons && data.moons.length > 0) {
      const moonTime = angleRef.current * 3;
      data.moons.forEach((m, idx) => {
        const moonMesh = moonRefs.current[idx];
        if (moonMesh) {
          const mAngle = moonTime * m.orbitSpeed * 10 + (idx * Math.PI * 2) / data.moons!.length;
          moonMesh.position.set(
            Math.cos(mAngle) * m.orbitRadius,
            Math.sin(mAngle * 0.5) * 0.3,
            Math.sin(mAngle) * m.orbitRadius
          );
        }
      });
    }
  });

  return (
    <group ref={planetGroupRef}>
      {/* Subtle Schematic Framing Plane Behind Selected/Major Planets */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[data.size * 3.2, data.size * 3.2]} />
          <meshBasicMaterial
            color="#4c1d95"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      <group rotation={[0, 0, axialTiltRad]}>
        {/* 3D Planet Sphere */}
        <mesh
          ref={meshRef}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(data.id);
          }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[data.size, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            roughness={data.roughness ?? 0.7}
            metalness={data.metalness ?? 0.15}
            emissive={data.emissive ? new THREE.Color(data.emissive) : new THREE.Color(0x000000)}
            emissiveIntensity={data.emissiveIntensity ?? 0}
          />
        </mesh>

        {/* 3D Spherical Cloud Layer */}
        {data.clouds && showAtmosphere && (
          <mesh ref={cloudsRef}>
            <sphereGeometry args={[data.size * 1.02, 48, 48]} />
            <meshStandardMaterial
              color={data.clouds.color}
              transparent
              opacity={data.clouds.opacity}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* 3D Atmosphere Glowing Rim */}
        {showAtmosphere && (
          <mesh>
            <sphereGeometry args={[data.size * 1.08, 32, 32]} />
            <meshBasicMaterial
              color={new THREE.Color(data.color)}
              transparent
              opacity={0.12}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* 3D Saturn & Uranus Rings */}
        {data.rings && ringTexture && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[data.rings.innerRadius, data.rings.outerRadius, 64]} />
            <meshStandardMaterial
              map={ringTexture}
              color={new THREE.Color(data.rings.color)}
              transparent
              opacity={data.rings.opacity}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              roughness={0.8}
            />
          </mesh>
        )}

        {/* 3D Moons */}
        {data.moons &&
          data.moons.map((moon, idx) => (
            <group key={moon.id}>
              <primitive
                object={
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints(
                      Array.from({ length: 65 }).map((_, i) => {
                        const th = (i / 64) * Math.PI * 2;
                        return new THREE.Vector3(
                          Math.cos(th) * moon.orbitRadius,
                          0,
                          Math.sin(th) * moon.orbitRadius
                        );
                      })
                    ),
                    new THREE.LineBasicMaterial({
                      color: new THREE.Color(moon.color),
                      transparent: true,
                      opacity: 0.2,
                      depthWrite: false,
                    })
                  )
                }
              />
              <mesh
                ref={(el) => {
                  moonRefs.current[idx] = el;
                }}
              >
                <sphereGeometry args={[moon.size, 24, 24]} />
                <meshStandardMaterial color={moon.color} roughness={0.9} />
              </mesh>
            </group>
          ))}
      </group>

      {/* Target Ring when Selected */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.size * 1.5, data.size * 1.62, 64]} />
          <meshBasicMaterial
            color="#c084fc"
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Exact Dark Pill Badges for Names */}
      {showLabels && (
        <Html
          position={[0, data.size + (data.rings ? 2.5 : 1.4), 0]}
          center
          distanceFactor={60}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect(data.id);
            }}
            className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-2 cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border shadow-2xl ${
              isSelected
                ? 'bg-[#150a2a] text-purple-200 border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.6)] scale-110'
                : 'bg-[#0a0515]/95 text-slate-100 border-purple-900/50 hover:border-purple-400 hover:bg-[#120726]'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full inline-block shrink-0 shadow-[0_0_6px_currentColor]"
              style={{ backgroundColor: data.color }}
            />
            <span>{data.name}</span>
          </div>
        </Html>
      )}
    </group>
  );
}

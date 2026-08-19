import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DeepSpaceObject, ThemeConfig, CosmicToggles } from '../../types/space';
import { getCircularParticleTexture } from '../../utils/proceduralTextures';
import { Html } from '@react-three/drei';

interface SpaceObjectsProps {
  objects: DeepSpaceObject[];
  theme: ThemeConfig;
  timeSpeed: number;
  showLabels: boolean;
  cosmicToggles: CosmicToggles;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// 1. Accretion Disk Black Hole (Bottom Right)
export function AccretionBlackHole({
  timeSpeed,
  showLabels,
  isSelected: _isSelected,
  onSelect,
}: {
  timeSpeed: number;
  showLabels: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const diskRef = useRef<THREE.Mesh>(null);
  const position: [number, number, number] = [135, -15, 80];

  useFrame((_, delta) => {
    const mult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.6;
    if (diskRef.current) {
      diskRef.current.rotation.z += 0.03 * mult * delta * 60;
    }
  });

  return (
    <group position={position}>
      {/* Black Hole Event Horizon Void Circle */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect('black-hole');
        }}
      >
        <sphereGeometry args={[2.2, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Thin Curved White Photon Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[2.25, 2.5, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Fiery Golden-Orange Glowing Accretion Disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[2.6, 6.2, 64]} />
        <meshBasicMaterial
          color="#ff7700"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Vertical Transparent Blue Relativistic Jet Cones */}
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[1.0, 9, 32, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -4.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.0, 9, 32, 1, true]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {showLabels && (
        <Html position={[0, 3.5, 0]} center distanceFactor={80}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect('black-hole');
            }}
            className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#0a0515]/95 text-orange-300 border-orange-500/50 shadow-2xl hover:border-orange-400"
          >
            Gargantua (Black Hole)
          </div>
        </Html>
      )}
    </group>
  );
}

// 2. Wormhole / Spacetime Funnel (Top Left)
export function WormholeFunnel({
  timeSpeed,
  showLabels,
  onSelect,
}: {
  timeSpeed: number;
  showLabels: boolean;
  onSelect: (id: string) => void;
}) {
  const funnelRef = useRef<THREE.Group>(null);
  const position: [number, number, number] = [-125, 30, -95];

  useFrame((_, delta) => {
    const mult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.5;
    if (funnelRef.current) {
      funnelRef.current.rotation.z += 0.02 * mult * delta * 60;
    }
  });

  return (
    <group position={position}>
      <group ref={funnelRef}>
        {/* Concentric Neon Pink / Purple Wireframe Ring Funnel */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[0, 0, -i * 0.8]}>
            <ringGeometry args={[1.2 + i * 0.6, 1.35 + i * 0.6, 32]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? '#ec4899' : '#a855f7'}
              transparent
              opacity={0.8 - i * 0.1}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {showLabels && (
        <Html position={[0, 3, 0]} center distanceFactor={80}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect('wormhole');
            }}
            className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#0a0515]/95 text-pink-300 border-pink-500/50 shadow-2xl hover:border-pink-400"
          >
            Wormhole
          </div>
        </Html>
      )}
    </group>
  );
}

// 3. Pulsar / Diamond Star (Top Center)
export function PulsarDiamond({
  timeSpeed,
  showLabels,
  onSelect,
}: {
  timeSpeed: number;
  showLabels: boolean;
  onSelect: (id: string) => void;
}) {
  const coreRef = useRef<THREE.Mesh>(null);
  const position: [number, number, number] = [10, 45, -130];

  useFrame((_, delta) => {
    const mult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.5;
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.08 * mult * delta * 60;
      coreRef.current.rotation.z += 0.05 * mult * delta * 60;
    }
  });

  return (
    <group position={position}>
      {/* Central Purple Diamond Core */}
      <mesh ref={coreRef}>
        <octahedronGeometry args={[1.6, 0]} />
        <meshBasicMaterial color="#c084fc" wireframe={false} />
      </mesh>

      {/* Vertical Sharp Beam Flares */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.08, 0.8, 10, 16]} />
        <meshBasicMaterial
          color="#e879f9"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -5, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.8, 10, 16]} />
        <meshBasicMaterial
          color="#e879f9"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {showLabels && (
        <Html position={[0, 3, 0]} center distanceFactor={80}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect('vela-pulsar');
            }}
            className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#0a0515]/95 text-purple-300 border-purple-500/50 shadow-2xl hover:border-purple-400"
          >
            Vela Pulsar
          </div>
        </Html>
      )}
    </group>
  );
}

// 4. Stippled Star Clusters with Soft Purple Diffuse Halos (Top Right & Bottom Center)
export function DiffuseStarClusters() {
  const circularParticleTex = useMemo(() => getCircularParticleTexture(), []);

  const clustersData = useMemo(() => {
    const centers = [
      [110, 35, -70], // Top Right
      [-40, -35, 110], // Bottom Center
    ];
    const points: number[] = [];
    centers.forEach((c) => {
      for (let i = 0; i < 350; i++) {
        const r = Math.random() * 14;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        points.push(
          c[0] + r * Math.sin(phi) * Math.cos(theta),
          c[1] + r * Math.sin(phi) * Math.sin(theta),
          c[2] + r * Math.cos(phi)
        );
      }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    return g;
  }, []);

  return (
    <group>
      {/* Soft Purple Layered Diffuse Glow Discs */}
      <mesh position={[110, 35, -70]}>
        <sphereGeometry args={[16, 24, 24]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
      <mesh position={[-40, -35, 110]}>
        <sphereGeometry args={[16, 24, 24]} />
        <meshBasicMaterial
          color="#9333ea"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Dense Stippled White Dot Clusters */}
      <points geometry={clustersData}>
        <pointsMaterial
          size={0.4}
          map={circularParticleTex}
          color="#ffffff"
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// 5. Background Cosmic Nebulae Discs (Upper Right & Lower Left)
export function BackgroundNebulaeDiscs() {
  return (
    <group>
      {/* Upper Right Translucent Purple Disc */}
      <mesh position={[140, 50, -110]}>
        <sphereGeometry args={[45, 24, 24]} />
        <meshBasicMaterial
          color="#7e22ce"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Lower Left Translucent Purple Disc */}
      <mesh position={[-130, -40, 90]}>
        <sphereGeometry args={[40, 24, 24]} />
        <meshBasicMaterial
          color="#6b21a8"
          transparent
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

export function SpaceObjects({
  timeSpeed,
  showLabels,
  cosmicToggles = {} as CosmicToggles,
  selectedId,
  onSelect,
}: SpaceObjectsProps) {
  return (
    <group>
      <BackgroundNebulaeDiscs />
      {cosmicToggles.starClusters && <DiffuseStarClusters />}
      {cosmicToggles.blackHole && (
        <AccretionBlackHole
          timeSpeed={timeSpeed}
          showLabels={showLabels}
          isSelected={selectedId === 'black-hole'}
          onSelect={onSelect}
        />
      )}
      {cosmicToggles.wormhole && (
        <WormholeFunnel
          timeSpeed={timeSpeed}
          showLabels={showLabels}
          onSelect={onSelect}
        />
      )}
      {cosmicToggles.pulsar && (
        <PulsarDiamond
          timeSpeed={timeSpeed}
          showLabels={showLabels}
          onSelect={onSelect}
        />
      )}
    </group>
  );
}

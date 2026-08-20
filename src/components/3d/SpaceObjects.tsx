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

// 1. Supermassive Black Hole ("Gargantua")
function BlackHoleObject({
  obj,
  timeSpeed,
  showLabels,
  isSelected,
  onSelect,
}: {
  obj: DeepSpaceObject;
  timeSpeed: number;
  showLabels: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const diskRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const mult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.6;
    if (diskRef.current) {
      diskRef.current.rotation.z += 0.03 * mult * delta * 60;
    }
  });

  return (
    <group position={obj.position}>
      {/* Event Horizon Void */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer"; onSelect(obj.id);
        }}
      >
        <sphereGeometry args={[2.4 * obj.scale * 0.3, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer"; onSelect(obj.id);
        }}
        visible={false}
      >
        <sphereGeometry args={[obj.scale * 4.0, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* Photon Sphere Ring */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[2.45 * obj.scale * 0.3, 2.7 * obj.scale * 0.3, 64]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Relativistic Accretion Disk */}
      <mesh ref={diskRef} rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[2.8 * obj.scale * 0.3, 6.4 * obj.scale * 0.3, 64]} />
        <meshBasicMaterial
          color={obj.primaryColor}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Relativistic Light Cones */}
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

      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[3.4, 3.6, 48]} />
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

      {showLabels && (
        <Html position={[0, 3.5, 0]} center distanceFactor={80} zIndexRange={[0, 10]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer"; onSelect(obj.id);
            }}
            className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#0a0515]/95 text-orange-300 border-orange-500/50 shadow-2xl hover:border-orange-400 hover:bg-[#150a2a]"
          >
            {obj.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// 2. Einstein-Rosen Bridge (Wormhole)
function WormholeObject({
  obj,
  timeSpeed,
  showLabels,
  isSelected,
  onSelect,
}: {
  obj: DeepSpaceObject;
  timeSpeed: number;
  showLabels: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const funnelRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const mult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.5;
    if (funnelRef.current) {
      funnelRef.current.rotation.z += 0.02 * mult * delta * 60;
    }
  });

  return (
    <group position={obj.position}>
      <group
        ref={funnelRef}
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer"; onSelect(obj.id);
        }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[0, 0, -i * 0.8]}>
            <ringGeometry args={[1.2 + i * 0.6, 1.35 + i * 0.6, 32]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? obj.primaryColor : obj.secondaryColor}
              transparent
              opacity={0.8 - i * 0.1}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {isSelected && (
        <mesh>
          <ringGeometry args={[4.2, 4.4, 48]} />
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

      {showLabels && (
        <Html position={[0, 3.2, 0]} center distanceFactor={80} zIndexRange={[0, 10]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer"; onSelect(obj.id);
            }}
            className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#0a0515]/95 text-pink-300 border-pink-500/50 shadow-2xl hover:border-pink-400 hover:bg-[#150a2a]"
          >
            {obj.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// 3. Vela Pulsar
function PulsarObject({
  obj,
  timeSpeed,
  showLabels,
  isSelected,
  onSelect,
}: {
  obj: DeepSpaceObject;
  timeSpeed: number;
  showLabels: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const mult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.5;
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.08 * mult * delta * 60;
      coreRef.current.rotation.z += 0.05 * mult * delta * 60;
    }
  });

  return (
    <group position={obj.position}>
      <mesh
        ref={coreRef}
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer"; onSelect(obj.id);
        }}
      >
        <octahedronGeometry args={[1.6, 0]} />
        <meshBasicMaterial color={obj.primaryColor} />
      </mesh>

      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.08, 0.8, 10, 16]} />
        <meshBasicMaterial
          color={obj.secondaryColor}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, -5, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.8, 10, 16]} />
        <meshBasicMaterial
          color={obj.secondaryColor}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {isSelected && (
        <mesh>
          <ringGeometry args={[2.5, 2.7, 48]} />
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

      {showLabels && (
        <Html position={[0, 3, 0]} center distanceFactor={80} zIndexRange={[0, 10]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer"; onSelect(obj.id);
            }}
            className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#0a0515]/95 text-purple-300 border-purple-500/50 shadow-2xl hover:border-purple-400 hover:bg-[#150a2a]"
          >
            {obj.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// 4. Halley's Comet
function CometObject({
  obj,
  timeSpeed,
  showLabels,
  isSelected,
  onSelect,
}: {
  obj: DeepSpaceObject;
  timeSpeed: number;
  showLabels: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const cometRef = useRef<THREE.Group>(null);
  const circularParticleTex = useMemo(() => getCircularParticleTexture(), []);

  const trailGeom = useMemo(() => {
    const count = 70;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = -i * 0.35;
      pos[i * 3 + 1] = i * 0.12;
      pos[i * 3 + 2] = -i * 0.25;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geom;
  }, []);

  const progressRef = useRef(0);

  useFrame((_, delta) => {
    const dir = timeSpeed < 0 ? -1 : 1;
    const rate = timeSpeed === 0 ? 0.05 : Math.abs(timeSpeed) * 0.2;
    progressRef.current += dir * delta * rate;

    if (progressRef.current > 1.5) {
      progressRef.current = -0.5;
    } else if (progressRef.current < -0.5) {
      progressRef.current = 1.5;
    }

    const t = progressRef.current;
    const startX = -120;
    const endX = 120;
    const startY = 30;
    const endY = -25;
    const startZ = -90;
    const endZ = 90;

    const x = startX + (endX - startX) * t;
    const y = startY + (endY - startY) * t;
    const z = startZ + (endZ - startZ) * t;

    if (cometRef.current) {
      cometRef.current.position.set(x, y, z);
    }
  });

  return (
    <group ref={cometRef} position={obj.position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer"; onSelect(obj.id);
        }}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial
          color={obj.primaryColor}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <points geometry={trailGeom}>
        <pointsMaterial
          size={0.35}
          map={circularParticleTex}
          color={obj.secondaryColor}
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {isSelected && (
        <mesh>
          <ringGeometry args={[1.5, 1.7, 32]} />
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

      {showLabels && (
        <Html position={[0, 1.8, 0]} center distanceFactor={80} zIndexRange={[0, 10]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer"; onSelect(obj.id);
            }}
            className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#0a0515]/95 text-cyan-300 border-cyan-500/50 shadow-2xl hover:border-cyan-400 hover:bg-[#150a2a]"
          >
            {obj.name}
          </div>
        </Html>
      )}
    </group>
  );
}

// 5. Generic Volumetric Nebula / Galaxy / Star Cluster Object
function VolumetricDeepSpaceEntity({
  obj,
  timeSpeed,
  showLabels,
  isSelected,
  onSelect,
}: {
  obj: DeepSpaceObject;
  timeSpeed: number;
  showLabels: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const circularParticleTex = useMemo(() => getCircularParticleTexture(), []);

  const geom = useMemo(() => {
    const count = 800;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c1 = new THREE.Color(obj.primaryColor);
    const c2 = new THREE.Color(obj.secondaryColor);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * (obj.scale * 3.0);
      const sinPhi = Math.sin(phi);

      pos[i * 3] = r * sinPhi * Math.cos(theta) * 1.4;
      pos[i * 3 + 1] = r * sinPhi * Math.sin(theta) * 0.7;
      pos[i * 3 + 2] = r * Math.cos(phi);

      const mixed = c1.clone().lerp(c2, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  }, [obj.primaryColor, obj.secondaryColor, obj.scale]);

  useFrame((_, delta) => {
    const mult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.5;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += obj.rotationSpeed * mult * delta * 60;
    }
  });

  return (
    <group position={obj.position}>
      {/* Soft Volumetric Halo */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer"; onSelect(obj.id);
        }}
      >
        <sphereGeometry args={[obj.scale * 2.5, 24, 24]} />
        <meshBasicMaterial
          color={obj.primaryColor}
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Point Particle System */}
      <points
        ref={pointsRef}
        geometry={geom}
        onClick={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer"; onSelect(obj.id);
        }}
      >
        <pointsMaterial
          size={0.45}
          map={circularParticleTex}
          vertexColors
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {isSelected && (
        <mesh>
          <ringGeometry args={[obj.scale * 2.8, obj.scale * 3.0, 48]} />
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

      {showLabels && (
        <Html position={[0, obj.scale * 2.2, 0]} center distanceFactor={80} zIndexRange={[0, 10]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer"; onSelect(obj.id);
            }}
            className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#0a0515]/95 text-purple-200 border-purple-500/50 shadow-2xl hover:border-purple-400 hover:bg-[#150a2a]"
          >
            {obj.name}
          </div>
        </Html>
      )}
    </group>
  );
}

export function SpaceObjects({
  objects,
  theme: _theme,
  timeSpeed,
  showLabels,
  cosmicToggles = {} as CosmicToggles,
  selectedId,
  onSelect,
}: SpaceObjectsProps) {
  return (
    <group>
      {objects.map((obj) => {
        const isSelected = selectedId === obj.id;

        // Granular toggle filter
        if (obj.id === 'black-hole' && !cosmicToggles.blackHole) return null;
        if (obj.id === 'wormhole' && !cosmicToggles.wormhole) return null;
        if (obj.id === 'vela-pulsar' && !cosmicToggles.pulsar) return null;
        if (obj.id === 'halleys-comet' && !cosmicToggles.comets) return null;
        if (obj.id === 'stellar-nebula' && !cosmicToggles.nebulae) return null;
        if (obj.id === 'globular-cluster' && !cosmicToggles.starClusters) return null;
        if (obj.id === 'milky-way' && !cosmicToggles.milkyWayCore) return null;
        if (
          (obj.id === 'andromeda-galaxy' || obj.id === 'barred-spiral') &&
          !cosmicToggles.distantGalaxies
        ) {
          return null;
        }

        switch (obj.id) {
          case 'black-hole':
            return (
              <BlackHoleObject
                key={obj.id}
                obj={obj}
                timeSpeed={timeSpeed}
                showLabels={showLabels}
                isSelected={isSelected}
                onSelect={onSelect}
              />
            );
          case 'wormhole':
            return (
              <WormholeObject
                key={obj.id}
                obj={obj}
                timeSpeed={timeSpeed}
                showLabels={showLabels}
                isSelected={isSelected}
                onSelect={onSelect}
              />
            );
          case 'vela-pulsar':
            return (
              <PulsarObject
                key={obj.id}
                obj={obj}
                timeSpeed={timeSpeed}
                showLabels={showLabels}
                isSelected={isSelected}
                onSelect={onSelect}
              />
            );
          case 'halleys-comet':
            return (
              <CometObject
                key={obj.id}
                obj={obj}
                timeSpeed={timeSpeed}
                showLabels={showLabels}
                isSelected={isSelected}
                onSelect={onSelect}
              />
            );
          default:
            return (
              <VolumetricDeepSpaceEntity
                key={obj.id}
                obj={obj}
                timeSpeed={timeSpeed}
                showLabels={showLabels}
                isSelected={isSelected}
                onSelect={onSelect}
              />
            );
        }
      })}
    </group>
  );
}

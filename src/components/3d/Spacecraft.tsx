import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SpacecraftData } from '../../types/space';
import { Html } from '@react-three/drei';

interface SpacecraftProps {
  crafts: SpacecraftData[];
  timeSpeed: number;
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// 1. Voyager 1 Model & Escape Trajectory
function VoyagerModel({
  craft,
  showLabels,
  isSelected,
  onSelect,
}: {
  craft: SpacecraftData;
  timeSpeed: number;
  showLabels: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const meshGroupRef = useRef<THREE.Group>(null);

  // Hyperbolic Interstellar Trajectory Line
  const trajectoryLine = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(24, 0, 0),
      new THREE.Vector3(38, 1, 8),
      new THREE.Vector3(52, 6, 16),
      new THREE.Vector3(70, 18, -25),
      new THREE.Vector3(craft.position[0], craft.position[1], craft.position[2]),
    ]);
    const points = curve.getPoints(80);
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: '#eab308',
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, [craft.position]);

  return (
    <group>
      <primitive object={trajectoryLine} />

      {/* Spacecraft Probe Mesh */}
      <group
        ref={meshGroupRef}
        position={craft.position}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(craft.id);
        }}
        scale={[craft.scale, craft.scale, craft.scale]}
      >
        {/* High-Gain Antenna Dish */}
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.1, 0.25, 24]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Central Bus Structure */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* RTG Nuclear Power Generator Boom */}
        <mesh position={[0.8, -0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 1.2, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Magnetometer Boom */}
        <mesh position={[-0.8, -0.2, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
          <meshStandardMaterial color="#475569" />
        </mesh>

        {/* Selected Highlight Ring */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[1.5, 1.7, 32]} />
            <meshBasicMaterial
              color="#eab308"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* 3D Label */}
        {showLabels && (
          <Html position={[0, 1.4, 0]} center distanceFactor={70} zIndexRange={[0, 10]}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect(craft.id);
              }}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#181102]/90 text-yellow-300 border-yellow-500/50 shadow-lg hover:border-yellow-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              {craft.name}
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

// 2. JWST Model & Sun-Earth L2 Halo Orbit
function JwstModel({
  craft,
  timeSpeed,
  showLabels,
  isSelected,
  onSelect,
}: {
  craft: SpacecraftData;
  timeSpeed: number;
  showLabels: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const meshGroupRef = useRef<THREE.Group>(null);

  // Halo Lissajous Orbit Loop around L2
  const haloLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 48; i++) {
      const th = (i / 48) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          craft.position[0] + Math.cos(th) * 1.2,
          craft.position[1] + Math.sin(th) * 0.5,
          craft.position[2] + Math.sin(th * 2) * 0.8
        )
      );
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, [craft.position]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const mult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.4;
    if (meshGroupRef.current) {
      meshGroupRef.current.position.x = craft.position[0] + Math.cos(time * mult) * 1.2;
      meshGroupRef.current.position.y = craft.position[1] + Math.sin(time * mult) * 0.5;
      meshGroupRef.current.position.z = craft.position[2] + Math.sin(time * mult * 2) * 0.8;
    }
  });

  return (
    <group>
      <primitive object={haloLine} />

      {/* JWST Spacecraft Mesh */}
      <group
        ref={meshGroupRef}
        position={craft.position}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(craft.id);
        }}
        scale={[craft.scale, craft.scale, craft.scale]}
      >
        {/* Five-Layer Silver-Kapton Sunshield */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[1.5, 0.9, 0.04]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Primary Hexagonal Gold Mirror Array */}
        <mesh position={[0, 0.4, 0.1]}>
          <cylinderGeometry args={[0.55, 0.55, 0.06, 6]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.98} roughness={0.1} />
        </mesh>

        {/* Secondary Mirror Support Struts */}
        <mesh position={[0, 0.5, 0.5]} rotation={[Math.PI / 4, 0, 0]}>
          <coneGeometry args={[0.04, 0.8, 4]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Selected Highlight Ring */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[1.4, 1.55, 32]} />
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* 3D Label */}
        {showLabels && (
          <Html position={[0, 1.2, 0]} center distanceFactor={70} zIndexRange={[0, 10]}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect(craft.id);
              }}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#021826]/90 text-cyan-300 border-cyan-500/50 shadow-lg hover:border-cyan-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              JWST (L2)
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

// 3. Parker Solar Probe Model & Solar Perihelion Dive Ellipse
function ParkerModel({
  craft,
  timeSpeed,
  showLabels,
  isSelected,
  onSelect,
}: {
  craft: SpacecraftData;
  timeSpeed: number;
  showLabels: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const meshGroupRef = useRef<THREE.Group>(null);

  // Eccentric Solar Perihelion Orbit Ellipse
  const orbitLine = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const a = 13.5;
    const b = 9.2;
    const centerX = 5.0;

    for (let i = 0; i <= 64; i++) {
      const th = (i / 64) * Math.PI * 2;
      pts.push(
        new THREE.Vector3(
          centerX + Math.cos(th) * a,
          Math.sin(th) * 0.4,
          Math.sin(th) * b
        )
      );
    }
    const geom = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: '#ef4444',
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const mult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.6;
    const a = 13.5;
    const b = 9.2;
    const centerX = 5.0;

    if (meshGroupRef.current) {
      meshGroupRef.current.position.x = centerX + Math.cos(time * mult) * a;
      meshGroupRef.current.position.y = Math.sin(time * mult) * 0.4;
      meshGroupRef.current.position.z = Math.sin(time * mult) * b;
    }
  });

  return (
    <group>
      <primitive object={orbitLine} />

      {/* Parker Spacecraft Mesh */}
      <group
        ref={meshGroupRef}
        position={craft.position}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(craft.id);
        }}
        scale={[craft.scale, craft.scale, craft.scale]}
      >
        {/* Carbon-Composite Heat Shield */}
        <mesh position={[-0.4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.1} />
        </mesh>

        {/* Spacecraft Bus Chassis */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.35, 0.35]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>

        {/* Retractable Solar Wings */}
        <mesh position={[0.1, 0, 0.55]} rotation={[Math.PI / 6, 0, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.7]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} />
        </mesh>
        <mesh position={[0.1, 0, -0.55]} rotation={[-Math.PI / 6, 0, 0]}>
          <boxGeometry args={[0.3, 0.02, 0.7]} />
          <meshStandardMaterial color="#0284c7" metalness={0.9} />
        </mesh>

        {/* Selected Highlight Ring */}
        {isSelected && (
          <mesh>
            <ringGeometry args={[1.3, 1.45, 32]} />
            <meshBasicMaterial
              color="#ef4444"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* 3D Label */}
        {showLabels && (
          <Html position={[0, 1.2, 0]} center distanceFactor={70} zIndexRange={[0, 10]}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect(craft.id);
              }}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide flex items-center gap-1.5 cursor-pointer transition-all duration-200 pointer-events-auto select-none backdrop-blur-md border bg-[#200505]/90 text-red-300 border-red-500/50 shadow-lg hover:border-red-300"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Parker Solar Probe
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

export function Spacecraft({
  crafts,
  timeSpeed,
  showLabels,
  selectedId,
  onSelect,
}: SpacecraftProps) {
  return (
    <group>
      {crafts.map((craft) => {
        const isSelected = selectedId === craft.id;
        switch (craft.id) {
          case 'voyager-1':
            return (
              <VoyagerModel
                key={craft.id}
                craft={craft}
                timeSpeed={timeSpeed}
                showLabels={showLabels}
                isSelected={isSelected}
                onSelect={onSelect}
              />
            );
          case 'jwst':
            return (
              <JwstModel
                key={craft.id}
                craft={craft}
                timeSpeed={timeSpeed}
                showLabels={showLabels}
                isSelected={isSelected}
                onSelect={onSelect}
              />
            );
          case 'parker-solar-probe':
            return (
              <ParkerModel
                key={craft.id}
                craft={craft}
                timeSpeed={timeSpeed}
                showLabels={showLabels}
                isSelected={isSelected}
                onSelect={onSelect}
              />
            );
          default:
            return null;
        }
      })}
    </group>
  );
}

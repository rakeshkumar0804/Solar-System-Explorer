import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody, DeepSpaceObject, ThemeConfig, CosmicToggles, SpacecraftData } from '../../types/space';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { OrbitTrail } from './OrbitTrail';
import { AsteroidBelt } from './AsteroidBelt';
import { SpaceObjects } from './SpaceObjects';
import { HabitableZone } from './HabitableZone';
import { Spacecraft } from './Spacecraft';
import { CameraController } from './CameraController';

interface SceneProps {
  sunData: CelestialBody;
  planets: CelestialBody[];
  deepSpaceObjects: DeepSpaceObject[];
  spacecraft?: SpacecraftData[];
  theme: ThemeConfig;
  timeSpeed: number;
  showOrbits: boolean;
  showLabels: boolean;
  cosmicToggles: CosmicToggles;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export function Scene({
  sunData,
  planets,
  deepSpaceObjects,
  spacecraft = [],
  theme,
  timeSpeed,
  showOrbits,
  showLabels,
  cosmicToggles,
  selectedId,
  onSelect,
}: SceneProps) {
  const planetPositions = useRef(new Map<string, THREE.Vector3>());

  const handlePositionUpdate = (id: string, pos: THREE.Vector3) => {
    planetPositions.current.set(id, pos.clone());
  };

  return (
    <div className="w-full h-full absolute inset-0 z-0 cursor-grab active:cursor-grabbing pointer-events-auto touch-none">
      <Canvas
        camera={{ position: [0, 48, 95], fov: 45, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true }}
        onPointerMissed={() => onSelect(null)}
      >
        <color attach="background" args={[theme.bgSpace]} />
        <ambientLight color={theme.ambientColor} intensity={theme.ambientIntensity} />
        <directionalLight
          position={[30, 40, 20]}
          intensity={0.3}
          color={theme.ambientColor}
        />

        {/* Clean Pinpoint Drei Stars */}
        <Stars
          radius={150}
          depth={50}
          count={3000}
          factor={2}
          saturation={0}
          fade
          speed={0.4}
        />

        {/* Central Sun */}
        <Sun
          data={sunData}
          theme={theme}
          timeSpeed={timeSpeed}
          isSelected={selectedId === 'sun'}
          showLabels={showLabels}
          onSelect={(id) => onSelect(id)}
        />

        {/* Goldilocks Habitable Zone Volumetric Overlay */}
        {cosmicToggles?.habitableZone && (
          <HabitableZone
            innerRadius={21.5}
            outerRadius={28.5}
            showLabels={showLabels}
          />
        )}

        {/* Concentric Planetary Orbits */}
        {showOrbits &&
          planets.map((planet) => (
            <OrbitTrail
              key={'orbit_' + planet.id}
              radius={planet.orbitRadius}
              color={theme.orbitColor}
              opacity={theme.orbitOpacity}
            />
          ))}

        {/* 3D Planets & Moons */}
        {planets.map((planet) => (
          <Planet
            key={planet.id}
            data={planet}
            theme={theme}
            timeSpeed={timeSpeed}
            isSelected={selectedId === planet.id}
            showLabels={showLabels}
            showAtmosphere={cosmicToggles?.atmospheres ?? true}
            onSelect={(id) => onSelect(id)}
            onPositionUpdate={handlePositionUpdate}
          />
        ))}

        {/* Instanced Asteroid Belt */}
        {cosmicToggles?.asteroidBelt && (
          <AsteroidBelt
            count={650}
            timeSpeed={timeSpeed}
          />
        )}

        {/* Historic Spacecraft & Interplanetary Trajectories */}
        {cosmicToggles?.spacecraft && (
          <Spacecraft
            crafts={spacecraft}
            timeSpeed={timeSpeed}
            showLabels={showLabels}
            selectedId={selectedId}
            onSelect={(id) => onSelect(id)}
          />
        )}

        {/* Deep Space Objects & Cosmic Phenomena */}
        <SpaceObjects
          objects={deepSpaceObjects}
          theme={theme}
          timeSpeed={timeSpeed}
          showLabels={showLabels}
          cosmicToggles={cosmicToggles}
          selectedId={selectedId}
          onSelect={(id) => onSelect(id)}
        />

        {/* Smooth, User-Interruptible Orbit Controls with Spacecraft support */}
        <CameraController
          selectedId={selectedId}
          planetPositionsRef={planetPositions}
          deepSpaceObjects={deepSpaceObjects}
          planets={planets}
          sunData={sunData}
          spacecraft={spacecraft}
        />
      </Canvas>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { CameraControls } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody, DeepSpaceObject } from '../../types/space';

export const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 75, 125);
export const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);

interface CameraControllerProps {
  selectedId: string | null;
  resetTrigger?: number;
  planetPositionsRef: React.RefObject<Map<string, THREE.Vector3>>;
  deepSpaceObjects: DeepSpaceObject[];
  planets: CelestialBody[];
  sunData: CelestialBody;
}

export function CameraController({
  selectedId,
  resetTrigger = 0,
  planetPositionsRef,
  deepSpaceObjects,
  planets,
  sunData: _sunData,
}: CameraControllerProps) {
  const controlsRef = useRef<CameraControls>(null);

  // 1. Handle Overview / Explicit Reset Trigger
  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.setLookAt(0, 75, 125, 0, 0, 0, true);
  }, [resetTrigger]);

  // 2. Handle Celestial Body & Deep Space Object Selection
  useEffect(() => {
    if (!controlsRef.current) return;

    if (selectedId && selectedId !== 'sun') {
      const planet = planets.find((p) => p.id === selectedId);
      if (planet) {
        const livePos = planetPositionsRef.current?.get(planet.id);
        if (
          livePos &&
          Number.isFinite(livePos.x) &&
          Number.isFinite(livePos.y) &&
          Number.isFinite(livePos.z)
        ) {
          controlsRef.current.setTarget(livePos.x, livePos.y, livePos.z, true);
          return;
        }
      }

      const dObj = deepSpaceObjects.find((o) => o.id === selectedId);
      if (dObj && Array.isArray(dObj.position)) {
        const [ox, oy, oz] = dObj.position;
        if (Number.isFinite(ox) && Number.isFinite(oy) && Number.isFinite(oz)) {
          controlsRef.current.setTarget(ox, oy, oz, true);
          return;
        }
      }
    } else {
      // Return smoothly to full solar system overview
      controlsRef.current.setLookAt(0, 75, 125, 0, 0, 0, true);
    }
  }, [selectedId, planets, deepSpaceObjects, planetPositionsRef]);

  return (
    <CameraControls
      ref={controlsRef}
      smoothTime={0.4}
      minDistance={10}
      maxDistance={450}
      dollySpeed={0.8}
    />
  );
}

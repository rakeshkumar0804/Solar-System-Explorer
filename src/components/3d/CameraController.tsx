import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { CelestialBody, DeepSpaceObject } from '../../types/space';

// Constant default wide-angle isometric view
export const DEFAULT_CAMERA_POS = new THREE.Vector3(30, 70, 100);
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
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioning = useRef(false);

  // 1. Explicit Reset Trigger (e.g. Overview button or Esc key)
  useEffect(() => {
    targetPos.current.copy(DEFAULT_CAMERA_TARGET);
    isTransitioning.current = true;
  }, [resetTrigger]);

  // 2. Set target ONCE when selectedId changes
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
          targetPos.current.copy(livePos);
          isTransitioning.current = true;
          return;
        }
      }

      const dObj = deepSpaceObjects.find((o) => o.id === selectedId);
      if (dObj && Array.isArray(dObj.position)) {
        const [ox, oy, oz] = dObj.position;
        if (Number.isFinite(ox) && Number.isFinite(oy) && Number.isFinite(oz)) {
          targetPos.current.set(ox, oy, oz);
          isTransitioning.current = true;
          return;
        }
      }
    }

    // Default overview center (Sun)
    targetPos.current.copy(DEFAULT_CAMERA_TARGET);
    isTransitioning.current = true;
  }, [selectedId, planets, deepSpaceObjects, planetPositionsRef]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // Self-healing guard against NaN camera matrix corruption
    if (
      !Number.isFinite(camera.position.x) ||
      !Number.isFinite(camera.position.y) ||
      !Number.isFinite(camera.position.z) ||
      !Number.isFinite(controlsRef.current.target.x) ||
      !Number.isFinite(controlsRef.current.target.y) ||
      !Number.isFinite(controlsRef.current.target.z)
    ) {
      camera.position.copy(DEFAULT_CAMERA_POS);
      controlsRef.current.target.copy(DEFAULT_CAMERA_TARGET);
      controlsRef.current.update();
      isTransitioning.current = false;
      return;
    }

    if (isTransitioning.current) {
      const safeDelta = Number.isFinite(delta) ? Math.min(Math.max(delta, 0.001), 0.1) : 0.016;
      const lerpSpeed = Math.min(safeDelta * 3.5, 0.16);

      // Smoothly lerp towards target point
      controlsRef.current.target.lerp(targetPos.current, lerpSpeed);

      if (!selectedId) {
        // Return to overview: animate both camera position and target back to full solar system view
        camera.position.lerp(DEFAULT_CAMERA_POS, lerpSpeed);

        const distTgt = controlsRef.current.target.distanceTo(DEFAULT_CAMERA_TARGET);
        const distPos = camera.position.distanceTo(DEFAULT_CAMERA_POS);

        if (distTgt < 0.06 && distPos < 0.06) {
          controlsRef.current.target.copy(DEFAULT_CAMERA_TARGET);
          camera.position.copy(DEFAULT_CAMERA_POS);
          isTransitioning.current = false;
        }
      } else {
        if (controlsRef.current.target.distanceTo(targetPos.current) < 0.05) {
          controlsRef.current.target.copy(targetPos.current);
          isTransitioning.current = false;
        }
      }

      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={10}
      maxDistance={400}
      minPolarAngle={0.01}
      maxPolarAngle={Math.PI - 0.01}
      enableRotate={true}
      enableZoom={true}
      enablePan={true}
      rotateSpeed={0.8}
      zoomSpeed={1.0}
      panSpeed={0.8}
    />
  );
}

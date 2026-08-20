import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { CelestialBody, DeepSpaceObject } from '../../types/space';

interface CameraControllerProps {
  selectedId: string | null;
  planetPositionsRef: React.RefObject<Map<string, THREE.Vector3>>;
  deepSpaceObjects: DeepSpaceObject[];
  planets: CelestialBody[];
  sunData: CelestialBody;
}

export function CameraController({
  selectedId,
  planetPositionsRef,
  deepSpaceObjects,
  planets,
  sunData: _sunData,
}: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const defaultCameraPos = useRef(new THREE.Vector3(30, 70, 100));
  const isTransitioning = useRef(false);

  // Set target ONCE when selectedId changes
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
    targetPos.current.set(0, 0, 0);
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
      camera.position.set(30, 70, 100);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
      isTransitioning.current = false;
      return;
    }

    if (isTransitioning.current) {
      const safeDelta = Number.isFinite(delta) ? Math.min(Math.max(delta, 0.001), 0.1) : 0.016;
      const lerpSpeed = Math.min(safeDelta * 4.0, 0.18);

      // Smoothly lerp towards target point
      controlsRef.current.target.lerp(targetPos.current, lerpSpeed);

      if (!selectedId) {
        // Return to overview: also lerp camera position to elevated isometric distance
        camera.position.lerp(defaultCameraPos.current, lerpSpeed);

        if (
          controlsRef.current.target.distanceTo(targetPos.current) < 0.08 &&
          camera.position.distanceTo(defaultCameraPos.current) < 0.08
        ) {
          controlsRef.current.target.copy(targetPos.current);
          camera.position.copy(defaultCameraPos.current);
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

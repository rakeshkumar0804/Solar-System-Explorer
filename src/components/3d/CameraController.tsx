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

// Helper to verify 3D vector coordinates are strictly finite numbers
function isFiniteVec(v: THREE.Vector3 | null | undefined): boolean {
  if (!v) return false;
  return Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z);
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

  const isUserInteracting = useRef(false);
  const isAnimating = useRef(false);
  const prevSelectedId = useRef<string | null>(null);

  // Default solar system overview coordinates
  const defaultCameraPos = useRef(new THREE.Vector3(30, 70, 100));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));

  // Reusable vector scratchpads to prevent garbage collection spikes
  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const desiredCamVec = useRef(new THREE.Vector3(30, 70, 100));
  const offsetVec = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      isUserInteracting.current = true;
    };

    const handleEnd = () => {
      isUserInteracting.current = false;
    };

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
    };
  }, []);

  // Trigger smooth one-time camera transition when selection changes
  useEffect(() => {
    if (selectedId !== prevSelectedId.current) {
      prevSelectedId.current = selectedId;
      isAnimating.current = true;
    }
  }, [selectedId]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // 1. Guard against non-finite camera / controls state (Self-healing recovery)
    if (!isFiniteVec(camera.position) || !isFiniteVec(controls.target)) {
      camera.position.set(30, 70, 100);
      controls.target.set(0, 0, 0);
      controls.update();
      isAnimating.current = false;
      return;
    }

    // 2. Safe clamped delta time
    const safeDelta = Number.isFinite(delta) ? Math.min(Math.max(delta, 0.001), 0.1) : 0.016;

    // 3. Resolve target world coordinates
    let minComfortableDistance = 30.0;
    targetVec.current.set(0, 0, 0);

    if (selectedId && selectedId !== 'sun') {
      const planet = planets.find((p) => p.id === selectedId);
      if (planet) {
        const livePos = planetPositionsRef.current?.get(planet.id);
        if (livePos && isFiniteVec(livePos)) {
          targetVec.current.copy(livePos);
          minComfortableDistance = Math.max(planet.size * 5.0, 26.0);
        }
      } else {
        const dObj = deepSpaceObjects.find((o) => o.id === selectedId);
        if (dObj && Array.isArray(dObj.position)) {
          const [ox, oy, oz] = dObj.position;
          if (Number.isFinite(ox) && Number.isFinite(oy) && Number.isFinite(oz)) {
            targetVec.current.set(ox, oy, oz);
            minComfortableDistance = Math.max(dObj.scale * 3.5, 34.0);
          }
        }
      }
    } else if (selectedId === 'sun') {
      minComfortableDistance = 35.0;
      targetVec.current.set(0, 0, 0);
    }

    // Double-check resolved target vector is strictly finite
    if (!isFiniteVec(targetVec.current)) {
      targetVec.current.set(0, 0, 0);
    }

    // 4. Smooth Programmatic Lerp Transition
    if (isAnimating.current && !isUserInteracting.current) {
      const lerpSpeed = Math.min(Math.max(safeDelta * 3.5, 0.04), 0.15);

      if (!selectedId) {
        // Return to Solar System Overview
        camera.position.lerp(defaultCameraPos.current, lerpSpeed);
        controls.target.lerp(defaultTarget.current, lerpSpeed);

        const distPos = camera.position.distanceTo(defaultCameraPos.current);
        const distTgt = controls.target.distanceTo(defaultTarget.current);

        if (distPos < 0.15 && distTgt < 0.15) {
          camera.position.copy(defaultCameraPos.current);
          controls.target.copy(defaultTarget.current);
          isAnimating.current = false;
        }
      } else {
        // Smoothly interpolate controls target to object coordinates
        controls.target.lerp(targetVec.current, lerpSpeed);

        // Compute desired camera position with safe offset vector
        offsetVec.current.subVectors(camera.position, controls.target);
        if (offsetVec.current.lengthSq() < 0.01) {
          offsetVec.current.set(minComfortableDistance * 0.4, minComfortableDistance * 0.5, minComfortableDistance * 0.7);
        }

        const currentDist = offsetVec.current.length();
        const targetDistance = Math.min(Math.max(currentDist * 0.8, minComfortableDistance), 85.0);

        if (Number.isFinite(targetDistance) && targetDistance > 0) {
          offsetVec.current.normalize().multiplyScalar(targetDistance);
        } else {
          offsetVec.current.set(0, minComfortableDistance * 0.5, minComfortableDistance);
        }

        desiredCamVec.current.addVectors(targetVec.current, offsetVec.current);

        if (isFiniteVec(desiredCamVec.current)) {
          camera.position.lerp(desiredCamVec.current, lerpSpeed);
        }

        const distTarget = controls.target.distanceTo(targetVec.current);
        const distPos = camera.position.distanceTo(desiredCamVec.current);

        if (distTarget < 0.15 && distPos < 0.15) {
          controls.target.copy(targetVec.current);
          isAnimating.current = false;
        }
      }
    } else if (selectedId && !isUserInteracting.current) {
      // 5. Dynamic orbital tracking for orbiting planets without camera jump
      offsetVec.current.subVectors(targetVec.current, controls.target);
      if (offsetVec.current.lengthSq() > 0.0001 && isFiniteVec(offsetVec.current)) {
        controls.target.copy(targetVec.current);
        camera.position.add(offsetVec.current);
      }
    }

    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={450}
      minPolarAngle={0.01}
      maxPolarAngle={Math.PI - 0.01}
      enableRotate={true}
      enableZoom={true}
      enablePan={true}
      rotateSpeed={0.8}
      zoomSpeed={1.1}
      panSpeed={0.8}
    />
  );
}

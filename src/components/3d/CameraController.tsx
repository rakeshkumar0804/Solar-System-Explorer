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
  sunData,
}: CameraControllerProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const isUserInteracting = useRef(false);
  const isAnimating = useRef(false);
  const prevSelectedId = useRef<string | null>(null);

  // Default isometric solar system overview
  const defaultCameraPos = useRef(new THREE.Vector3(30, 70, 100));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));

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

  useEffect(() => {
    if (selectedId !== prevSelectedId.current) {
      prevSelectedId.current = selectedId;
      isAnimating.current = true;
    }
  }, [selectedId]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Determine target world position & comfortable view distance
    let targetPos: THREE.Vector3 = defaultTarget.current;
    let minComfortableDistance = 30.0;

    if (selectedId === 'sun') {
      targetPos = defaultTarget.current;
      minComfortableDistance = Math.max(sunData.size * 4.0, 32.0);
    } else if (selectedId) {
      const planet = planets.find((p) => p.id === selectedId);
      if (planet) {
        const livePos = planetPositionsRef.current?.get(planet.id);
        if (livePos) {
          targetPos = livePos;
          minComfortableDistance = Math.max(planet.size * 5.0, 26.0);
        }
      } else {
        const dObj = deepSpaceObjects.find((o) => o.id === selectedId);
        if (dObj) {
          targetPos = new THREE.Vector3(...dObj.position);
          minComfortableDistance = Math.max(dObj.scale * 3.5, 34.0);
        }
      }
    }

    if (isAnimating.current) {
      const lerpSpeed = THREE.MathUtils.clamp(delta * 3.2, 0.03, 0.14);

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
        // Shift target smoothly to the selected object
        controls.target.lerp(targetPos, lerpSpeed);

        // Preserve current view vector and ensure comfortable, wide viewing distance
        const currentVec = new THREE.Vector3().subVectors(camera.position, controls.target);
        if (currentVec.lengthSq() < 0.001) {
          currentVec.set(minComfortableDistance * 0.4, minComfortableDistance * 0.5, minComfortableDistance * 0.7);
        }

        // Clamp distance to a comfortable non-aggressive framing
        const currentDist = currentVec.length();
        const targetDistance = Math.min(Math.max(currentDist * 0.8, minComfortableDistance), 85.0);
        currentVec.normalize().multiplyScalar(targetDistance);

        const desiredCamPos = new THREE.Vector3().addVectors(targetPos, currentVec);
        camera.position.lerp(desiredCamPos, lerpSpeed);

        const distTarget = controls.target.distanceTo(targetPos);
        const distPos = camera.position.distanceTo(desiredCamPos);

        if (distTarget < 0.15 && distPos < 0.15) {
          controls.target.copy(targetPos);
          isAnimating.current = false;
        }
      }
    } else if (selectedId && !isUserInteracting.current) {
      // Dynamic orbital tracking without abrupt camera movement
      const targetDelta = new THREE.Vector3().subVectors(targetPos, controls.target);
      if (targetDelta.lengthSq() > 0.0001) {
        controls.target.copy(targetPos);
        camera.position.add(targetDelta);
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

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

  // Solar system overview coordinates
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

    let targetPos: THREE.Vector3 = defaultTarget.current;
    let targetZoomDistance = 75;

    if (selectedId === 'sun') {
      targetPos = defaultTarget.current;
      targetZoomDistance = sunData.size * 2.8;
    } else if (selectedId) {
      const planet = planets.find((p) => p.id === selectedId);
      if (planet) {
        const livePos = planetPositionsRef.current?.get(planet.id);
        if (livePos) {
          targetPos = livePos;
          targetZoomDistance = Math.max(planet.size * 3.4, 5.5);
        }
      } else {
        const dObj = deepSpaceObjects.find((o) => o.id === selectedId);
        if (dObj) {
          targetPos = new THREE.Vector3(...dObj.position);
          targetZoomDistance = Math.max(dObj.scale * 3.8, 14.0);
        }
      }
    }

    if (isAnimating.current) {
      const lerpSpeed = THREE.MathUtils.clamp(delta * 3.5, 0.03, 0.15);

      if (!selectedId) {
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
        controls.target.lerp(targetPos, lerpSpeed);

        const offset = new THREE.Vector3().subVectors(camera.position, controls.target);
        if (offset.lengthSq() < 0.001) {
          offset.set(targetZoomDistance * 0.5, targetZoomDistance * 0.4, targetZoomDistance * 0.75);
        }
        offset.normalize().multiplyScalar(targetZoomDistance);
        const desiredCamPos = new THREE.Vector3().addVectors(targetPos, offset);

        camera.position.lerp(desiredCamPos, lerpSpeed);

        const distTarget = controls.target.distanceTo(targetPos);
        const distPos = camera.position.distanceTo(desiredCamPos);

        if (distTarget < 0.12 && distPos < 0.12) {
          controls.target.copy(targetPos);
          isAnimating.current = false;
        }
      }
    } else if (selectedId && !isUserInteracting.current) {
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

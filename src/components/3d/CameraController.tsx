import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { CelestialBody, DeepSpaceObject, SpacecraftData } from '../../types/space';

interface CameraControllerProps {
  selectedId: string | null;
  planetPositionsRef: React.RefObject<Map<string, THREE.Vector3>>;
  deepSpaceObjects: DeepSpaceObject[];
  planets: CelestialBody[];
  sunData: CelestialBody;
  spacecraft?: SpacecraftData[];
}

export function CameraController({
  selectedId,
  planetPositionsRef,
  deepSpaceObjects,
  planets,
  sunData,
  spacecraft = [],
}: CameraControllerProps) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  // Flags for interaction and animation
  const isUserInteracting = useRef(false);
  const isAnimating = useRef(false);
  const prevSelectedId = useRef<string | null>(null);

  // Default solar system overview
  const defaultCameraPos = useRef(new THREE.Vector3(30, 70, 100));
  const defaultTarget = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      isUserInteracting.current = true;
      isAnimating.current = false;
    };

    const handleEnd = () => {
      isUserInteracting.current = false;
    };

    controls.addEventListener('start', handleStart);
    controls.addEventListener('end', handleEnd);

    const domElement = gl.domElement;
    const handleWheel = () => {
      isAnimating.current = false;
    };
    domElement.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.removeEventListener('end', handleEnd);
      domElement.removeEventListener('wheel', handleWheel);
    };
  }, [gl.domElement]);

  useEffect(() => {
    if (selectedId !== prevSelectedId.current) {
      prevSelectedId.current = selectedId;
      isAnimating.current = true;
    }
  }, [selectedId]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (isUserInteracting.current) {
      controls.update();
      return;
    }

    let targetPos: THREE.Vector3 = defaultTarget.current;
    let targetZoomOffset = 70;

    if (selectedId === 'sun') {
      targetPos = defaultTarget.current;
      targetZoomOffset = sunData.size * 2.8;
    } else if (selectedId) {
      const planet = planets.find((p) => p.id === selectedId);
      if (planet) {
        const livePos = planetPositionsRef.current?.get(planet.id);
        if (livePos) {
          targetPos = livePos;
          targetZoomOffset = Math.max(planet.size * 3.4, 5.5);
        }
      } else {
        const dObj = deepSpaceObjects.find((o) => o.id === selectedId);
        if (dObj) {
          targetPos = new THREE.Vector3(...dObj.position);
          targetZoomOffset = dObj.scale * 3.5;
        } else {
          const craft = spacecraft.find((c) => c.id === selectedId);
          if (craft) {
            targetPos = new THREE.Vector3(...craft.position);
            targetZoomOffset = 4.5;
          }
        }
      }
    }

    if (isAnimating.current) {
      const lerpSpeed = THREE.MathUtils.clamp(delta * 3.0, 0.02, 0.12);

      if (!selectedId) {
        camera.position.lerp(defaultCameraPos.current, lerpSpeed);
        controls.target.lerp(defaultTarget.current, lerpSpeed);

        const distPos = camera.position.distanceTo(defaultCameraPos.current);
        const distTgt = controls.target.distanceTo(defaultTarget.current);

        if (distPos < 0.1 && distTgt < 0.1) {
          camera.position.copy(defaultCameraPos.current);
          controls.target.copy(defaultTarget.current);
          isAnimating.current = false;
        }
      } else {
        controls.target.lerp(targetPos, lerpSpeed);

        const currentOffset = new THREE.Vector3().subVectors(camera.position, controls.target);
        if (currentOffset.lengthSq() < 0.001) {
          currentOffset.set(0, targetZoomOffset * 0.6, targetZoomOffset);
        }
        currentOffset.normalize().multiplyScalar(targetZoomOffset);
        const desiredCamPos = new THREE.Vector3().addVectors(targetPos, currentOffset);

        camera.position.lerp(desiredCamPos, lerpSpeed);

        const distTarget = controls.target.distanceTo(targetPos);
        const distPos = camera.position.distanceTo(desiredCamPos);

        if (distTarget < 0.08 && distPos < 0.08) {
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
      minDistance={3}
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

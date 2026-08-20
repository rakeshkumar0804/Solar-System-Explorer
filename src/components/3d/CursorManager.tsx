import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface CursorManagerProps {
  interactiveGroupRef: React.RefObject<THREE.Group | null>;
}

export function CursorManager({ interactiveGroupRef }: CursorManagerProps) {
  const { gl, camera, raycaster, pointer } = useThree();
  const isPointerOverCanvas = useRef(false);

  useEffect(() => {
    const dom = gl.domElement;

    const handlePointerEnter = () => {
      isPointerOverCanvas.current = true;
    };

    const handlePointerLeave = () => {
      isPointerOverCanvas.current = false;
      dom.style.cursor = 'default';
      document.body.style.cursor = 'default';
    };

    dom.addEventListener('pointerenter', handlePointerEnter);
    dom.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      dom.removeEventListener('pointerenter', handlePointerEnter);
      dom.removeEventListener('pointerleave', handlePointerLeave);
      dom.style.cursor = 'default';
      document.body.style.cursor = 'default';
    };
  }, [gl]);

  useFrame(() => {
    if (!isPointerOverCanvas.current || !interactiveGroupRef.current) {
      return;
    }

    // Centralized single source of truth raycast check on every frame / pointer position
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(interactiveGroupRef.current.children, true);

    const isHovering = intersects.length > 0;
    const targetCursor = isHovering ? 'pointer' : 'default';

    if (gl.domElement.style.cursor !== targetCursor) {
      gl.domElement.style.cursor = targetCursor;
    }
    if (document.body.style.cursor !== targetCursor) {
      document.body.style.cursor = targetCursor;
    }
  });

  return null;
}

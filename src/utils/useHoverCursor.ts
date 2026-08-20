import { useCallback } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

export function useHoverCursor() {
  const onPointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = 'pointer';
  }, []);

  const onPointerOut = useCallback(() => {
    document.body.style.cursor = 'auto';
  }, []);

  return {
    onPointerOver,
    onPointerOut,
    hoverProps: {
      onPointerOver,
      onPointerOut,
    },
  };
}

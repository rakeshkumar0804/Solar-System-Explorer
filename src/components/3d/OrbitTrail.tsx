import { useMemo } from 'react';
import * as THREE from 'three';
import { useHoverCursor } from '../../utils/useHoverCursor';

interface OrbitTrailProps {
  radius: number;
  color: string;
  opacity?: number;
  segments?: number;
}

export function OrbitTrail({ radius, opacity = 0.25, segments = 128 }: OrbitTrailProps) {
  const { hoverProps } = useHoverCursor();

  const lineGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }, [radius, segments]);

  if (radius <= 0) return null;

  return (
    <group>
      {/* 1. Visible Graphic Orbit Line */}
      <primitive
        object={
          new THREE.Line(
            lineGeometry,
            new THREE.LineBasicMaterial({
              color: new THREE.Color('#475569'),
              transparent: true,
              opacity: opacity,
              depthWrite: false,
            })
          )
        }
      />

      {/* 2. Invisible Hit-Area Ring Ribbon for effortless hover detection */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        {...hoverProps}
        onClick={(e) => e.stopPropagation()}
      >
        <ringGeometry args={[Math.max(0.1, radius - 0.75), radius + 0.75, 64]} />
        <meshBasicMaterial
          visible={false}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

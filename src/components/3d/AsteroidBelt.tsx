import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AsteroidBeltProps {
  count?: number;
  timeSpeed: number;
}

export function AsteroidBelt({ count = 600, timeSpeed }: AsteroidBeltProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const asteroids = useMemo(() => {
    const data = [];
    const minRadius = 45;
    const maxRadius = 52;

    for (let i = 0; i < count; i++) {
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.008 + Math.random() * 0.006) * (48 / radius);
      const yOffset = (Math.random() - 0.5) * 2.8;
      const scale = 0.08 + Math.random() * 0.22;
      const rotSpeedX = (Math.random() - 0.5) * 0.05;
      const rotSpeedY = (Math.random() - 0.5) * 0.05;
      const rotSpeedZ = (Math.random() - 0.5) * 0.05;

      data.push({
        radius,
        angle,
        speed,
        yOffset,
        scale,
        rotSpeedX,
        rotSpeedY,
        rotSpeedZ,
        currRotX: Math.random() * Math.PI * 2,
        currRotY: Math.random() * Math.PI * 2,
        currRotZ: Math.random() * Math.PI * 2,
      });
    }
    return data;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const speedMultiplier = timeSpeed * 0.4;

    asteroids.forEach((ast, i) => {
      ast.angle += ast.speed * speedMultiplier * delta * 60;
      const rotMult = timeSpeed === 0 ? 0.05 : timeSpeed * 0.5;
      ast.currRotX += ast.rotSpeedX * rotMult * delta * 60;
      ast.currRotY += ast.rotSpeedY * rotMult * delta * 60;
      ast.currRotZ += ast.rotSpeedZ * rotMult * delta * 60;

      const x = Math.cos(ast.angle) * ast.radius;
      const z = Math.sin(ast.angle) * ast.radius;

      dummy.position.set(x, ast.yOffset, z);
      dummy.rotation.set(ast.currRotX, ast.currRotY, ast.currRotZ);
      dummy.scale.set(ast.scale, ast.scale, ast.scale);
      dummy.updateMatrix();

      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#78716c"
        roughness={0.9}
        metalness={0.2}
      />
    </instancedMesh>
  );
}

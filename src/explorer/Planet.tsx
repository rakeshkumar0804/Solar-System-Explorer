import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PRESENTATION, getBody, texturePath } from './catalog';
import { advanceTime } from './math';
import { planetVertex, earthFragment, atmosphereFragment, cloudFragment, ringVertex, ringFragment, saturnVertex, saturnFragment } from './shaders';
import { configureTexture, SUN_DIRECTION } from './textureConfig';

interface PlanetProps {
  id: string;
  radius?: number;
  speed: number;
  paused: boolean;
  detail?: boolean;
  atmosphere?: boolean;
  clouds?: boolean;
  sunlight?: THREE.Vector3;
  onClick?: () => void;
}

function EarthSurface({ clouds, sunlight }: { clouds: boolean; sunlight: THREE.Vector3 }) {
  const [day, night, ocean, normal, cloudMap] = useTexture([
    '/textures/earth.jpg', '/textures/earth-night.jpg', '/textures/earth-specular.jpg',
    '/textures/earth-normal.jpg', '/textures/earth-clouds.jpg',
  ]);
  const uniforms = useMemo(() => ({
    uDay: { value: day }, uNight: { value: night }, uOcean: { value: ocean },
    uNormal: { value: normal }, uClouds: { value: cloudMap },
    uSun: { value: sunlight }, uCloudOffset: { value: 0 }, uCloudsEnabled: { value: clouds ? 1 : 0 },
  }), [day, night, ocean, normal, cloudMap, sunlight, clouds]);
  useEffect(() => {
    configureTexture(day, true);
    configureTexture(night, true);
    for (const texture of [ocean, normal, cloudMap]) configureTexture(texture, false);
  }, [day, night, ocean, normal, cloudMap]);
  return <shaderMaterial vertexShader={planetVertex} fragmentShader={earthFragment} uniforms={uniforms} />;
}

function Clouds({ sunlight, segments }: { sunlight: THREE.Vector3; segments: number }) {
  const map = useTexture('/textures/earth-clouds.jpg');
  const uniforms = useMemo(() => ({ uClouds: { value: map }, uSun: { value: sunlight } }), [map, sunlight]);
  return <mesh scale={1.007}>
    <sphereGeometry args={[1, segments, segments / 2]} />
    <shaderMaterial transparent depthWrite={false} vertexShader={planetVertex} fragmentShader={cloudFragment} uniforms={uniforms} />
  </mesh>;
}

function Atmosphere({ id, sunlight, segments }: { id: string; sunlight: THREE.Vector3; segments: number }) {
  const colour = PRESENTATION[id].atmosphere;
  const uniforms = useMemo(() => ({
    uSun: { value: sunlight }, uColour: { value: new THREE.Color(colour ?? '#5588bb') },
    uStrength: { value: id === 'earth' ? 0.72 : 0.30 },
  }), [colour, sunlight, id]);
  if (!colour) return null;
  return <mesh scale={id === 'earth' ? 1.025 : 1.014}>
    <sphereGeometry args={[1, segments, segments / 2]} />
    <shaderMaterial transparent depthWrite={false} blending={THREE.AdditiveBlending} vertexShader={planetVertex} fragmentShader={atmosphereFragment} uniforms={uniforms} />
  </mesh>;
}

function Rings({ sunlight, tilt, detail }: { sunlight: THREE.Vector3; tilt: number; detail: boolean }) {
  const map = useTexture('/textures/saturn-rings.png');
  const uniforms = useMemo(() => {
    const sun = sunlight.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), -tilt)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    return { uMap: { value: map }, uSunLocal: { value: sun }, uInner: { value: 1.22 }, uOuter: { value: 2.32 } };
  }, [map, sunlight, tilt]);
  useEffect(() => { configureTexture(map, true); }, [map]);
  useFrame(() => {
    uniforms.uSunLocal.value.copy(sunlight)
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), -tilt)
      .applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
  });
  return <mesh rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[1.22, 2.32, detail ? 192 : 96]} />
    <shaderMaterial vertexShader={ringVertex} fragmentShader={ringFragment} uniforms={uniforms} transparent side={THREE.DoubleSide} depthWrite={false} />
  </mesh>;
}

function SaturnSurface({ sunlight }: { sunlight: THREE.Vector3 }) {
  const [day, rings] = useTexture(['/textures/saturn.jpg', '/textures/saturn-rings.png']);
  const uniforms = useMemo(() => ({ uDay: { value: day }, uRings: { value: rings }, uSun: { value: sunlight } }), [day, rings, sunlight]);
  useEffect(() => { configureTexture(day, true); configureTexture(rings, true); }, [day, rings]);
  return <shaderMaterial vertexShader={saturnVertex} fragmentShader={saturnFragment} uniforms={uniforms} />;
}

function Surface({ id, detail }: { id: string; detail: boolean }) {
  const texture = useTexture(texturePath(id));
  useEffect(() => {
    configureTexture(texture, true, detail ? 8 : 2);
  }, [texture, detail]);
  if (id === 'sun') return <meshBasicMaterial map={texture} color="#fff5df" toneMapped={false} />;
  return <meshStandardMaterial map={texture} roughness={id === 'moon' ? 1 : 0.92} metalness={0} />;
}

export function Planet({ id, radius = 1.8, speed, paused, detail = true, atmosphere = true, clouds = true, sunlight = SUN_DIRECTION, onClick }: PlanetProps) {
  const spin = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const body = getBody(id);
  const tilt = body.axialTilt * Math.PI / 180;
  const segments = detail ? 96 : 40;
  useFrame((_, delta) => {
    elapsed.current = advanceTime(elapsed.current, delta, speed, paused);
    // The tilt already reverses Venus/Uranus; do not reverse the spin a second time.
    if (spin.current) spin.current.rotation.y = (id === 'earth' ? 3.95 : 0.35) + elapsed.current * 0.045;
  });
  return <group scale={radius} rotation={[0, 0, tilt]}>
    <group ref={spin}>
      <mesh onClick={onClick ? event => { event.stopPropagation(); onClick(); } : undefined}
        onPointerOver={onClick ? event => { event.stopPropagation(); document.body.style.cursor = 'pointer'; } : undefined}
        onPointerOut={onClick ? () => { document.body.style.cursor = ''; } : undefined}>
        <sphereGeometry args={[1, segments, segments / 2]} />
        {id === 'earth' && detail ? <EarthSurface clouds={clouds} sunlight={sunlight} /> : id === 'saturn' && detail ? <SaturnSurface sunlight={sunlight} /> : <Surface id={id} detail={detail} />}
      </mesh>
      {id === 'earth' && clouds && detail && <Clouds sunlight={sunlight} segments={segments} />}
    </group>
    {id === 'saturn' && <Rings sunlight={sunlight} tilt={tilt} detail={detail} />}
    {atmosphere && detail && <Atmosphere id={id} sunlight={sunlight} segments={segments} />}
  </group>;
}

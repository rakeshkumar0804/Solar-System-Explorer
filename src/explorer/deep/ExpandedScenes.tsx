import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import type { DeepSceneProps } from './DeepScene';
import type { StarData } from './particles';
import type { Quality } from '../catalog';
import { advanceTime } from '../math';
import { EXPANDED_BUDGETS, QUALITY_BUDGETS } from './catalog';
import { andromedaStars, beltBodies, fieldStars, noiseVolume, orbitPoint, remnantFilaments, TRAPPIST_PLANETS } from './expandedParticles';
import { andromedaDustFragment, beamFragment, bridgeFragment, glowFragment, rockFragment, stellarSurfaceFragment, surfaceVertex, volumeFragment } from './expandedShaders';
import { cometNucleusGeometry, pulsarFieldGeometry, wormholeGeometry } from './expandedGeometry';
import { blackHoleVertex, planeVertex, starFragment, starVertex } from './shaders';

type MotionProps = Pick<DeepSceneProps, 'paused' | 'quality'>;

function PointField({ kind, quality }: { kind: 'sky' | 'andromeda' | 'belts'; quality: Quality }) {
  const geometry = useMemo(() => {
    const data: StarData = kind === 'andromeda' ? andromedaStars(QUALITY_BUDGETS[quality].galaxyStars) : kind === 'belts' ? beltBodies(EXPANDED_BUDGETS[quality].beltBodies) : fieldStars(EXPANDED_BUDGETS[quality].fieldStars);
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    result.setAttribute('aColour', new THREE.BufferAttribute(data.colours, 3));
    result.setAttribute('aSize', new THREE.BufferAttribute(data.sizes, 1));
    result.setAttribute('aLuminosity', new THREE.BufferAttribute(data.luminosities, 1));
    return result;
  }, [kind, quality]);
  const material = useRef<THREE.ShaderMaterial>(null);
  const dimensions = useMemo(() => new THREE.Vector2(), []);
  const uniforms = useMemo(() => ({ uScale: { value: 800 } }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ gl, camera }) => {
    gl.getDrawingBufferSize(dimensions);
    if (material.current) material.current.uniforms.uScale.value = dimensions.y / (2 * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2)));
  });
  return <points geometry={geometry} frustumCulled={false}><shaderMaterial ref={material} uniforms={uniforms} vertexShader={starVertex} fragmentShader={starFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></points>;
}

function Cloud({ mode, quality, paused }: MotionProps & { mode: 0 | 1 | 2 }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const elapsed = useRef(0);
  const noise = useMemo(() => {
    const texture = new THREE.Data3DTexture(noiseVolume(), 32, 32, 32);
    texture.format = THREE.RedFormat; texture.type = THREE.UnsignedByteType;
    texture.minFilter = texture.magFilter = THREE.LinearFilter;
    texture.wrapS = texture.wrapT = texture.wrapR = THREE.RepeatWrapping;
    texture.unpackAlignment = 1; texture.needsUpdate = true;
    return texture;
  }, []);
  useEffect(() => () => noise.dispose(), [noise]);
  const uniforms = useMemo(() => ({
    uCamera: { value: new THREE.Vector3() }, uCameraBasis: { value: new THREE.Matrix3() },
    uAspect: { value: 1 }, uTanFov: { value: Math.tan(THREE.MathUtils.degToRad(21)) },
    uTime: { value: 0 }, uSteps: { value: EXPANDED_BUDGETS[quality].volumeSteps }, uMode: { value: mode }, uNoise: { value: noise },
  }), [quality, mode, noise]);
  useFrame(({ camera, size }, delta) => {
    elapsed.current = advanceTime(elapsed.current, delta, 1, paused);
    camera.updateMatrixWorld();
    const shader = material.current;
    if (!shader) return;
    shader.uniforms.uCamera.value.copy(camera.position);
    shader.uniforms.uCameraBasis.value.setFromMatrix4(camera.matrixWorld);
    shader.uniforms.uAspect.value = size.width / Math.max(1, size.height);
    shader.uniforms.uTanFov.value = Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov / 2));
    shader.uniforms.uTime.value = elapsed.current;
  });
  return <mesh frustumCulled={false} renderOrder={-10}><planeGeometry args={[2, 2]} /><shaderMaterial ref={material} uniforms={uniforms} vertexShader={blackHoleVertex} fragmentShader={volumeFragment} depthTest={false} depthWrite={false} /></mesh>;
}

function Glow({ colour, size }: { colour: string; size: number }) {
  const uniforms = useMemo(() => ({ uColour: { value: new THREE.Color(colour) } }), [colour]);
  return <Billboard><mesh><planeGeometry args={[size, size]} /><shaderMaterial uniforms={uniforms} vertexShader={planeVertex} fragmentShader={glowFragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} /></mesh></Billboard>;
}

function Beacon({ colour = '#d1f2ff', size = 0.58 }: { colour?: string; size?: number }) {
  const uniforms = useMemo(() => ({ uColour: { value: new THREE.Color(colour) } }), [colour]);
  return <><mesh><sphereGeometry args={[size, 48, 32]} /><shaderMaterial vertexShader={surfaceVertex} fragmentShader={stellarSurfaceFragment} uniforms={uniforms} /></mesh><Glow colour={colour} size={size * 9} /></>;
}

function Pulsar({ paused, quality }: MotionProps) {
  const spin = useRef<THREE.Group>(null), elapsed = useRef(0);
  const geometry = useMemo(() => pulsarFieldGeometry(), []);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    elapsed.current = advanceTime(elapsed.current, delta, 1, paused);
    if (spin.current) spin.current.rotation.y = elapsed.current * 0.32;
  });
  return <>
    <PointField kind="sky" quality={quality} />
    <group rotation={[0, 0, -0.17]}>
      <Beacon />
      <group ref={spin}><group rotation={[0, 0, 0.57]}>
        <lineSegments geometry={geometry}><lineBasicMaterial color="#508ca6" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} /></lineSegments>
        {[1, -1].map(sign => <group key={sign} rotation={[sign === 1 ? 0 : Math.PI, 0, 0]}>
          <mesh position={[0, 4.5, 0]}><cylinderGeometry args={[1.65, 0.025, 8.0, quality === 'low' ? 32 : 56, 1, true]} /><shaderMaterial uniforms={uniforms} vertexShader={surfaceVertex} fragmentShader={beamFragment} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} /></mesh>
          <group position={[0, 0.6, 0]}><Glow colour="#78d9ff" size={2.6} /></group>
        </group>)}
      </group></group>
    </group>
  </>;
}

function Remnant(props: MotionProps) {
  const geometry = useMemo(() => {
    const data = remnantFilaments(props.quality === 'low' ? 100 : props.quality === 'high' ? 300 : 210);
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(data.positions, 3)); result.setAttribute('color', new THREE.BufferAttribute(data.colours, 3));
    return result;
  }, [props.quality]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <><Cloud {...props} mode={1} /><lineSegments geometry={geometry}><lineBasicMaterial vertexColors transparent opacity={0.18} blending={THREE.AdditiveBlending} depthWrite={false} /></lineSegments></>;
}

function Andromeda({ quality }: { quality: Quality }) {
  return <group rotation={[0, -0.24, -0.16]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[24, 24]} /><shaderMaterial vertexShader={planeVertex} fragmentShader={andromedaDustFragment} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} /></mesh>
    <PointField kind="andromeda" quality={quality} />
  </group>;
}

function OrbitPath({ radius, colour = '#6e8195', opacity = 0.22 }: { radius: number; colour?: string; opacity?: number }) {
  const geometry = useMemo(() => {
    const points = Array.from({ length: 161 }, (_, index) => new THREE.Vector3(Math.cos(index / 160 * Math.PI * 2) * radius, 0, Math.sin(index / 160 * Math.PI * 2) * radius));
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);
  const material = useMemo(() => new THREE.LineBasicMaterial({ color: colour, transparent: true, opacity, depthWrite: false }), [colour, opacity]);
  const line = useMemo(() => new THREE.Line(geometry, material), [geometry, material]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  return <primitive object={line} />;
}

function SmallWorld({ planet, paused }: { planet: typeof TRAPPIST_PLANETS[number]; paused: boolean }) {
  const group = useRef<THREE.Group>(null), material = useRef<THREE.ShaderMaterial>(null), elapsed = useRef(0);
  const position = useMemo(() => orbitPoint(planet.radius, planet.phase, planet.period, 0), [planet]);
  const uniforms = useMemo(() => ({ uColour: { value: new THREE.Color(planet.colour) }, uLight: { value: new THREE.Vector3() } }), [planet.colour]);
  const light = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera }, delta) => {
    elapsed.current = advanceTime(elapsed.current, delta, 1, paused);
    if (!group.current || !material.current) return;
    group.current.position.set(...orbitPoint(planet.radius, planet.phase, planet.period, elapsed.current));
    camera.updateMatrixWorld();
    light.copy(group.current.position).negate().transformDirection(camera.matrixWorldInverse);
    material.current.uniforms.uLight.value.copy(light);
  });
  return <group ref={group} position={position}>
    <mesh><sphereGeometry args={[planet.size, 32, 24]} /><shaderMaterial ref={material} vertexShader={surfaceVertex} fragmentShader={rockFragment} uniforms={uniforms} /></mesh>
    <Html position={[0, planet.size + 0.26, 0]} center zIndexRange={[2, 0]}><span className="cosmic-world-label">{planet.letter}</span></Html>
  </group>;
}

function Exoplanets(props: MotionProps) {
  return <><PointField kind="sky" quality={props.quality} /><Beacon colour="#ffad72" size={0.78} />
    {TRAPPIST_PLANETS.map(planet => <group key={planet.letter}><OrbitPath radius={planet.radius} colour="#b0937c" /><SmallWorld planet={planet} paused={props.paused} /></group>)}
  </>;
}

function Comet(props: MotionProps) {
  const geometry = useMemo(() => cometNucleusGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <><Cloud {...props} mode={2} />
    <directionalLight position={[-12, 3, 7]} intensity={2.5} color="#ffe5c8" /><ambientLight intensity={0.12} />
    <mesh geometry={geometry} position={[-4.1, 0, 0]} rotation={[0.4, 0.2, -0.3]}><meshStandardMaterial color="#655c52" roughness={1} /></mesh>
    <Html position={[-8.1, 0, 0]} center zIndexRange={[2, 0]}><span className="cosmic-direction">← SUNWARD</span></Html>
  </>;
}

function Frontiers({ quality }: { quality: Quality }) {
  const anchors = [
    { radius: 3.1, angle: 2.3, name: 'Mars', colour: '#c79277', size: 0.09 },
    { radius: 5.8, angle: 4.4, name: 'Jupiter', colour: '#d8bc93', size: 0.21 },
    { radius: 8.8, angle: 0.65, name: 'Neptune', colour: '#5687be', size: 0.17 },
    { radius: 10.8, angle: 2.1, name: 'Pluto', colour: '#bcaaa0', size: 0.08 },
  ];
  return <><PointField kind="sky" quality={quality} /><Beacon colour="#ffe0a0" size={0.37} /><PointField kind="belts" quality={quality} />
    {anchors.map(anchor => <group key={anchor.name}>
      <OrbitPath radius={anchor.radius} opacity={0.10} />
      <group position={[Math.cos(anchor.angle) * anchor.radius, 0, Math.sin(anchor.angle) * anchor.radius]}>
        <mesh><sphereGeometry args={[anchor.size, 24, 16]} /><meshBasicMaterial color={anchor.colour} /></mesh>
        <Html position={[0, 0.4, 0]} center zIndexRange={[2, 0]}><span className="cosmic-world-label">{anchor.name}</span></Html>
      </group>
    </group>)}
    <Html position={[-4.5, 0.1, -0.6]} center zIndexRange={[2, 0]}><span className="cosmic-region-label">ASTEROID BELT</span></Html>
    <Html position={[10.7, 0.3, 0]} center zIndexRange={[2, 0]}><span className="cosmic-region-label">KUIPER BELT</span></Html>
  </>;
}

function Wormhole({ quality }: { quality: Quality }) {
  const geometry = useMemo(() => wormholeGeometry(quality === 'low'), [quality]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <><PointField kind="sky" quality={quality} /><group rotation={[0.0, 0.0, -0.2]}>
    <mesh geometry={geometry}><shaderMaterial vertexShader={surfaceVertex} fragmentShader={bridgeFragment} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} /></mesh>
    <Html position={[0, 0, 0]} center zIndexRange={[2, 0]}><span className="cosmic-region-label">HYPOTHETICAL THROAT</span></Html>
  </group></>;
}

export default function ExpandedScenes(props: DeepSceneProps) {
  switch (props.selected) {
    case 'orion-nebula': return <Cloud {...props} mode={0} />;
    case 'pulsar': return <Pulsar {...props} />;
    case 'crab-nebula': return <Remnant {...props} />;
    case 'andromeda': return <Andromeda quality={props.quality} />;
    case 'trappist-1': return <Exoplanets {...props} />;
    case 'comet': return <Comet {...props} />;
    case 'solar-frontiers': return <Frontiers quality={props.quality} />;
    case 'wormhole': return <Wormhole quality={props.quality} />;
    default: return null;
  }
}

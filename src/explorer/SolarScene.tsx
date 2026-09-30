import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { Planet } from './Planet';
import { SUN_DIRECTION } from './textureConfig';
import { BODIES, PRESENTATION } from './catalog';
import type { Quality, ViewMode } from './catalog';
import { ORBITS, advanceTime, orbitalPosition, seedRandom } from './math';

export interface SceneProps {
  selected: string;
  mode: ViewMode;
  quality: Quality;
  paused: boolean;
  speed: number;
  showOrbits: boolean;
  showLabels: boolean;
  atmosphere: boolean;
  clouds: boolean;
  reset: number;
  zoom: { sequence: number; direction: number };
  onSelect: (id: string) => void;
  onReady: () => void;
  onError: () => void;
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Solar scene failed:', error, info.componentStack);
    this.props.onError();
  }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function Starfield() {
  const geometry = useMemo(() => {
    const random = seedRandom();
    const points = new Float32Array(1100 * 3);
    const colours = new Float32Array(1100 * 3);
    for (let i = 0; i < 1100; i++) {
      const z = random() * 2 - 1;
      const angle = random() * Math.PI * 2;
      const r = 160 + random() * 70;
      const length = Math.sqrt(1 - z * z);
      points.set([length * Math.cos(angle) * r, z * r, length * Math.sin(angle) * r], i * 3);
      const brightness = 0.18 + random() * 0.46;
      colours.set([brightness * 0.95, brightness, brightness * (1 + random() * 0.15)], i * 3);
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(points, 3));
    result.setAttribute('color', new THREE.BufferAttribute(colours, 3));
    return result;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <points geometry={geometry}><pointsMaterial size={0.07} vertexColors transparent opacity={0.75} sizeAttenuation depthWrite={false} /></points>;
}

function Navigation({ mode, selected, reset, zoom }: Pick<SceneProps, 'mode' | 'selected' | 'reset' | 'zoom'>) {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, size, invalidate } = useThree();
  const moving = useRef(true);
  const destination = useRef(new THREE.Vector3());
  const offset = useMemo(() => new THREE.Vector3(), []);
  const centre = useMemo(() => new THREE.Vector3(), []);
  const minimum = mode === 'overview' ? 12 : selected === 'saturn' ? 4.8 : 3.1;
  const maximum = mode === 'overview' ? 135 : 18;
  useEffect(() => {
    const portrait = size.width / size.height < 0.85;
    if (mode === 'overview') destination.current.set(0, portrait ? 65 : 45, portrait ? 74 : 52);
    else destination.current.set(0, selected === 'saturn' ? 4.2 : 0.32, (selected === 'saturn' ? 9.1 : 7.3) * (portrait ? 1.22 : 1));
    moving.current = true;
    invalidate();
  }, [mode, selected, reset, size.width, size.height, invalidate]);
  useEffect(() => {
    if (!zoom.sequence || !controls.current) return;
    offset.copy(camera.position).sub(controls.current.target);
    const distance = THREE.MathUtils.clamp(offset.length() * (zoom.direction > 0 ? 0.8 : 1.25), minimum, maximum);
    destination.current.copy(controls.current.target).add(offset.setLength(distance));
    moving.current = true;
    invalidate();
  }, [zoom, camera, minimum, maximum, offset, invalidate]);
  useFrame((_, delta) => {
    if (!moving.current || !controls.current) return;
    const factor = 1 - Math.exp(-Math.min(delta, 0.1) * 5);
    camera.position.lerp(destination.current, factor);
    controls.current.target.lerp(centre, factor);
    controls.current.update();
    if (camera.position.distanceTo(destination.current) < 0.006) moving.current = false;
    else invalidate();
  });
  return <OrbitControls ref={controls} makeDefault enablePan={false} enableDamping dampingFactor={0.07}
    minDistance={minimum} maxDistance={maximum} minPolarAngle={0.12} maxPolarAngle={Math.PI - 0.12}
    rotateSpeed={0.45} zoomSpeed={0.55} onStart={() => { moving.current = false; }} />;
}

function Orbit({ radius }: { radius: number }) {
  const points = useMemo(() => Array.from({ length: 129 }, (_, index) => {
    const angle = index / 128 * Math.PI * 2;
    return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number];
  }), [radius]);
  return <Line points={points} color="#52606e" transparent opacity={0.32} lineWidth={0.65} />;
}

function OrbitingPlanet({ id, speed, paused, labels, onSelect }: { id: string; speed: number; paused: boolean; labels: boolean; onSelect: (id: string) => void }) {
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const direction = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, delta) => {
    elapsed.current = advanceTime(elapsed.current, delta, speed, paused);
    const position = orbitalPosition(id, elapsed.current);
    if (group.current) group.current.position.set(...position);
    direction.set(-position[0], -position[1], -position[2]).normalize();
  });
  return <group ref={group} position={orbitalPosition(id, 0)}>
    <Planet id={id} radius={ORBITS[id].size} paused={paused} speed={speed} detail={false} sunlight={direction} onClick={() => onSelect(id)} />
    {labels && <Html position={[0, ORBITS[id].size + 0.55, 0]} center zIndexRange={[2, 0]}>
      <button className="orbit-label" onClick={() => onSelect(id)}>{PRESENTATION[id].title}</button>
    </Html>}
  </group>;
}

function SceneContent(props: SceneProps) {
  const { gl } = useThree();
  const { onReady, onError } = props;
  useEffect(() => {
    onReady();
    const canvas = gl.domElement;
    const lost = (event: Event) => { event.preventDefault(); onError(); };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onReady, onError]);
  return <>
    <Starfield />
    <ambientLight intensity={props.mode === 'overview' ? 0.08 : 0.025} />
    {props.mode === 'overview' ? <>
      <pointLight position={[0, 0, 0]} intensity={155} decay={1} />
      <Planet id="sun" radius={2.1} speed={props.speed} paused={props.paused} detail={false} onClick={() => props.onSelect('sun')} />
      {BODIES.filter(body => ORBITS[body.id]).map(body => <group key={body.id}>
        {props.showOrbits && <Orbit radius={ORBITS[body.id].radius} />}
        <OrbitingPlanet id={body.id} speed={props.speed} paused={props.paused} labels={props.showLabels} onSelect={props.onSelect} />
      </group>)}
    </> : <>
      <directionalLight position={SUN_DIRECTION.clone().multiplyScalar(12)} intensity={3.0} color="#fff6e8" />
      <Planet key={props.selected} id={props.selected} radius={props.selected === 'saturn' ? 1.45 : 1.85}
        speed={props.speed} paused={props.paused} detail={props.quality !== 'low'} atmosphere={props.atmosphere} clouds={props.clouds} />
      {props.selected === 'earth' && <group position={[3.1, 0.65, -1.55]}>
        <Planet id="moon" radius={1.85 * 0.27264} speed={props.speed} paused={props.paused} detail={props.quality !== 'low'} onClick={() => props.onSelect('moon')} />
        {props.showLabels && <Html position={[0, -0.75, 0]} center zIndexRange={[2, 0]}><button className="moon-label" onClick={() => props.onSelect('moon')}>MOON <span>↗</span></button></Html>}
      </group>}
    </>}
    <Navigation mode={props.mode} selected={props.selected} reset={props.reset} zoom={props.zoom} />
  </>;
}

export default function SolarScene(props: SceneProps) {
  const [active, setActive] = useState(!document.hidden);
  useEffect(() => {
    const changed = () => setActive(!document.hidden);
    document.addEventListener('visibilitychange', changed);
    return () => document.removeEventListener('visibilitychange', changed);
  }, []);
  const fallback = <div className="scene-error"><span>3D view unavailable</span><p>You can still explore planet details and comparisons. Enable browser graphics acceleration to use the 3D view.</p></div>;
  return <SceneBoundary fallback={fallback} onError={props.onError}>
    <Canvas camera={{ position: [0, 0.32, 7.3], fov: 38, near: 0.03, far: 450 }}
      dpr={props.quality === 'high' ? [1, 2] : props.quality === 'low' ? 1 : [1, 1.5]}
      frameloop={!active ? 'never' : props.paused ? 'demand' : 'always'}
      gl={{ antialias: props.quality !== 'low', alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
      fallback={fallback} onCreated={({ gl }) => { gl.setClearColor('#03060b', 0); }}>
      <Suspense fallback={null}><SceneContent {...props} /></Suspense>
    </Canvas>
  </SceneBoundary>;
}

import { Component, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import type { OrbitControls as Controls } from 'three-stdlib';
import * as THREE from 'three';
import type { Quality } from '../catalog';
import { advanceTime } from '../math';
import { CAMERA_LIMITS, cameraPosition, graphicsDpr, QUALITY_BUDGETS } from './catalog';
import type { CameraPreset, DestinationId } from './catalog';
import { clusterStars, galaxyStars } from './particles';
import { blackHoleFragment, blackHoleVertex, galaxyDustFragment, planeVertex, starFragment, starVertex } from './shaders';
import ExpandedScenes from './ExpandedScenes';

export interface DeepSceneProps {
  selected: DestinationId;
  quality: Quality;
  paused: boolean;
  labels: boolean;
  preset: CameraPreset;
  reset: number;
  zoom: { sequence: number; direction: number };
  onReady: () => void;
  onError: () => void;
}
class GraphicsBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error) { console.error('Deep Space scene failed:', error); this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Stars({ kind, count }: { kind: 'galaxy' | 'cluster'; count: number }) {
  const geometry = useMemo(() => {
    const data = kind === 'galaxy' ? galaxyStars(count) : clusterStars(count);
    const next = new THREE.BufferGeometry();
    next.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    next.setAttribute('aColour', new THREE.BufferAttribute(data.colours, 3));
    next.setAttribute('aSize', new THREE.BufferAttribute(data.sizes, 1));
    next.setAttribute('aLuminosity', new THREE.BufferAttribute(data.luminosities, 1));
    return next;
  }, [kind, count]);
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uScale: { value: 800 } }), []);
  const size = useMemo(() => new THREE.Vector2(), []);
  useFrame(({ gl, camera }) => {
    gl.getDrawingBufferSize(size);
    if (material.current) material.current.uniforms.uScale.value = size.y / (2 * Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov * 0.5)));
  });
  useEffect(() => () => geometry.dispose(), [geometry]);
  return <points geometry={geometry} frustumCulled={false}>
    <shaderMaterial vertexShader={starVertex} fragmentShader={starFragment} ref={material} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
  </points>;
}

function Galaxy({ quality, labels }: Pick<DeepSceneProps, 'quality' | 'labels'>) {
  return <group rotation={[0, -0.3, 0]}>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[23, 23]} />
      <shaderMaterial vertexShader={planeVertex} fragmentShader={galaxyDustFragment} transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
    </mesh>
    <Stars kind="galaxy" count={QUALITY_BUDGETS[quality].galaxyStars} />
    {labels && <Html position={[-3.6, 0.22, 4.5]} center zIndexRange={[3, 0]}>
      <span className="cosmic-marker"><i /><span>OUR SOLAR SYSTEM<small>Approximate location</small></span></span>
    </Html>}
  </group>;
}

function BlackHole({ quality, paused }: Pick<DeepSceneProps, 'quality' | 'paused'>) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uCamera: { value: new THREE.Vector3() }, uCameraBasis: { value: new THREE.Matrix3() }, uAspect: { value: 1 }, uTanFov: { value: Math.tan(THREE.MathUtils.degToRad(21)) }, uTime: { value: 0 }, uSteps: { value: QUALITY_BUDGETS[quality].raySteps } }), [quality]);
  const elapsed = useRef(0);
  useFrame(({ camera, size }, delta) => {
    elapsed.current = advanceTime(elapsed.current, delta, 1, paused);
    camera.updateMatrixWorld();
    const shader = material.current;
    if (!shader) return;
    shader.uniforms.uCamera.value.copy(camera.position);
    shader.uniforms.uCameraBasis.value.setFromMatrix4(camera.matrixWorld);
    shader.uniforms.uAspect.value = size.width / Math.max(1, size.height);
    shader.uniforms.uTanFov.value = Math.tan(THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov * 0.5));
    shader.uniforms.uTime.value = elapsed.current;
    shader.uniforms.uSteps.value = QUALITY_BUDGETS[quality].raySteps;
  });
  return <mesh frustumCulled={false}>
    <planeGeometry args={[2, 2]} />
    <shaderMaterial vertexShader={blackHoleVertex} fragmentShader={blackHoleFragment} ref={material} uniforms={uniforms} depthWrite={false} depthTest={false} />
  </mesh>;
}

function CameraRig({ selected, paused, preset, reset, zoom }: DeepSceneProps) {
  const controls = useRef<Controls>(null);
  const { camera, size, invalidate } = useThree();
  const destination = useRef(new THREE.Vector3());
  const moving = useRef(true);
  const [minimum, maximum] = CAMERA_LIMITS[selected];
  useEffect(() => {
    destination.current.set(...cameraPosition(selected, preset, size.width / size.height < 0.8));
    moving.current = true;
    invalidate();
  }, [selected, preset, reset, size.width, size.height, invalidate]);
  useEffect(() => {
    if (!zoom.sequence) return;
    destination.current.copy(camera.position).multiplyScalar(zoom.direction > 0 ? 0.82 : 1.22).clampLength(minimum, maximum);
    moving.current = true;
    invalidate();
  }, [zoom, camera, minimum, maximum, invalidate]);
  useFrame((_, delta) => {
    if (!controls.current) return;
    controls.current.autoRotate = !paused && !['black-hole', 'pulsar', 'trappist-1'].includes(selected) && !moving.current;
    if (!moving.current) return;
    camera.position.lerp(destination.current, 1 - Math.exp(-Math.min(delta, 0.1) * 7));
    controls.current.update();
    moving.current = camera.position.distanceTo(destination.current) > 0.008;
    if (moving.current) invalidate();
  }, -0.5);
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} enablePan={false}
    minDistance={minimum} maxDistance={maximum} minPolarAngle={0.04} maxPolarAngle={Math.PI - 0.04}
    autoRotate={false} autoRotateSpeed={0.1} rotateSpeed={0.4} zoomSpeed={0.55}
    onStart={() => { moving.current = false; }} />;
}

function ResolutionBudget({ selected, quality }: Pick<DeepSceneProps, 'selected' | 'quality'>) {
  const size = useThree(state => state.size);
  const setDpr = useThree(state => state.setDpr);
  const currentDpr = useThree(state => state.viewport.dpr);
  useEffect(() => {
    // Canvas can reapply its DPR during parent updates. Reconcile that as well as resizes.
    const target = graphicsDpr(selected, quality, size.width, size.height, window.devicePixelRatio || 1);
    if (Math.abs(currentDpr - target) > 0.0001) setDpr(target);
  }, [selected, quality, size.width, size.height, currentDpr, setDpr]);
  return null;
}

function SceneContent(props: DeepSceneProps) {
  const { gl } = useThree();
  const { selected, onReady, onError } = props;
  useEffect(() => {
    onReady();
    const lost = (event: Event) => { event.preventDefault(); onError(); };
    const element = gl.domElement;
    element.addEventListener('webglcontextlost', lost);
    return () => element.removeEventListener('webglcontextlost', lost);
  }, [selected, gl, onReady, onError]);
  return <>
    <ResolutionBudget selected={props.selected} quality={props.quality} />
    <CameraRig {...props} />
    {selected === 'milky-way' ? <Galaxy quality={props.quality} labels={props.labels} /> : selected === 'black-hole' ? <BlackHole quality={props.quality} paused={props.paused} /> : selected === 'messier-13' ? <Stars kind="cluster" count={QUALITY_BUDGETS[props.quality].clusterStars} /> : <ExpandedScenes key={selected} {...props} />}
  </>;
}

export default function DeepScene(props: DeepSceneProps) {
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const changed = () => setVisible(!document.hidden);
    document.addEventListener('visibilitychange', changed);
    return () => document.removeEventListener('visibilitychange', changed);
  }, []);
  return <GraphicsBoundary onError={props.onError}>
    <Canvas camera={{ position: cameraPosition(props.selected, 'home'), fov: 42, near: 0.05, far: 150 }}
      dpr={[1, QUALITY_BUDGETS[props.quality].maxDpr]} frameloop={!visible ? 'never' : props.paused ? 'demand' : 'always'}
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1 }}
      fallback={<p>WebGL 2 is required for this view.</p>}
      onCreated={({ gl }) => {
        gl.setClearColor('#020407', 1);
        gl.debug.onShaderError = (_context, _program, vertex, fragment) => {
          console.error('Deep Space shader compilation failed.', vertex, fragment);
          props.onError();
        };
      }}>
      <SceneContent {...props} />
    </Canvas>
  </GraphicsBoundary>;
}

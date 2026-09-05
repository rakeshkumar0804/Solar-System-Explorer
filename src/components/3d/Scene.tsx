import React, { useRef, useState, useEffect, useCallback, Component, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import type { CelestialBody, DeepSpaceObject, ThemeConfig, CosmicToggles } from '../../types/space';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { OrbitTrail } from './OrbitTrail';
import { AsteroidBelt } from './AsteroidBelt';
import { SpaceObjects } from './SpaceObjects';
import { HabitableZone } from './HabitableZone';
import { CameraController } from './CameraController';
import { CursorManager } from './CursorManager';
import { WebGLFallback } from './WebGLFallback';
import { isWebGLSupported } from '../../utils/webgl';

interface SceneErrorBoundaryProps {
  children: ReactNode;
  fallback: (error: Error, reset: () => void) => ReactNode;
  onReset?: () => void;
  onError?: (err: Error) => void;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, SceneErrorBoundaryState> {
  constructor(props: SceneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SceneErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('WebGL / 3D Canvas initialization error captured:', error.message, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback(this.state.error, this.handleReset);
    }
    return this.props.children;
  }
}

interface SceneProps {
  sunData: CelestialBody;
  planets: CelestialBody[];
  deepSpaceObjects: DeepSpaceObject[];
  theme: ThemeConfig;
  timeSpeed: number;
  showOrbits: boolean;
  showLabels: boolean;
  cosmicToggles: CosmicToggles;
  selectedId: string | null;
  resetTrigger?: number;
  onSelect: (id: string | null) => void;
  onSceneReady?: () => void;
  onWebGLFailure?: (reason: string) => void;
}

export function Scene({
  sunData,
  planets,
  deepSpaceObjects,
  theme,
  timeSpeed,
  showOrbits,
  showLabels,
  cosmicToggles,
  selectedId,
  resetTrigger = 0,
  onSelect,
  onSceneReady,
  onWebGLFailure,
}: SceneProps) {
  const planetPositions = useRef(new Map<string, THREE.Vector3>());
  const interactiveGroupRef = useRef<THREE.Group>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [contextLost, setContextLost] = useState<boolean>(false);

  // Check WebGL support on mount or retry
  useEffect(() => {
    const supported = isWebGLSupported();
    setIsSupported(supported);
    setContextLost(false);
    if (!supported && onWebGLFailure) {
      onWebGLFailure('WebGL is disabled or unsupported by your graphics driver');
    }
  }, [retryKey, onWebGLFailure]);

  const handlePositionUpdate = useCallback((id: string, pos: THREE.Vector3) => {
    planetPositions.current.set(id, pos.clone());
  }, []);

  const handleRetry = useCallback(() => {
    setContextLost(false);
    setIsSupported(true);
    setRetryKey((k) => k + 1);
  }, []);

  if (!isSupported || contextLost) {
    return (
      <WebGLFallback
        theme={theme}
        onRetry={handleRetry}
        reason={contextLost ? 'WebGL context was lost' : 'WebGL is disabled or unsupported by your graphics driver'}
      />
    );
  }

  return (
    <div className="w-full h-full absolute inset-0 z-0 pointer-events-auto touch-none">
      <SceneErrorBoundary
        key={`scene-boundary-${retryKey}`}
        onReset={handleRetry}
        onError={(err) => onWebGLFailure?.(err.message)}
        fallback={(error, reset) => (
          <WebGLFallback
            theme={theme}
            onRetry={reset}
            reason={error.message || 'Renderer context initialization failed'}
          />
        )}
      >
        <Canvas
          key={`canvas-${retryKey}`}
          camera={{ position: [0, 75, 125], fov: 45, near: 0.1, far: 1000 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            const canvasEl = gl.domElement;
            const handleContextLost = (event: Event) => {
              event.preventDefault();
              console.warn('WebGL context lost. Handling gracefully.');
              setContextLost(true);
              onWebGLFailure?.('WebGL context was lost');
            };
            const handleContextRestored = () => {
              console.info('WebGL context restored.');
              setContextLost(false);
              setRetryKey((k) => k + 1);
            };

            canvasEl.addEventListener('webglcontextlost', handleContextLost, false);
            canvasEl.addEventListener('webglcontextrestored', handleContextRestored, false);

            if (onSceneReady) {
              // Signal scene ready
              onSceneReady();
            }
          }}
          onPointerMissed={() => onSelect(null)}
        >
          <color attach="background" args={[theme.bgSpace]} />
          <ambientLight color={theme.ambientColor} intensity={theme.ambientIntensity} />
          <directionalLight
            position={[30, 40, 20]}
            intensity={0.3}
            color={theme.ambientColor}
          />

          {/* Clean Pinpoint Drei Stars */}
          <Stars
            radius={150}
            depth={50}
            count={3000}
            factor={2}
            saturation={0}
            fade
            speed={0.4}
          />

          {/* Centralized Raycast Cursor Manager */}
          <CursorManager interactiveGroupRef={interactiveGroupRef} />

          {/* Group containing all interactive clickable and hoverable elements */}
          <group ref={interactiveGroupRef}>
            {/* Central Sun */}
            <Sun
              data={sunData}
              theme={theme}
              timeSpeed={timeSpeed}
              isSelected={selectedId === 'sun'}
              showLabels={showLabels}
              onSelect={(id) => onSelect(id)}
            />

            {/* Goldilocks Habitable Zone Volumetric Ring */}
            {cosmicToggles?.habitableZone && (
              <HabitableZone
                innerRadius={21.5}
                outerRadius={28.5}
              />
            )}

            {/* Concentric Planetary Orbits with Hover Line Hit Ribbons */}
            {showOrbits &&
              planets.map((planet) => (
                <OrbitTrail
                  key={'orbit_' + planet.id}
                  radius={planet.orbitRadius}
                  color={theme.orbitColor}
                  opacity={theme.orbitOpacity}
                />
              ))}

            {/* 3D Planets & Moons */}
            {planets.map((planet) => (
              <Planet
                key={planet.id}
                data={planet}
                theme={theme}
                timeSpeed={timeSpeed}
                isSelected={selectedId === planet.id}
                showLabels={showLabels}
                showAtmosphere={cosmicToggles?.atmospheres ?? true}
                onSelect={(id) => onSelect(id)}
                onPositionUpdate={handlePositionUpdate}
              />
            ))}

            {/* Instanced Asteroid Belt */}
            {cosmicToggles?.asteroidBelt && (
              <AsteroidBelt
                count={650}
                timeSpeed={timeSpeed}
              />
            )}

            {/* Deep Space Objects & Cosmic Phenomena */}
            <SpaceObjects
              objects={deepSpaceObjects}
              theme={theme}
              timeSpeed={timeSpeed}
              showLabels={showLabels}
              cosmicToggles={cosmicToggles}
              selectedId={selectedId}
              onSelect={(id) => onSelect(id)}
            />
          </group>

          {/* Camera Controls */}
          <CameraController
            selectedId={selectedId}
            resetTrigger={resetTrigger}
            planetPositionsRef={planetPositions}
            deepSpaceObjects={deepSpaceObjects}
            planets={planets}
            sunData={sunData}
          />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { CosmicCanvas, type BootPhase } from './CosmicCanvas';
import { BootHUD } from './BootHUD';

interface BootScreenProps {
  isSceneReady: boolean;
  onComplete: () => void;
  isReplay?: boolean;
}

export function BootScreen({ isSceneReady, onComplete, isReplay = false }: BootScreenProps) {
  const [phase, setPhase] = useState<BootPhase>('wakeup');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING NAVIGATION CORE');
  const [stageIndex, setStageIndex] = useState(0);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [isWaitingForScene, setIsWaitingForScene] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const animFrameRef = useRef<number | null>(null);
  const hasFinishedTimelineRef = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  const handleFinish = useCallback(() => {
    setIsFadingOut(true);
    if (!isReplay && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('hasSeenCosmicBoot', 'true');
      } catch {
        // sessionStorage safety
      }
    }
    setTimeout(() => {
      onComplete();
    }, 800);
  }, [onComplete, isReplay]);

  // Handle Skip Intro
  const handleSkip = useCallback(() => {
    if (isSceneReady) {
      handleFinish();
    } else {
      setIsWaitingForScene(true);
      setStatusText('PREPARING 3D ENVIRONMENT');
      setStageIndex(3);
    }
  }, [isSceneReady, handleFinish]);

  // If waiting for scene and scene becomes ready, finish cleanly
  useEffect(() => {
    if (isWaitingForScene && isSceneReady) {
      handleFinish();
    }
  }, [isWaitingForScene, isSceneReady, handleFinish]);

  // Main 9.5 - 10.5s NASA Intelligent Space Navigation Startup Timeline
  useEffect(() => {
    startTimeRef.current = Date.now();

    const updateTimeline = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setTotalElapsed(elapsed);

      // Phase 1: 0.0s - 2.0s (System Wake-Up)
      if (elapsed < 2.0) {
        setPhase('wakeup');
        setPhaseProgress(elapsed / 2.0);
        setStatusText('INITIALIZING NAVIGATION CORE');
        setStageIndex(0);
        setDiagnostics([]);
      }
      // Phase 2: 2.0s - 5.0s (Diagnostic Checks & Module Initialization)
      else if (elapsed < 5.0) {
        setPhase('diagnostics');
        const p2Progress = (elapsed - 2.0) / 3.0;
        setPhaseProgress(p2Progress);

        // Sequential diagnostic log accumulation
        const logs: string[] = [];
        if (elapsed >= 2.2) logs.push('Rendering engine detected');
        if (elapsed >= 2.9) logs.push('Celestial database loaded');
        if (elapsed >= 3.6) logs.push('Orbital coordinates synchronized');
        if (elapsed >= 4.2) logs.push('Interaction controls registered');
        if (elapsed >= 4.8) {
          logs.push(isSceneReady ? 'WebGL context stable' : 'WebGL pipeline verifying');
        }
        setDiagnostics(logs);

        if (elapsed < 3.5) {
          setStatusText('DIAGNOSING SYSTEM MODULES');
          setStageIndex(0);
        } else {
          setStatusText('SYNCHRONIZING STAR MAP');
          setStageIndex(1);
        }
      }
      // Phase 3: 5.0s - 8.0s (Solar-System Vector Construction)
      else if (elapsed < 8.0) {
        setPhase('construction');
        const p3Progress = (elapsed - 5.0) / 3.0;
        setPhaseProgress(p3Progress);
        setDiagnostics([
          'Rendering engine detected',
          'Celestial database loaded',
          'Orbital coordinates synchronized',
          'Interaction controls registered',
          'WebGL context stable',
        ]);

        if (elapsed < 6.0) {
          setStatusText('MAPPING CELESTIAL OBJECTS');
          setStageIndex(2);
        } else if (elapsed < 7.0) {
          setStatusText('COMPUTING ORBITAL PATHS');
          setStageIndex(2);
        } else {
          setStatusText('CALIBRATING SPATIAL SCALE');
          setStageIndex(2);
        }
      }
      // Phase 4: 8.0s - 10.0s (Interface Online Confirmation)
      else if (elapsed < 10.0) {
        setPhase('online');
        setPhaseProgress((elapsed - 8.0) / 2.0);
        setStatusText('NAVIGATION SYSTEM ONLINE');
        setStageIndex(3);
      }
      // Phase 5: 10.0s - 11.0s (Natural Handoff & Scene Transition)
      else if (elapsed < 11.0) {
        setPhase('handoff');
        setPhaseProgress((elapsed - 10.0) / 1.0);
        setStatusText('HANDOFF TO INTERACTIVE EXPLORER');
        setStageIndex(3);
      }
      // Finished Timeline
      else {
        if (!hasFinishedTimelineRef.current) {
          hasFinishedTimelineRef.current = true;
          setPhase('ready');
          if (isSceneReady) {
            handleFinish();
          } else {
            setIsWaitingForScene(true);
            setStatusText('PREPARING 3D ENVIRONMENT');
          }
        }
      }

      if (!hasFinishedTimelineRef.current || !isSceneReady) {
        animFrameRef.current = requestAnimationFrame(updateTimeline);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateTimeline);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isSceneReady, handleFinish]);

  return (
    <div
      className={`fixed inset-0 z-[120] bg-[#05010d] overflow-hidden transition-opacity duration-1000 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 2D Canvas Cosmic Progression (Zero WebGL dependency) */}
      <CosmicCanvas
        phase={phase}
        phaseProgress={phaseProgress}
        totalElapsed={totalElapsed}
        reducedMotion={reducedMotion}
      />

      {/* Futuristic NASA Telemetry HUD */}
      <BootHUD
        phase={phase}
        statusText={statusText}
        stageIndex={stageIndex}
        diagnostics={diagnostics}
        totalElapsed={totalElapsed}
        onSkip={handleSkip}
        isWaitingForScene={isWaitingForScene}
      />
    </div>
  );
}

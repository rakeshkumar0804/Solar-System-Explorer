import { FastForward, Radio, CheckCircle2, ShieldCheck, AlertOctagon, AlertTriangle } from 'lucide-react';
import type { BootPhase } from './CosmicCanvas';
import type { WebGLStatus } from '../../types/space';

export interface DiagnosticEntry {
  text: string;
  isError?: boolean;
}

interface BootHUDProps {
  phase: BootPhase;
  statusText: string;
  stageIndex: number; // 0..3 (Engine, Star Map, Orbits, Scene)
  diagnostics: DiagnosticEntry[];
  totalElapsed: number;
  webglStatus: WebGLStatus;
  onSkip: () => void;
  isWaitingForScene: boolean;
}

const STAGES = ['Engine', 'Star Map', 'Orbits', 'Scene'];

export function BootHUD({
  phase,
  statusText,
  stageIndex,
  diagnostics,
  totalElapsed,
  webglStatus,
  onSkip,
  isWaitingForScene,
}: BootHUDProps) {
  const isUnsupported = webglStatus === 'unsupported';

  return (
    <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-8 select-none text-slate-200">
      {/* 1. TOP BAR */}
      <header className="flex items-center justify-between pointer-events-auto">
        {/* Top Left System Identity */}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isUnsupported ? 'bg-amber-400' : 'bg-cyan-400'} animate-pulse`} aria-hidden="true" />
            <h1 className="text-xs sm:text-sm font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-cyan-200 to-white">
              SOLAR SYSTEM // EXPLORER
            </h1>
          </div>
          <p className="text-[9px] sm:text-[10px] font-mono tracking-wider text-purple-300/70 uppercase">
            COSMIC NAVIGATION INTERFACE &bull; V2.0
          </p>
        </div>

        {/* Top Right: Skip Intro Button */}
        <button
          onClick={onSkip}
          aria-label="Skip introductory sequence"
          className="group px-3.5 py-1.5 rounded-full bg-purple-950/50 hover:bg-purple-900/70 border border-purple-700/40 hover:border-purple-400/80 text-purple-200 hover:text-white text-xs font-mono font-semibold transition-all cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)] flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 text-purple-300 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* 2. CENTER-LEFT: NASA SYSTEM BOOT DIAGNOSTIC LOG (Phase 2 & 3) */}
      <div className="flex items-center justify-between my-auto w-full max-w-7xl mx-auto px-2 pointer-events-none">
        {/* Left Side: System Telemetry & Logs */}
        <div className="hidden sm:flex flex-col space-y-2 w-76 bg-purple-950/20 border border-purple-800/30 backdrop-blur-md p-3.5 rounded-xl text-[11px] font-mono shadow-xl transition-opacity duration-500">
          <div className="flex items-center justify-between pb-1.5 border-b border-purple-800/30 text-purple-300 font-bold text-[10px] tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isUnsupported ? 'bg-amber-400' : 'bg-cyan-400'} animate-ping`} />
              SYSTEM DIAGNOSTICS
            </span>
            <span className="text-purple-400/60">{totalElapsed.toFixed(1)}s</span>
          </div>

          <div className="space-y-1.5 min-h-[110px] flex flex-col justify-start">
            {diagnostics.length === 0 ? (
              <span className="text-purple-400/40 italic">Awaiting telemetry stream...</span>
            ) : (
              diagnostics.map((log, i) => (
                <div key={i} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                  {log.isError ? (
                    <>
                      <span className="text-red-400 font-bold">[ERROR]</span>
                      <span className="text-red-300 font-medium truncate">{log.text}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-emerald-400 font-bold">[OK]</span>
                      <span className="text-purple-200/90 truncate">{log.text}</span>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Center: Restrained Technical Confirmation Badge (Phase 4 / Ready) */}
        {(phase === 'online' || phase === 'handoff' || phase === 'ready' || isWaitingForScene) && (
          <div className="mx-auto text-center space-y-2 animate-in fade-in zoom-in-95 duration-500 max-w-md bg-purple-950/40 border border-purple-600/40 backdrop-blur-md p-5 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.25)]">
            {isUnsupported ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/50 text-[10px] font-mono text-amber-300 uppercase tracking-widest shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>LIMITED MODE ACTIVE</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-purple-200 tracking-wider">
                  LIMITED MODE READY
                </h2>
                <p className="text-xs text-purple-200/80 font-mono tracking-wide">
                  3D renderer unavailable &mdash; non-3D tools remain accessible
                </p>
              </>
            ) : (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 uppercase tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isWaitingForScene ? 'PREPARING 3D ENVIRONMENT' : 'NAVIGATION CORE READY'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-cyan-200 tracking-wider">
                  NAVIGATION SYSTEM ONLINE
                </h2>
                <p className="text-xs text-purple-200/80 font-mono tracking-wide">
                  {isWaitingForScene ? 'Synchronizing celestial coordinates...' : 'All celestial systems operational'}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM TELEMETRY & STAGES BAR */}
      <footer className="space-y-3 pointer-events-auto">
        {/* Stage Progress Pills (Bottom Center) */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3">
          {STAGES.map((stg, idx) => {
            const isSceneStage = stg === 'Scene';
            const isCompleted = isSceneStage ? (!isUnsupported && idx <= stageIndex && phase !== 'wakeup' && phase !== 'diagnostics' && phase !== 'construction') : idx < stageIndex;
            const isCurrent = idx === stageIndex;
            const isSceneError = isSceneStage && isUnsupported && (idx <= stageIndex);

            return (
              <div
                key={stg}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono transition-all duration-300 border ${
                  isSceneError
                    ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                    : isCompleted
                    ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : isCurrent
                    ? 'bg-purple-900/50 border-purple-400 text-white shadow-[0_0_14px_rgba(168,85,247,0.4)] animate-pulse'
                    : 'bg-purple-950/20 border-purple-900/30 text-purple-400/50'
                }`}
              >
                {isSceneError ? (
                  <AlertOctagon className="w-3 h-3 text-amber-400" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                )}
                <span>{stg}</span>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar: Status and Coordinates */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-purple-900/30 text-[10px] font-mono">
          {/* Status Message */}
          <div
            aria-live="polite"
            className="flex items-center gap-2 text-purple-200"
          >
            <Radio className={`w-3.5 h-3.5 ${isUnsupported ? 'text-amber-400' : 'text-cyan-400'} animate-pulse`} />
            <span className="font-bold tracking-wider uppercase">{statusText}</span>
          </div>

          {/* Sci-Fi Decorative Coordinates */}
          <div className="hidden sm:flex items-center gap-4 text-purple-400/60 font-mono">
            <span>RA: 17h 45m 40s</span>
            <span>DEC: -29&deg; 00&prime; 28&Prime;</span>
            <span>EPOCH: J2000.0</span>
          </div>
        </div>
      </footer>

      {/* Decorative Corner Brackets */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-purple-500/40 pointer-events-none" aria-hidden="true" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-purple-500/40 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-purple-500/40 pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-purple-500/40 pointer-events-none" aria-hidden="true" />
    </div>
  );
}

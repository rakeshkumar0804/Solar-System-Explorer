import { useState, useEffect } from 'react';
import {
  Eye,
  Rocket,
  Scale,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import type { CelestialBody, DeepSpaceObject, ThemeConfig } from '../../types/space';

interface NavbarProps {
  planets: CelestialBody[];
  deepSpaceObjects: DeepSpaceObject[];
  theme: ThemeConfig;
  soundEnabled: boolean;
  isTourActive?: boolean;
  onToggleSound: () => void;
  onSelectObject: (id: string | null) => void;
  onResetOverview?: () => void;
  onToggleTour?: () => void;
  onOpenCompare?: () => void;
}

export function Navbar({
  soundEnabled,
  isTourActive = false,
  onToggleSound,
  onSelectObject,
  onResetOverview,
  onToggleTour,
  onOpenCompare,
}: NavbarProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOverviewPressed, setIsOverviewPressed] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleOverviewClick = () => {
    setIsOverviewPressed(true);
    setTimeout(() => setIsOverviewPressed(false), 300);

    if (onResetOverview) {
      onResetOverview();
    } else {
      onSelectObject(null);
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between p-4 sm:p-6 pointer-events-none select-none">
      {/* Top Left Header */}
      <div className="pointer-events-auto space-y-0.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          Solar System
        </h1>
        <p className="text-xs text-purple-300/80 font-medium tracking-wide">
          Interactive 3D Space Exploration
        </p>
      </div>

      {/* Top Right Navigation & Utility Suite */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5">
        {/* 1. Navigation Pill Group */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#0c061a]/80 backdrop-blur-md p-1 rounded-full border border-purple-900/40 shadow-xl">
          {/* Overview Button with active pressed feedback */}
          <button
            onClick={handleOverviewClick}
            className={`h-8 px-3 rounded-full flex items-center gap-1.5 border transition-all text-xs font-semibold cursor-pointer active:scale-95 shadow-sm ${
              isOverviewPressed
                ? 'bg-purple-600/50 border-purple-400 text-white scale-95 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-800/40 hover:border-purple-500/60 text-purple-200 hover:text-white'
            }`}
            title="Reset to Isometric Solar Overview (Center on Sun)"
          >
            <Eye className="w-3.5 h-3.5 text-purple-300 shrink-0" />
            <span className="hidden md:inline">Overview</span>
          </button>

          {/* Cosmic Tour Button */}
          {onToggleTour && (
            <button
              onClick={onToggleTour}
              className={`h-8 px-3 rounded-full flex items-center gap-1.5 border transition-all text-xs font-semibold cursor-pointer active:scale-95 ${
                isTourActive
                  ? 'bg-gradient-to-r from-amber-500/30 to-purple-600/40 border-amber-400/80 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
                  : 'bg-purple-950/40 hover:bg-purple-900/60 border-purple-800/40 hover:border-purple-500/60 text-purple-200 hover:text-white'
              }`}
              title={isTourActive ? 'Stop Cosmic Tour' : 'Start Automated Cosmic Tour'}
            >
              {isTourActive ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-spin" />
              ) : (
                <Rocket className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              )}
              <span className="hidden md:inline">
                {isTourActive ? 'Touring...' : 'Cosmic Tour'}
              </span>
            </button>
          )}

          {/* Compare Button */}
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="h-8 px-3 rounded-full flex items-center gap-1.5 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/40 hover:border-purple-500/60 text-purple-200 hover:text-white transition-all text-xs font-semibold cursor-pointer active:scale-95"
              title="Compare Celestial Bodies"
            >
              <Scale className="w-3.5 h-3.5 text-purple-300 shrink-0" />
              <span className="hidden md:inline">Compare</span>
            </button>
          )}
        </div>

        {/* 2. Utility Controls Group (Audio & Fullscreen) */}
        <div className="flex items-center gap-1.5 bg-[#0c061a]/80 backdrop-blur-md p-1 rounded-full border border-purple-900/40 shadow-xl">
          {/* Mute Audio Toggle */}
          <button
            onClick={onToggleSound}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-purple-500/20 text-purple-200 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-transparent text-slate-400 border-transparent hover:text-white hover:bg-purple-900/30'
            }`}
            title={soundEnabled ? 'Mute Audio' : 'Enable Space Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-transparent hover:bg-purple-900/30 text-slate-300 hover:text-white transition-all cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

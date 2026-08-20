import { Volume2, VolumeX, X, Scale } from 'lucide-react';
import type { CelestialBody, DeepSpaceObject, ThemeConfig } from '../../types/space';

interface NavbarProps {
  planets: CelestialBody[];
  deepSpaceObjects: DeepSpaceObject[];
  theme: ThemeConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectObject: (id: string | null) => void;
  onOpenCompare?: () => void;
}

export function Navbar({
  soundEnabled,
  onToggleSound,
  onSelectObject,
  onOpenCompare,
}: NavbarProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between p-6 pointer-events-none select-none">
      {/* Top Left Header */}
      <div className="pointer-events-auto space-y-0.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-300 via-purple-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">
          Solar System
        </h1>
        <p className="text-xs text-purple-300/80 font-medium tracking-wide">
          Interactive 3D Space Exploration
        </p>
      </div>

      {/* Top Right Controls (Compare + Sound + Close/Reset) */}
      <div className="pointer-events-auto flex items-center gap-2">
        {onOpenCompare && (
          <button
            onClick={onOpenCompare}
            className="h-9 px-3 rounded-full flex items-center gap-1.5 bg-gradient-to-r from-purple-900/60 to-purple-950/70 hover:from-purple-800/80 hover:to-purple-900/80 border border-purple-600/40 text-purple-200 hover:text-white transition-all shadow-lg text-xs font-bold cursor-pointer backdrop-blur-md"
            title="Compare Celestial Bodies"
          >
            <Scale className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">Compare</span>
          </button>
        )}

        <button
          onClick={onToggleSound}
          className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-purple-500/20 text-purple-200 border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'bg-black/40 text-slate-400 border-white/10 hover:text-white hover:bg-black/60'
          }`}
          title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => onSelectObject(null)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/70 border border-white/10 hover:border-purple-400/50 text-slate-300 hover:text-white transition-all shadow-lg cursor-pointer"
          title="Reset View"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

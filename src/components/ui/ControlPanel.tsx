import { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown, CircleDot, Tag, Sparkles, Play } from 'lucide-react';
import { THEMES, THEME_KEYS } from '../../data/themes';
import type { ExplorerSettings, ThemeConfig, CosmicToggles } from '../../types/space';
import { SpaceObjectsMenu } from './SpaceObjectsMenu';

interface ControlPanelProps {
  settings: ExplorerSettings;
  theme: ThemeConfig;
  isVisible?: boolean;
  onUpdateSettings: (updater: (prev: ExplorerSettings) => ExplorerSettings) => void;
  onResetCamera?: () => void;
  onReplayIntro?: () => void;
}

export function ControlPanel({
  settings,
  theme,
  isVisible = true,
  onUpdateSettings,
  onReplayIntro,
}: ControlPanelProps) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isSpaceObjectsOpen, setIsSpaceObjectsOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const spaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (spaceRef.current && !spaceRef.current.contains(e.target as Node)) {
        setIsSpaceObjectsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const resetSpeed = () => {
    onUpdateSettings((prev) => ({ ...prev, timeSpeed: 1 }));
  };

  const handleTogglePhenomenon = (key: keyof CosmicToggles) => {
    onUpdateSettings((prev) => ({
      ...prev,
      cosmicToggles: {
        ...prev.cosmicToggles,
        [key]: !prev.cosmicToggles[key],
      },
    }));
  };

  const handleToggleAllPhenomena = (enable: boolean) => {
    onUpdateSettings((prev) => {
      const nextToggles = { ...prev.cosmicToggles };
      (Object.keys(nextToggles) as (keyof CosmicToggles)[]).forEach((k) => {
        nextToggles[k] = enable;
      });
      return { ...prev, cosmicToggles: nextToggles };
    });
  };

  return (
    <aside
      aria-label="Solar System Navigation and Display Controls"
      className={`fixed bottom-4 sm:bottom-6 left-4 sm:left-6 z-30 select-none transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <div className="w-76 sm:w-80 bg-[#0a0515]/95 backdrop-blur-xl border border-purple-900/50 rounded-2xl p-3.5 sm:p-4 shadow-[0_16px_50px_rgba(0,0,0,0.85)] space-y-3 sm:space-y-3.5 text-slate-200 text-xs relative">
        {/* 1. TIME SPEED SECTION */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-purple-300 font-bold">
            <span>TIME SPEED</span>
            <button
              onClick={resetSpeed}
              title="Click to reset to 1.0?"
              aria-label="Reset orbital speed to 1.0?"
              className="text-xs font-mono text-purple-200 hover:text-white font-bold cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none rounded px-1"
            >
              {settings.timeSpeed.toFixed(1)}&times;
            </button>
          </div>

          <input
            type="range"
            min="-0.5"
            max="10"
            step="0.05"
            value={settings.timeSpeed}
            onDoubleClick={resetSpeed}
            aria-label="Adjust planetary orbital speed"
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdateSettings((s) => ({ ...s, timeSpeed: val }));
            }}
            className="w-full accent-purple-400 h-1.5 bg-purple-950/70 rounded-lg appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          />
        </div>

        {/* 2. SPACE THEME SECTION */}
        <div className="space-y-1 relative" ref={themeRef}>
          <div className="text-[10px] font-mono tracking-wider text-purple-300 font-bold">
            SPACE THEME
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900/50 via-purple-950/40 to-indigo-950/50 border border-purple-700/30">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <Palette className="w-3.5 h-3.5 text-purple-300 shrink-0" aria-hidden="true" />
              <span className="font-semibold text-purple-100 truncate text-xs">{theme.name}</span>
            </div>

            <button
              onClick={() => {
                setIsThemeMenuOpen(!isThemeMenuOpen);
                setIsSpaceObjectsOpen(false);
              }}
              aria-label="Change space theme"
              aria-expanded={isThemeMenuOpen}
              className="px-2 py-0.5 rounded-lg bg-purple-800/40 hover:bg-purple-700/50 text-purple-200 hover:text-white border border-purple-600/30 text-[10px] font-semibold transition-all cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
            >
              Change
            </button>
          </div>

          {/* Theme Dropdown Menu */}
          {isThemeMenuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-[#0a0515]/95 backdrop-blur-xl border border-purple-800/50 rounded-xl p-1.5 shadow-2xl space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              {THEME_KEYS.map((k) => {
                const t = THEMES[k];
                const isActive = settings.activeThemeId === k;
                return (
                  <button
                    key={k}
                    onClick={() => {
                      onUpdateSettings((s) => ({ ...s, activeThemeId: k }));
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs ${
                      isActive
                        ? 'bg-purple-600/30 text-white font-bold border border-purple-500/40'
                        : 'hover:bg-purple-900/20 text-purple-200'
                    }`}
                  >
                    <span>{t.name}</span>
                    <div
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: t.uiAccent }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. DISPLAY TOGGLES (Orbits & Labels) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              onUpdateSettings((s) => ({ ...s, showOrbits: !s.showOrbits }))
            }
            aria-pressed={settings.showOrbits}
            aria-label="Toggle planetary orbits visibility"
            className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
              settings.showOrbits
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'bg-purple-950/30 border-purple-900/30 text-purple-400 hover:bg-purple-900/20'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <CircleDot className="w-3.5 h-3.5 text-purple-300" aria-hidden="true" />
              <span>Orbits</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                settings.showOrbits
                  ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                  : 'bg-purple-950 border border-purple-800'
              }`}
              aria-hidden="true"
            />
          </button>

          <button
            onClick={() =>
              onUpdateSettings((s) => ({ ...s, showLabels: !s.showLabels }))
            }
            aria-pressed={settings.showLabels}
            aria-label="Toggle celestial body labels visibility"
            className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
              settings.showLabels
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'bg-purple-950/30 border-purple-900/30 text-purple-400 hover:bg-purple-900/20'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <Tag className="w-3.5 h-3.5 text-purple-300" aria-hidden="true" />
              <span>Labels</span>
            </div>
            <span
              className={`w-2 h-2 rounded-full transition-all ${
                settings.showLabels
                  ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                  : 'bg-purple-950 border border-purple-800'
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* 4. SPACE OBJECTS & REPLAY INTRO */}
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <div className="relative flex-1" ref={spaceRef}>
            <button
              onClick={() => {
                setIsSpaceObjectsOpen(!isSpaceObjectsOpen);
                setIsThemeMenuOpen(false);
              }}
              aria-label="Toggle space phenomena and objects menu"
              aria-expanded={isSpaceObjectsOpen}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900/40 via-purple-950/60 to-purple-900/40 hover:from-purple-800/50 hover:to-purple-800/50 border border-purple-700/30 text-purple-200 font-semibold transition-all cursor-pointer shadow-md text-xs focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
            >
              <div className="flex items-center gap-1.5 truncate">
                <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
                <span className="truncate">Space Objects</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-purple-300 transition-transform shrink-0 ${isSpaceObjectsOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>

            {isSpaceObjectsOpen && (
              <div className="absolute bottom-full left-0 mb-2.5 z-50">
                <SpaceObjectsMenu
                  toggles={settings.cosmicToggles}
                  theme={theme}
                  onToggle={handleTogglePhenomenon}
                  onToggleAll={handleToggleAllPhenomena}
                  onClose={() => setIsSpaceObjectsOpen(false)}
                />
              </div>
            )}
          </div>

          {onReplayIntro && (
            <button
              onClick={onReplayIntro}
              title="Replay Navigation System Startup"
              aria-label="Replay Navigation System Startup"
              className="p-2 rounded-xl bg-purple-950/50 hover:bg-purple-900/70 border border-purple-800/40 hover:border-purple-500/60 text-purple-300 hover:text-white transition-all cursor-pointer shadow-md text-xs flex items-center justify-center focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
            >
              <Play className="w-3.5 h-3.5 text-purple-300 fill-purple-300" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

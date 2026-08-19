import { useState, useRef, useEffect } from 'react';
import { Palette, ChevronDown, CircleDot, Tag, Sparkles } from 'lucide-react';
import { THEMES, THEME_KEYS } from '../../data/themes';
import type { ExplorerSettings, ThemeConfig, CosmicToggles } from '../../types/space';
import { SpaceObjectsMenu } from './SpaceObjectsMenu';

interface ControlPanelProps {
  settings: ExplorerSettings;
  theme: ThemeConfig;
  onUpdateSettings: (updater: (prev: ExplorerSettings) => ExplorerSettings) => void;
  onResetCamera: () => void;
}

export function ControlPanel({
  settings,
  theme,
  onUpdateSettings,
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
    <div className="fixed bottom-6 left-6 z-30 pointer-events-none select-none">
      <div className="pointer-events-auto w-80 bg-[#0a0515]/90 backdrop-blur-md border border-purple-900/40 rounded-2xl p-4 shadow-[0_16px_40px_rgba(0,0,0,0.8)] space-y-3.5 text-slate-200 text-xs relative">
        {/* 1. TIME SPEED SECTION */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-purple-300 font-bold">
            <span>TIME SPEED</span>
            <button
              onClick={resetSpeed}
              title="Click to reset to 1.0x"
              className="text-xs font-mono text-purple-200 hover:text-white font-bold cursor-pointer transition-colors"
            >
              {settings.timeSpeed.toFixed(1)}x
            </button>
          </div>

          <input
            type="range"
            min="-0.5"
            max="10"
            step="0.05"
            value={settings.timeSpeed}
            onDoubleClick={resetSpeed}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              onUpdateSettings((s) => ({ ...s, timeSpeed: val }));
            }}
            className="w-full accent-purple-400 h-1.5 bg-purple-950/60 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* 2. SPACE THEME BAR */}
        <div className="space-y-1 relative" ref={themeRef}>
          <div className="text-[10px] font-mono tracking-wider text-purple-300 font-bold">
            SPACE THEME
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900/50 via-purple-950/40 to-indigo-950/50 border border-purple-700/30">
            <div className="flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-purple-300" />
              <span className="font-semibold text-purple-100">{theme.name}</span>
            </div>
            <button
              onClick={() => {
                setIsThemeMenuOpen(!isThemeMenuOpen);
                setIsSpaceObjectsOpen(false);
              }}
              className="px-2.5 py-0.5 rounded-full bg-purple-600/40 hover:bg-purple-600/70 border border-purple-400/40 text-[10px] text-purple-200 font-semibold transition-colors cursor-pointer"
            >
              Change
            </button>
          </div>

          {/* Theme Selector Popover */}
          {isThemeMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#0c061a]/95 backdrop-blur-xl border border-purple-800/40 rounded-xl shadow-2xl p-1.5 grid grid-cols-1 gap-1 z-50 max-h-48 overflow-y-auto custom-scrollbar">
              {THEME_KEYS.map((key) => {
                const t = THEMES[key];
                const isSelected = settings.activeThemeId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      onUpdateSettings((s) => ({ ...s, activeThemeId: t.id }));
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/30 text-white font-semibold'
                        : 'hover:bg-purple-900/20 text-purple-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: t.uiAccent }}
                    />
                    <span className="truncate text-xs">{t.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. TOGGLES ROW (Orbits & Labels) */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() =>
              onUpdateSettings((s) => ({ ...s, showOrbits: !s.showOrbits }))
            }
            className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              settings.showOrbits
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-200'
                : 'bg-purple-950/30 border-purple-900/30 text-purple-400 hover:bg-purple-900/20'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <CircleDot className="w-3.5 h-3.5" />
              <span>Orbits</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${settings.showOrbits ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-purple-900'}`} />
          </button>

          <button
            onClick={() =>
              onUpdateSettings((s) => ({ ...s, showLabels: !s.showLabels }))
            }
            className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              settings.showLabels
                ? 'bg-purple-600/20 border-purple-500/40 text-purple-200'
                : 'bg-purple-950/30 border-purple-900/30 text-purple-400 hover:bg-purple-900/20'
            }`}
          >
            <div className="flex items-center gap-1.5 font-medium text-[11px]">
              <Tag className="w-3.5 h-3.5" />
              <span>Labels</span>
            </div>
            <span className={`w-2 h-2 rounded-full ${settings.showLabels ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-purple-900'}`} />
          </button>
        </div>

        {/* 4. SPACE OBJECTS BUTTON */}
        <div className="relative" ref={spaceRef}>
          <button
            onClick={() => {
              setIsSpaceObjectsOpen(!isSpaceObjectsOpen);
              setIsThemeMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-purple-900/40 via-purple-950/60 to-purple-900/40 hover:from-purple-800/50 hover:to-purple-800/50 border border-purple-700/30 text-purple-200 font-semibold transition-all cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Space Objects</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-purple-300 transition-transform ${isSpaceObjectsOpen ? 'rotate-180' : ''}`} />
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
      </div>
    </div>
  );
}

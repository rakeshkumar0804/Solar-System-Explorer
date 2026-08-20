import React from 'react';
import {
  Telescope,
  Sparkles,
  Zap,
  Radio,
  Layers,
  CircleDot,
  Orbit,
  Compass,
  Rocket,
  Sun,
  X,
  Check,
} from 'lucide-react';
import type { CosmicToggles, ThemeConfig } from '../../types/space';

interface SpaceObjectsMenuProps {
  toggles: CosmicToggles;
  theme: ThemeConfig;
  onToggle: (key: keyof CosmicToggles) => void;
  onToggleAll: (enable: boolean) => void;
  onClose?: () => void;
}

interface PhenomenonItem {
  key: keyof CosmicToggles;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

const PHENOMENA: PhenomenonItem[] = [
  {
    key: 'habitableZone',
    label: 'Habitable Zone',
    category: 'Goldilocks Liquid Water Band',
    icon: Sun,
    iconColor: '#10b981',
    iconBg: 'rgba(16, 185, 129, 0.15)',
  },
  {
    key: 'spacecraft',
    label: 'Historic Spacecraft',
    category: 'Voyager 1, JWST, Parker Probe',
    icon: Rocket,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245, 158, 11, 0.15)',
  },
  {
    key: 'milkyWayCore',
    label: 'Milky Way Core',
    category: 'Galaxy Center Spiral',
    icon: Compass,
    iconColor: '#f59e0b',
    iconBg: 'rgba(245, 158, 11, 0.15)',
  },
  {
    key: 'starClusters',
    label: 'Star Clusters',
    category: 'Globular Formations',
    icon: Sparkles,
    iconColor: '#38bdf8',
    iconBg: 'rgba(56, 189, 248, 0.15)',
  },
  {
    key: 'wormhole',
    label: 'Wormhole',
    category: 'Einstein-Rosen Bridge',
    icon: CircleDot,
    iconColor: '#ec4899',
    iconBg: 'rgba(236, 72, 153, 0.15)',
  },
  {
    key: 'blackHole',
    label: 'Gargantua',
    category: 'Supermassive Black Hole',
    icon: Radio,
    iconColor: '#fb923c',
    iconBg: 'rgba(251, 146, 60, 0.15)',
  },
  {
    key: 'comets',
    label: 'Comets',
    category: 'Active Particle Trails',
    icon: Zap,
    iconColor: '#38bdf8',
    iconBg: 'rgba(56, 189, 248, 0.15)',
  },
  {
    key: 'nebulae',
    label: 'Nebulae',
    category: 'Volumetric Stellar Nurseries',
    icon: Layers,
    iconColor: '#06b6d4',
    iconBg: 'rgba(6, 182, 212, 0.15)',
  },
  {
    key: 'pulsar',
    label: 'Vela Pulsar',
    category: 'Relativistic Beams',
    icon: Zap,
    iconColor: '#c084fc',
    iconBg: 'rgba(192, 132, 252, 0.15)',
  },
  {
    key: 'shootingStars',
    label: 'Shooting Stars',
    category: 'Dynamic Meteors',
    icon: Orbit,
    iconColor: '#a7f3d0',
    iconBg: 'rgba(52, 211, 153, 0.15)',
  },
  {
    key: 'distantGalaxies',
    label: 'Distant Galaxies',
    category: 'Deep Sky Field',
    icon: Telescope,
    iconColor: '#818cf8',
    iconBg: 'rgba(129, 140, 248, 0.15)',
  },
];

export function SpaceObjectsMenu({
  toggles,
  theme,
  onToggle,
  onToggleAll,
  onClose,
}: SpaceObjectsMenuProps) {
  const activeCount = Object.values(toggles).filter(Boolean).length;
  const allActive = activeCount >= PHENOMENA.length;

  return (
    <div
      className="w-84 bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-4 text-slate-200 text-xs space-y-3 pointer-events-auto z-50 animate-in fade-in zoom-in-95 duration-150 select-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center border shadow-sm"
            style={{
              backgroundColor: theme.uiBadgeBg,
              borderColor: theme.uiBorder,
              color: theme.uiAccent,
            }}
          >
            <Telescope className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase font-bold tracking-wider text-white">
              COSMIC PHENOMENA
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              {activeCount} of {PHENOMENA.length} Active
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleAll(!allActive)}
            className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono text-cyan-300 font-semibold transition-colors cursor-pointer"
          >
            {allActive ? 'Disable All' : 'Enable All'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Phenomena Items List */}
      <div className="space-y-1 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
        {PHENOMENA.map((item) => {
          const isActive = !!toggles[item.key];
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => onToggle(item.key)}
              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer text-left group ${
                isActive
                  ? 'bg-white/[0.06] hover:bg-white/[0.09] border border-white/10'
                  : 'bg-transparent hover:bg-white/[0.03] border border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              {/* Icon & Metadata */}
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-white/10 transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: item.iconBg,
                    color: item.iconColor,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-[11px] text-white truncate group-hover:text-cyan-200 transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 truncate">
                    {item.category}
                  </div>
                </div>
              </div>

              {/* iOS-Style Pill Switch */}
              <div
                className={`w-9 h-5 rounded-full transition-colors duration-200 relative flex items-center px-0.5 shrink-0 ${
                  isActive
                    ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-800 border border-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 flex items-center justify-center ${
                    isActive ? 'translate-x-4' : 'translate-x-0'
                  }`}
                >
                  {isActive && <Check className="w-2.5 h-2.5 text-cyan-600 stroke-[3]" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

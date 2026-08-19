import { useState } from 'react';
import {
  X,
  Compass,
  Scale,
  Thermometer,
  Orbit,
  Moon,
  Info,
  Rocket,
  Lightbulb,
  Crosshair,
  GitCompare,
} from 'lucide-react';
import type { CelestialBody, DeepSpaceObject, ThemeConfig  } from '../../types/space';

interface InfoPanelProps {
  selectedItem: CelestialBody | DeepSpaceObject | null;
  theme: ThemeConfig;
  onClose: () => void;
  onCompareWithEarth?: (id: string) => void;
  onNextPlanet?: () => void;
}

export function InfoPanel({
  selectedItem,
  theme,
  onClose,
  onCompareWithEarth,
  onNextPlanet,
}: InfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'geology' | 'missions' | 'facts'>('overview');

  if (!selectedItem) return null;

  const isPlanet = 'stats' in selectedItem && 'distanceFromSun' in selectedItem.stats;
  const planet = isPlanet ? (selectedItem as CelestialBody) : null;
  const deepSpace = !isPlanet ? (selectedItem as DeepSpaceObject) : null;

  return (
    <aside className="fixed top-16 right-4 sm:right-6 bottom-20 z-40 w-[calc(100vw-2rem)] sm:w-96 bg-slate-950/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_16px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-slate-200 select-none animate-in slide-in-from-right-8 duration-300 pointer-events-auto">
      {/* Header Banner */}
      <div className="p-5 border-b border-white/10 bg-gradient-to-b from-white/10 to-transparent relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-3 h-3 rounded-full border border-white/40 shadow-sm"
            style={{ backgroundColor: planet ? planet.color : deepSpace?.primaryColor }}
          />
          <span
            className="text-[10px] uppercase font-mono tracking-widest font-bold px-2 py-0.5 rounded border"
            style={{
              color: theme.uiAccent,
              borderColor: theme.uiBorder,
              backgroundColor: theme.uiBadgeBg,
            }}
          >
            {selectedItem.category}
          </span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">
          {selectedItem.name}
        </h1>
        <p className="text-xs text-slate-300 font-medium mt-1 line-clamp-2 leading-relaxed">
          {selectedItem.tagline}
        </p>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          {planet && planet.id !== 'sun' && onCompareWithEarth && (
            <button
              onClick={() => onCompareWithEarth(planet.id)}
              className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <GitCompare className="w-3.5 h-3.5 text-cyan-400" /> Compare to Earth
            </button>
          )}
          {onNextPlanet && (
            <button
              onClick={onNextPlanet}
              className="py-1.5 px-3 rounded-xl text-xs font-semibold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 transition-all flex items-center justify-center gap-1.5"
            >
              <Crosshair className="w-3.5 h-3.5" /> Next Body
            </button>
          )}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center border-b border-white/10 px-3 bg-white/5">
        {[
          { id: 'overview', label: 'Overview', icon: Info },
          { id: 'geology', label: 'Geology & Atm', icon: Compass },
          { id: 'missions', label: 'Missions', icon: Rocket },
          { id: 'facts', label: 'Fun Facts', icon: Lightbulb },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-2.5 text-[11px] font-mono font-medium flex items-center justify-center gap-1 transition-all border-b-2 ${
              activeTab === tab.id
                ? 'border-cyan-400 text-white font-bold bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-3 h-3" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <p className="text-slate-300 leading-relaxed">
              {selectedItem.overview}
            </p>

            {/* Quick Metrics Grid */}
            {planet && (
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mb-0.5">
                    <Scale className="w-3 h-3 text-cyan-400" /> Mass
                  </div>
                  <div className="font-semibold text-white font-mono text-[11px] truncate">
                    {planet.stats.mass}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mb-0.5">
                    <Orbit className="w-3 h-3 text-cyan-400" /> Diameter
                  </div>
                  <div className="font-semibold text-white font-mono text-[11px] truncate">
                    {planet.stats.diameter}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mb-0.5">
                    <Thermometer className="w-3 h-3 text-amber-400" /> Temp
                  </div>
                  <div className="font-semibold text-white font-mono text-[11px] truncate">
                    {planet.stats.temperature}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mb-0.5">
                    <Moon className="w-3 h-3 text-purple-400" /> Moons
                  </div>
                  <div className="font-semibold text-white font-mono text-[11px]">
                    {planet.stats.moonsCount} known
                  </div>
                </div>
              </div>
            )}

            {/* Deep Space Metrics Grid */}
            {deepSpace && (
              <div className="grid grid-cols-1 gap-2.5 pt-2">
                {Object.entries(deepSpace.stats).map(([k, v]) => (
                  <div
                    key={k}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center"
                  >
                    <span className="text-[10px] text-slate-400 font-mono capitalize">
                      {k.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-semibold text-white font-mono text-[11px]">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GEOLOGY & ATMOSPHERE */}
        {activeTab === 'geology' && (
          <div className="space-y-4">
            {planet ? (
              <>
                <div>
                  <h4 className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-1.5 font-bold">
                    Geological Features
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {planet.geology}
                  </p>
                </div>

                <div>
                  <h4 className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-2 font-bold">
                    Atmospheric Composition
                  </h4>
                  <div className="space-y-1.5">
                    {planet.stats.atmosphere.map((gas, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
                      >
                        <span className="font-mono text-slate-200">{gas}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-slate-300 leading-relaxed">
                {deepSpace?.overview}
              </p>
            )}
          </div>
        )}

        {/* TAB 3: EXPLORATION & MISSIONS */}
        {activeTab === 'missions' && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-2 font-bold">
              Key Missions & Historic Discoveries
            </h4>
            {planet && planet.exploration.length > 0 ? (
              <ul className="space-y-2.5">
                {planet.exploration.map((mission, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 leading-relaxed"
                  >
                    {mission}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400">
                Continuous observational tracking via Hubble, James Webb Space Telescope (JWST), and radio interferometer arrays.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FUN FACTS & TRIVIA */}
        {activeTab === 'facts' && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-2 font-bold">
              Did You Know?
            </h4>
            <ul className="space-y-2.5">
              {(planet ? planet.funFacts : deepSpace?.facts ?? []).map((fact, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-100 flex items-start gap-2.5 leading-relaxed"
                >
                  <span className="text-amber-400 text-sm">✦</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}

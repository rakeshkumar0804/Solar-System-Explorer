import { useState } from 'react';
import {
  X,
  ChevronRight,
  Sparkles,
  Layers,
  Rocket,
  Info,
  Scale,
  Thermometer,
  Compass,
  Radio,
  Clock,
  Gauge,
} from 'lucide-react';
import type { CelestialBody, DeepSpaceObject, SpacecraftData, ThemeConfig } from '../../types/space';

interface InfoPanelProps {
  selectedItem: CelestialBody | DeepSpaceObject | SpacecraftData | null;
  theme: ThemeConfig;
  onClose: () => void;
  onCompareWithEarth?: (planetId: string) => void;
  onNextPlanet?: () => void;
}

export function InfoPanel({
  selectedItem,
  theme: _theme,
  onClose,
  onCompareWithEarth,
  onNextPlanet,
}: InfoPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'science' | 'facts'>('overview');

  if (!selectedItem) return null;

  const isSpacecraft = 'launchYear' in selectedItem;
  const isDeepSpace = !isSpacecraft && 'stats' in selectedItem && 'classification' in selectedItem.stats;
  const isPlanet = !isSpacecraft && !isDeepSpace;

  const craft = isSpacecraft ? (selectedItem as SpacecraftData) : null;
  const deepSpace = isDeepSpace ? (selectedItem as DeepSpaceObject) : null;
  const planet = isPlanet ? (selectedItem as CelestialBody) : null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex justify-end">
      {/* Semi-transparent backdrop for click-to-dismiss */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto transition-opacity"
      />

      {/* Slide-out Telemetry Drawer */}
      <div
        className="relative w-full max-w-md h-full bg-[#0c061a]/95 backdrop-blur-2xl border-l border-purple-900/50 shadow-[-20px_0_60px_rgba(0,0,0,0.9)] flex flex-col pointer-events-auto z-[101] text-slate-100 select-none animate-in slide-in-from-right duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Card */}
        <div className="p-5 border-b border-purple-900/40 bg-gradient-to-b from-purple-950/60 to-transparent space-y-2 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-purple-300/90 px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/50">
              {selectedItem.category}
            </span>

            <div className="flex items-center gap-1.5">
              {onNextPlanet && planet && (
                <button
                  onClick={onNextPlanet}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-900/40 border border-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
                  title="Next Celestial Body"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-900/40 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close Telemetry"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block shrink-0 shadow-[0_0_10px_currentColor]"
                style={{
                  backgroundColor: planet
                    ? planet.color
                    : craft
                    ? craft.trajectoryColor
                    : deepSpace?.primaryColor || '#c084fc',
                }}
              />
              {selectedItem.name}
            </h2>
            <p className="text-xs text-purple-200/80 font-medium mt-0.5">
              {selectedItem.tagline}
            </p>
          </div>

          {/* Tab Navigation Ribbon */}
          <div className="flex items-center gap-1 pt-2 border-t border-purple-900/30">
            {[
              { id: 'overview', label: 'Overview', icon: Info },
              { id: 'stats', label: 'Telemetry', icon: Compass },
              { id: 'science', label: craft ? 'Payload' : isDeepSpace ? 'Science' : 'Geology', icon: Layers },
              { id: 'facts', label: 'Facts', icon: Sparkles },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600/30 text-purple-100 border border-purple-500/40 shadow-sm'
                      : 'text-purple-300/70 hover:text-purple-200 hover:bg-purple-950/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-purple-950/30 border border-purple-900/40 rounded-2xl p-4 space-y-2">
                <div className="text-[11px] font-mono font-bold tracking-wider text-purple-300">
                  MISSION / COSMIC OVERVIEW
                </div>
                <p className="text-purple-100/90 leading-relaxed text-xs">
                  {selectedItem.overview}
                </p>
              </div>

              {/* Spacecraft Quick Badges */}
              {craft && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3 space-y-0.5">
                    <div className="text-[10px] font-mono text-purple-300/70 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-yellow-400" /> Launch Date
                    </div>
                    <div className="text-xs font-bold text-white">
                      {craft.launchYear}
                    </div>
                  </div>
                  <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3 space-y-0.5">
                    <div className="text-[10px] font-mono text-purple-300/70 flex items-center gap-1">
                      <Gauge className="w-3 h-3 text-cyan-400" /> Current Status
                    </div>
                    <div className="text-xs font-bold text-emerald-400">
                      {craft.status}
                    </div>
                  </div>
                </div>
              )}

              {/* Planet Highlights */}
              {planet && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3 space-y-0.5">
                    <div className="text-[10px] font-mono text-purple-300/70 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-400" /> Temperature
                    </div>
                    <div className="text-sm font-bold text-white">
                      {planet.stats.temperature}
                    </div>
                  </div>
                  <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3 space-y-0.5">
                    <div className="text-[10px] font-mono text-purple-300/70 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-cyan-400" /> Moons Count
                    </div>
                    <div className="text-sm font-bold text-white">
                      {planet.stats.moonsCount} Moons
                    </div>
                  </div>
                </div>
              )}

              {deepSpace && (
                <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-3.5 space-y-1.5">
                  <div className="text-[10px] font-mono text-purple-300/70">
                    SPECIAL PHENOMENON
                  </div>
                  <div className="text-xs font-semibold text-purple-100">
                    {deepSpace.stats.specialFeature}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TELEMETRY / PHYSICAL STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-2.5">
              {craft ? (
                <div className="space-y-2">
                  {[
                    { label: 'Launch Year', val: craft.launchYear },
                    { label: 'Mission Status', val: craft.status },
                    { label: 'Current Velocity', val: craft.speed },
                    { label: 'Distance from Earth', val: craft.distance },
                    { label: 'Primary Payload', val: craft.primaryInstrument },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center p-3 rounded-xl bg-purple-950/30 border border-purple-900/40"
                    >
                      <span className="text-[11px] font-mono text-purple-300/80">{item.label}</span>
                      <span className="font-bold text-white text-right max-w-[55%] truncate">
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              ) : deepSpace ? (
                <div className="space-y-2">
                  {[
                    { label: 'Distance from Earth', val: deepSpace.stats.distanceFromEarth },
                    { label: 'Mass / Size', val: deepSpace.stats.massOrSize },
                    { label: 'Classification', val: deepSpace.stats.classification },
                    { label: 'Energy / Temperature', val: deepSpace.stats.temperatureOrEnergy },
                    { label: 'Key Feature', val: deepSpace.stats.specialFeature },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between items-center p-3 rounded-xl bg-purple-950/30 border border-purple-900/40"
                    >
                      <span className="text-[11px] font-mono text-purple-300/80">{item.label}</span>
                      <span className="font-bold text-white text-right max-w-[55%] truncate">
                        {item.val}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                planet && (
                  <div className="space-y-2">
                    {[
                      { label: 'Diameter', val: planet.stats.diameter },
                      { label: 'Mass', val: planet.stats.mass },
                      { label: 'Surface Gravity', val: planet.stats.gravity },
                      { label: 'Distance from Sun', val: planet.stats.distanceFromSun },
                      { label: 'Orbital Period', val: planet.stats.orbitalPeriod },
                      { label: 'Rotation Period', val: planet.stats.rotationPeriod },
                      { label: 'Mean Temperature', val: planet.stats.temperature },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex justify-between items-center p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/40"
                      >
                        <span className="text-[11px] font-mono text-purple-300/80">{item.label}</span>
                        <span className="font-bold text-white">{item.val}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 3: SCIENCE / GEOLOGY / MISSIONS / PAYLOAD */}
          {activeTab === 'science' && (
            <div className="space-y-3">
              {craft ? (
                <div className="bg-purple-950/30 border border-purple-900/40 rounded-2xl p-4 space-y-2">
                  <div className="text-[11px] font-mono font-bold text-purple-300 flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-purple-400" /> Scientific Instruments & Payload
                  </div>
                  <p className="text-purple-100/90 leading-relaxed">{craft.primaryInstrument}</p>
                </div>
              ) : planet ? (
                <>
                  <div className="bg-purple-950/30 border border-purple-900/40 rounded-2xl p-4 space-y-1.5">
                    <div className="text-[11px] font-mono font-bold text-purple-300">
                      GEOLOGICAL COMPOSITION
                    </div>
                    <p className="text-purple-100/90 leading-relaxed">{planet.geology}</p>
                  </div>

                  {planet.exploration && planet.exploration.length > 0 && (
                    <div className="bg-purple-950/30 border border-purple-900/40 rounded-2xl p-4 space-y-2">
                      <div className="text-[11px] font-mono font-bold text-purple-300 flex items-center gap-1.5">
                        <Rocket className="w-3.5 h-3.5 text-purple-400" /> Space Missions
                      </div>
                      <ul className="space-y-1.5">
                        {planet.exploration.map((m, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-purple-200/90">
                            <span className="text-purple-400 font-bold">?</span>
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                deepSpace && (
                  <div className="bg-purple-950/30 border border-purple-900/40 rounded-2xl p-4 space-y-2">
                    <div className="text-[11px] font-mono font-bold text-purple-300">
                      ASTROPHYSICAL NATURE
                    </div>
                    <p className="text-purple-100/90 leading-relaxed">{deepSpace.overview}</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 4: FUN FACTS / TRIVIA */}
          {activeTab === 'facts' && (
            <div className="space-y-2.5">
              {(planet ? planet.funFacts : craft ? craft.facts : deepSpace?.facts || []).map((fact, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40"
                >
                  <div className="w-5 h-5 rounded-full bg-purple-600/30 border border-purple-400/40 text-purple-200 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-purple-100/90 leading-relaxed text-xs">{fact}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Footer Actions */}
        {planet && planet.id !== 'earth' && onCompareWithEarth && (
          <div className="p-4 border-t border-purple-900/40 bg-purple-950/40 flex items-center justify-between gap-3">
            <button
              onClick={() => onCompareWithEarth(planet.id)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              <Scale className="w-4 h-4" /> Compare with Earth
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

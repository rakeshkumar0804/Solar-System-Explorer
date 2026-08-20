import { useState, useMemo } from 'react';
import { X, Scale, ArrowLeftRight, ChevronDown } from 'lucide-react';
import type { ThemeConfig } from '../../types/space';
import { ALL_CELESTIAL_BODIES } from '../../data/planetsData';

interface CompareModalProps {
  initialTargetA?: string;
  initialTargetB?: string;
  theme: ThemeConfig;
  onClose: () => void;
}

const PRESETS = [
  { label: 'Earth vs. Mars', a: 'earth', b: 'mars' },
  { label: 'Earth vs. Venus (Twin Planet)', a: 'earth', b: 'venus' },
  { label: 'Jupiter vs. Saturn (Gas Giants)', a: 'jupiter', b: 'saturn' },
  { label: 'Sun vs. Jupiter (Star Scale)', a: 'sun', b: 'jupiter' },
];

export function CompareModal({
  initialTargetA = 'earth',
  initialTargetB = 'mars',
  theme: _theme,
  onClose,
}: CompareModalProps) {
  const [targetAId, setTargetAId] = useState(initialTargetA);
  const [targetBId, setTargetBId] = useState(initialTargetB);

  const bodyA = useMemo(
    () => ALL_CELESTIAL_BODIES.find((b) => b.id === targetAId) || ALL_CELESTIAL_BODIES[3],
    [targetAId]
  );
  const bodyB = useMemo(
    () => ALL_CELESTIAL_BODIES.find((b) => b.id === targetBId) || ALL_CELESTIAL_BODIES[4],
    [targetBId]
  );

  const swapTargets = () => {
    setTargetAId(targetBId);
    setTargetBId(targetAId);
  };

  // Calculate diameter scale ratio
  const ratio = (bodyB.size / bodyA.size);
  const ratioStr = ratio >= 1 ? ratio.toFixed(2) : (1 / ratio).toFixed(2);
  const comparisonText =
    ratio === 1
      ? `${bodyA.name} and ${bodyB.name} have identical model scales`
      : ratio > 1
      ? `${bodyB.name} is ${ratioStr}? larger in diameter than ${bodyA.name}`
      : `${bodyA.name} is ${ratioStr}? larger in diameter than ${bodyB.name}`;

  // Normalized visual bubble sizes clamped for clean visual aesthetics
  const maxPixelSize = 140;
  const minPixelSize = 36;
  const sizeA =
    bodyA.size >= bodyB.size
      ? maxPixelSize
      : Math.max(minPixelSize, (bodyA.size / bodyB.size) * maxPixelSize);
  const sizeB =
    bodyB.size >= bodyA.size
      ? maxPixelSize
      : Math.max(minPixelSize, (bodyB.size / bodyA.size) * maxPixelSize);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Glassmorphic Modal Card */}
      <div
        className="relative bg-[#0c061a]/95 border border-purple-900/50 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-[0_20px_80px_rgba(0,0,0,0.9)] text-slate-100 z-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header & Close Button */}
        <div className="p-5 pb-3 border-b border-purple-900/40 bg-gradient-to-b from-purple-950/60 to-transparent space-y-3 shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300">
                  <Scale className="w-4 h-4" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Compare Celestial Bodies
                </h2>
              </div>
              <p className="text-xs text-purple-200/70 font-medium">
                Direct physical, orbital, and visual scale ratio analysis
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-purple-300/80 hover:text-white rounded-full hover:bg-purple-900/30 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Presets Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase shrink-0 mr-1">
              Presets:
            </span>
            {PRESETS.map((p) => {
              const isSelected =
                (targetAId === p.a && targetBId === p.b) ||
                (targetAId === p.b && targetBId === p.a);
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    setTargetAId(p.a);
                    setTargetBId(p.b);
                  }}
                  className={`py-1 px-2.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600/40 text-white border-purple-400/60 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-purple-950/30 text-purple-300 border-purple-900/40 hover:bg-purple-900/30 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar text-xs">
          {/* Dual Dropdown Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 bg-purple-950/20 border border-purple-900/40 p-3.5 rounded-2xl">
            {/* Selector A */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-purple-300 uppercase font-bold">
                Target Body A
              </label>
              <div className="relative">
                <select
                  value={targetAId}
                  onChange={(e) => setTargetAId(e.target.value)}
                  className="w-full bg-[#150a2a] border border-purple-800/60 rounded-xl px-3 py-2 text-xs font-bold text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-400"
                >
                  {ALL_CELESTIAL_BODIES.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#0c061a] text-white">
                      {b.name} ({b.category})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center pt-3 sm:pt-4">
              <button
                onClick={swapTargets}
                className="p-2 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 text-purple-200 hover:text-white transition-all cursor-pointer shadow-md"
                title="Swap Bodies"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* Selector B */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-purple-300 uppercase font-bold">
                Target Body B
              </label>
              <div className="relative">
                <select
                  value={targetBId}
                  onChange={(e) => setTargetBId(e.target.value)}
                  className="w-full bg-[#150a2a] border border-purple-800/60 rounded-xl px-3 py-2 text-xs font-bold text-white appearance-none cursor-pointer focus:outline-none focus:border-purple-400"
                >
                  {ALL_CELESTIAL_BODIES.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#0c061a] text-white">
                      {b.name} ({b.category})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-purple-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* 3. Visual Scale Ratio Preview Box */}
          <div className="bg-purple-950/30 border border-purple-900/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase font-bold text-purple-300 tracking-wider">
                Visual Scale Ratio
              </span>
              <span className="text-[11px] font-mono text-purple-200 bg-purple-900/40 border border-purple-700/40 px-2 py-0.5 rounded-full font-bold">
                {comparisonText}
              </span>
            </div>

            <div className="flex items-center justify-around py-4 min-h-[160px]">
              {/* Body A Visual Bubble */}
              <div className="flex flex-col items-center gap-2 w-32 text-center">
                <div
                  className="rounded-full shadow-[0_0_25px_rgba(0,0,0,0.8)] border border-white/30 flex items-center justify-center font-mono text-[11px] font-bold text-white transition-all duration-300 relative group"
                  style={{
                    width: `${sizeA}px`,
                    height: `${sizeA}px`,
                    backgroundColor: bodyA.color,
                  }}
                >
                  {bodyA.rings && (
                    <div
                      className="absolute inset-[-20%] rounded-full border-2 border-white/40 pointer-events-none"
                      style={{ borderColor: bodyA.rings.color }}
                    />
                  )}
                  <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{bodyA.size}</span>
                </div>
                <div className="font-bold text-xs text-white truncate max-w-full">
                  {bodyA.name}
                </div>
              </div>

              {/* Central Scale Callout */}
              <div className="text-center font-mono space-y-0.5 shrink-0 px-2">
                <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                  Scale Factor
                </div>
                <div className="text-2xl font-black text-purple-200 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                  {ratio >= 1 ? `${ratio.toFixed(2)}x` : `1/${(1 / ratio).toFixed(2)}x`}
                </div>
              </div>

              {/* Body B Visual Bubble */}
              <div className="flex flex-col items-center gap-2 w-32 text-center">
                <div
                  className="rounded-full shadow-[0_0_25px_rgba(0,0,0,0.8)] border border-white/30 flex items-center justify-center font-mono text-[11px] font-bold text-white transition-all duration-300 relative group"
                  style={{
                    width: `${sizeB}px`,
                    height: `${sizeB}px`,
                    backgroundColor: bodyB.color,
                  }}
                >
                  {bodyB.rings && (
                    <div
                      className="absolute inset-[-20%] rounded-full border-2 border-white/40 pointer-events-none"
                      style={{ borderColor: bodyB.rings.color }}
                    />
                  )}
                  <span className="drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">{bodyB.size}</span>
                </div>
                <div className="font-bold text-xs text-white truncate max-w-full">
                  {bodyB.name}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Side-by-Side Comparative Metrics Table */}
          <div className="border border-purple-900/40 rounded-2xl overflow-hidden text-xs divide-y divide-purple-900/30">
            {/* Table Header */}
            <div className="grid grid-cols-3 p-3 bg-purple-950/60 font-mono text-[11px] font-bold text-purple-300">
              <span>Metric Property</span>
              <span className="text-white truncate">{bodyA.name}</span>
              <span className="text-purple-200 truncate">{bodyB.name}</span>
            </div>

            {/* Metric Rows */}
            {[
              {
                label: 'Classification',
                valA: bodyA.category,
                valB: bodyB.category,
              },
              {
                label: 'Equatorial Diameter',
                valA: bodyA.stats.diameter,
                valB: bodyB.stats.diameter,
              },
              {
                label: 'Planetary Mass',
                valA: bodyA.stats.mass,
                valB: bodyB.stats.mass,
              },
              {
                label: 'Surface Gravity',
                valA: bodyA.stats.gravity,
                valB: bodyB.stats.gravity,
              },
              {
                label: 'Mean Temperature',
                valA: bodyA.stats.temperature,
                valB: bodyB.stats.temperature,
              },
              {
                label: 'Distance from Sun',
                valA: bodyA.stats.distanceFromSun,
                valB: bodyB.stats.distanceFromSun,
              },
              {
                label: 'Day Length (Rotation)',
                valA: bodyA.stats.rotationPeriod,
                valB: bodyB.stats.rotationPeriod,
              },
              {
                label: 'Year Length (Orbit)',
                valA: bodyA.stats.orbitalPeriod,
                valB: bodyB.stats.orbitalPeriod,
              },
              {
                label: 'Known Moons',
                valA: `${bodyA.stats.moonsCount} Moons`,
                valB: `${bodyB.stats.moonsCount} Moons`,
              },
              {
                label: 'Primary Atmosphere',
                valA: bodyA.stats.atmosphere ? bodyA.stats.atmosphere.slice(0, 2).join(', ') : 'None / Trace',
                valB: bodyB.stats.atmosphere ? bodyB.stats.atmosphere.slice(0, 2).join(', ') : 'None / Trace',
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 p-3 bg-purple-950/20 hover:bg-purple-900/20 transition-colors items-center"
              >
                <span className="text-purple-300/80 font-mono font-medium">{row.label}</span>
                <span className="text-white font-semibold pr-2">{row.valA}</span>
                <span className="text-purple-200 font-semibold">{row.valB}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Scale,
  ArrowLeftRight,
  ChevronDown,
  Globe2,
  Orbit,
  Thermometer,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { ThemeConfig } from '../../types/space';
import { ALL_CELESTIAL_BODIES } from '../../data/planetsData';
import { calculateDiameterComparison, getDiameterKm } from '../../utils/comparison';

interface CompareModalProps {
  initialTargetA?: string;
  initialTargetB?: string;
  theme?: ThemeConfig;
  onClose: () => void;
}

const PRESETS = [
  { label: 'Earth vs. Mars', a: 'earth', b: 'mars' },
  { label: 'Earth vs. Venus (Twin)', a: 'earth', b: 'venus' },
  { label: 'Jupiter vs. Saturn (Giants)', a: 'jupiter', b: 'saturn' },
  { label: 'Sun vs. Jupiter (Star Scale)', a: 'sun', b: 'jupiter' },
  { label: 'Earth vs. Moon', a: 'earth', b: 'moon' },
];

export function CompareModal({
  initialTargetA = 'earth',
  initialTargetB = 'mars',
  theme: _theme,
  onClose,
}: CompareModalProps) {
  const [targetAId, setTargetAId] = useState(initialTargetA);
  const [targetBId, setTargetBId] = useState(initialTargetB);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Keyboard shortcut: Escape to close & trap focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  // Dynamic diameter calculation
  const comparison = useMemo(
    () => calculateDiameterComparison(bodyA, bodyB),
    [bodyA, bodyB]
  );

  // Numeric extraction helpers for comparative telemetry highlights
  const diameterA = getDiameterKm(bodyA);
  const diameterB = getDiameterKm(bodyB);
  const moonsA = bodyA.stats.moonsCount ?? 0;
  const moonsB = bodyB.stats.moonsCount ?? 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200"
    >
      {/* Click-outside backdrop */}
      <div
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Glassmorphic Modal Container */}
      <div
        ref={modalRef}
        className="relative bg-[#0b0518]/95 border border-purple-800/40 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-[0_25px_90px_rgba(0,0,0,0.95)] text-slate-100 z-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header with Sticky Navigation & Preset Chips */}
        <header className="p-4 sm:p-5 pb-3 border-b border-purple-900/40 bg-gradient-to-b from-purple-950/70 via-[#120726] to-transparent space-y-3 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <Scale className="w-5 h-5 text-purple-300" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="compare-modal-title"
                    className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2"
                  >
                    <span>Celestial Body Comparison</span>
                  </h2>
                  <p className="text-[11px] sm:text-xs text-purple-300/80 font-medium">
                    Direct physical, orbital, and atmospheric telemetry analysis
                  </p>
                </div>
              </div>
            </div>

            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close celestial comparison dialog"
              className="p-2 text-purple-300/80 hover:text-white rounded-full hover:bg-purple-900/40 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Quick Presets Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" aria-hidden="true" />
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
                  className={`py-1 px-3 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all border cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-purple-600/40 text-white border-purple-400/80 shadow-[0_0_12px_rgba(168,85,247,0.4)] ring-1 ring-purple-400/50'
                      : 'bg-purple-950/30 text-purple-300 border-purple-900/40 hover:bg-purple-900/30 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4 sm:space-y-5 custom-scrollbar text-xs">
          {/* Dual Body Selectors with Color Indicators and Swap Control */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3 bg-purple-950/25 border border-purple-900/40 p-3.5 rounded-2xl">
            {/* Target Body A */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="body-a-select"
                  className="text-[10px] font-mono text-cyan-300 uppercase font-bold flex items-center gap-1.5"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    style={{ backgroundColor: bodyA.color }}
                    aria-hidden="true"
                  />
                  Body A (Cyan Anchor)
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {diameterA.toLocaleString()} km
                </span>
              </div>
              <div className="relative">
                <select
                  id="body-a-select"
                  value={targetAId}
                  onChange={(e) => setTargetAId(e.target.value)}
                  className="w-full bg-[#16092e] border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none pr-8 transition-colors"
                >
                  {ALL_CELESTIAL_BODIES.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#0b0518] text-white">
                      {b.name} ({b.category})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="w-4 h-4 text-cyan-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center sm:pt-4">
              <button
                onClick={swapTargets}
                aria-label="Swap target celestial bodies"
                title="Swap Body A and Body B"
                className="p-2.5 rounded-xl bg-purple-900/50 hover:bg-purple-800/80 border border-purple-700/60 text-purple-200 hover:text-white transition-all cursor-pointer shadow-lg active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
              >
                <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Target Body B */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="body-b-select"
                  className="text-[10px] font-mono text-amber-300 uppercase font-bold flex items-center gap-1.5"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    style={{ backgroundColor: bodyB.color }}
                    aria-hidden="true"
                  />
                  Body B (Amber Target)
                </label>
                <span className="text-[10px] font-mono text-slate-400">
                  {diameterB.toLocaleString()} km
                </span>
              </div>
              <div className="relative">
                <select
                  id="body-b-select"
                  value={targetBId}
                  onChange={(e) => setTargetBId(e.target.value)}
                  className="w-full bg-[#16092e] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white appearance-none cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none pr-8 transition-colors"
                >
                  {ALL_CELESTIAL_BODIES.map((b) => (
                    <option key={b.id} value={b.id} className="bg-[#0b0518] text-white">
                      {b.name} ({b.category})
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* 3. Primary Size-Ratio Statement & Proportional Diameter Visualizer */}
          <section
            aria-label="Diameter comparison and visual scale"
            className="bg-gradient-to-br from-purple-950/40 via-[#130728] to-purple-950/20 border border-purple-800/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-inner"
          >
            {/* Header with Statement & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-purple-900/40">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono uppercase font-bold text-purple-300 tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                  Primary Size Ratio Analysis
                </div>
                <div className="text-sm sm:text-base font-bold text-white">
                  {comparison.primaryStatement}
                </div>
                <div className="text-xs text-purple-300/90 font-medium">
                  {comparison.secondaryStatement}
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="text-xs font-mono font-black text-cyan-200 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                  {comparison.comparisonBadge}
                </span>
              </div>
            </div>

            {/* Visual Spheres Comparison View */}
            <div className="flex items-center justify-around py-3 sm:py-5 min-h-[160px] bg-black/30 rounded-xl border border-purple-950/60">
              {/* Body A Visual Circle */}
              <div className="flex flex-col items-center gap-2.5 w-36 text-center">
                <div
                  className="rounded-full shadow-[0_0_30px_rgba(0,0,0,0.9)] border-2 border-cyan-400/60 flex items-center justify-center font-mono text-[11px] font-bold text-white transition-all duration-300 relative group"
                  style={{
                    width: `${comparison.visualScaleA}px`,
                    height: `${comparison.visualScaleA}px`,
                    backgroundColor: bodyA.color,
                  }}
                  title={`${bodyA.name}: ${diameterA.toLocaleString()} km`}
                >
                  {bodyA.rings && (
                    <div
                      className="absolute inset-[-25%] rounded-full border-2 border-white/40 pointer-events-none"
                      style={{ borderColor: bodyA.rings.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] px-1 truncate">
                    {bodyA.size}
                  </span>
                </div>
                <div className="space-y-0.5 max-w-full">
                  <div className="font-bold text-xs text-cyan-200 truncate flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" aria-hidden="true" />
                    <span>{bodyA.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {diameterA.toLocaleString()} km
                  </div>
                </div>
              </div>

              {/* Central Scale Multiplier Callout */}
              <div className="text-center font-mono space-y-1 shrink-0 px-2">
                <div className="text-[10px] text-purple-300/80 font-bold uppercase tracking-wider">
                  Scale Ratio
                </div>
                <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-amber-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                  {comparison.ratioFormatted}
                </div>
                <div className="text-[10px] text-purple-300/70 font-semibold">
                  {comparison.percentFormatted} diff
                </div>
              </div>

              {/* Body B Visual Circle */}
              <div className="flex flex-col items-center gap-2.5 w-36 text-center">
                <div
                  className="rounded-full shadow-[0_0_30px_rgba(0,0,0,0.9)] border-2 border-amber-400/60 flex items-center justify-center font-mono text-[11px] font-bold text-white transition-all duration-300 relative group"
                  style={{
                    width: `${comparison.visualScaleB}px`,
                    height: `${comparison.visualScaleB}px`,
                    backgroundColor: bodyB.color,
                  }}
                  title={`${bodyB.name}: ${diameterB.toLocaleString()} km`}
                >
                  {bodyB.rings && (
                    <div
                      className="absolute inset-[-25%] rounded-full border-2 border-white/40 pointer-events-none"
                      style={{ borderColor: bodyB.rings.color }}
                      aria-hidden="true"
                    />
                  )}
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] px-1 truncate">
                    {bodyB.size}
                  </span>
                </div>
                <div className="space-y-0.5 max-w-full">
                  <div className="font-bold text-xs text-amber-200 truncate flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
                    <span>{bodyB.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {diameterB.toLocaleString()} km
                  </div>
                </div>
              </div>
            </div>

            {/* Normalized Horizontal Comparison Bars */}
            <div className="space-y-2 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono font-medium">
                  <span className="text-cyan-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden="true" />
                    {bodyA.name} ({diameterA.toLocaleString()} km)
                  </span>
                  <span className="text-slate-400">{comparison.barPercentA.toFixed(1)}% of max</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 border border-purple-900/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${comparison.barPercentA}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono font-medium">
                  <span className="text-amber-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                    {bodyB.name} ({diameterB.toLocaleString()} km)
                  </span>
                  <span className="text-slate-400">{comparison.barPercentB.toFixed(1)}% of max</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 border border-purple-900/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300"
                    style={{ width: `${comparison.barPercentB}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Capped Visual Scale Note if extreme ratio */}
            {comparison.isVisualScaleCapped && (
              <p className="text-[10px] font-mono text-purple-300/80 italic text-center pt-1">
                * {comparison.visualScaleNote}
              </p>
            )}
          </section>

          {/* 4. Structured Comparative Telemetry Table */}
          <div className="space-y-4">
            {/* Legend Bar */}
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono text-purple-300 border-b border-purple-900/30">
              <span className="font-bold uppercase tracking-wider text-[10px] text-purple-400">
                Detailed Metric Breakdown
              </span>
              <div className="flex items-center gap-4 text-[10px]">
                <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" aria-hidden="true" />
                  {bodyA.name} (Body A)
                </span>
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
                  {bodyB.name} (Body B)
                </span>
              </div>
            </div>

            {/* Section 1: Physical Characteristics */}
            <div className="border border-purple-900/40 rounded-2xl overflow-hidden bg-purple-950/20 shadow-sm">
              <div className="px-4 py-2.5 bg-purple-950/60 border-b border-purple-900/40 flex items-center gap-2 font-mono text-[11px] font-bold text-purple-200">
                <Globe2 className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                <span>Physical Characteristics</span>
              </div>
              <div className="divide-y divide-purple-900/25">
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
                    highlightA: diameterA > diameterB,
                    highlightB: diameterB > diameterA,
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
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-1 sm:grid-cols-3 p-3 text-xs items-center gap-1 sm:gap-2 transition-colors ${
                      idx % 2 === 0 ? 'bg-purple-950/15' : 'bg-transparent'
                    } hover:bg-purple-900/20`}
                  >
                    <span className="text-purple-300/80 font-mono font-medium">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-white font-semibold pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 sm:hidden shrink-0" aria-hidden="true" />
                      <span className={row.highlightA ? 'text-cyan-300 font-bold' : ''}>
                        {row.valA}
                      </span>
                      {row.highlightA && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                          Larger
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 sm:hidden shrink-0" aria-hidden="true" />
                      <span className={row.highlightB ? 'text-amber-300 font-bold' : ''}>
                        {row.valB}
                      </span>
                      {row.highlightB && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                          Larger
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Orbital & Rotational Mechanics */}
            <div className="border border-purple-900/40 rounded-2xl overflow-hidden bg-purple-950/20 shadow-sm">
              <div className="px-4 py-2.5 bg-purple-950/60 border-b border-purple-900/40 flex items-center gap-2 font-mono text-[11px] font-bold text-purple-200">
                <Orbit className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                <span>Orbital & Rotational Mechanics</span>
              </div>
              <div className="divide-y divide-purple-900/25">
                {[
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
                    valA: `${moonsA} Moon${moonsA === 1 ? '' : 's'}`,
                    valB: `${moonsB} Moon${moonsB === 1 ? '' : 's'}`,
                    highlightA: moonsA > moonsB,
                    highlightB: moonsB > moonsA,
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-1 sm:grid-cols-3 p-3 text-xs items-center gap-1 sm:gap-2 transition-colors ${
                      idx % 2 === 0 ? 'bg-purple-950/15' : 'bg-transparent'
                    } hover:bg-purple-900/20`}
                  >
                    <span className="text-purple-300/80 font-mono font-medium">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-white font-semibold pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 sm:hidden shrink-0" aria-hidden="true" />
                      <span className={row.highlightA ? 'text-cyan-300 font-bold' : ''}>
                        {row.valA}
                      </span>
                      {row.highlightA && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                          More Moons
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 sm:hidden shrink-0" aria-hidden="true" />
                      <span className={row.highlightB ? 'text-amber-300 font-bold' : ''}>
                        {row.valB}
                      </span>
                      {row.highlightB && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                          More Moons
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Atmosphere & Climate */}
            <div className="border border-purple-900/40 rounded-2xl overflow-hidden bg-purple-950/20 shadow-sm">
              <div className="px-4 py-2.5 bg-purple-950/60 border-b border-purple-900/40 flex items-center gap-2 font-mono text-[11px] font-bold text-purple-200">
                <Thermometer className="w-3.5 h-3.5 text-purple-400" aria-hidden="true" />
                <span>Atmosphere & Environment</span>
              </div>
              <div className="divide-y divide-purple-900/25">
                {[
                  {
                    label: 'Mean Temperature',
                    valA: bodyA.stats.temperature,
                    valB: bodyB.stats.temperature,
                  },
                  {
                    label: 'Primary Atmosphere',
                    valA: bodyA.stats.atmosphere && bodyA.stats.atmosphere.length > 0
                      ? bodyA.stats.atmosphere.slice(0, 3).join(', ')
                      : 'None / Exosphere',
                    valB: bodyB.stats.atmosphere && bodyB.stats.atmosphere.length > 0
                      ? bodyB.stats.atmosphere.slice(0, 3).join(', ')
                      : 'None / Exosphere',
                  },
                ].map((row, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-1 sm:grid-cols-3 p-3 text-xs items-center gap-1 sm:gap-2 transition-colors ${
                      idx % 2 === 0 ? 'bg-purple-950/15' : 'bg-transparent'
                    } hover:bg-purple-900/20`}
                  >
                    <span className="text-purple-300/80 font-mono font-medium">
                      {row.label}
                    </span>
                    <div className="flex items-center gap-1.5 text-white font-semibold pr-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 sm:hidden shrink-0" aria-hidden="true" />
                      <span>{row.valA}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 sm:hidden shrink-0" aria-hidden="true" />
                      <span>{row.valB}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

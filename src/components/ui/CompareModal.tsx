import { X } from 'lucide-react';
import type { ThemeConfig  } from '../../types/space';
import { PLANETS_DATA } from '../../data/planetsData';

interface CompareModalProps {
  targetPlanetId: string;
  theme: ThemeConfig;
  onClose: () => void;
}

export function CompareModal({ targetPlanetId, theme: _theme, onClose }: CompareModalProps) {
  const earth = PLANETS_DATA.find((p) => p.id === 'earth')!;
  const target = PLANETS_DATA.find((p) => p.id === targetPlanetId) || earth;

  const ratio = (target.size / earth.size).toFixed(2);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-950/95 border border-white/15 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          🌍 Earth vs. {target.name}
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-6">
          Direct physical, orbital, and atmospheric planetary comparison
        </p>

        {/* Visual Scale Diagram */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 flex items-center justify-around">
          {/* Earth */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-full shadow-lg border border-cyan-400 flex items-center justify-center font-mono text-[10px] text-white"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: earth.color,
              }}
            >
              1.0x
            </div>
            <span className="font-bold text-xs text-white">Earth (1.0)</span>
          </div>

          {/* Size Comparison Badge */}
          <div className="text-center font-mono">
            <div className="text-xs text-slate-400">Scale Ratio</div>
            <div className="text-lg font-black text-cyan-300">{ratio}x</div>
          </div>

          {/* Target */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-full shadow-lg border border-white/30 flex items-center justify-center font-mono text-[10px] text-white"
              style={{
                width: `${Math.min(130, Math.max(30, (target.size / earth.size) * 64))}px`,
                height: `${Math.min(130, Math.max(30, (target.size / earth.size) * 64))}px`,
                backgroundColor: target.color,
              }}
            >
              {ratio}x
            </div>
            <span className="font-bold text-xs text-white">{target.name}</span>
          </div>
        </div>

        {/* Comparison Metrics Table */}
        <div className="divide-y divide-white/10 border border-white/10 rounded-2xl overflow-hidden text-xs">
          {[
            {
              label: 'Classification',
              earth: earth.category,
              target: target.category,
            },
            {
              label: 'Mass',
              earth: earth.stats.mass,
              target: target.stats.mass,
            },
            {
              label: 'Diameter',
              earth: earth.stats.diameter,
              target: target.stats.diameter,
            },
            {
              label: 'Surface Gravity',
              earth: earth.stats.gravity,
              target: target.stats.gravity,
            },
            {
              label: 'Surface Temperature',
              earth: earth.stats.temperature,
              target: target.stats.temperature,
            },
            {
              label: 'Distance from Sun',
              earth: earth.stats.distanceFromSun,
              target: target.stats.distanceFromSun,
            },
            {
              label: 'Orbital Period (Year)',
              earth: earth.stats.orbitalPeriod,
              target: target.stats.orbitalPeriod,
            },
            {
              label: 'Rotation Period (Day)',
              earth: earth.stats.rotationPeriod,
              target: target.stats.rotationPeriod,
            },
          ].map((row, idx) => (
            <div
              key={idx}
              className="grid grid-cols-3 p-3 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <span className="text-slate-400 font-mono font-medium">
                {row.label}
              </span>
              <span className="text-slate-200 font-mono font-semibold">
                {row.earth}
              </span>
              <span className="text-cyan-300 font-mono font-semibold">
                {row.target}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

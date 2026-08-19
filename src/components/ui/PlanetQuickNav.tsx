import { useRef } from 'react';
import type { CelestialBody, ThemeConfig  } from '../../types/space';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PlanetQuickNavProps {
  planets: CelestialBody[];
  selectedId: string | null;
  theme: ThemeConfig;
  onSelect: (id: string) => void;
}

export function PlanetQuickNav({
  planets,
  selectedId,
  theme: _theme,
  onSelect,
}: PlanetQuickNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 pointer-events-auto max-w-[95vw] sm:max-w-3xl select-none">
      <div className="flex items-center bg-slate-950/80 backdrop-blur-2xl border border-white/15 px-2 py-1.5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        <button
          onClick={() => scroll('left')}
          className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-1 scroll-smooth"
        >
          {planets.map((planet) => {
            const isSelected = selectedId === planet.id;
            return (
              <button
                key={planet.id}
                onClick={() => onSelect(planet.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border shrink-0 ${
                  isSelected
                    ? 'bg-white/20 text-white border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold scale-105'
                    : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/20 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-sm"
                  style={{ backgroundColor: planet.color }}
                />
                <span>{planet.name}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll('right')}
          className="p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

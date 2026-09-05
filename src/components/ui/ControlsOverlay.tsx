import { useState } from 'react';
import { MousePointer, ZoomIn, Hand, Sliders, Info, ChevronDown } from 'lucide-react';
import type { ThemeConfig } from '../../types/space';

interface ControlsOverlayProps {
  theme?: ThemeConfig;
  isVisible?: boolean;
}

export function ControlsOverlay({ theme: _theme, isVisible = true }: ControlsOverlayProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <aside
      aria-label="Navigation Guide and Legend"
      className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-20 select-none transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      {/* Mobile Mini Trigger (screens < 640px) */}
      <div className="sm:hidden flex justify-end mb-2">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle navigation guide"
          aria-expanded={isMobileOpen}
          className="p-2 rounded-full bg-[#0a0515]/90 border border-purple-900/50 text-purple-300 shadow-xl flex items-center gap-1.5 text-xs font-mono backdrop-blur-md focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
        >
          <Info className="w-3.5 h-3.5 text-purple-300" />
          <span>Guide</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isMobileOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Main Glassmorphic Help Card */}
      <div
        className={`bg-[#0a0515]/95 backdrop-blur-xl border border-purple-900/50 rounded-2xl p-3.5 sm:p-4 shadow-[0_16px_50px_rgba(0,0,0,0.85)] space-y-2 text-[11px] font-sans text-purple-200/90 w-56 sm:w-60 transition-all ${
          isMobileOpen ? 'block' : 'hidden sm:block'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <MousePointer className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
          <span>Drag to rotate view</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ZoomIn className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
          <span>Scroll to zoom in/out</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Hand className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
          <span>Click planet for details</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" aria-hidden="true" />
          <span>Use controls to customize</span>
        </div>

        {/* Habitable Zone Legend Indicator */}
        <div className="pt-2 mt-1 border-t border-purple-900/40 flex items-center gap-2 text-[10px] text-emerald-300 font-medium">
          <span
            className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] shrink-0 animate-pulse"
            aria-hidden="true"
          />
          <span>Green Band: Habitable Zone</span>
        </div>
      </div>
    </aside>
  );
}

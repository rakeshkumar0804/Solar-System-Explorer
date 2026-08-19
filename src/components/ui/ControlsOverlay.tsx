import { MousePointer, ZoomIn, Hand, Sliders } from 'lucide-react';
import type { ThemeConfig } from '../../types/space';

interface ControlsOverlayProps {
  theme: ThemeConfig;
}

export function ControlsOverlay({ theme: _theme }: ControlsOverlayProps) {
  return (
    <div className="fixed bottom-6 right-6 z-20 pointer-events-none select-none hidden md:block">
      <div className="bg-[#0a0515]/90 backdrop-blur-md border border-purple-900/40 rounded-2xl p-3.5 shadow-2xl space-y-2 text-[11px] font-sans text-purple-200/85 w-56">
        <div className="flex items-center gap-2.5">
          <MousePointer className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Drag to rotate view</span>
        </div>
        <div className="flex items-center gap-2.5">
          <ZoomIn className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Scroll to zoom in/out</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Hand className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Click planet for details</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span>Use controls to customize</span>
        </div>
      </div>
    </div>
  );
}

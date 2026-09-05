import { RefreshCw, AlertTriangle, Telescope, Sparkles } from 'lucide-react';
import type { ThemeConfig } from '../../types/space';

interface WebGLFallbackProps {
  theme?: ThemeConfig;
  onRetry: () => void;
  reason?: string;
}

export function WebGLFallback({ onRetry, reason }: WebGLFallbackProps) {
  return (
    <div className="w-full h-full absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6 bg-[#05010d] text-slate-100 select-none overflow-hidden">
      {/* Background Animated Star/Glow CSS Illustration (Zero WebGL Dependency) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-purple-900/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-dashed border-purple-800/20 rounded-full animate-spin" style={{ animationDuration: '60s' }} />
      </div>

      {/* Main Polished Fallback Card */}
      <div className="relative max-w-md w-full bg-[#0c061a]/90 border border-purple-800/50 rounded-3xl p-6 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.9)] text-center space-y-5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Space Illustration Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-700/60 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.3)]">
          <Telescope className="w-8 h-8 text-purple-300 animate-pulse" />
          <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            3D graphics are unavailable
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/80 font-medium leading-relaxed">
            Your browser or device could not initialize WebGL. Enable hardware acceleration, update your browser, or try another supported device.
          </p>
          {reason && (
            <p className="text-[11px] font-mono text-purple-400/70 pt-1">
              Diagnostic: {reason}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>

        {/* Tip */}
        <div className="pt-2 border-t border-purple-900/40 text-[11px] text-purple-300/60 flex items-center justify-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Non-3D comparison tools remain accessible via top controls</span>
        </div>
      </div>
    </div>
  );
}

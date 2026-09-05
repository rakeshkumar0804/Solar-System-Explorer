import { useEffect, useRef } from 'react';

export type BootPhase =
  | 'wakeup'         // Phase 1: 0.0s - 2.0s (System wake-up, targeting reticle, singularity)
  | 'diagnostics'    // Phase 2: 2.0s - 5.0s (Module initialization & diagnostic checks)
  | 'construction'   // Phase 3: 5.0s - 8.0s (Solar-system vector map construction)
  | 'online'         // Phase 4: 8.0s - 10.0s (Technical confirmation & lock-on)
  | 'handoff'        // Phase 5: 10.0s - 11.0s (Seamless crossfade into WebGL scene)
  | 'ready';

interface CosmicCanvasProps {
  phase: BootPhase;
  phaseProgress: number; // 0..1 within current phase
  totalElapsed: number;  // seconds since boot start
  reducedMotion: boolean;
}

// Fixed orbit definitions for abstract 2D solar system preview
const BOOT_ORBITS = [
  { name: 'Mercury', rFactor: 0.14, speed: 0.040, color: '#a8a29e', size: 2.2 },
  { name: 'Venus',   rFactor: 0.22, speed: 0.030, color: '#f59e0b', size: 3.2 },
  { name: 'Earth',   rFactor: 0.31, speed: 0.024, color: '#38bdf8', size: 3.6 },
  { name: 'Mars',    rFactor: 0.40, speed: 0.019, color: '#ef4444', size: 2.8 },
  { name: 'Jupiter', rFactor: 0.54, speed: 0.012, color: '#fb923c', size: 6.0 },
  { name: 'Saturn',  rFactor: 0.68, speed: 0.009, color: '#eab308', size: 5.2, hasRings: true },
  { name: 'Uranus',  rFactor: 0.82, speed: 0.006, color: '#06b6d4', size: 4.2 },
  { name: 'Neptune', rFactor: 0.94, speed: 0.004, color: '#6366f1', size: 4.0 },
];

export function CosmicCanvas({
  phase,
  phaseProgress,
  totalElapsed,
  reducedMotion,
}: CosmicCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Calm, non-streaking background stars (slow atmospheric drift)
    const starCount = width < 768 ? 70 : 160;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.6 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.002 + 0.001,
      color: Math.random() > 0.7 ? '#c084fc' : Math.random() > 0.4 ? '#38bdf8' : '#ffffff',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.44;

      // 1. Dark Deep-Space Background
      ctx.fillStyle = '#05010d';
      ctx.fillRect(0, 0, width, height);

      // Subtle calm ambient nebula tint in center
      const ambientGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, maxRadius * 1.6);
      ambientGlow.addColorStop(0, 'rgba(112, 26, 117, 0.07)');
      ambientGlow.addColorStop(0.5, 'rgba(15, 23, 42, 0.04)');
      ambientGlow.addColorStop(1, 'rgba(5, 1, 13, 0)');
      ctx.fillStyle = ambientGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Slow, stable background stars (no hyper-speed or radial zoom)
      const starVisibility =
        phase === 'wakeup'
          ? Math.min(1, phaseProgress * 0.8)
          : phase === 'diagnostics'
          ? 0.8 + phaseProgress * 0.2
          : 1.0;

      stars.forEach((s, idx) => {
        const twinkle = Math.sin(Date.now() * s.twinkleSpeed + idx) * 0.25;
        const currentAlpha = Math.max(0.1, Math.min(1, (s.baseAlpha + twinkle) * starVisibility));

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fill();
      });

      if (reducedMotion) {
        ctx.globalAlpha = 1;
        animId = requestAnimationFrame(render);
        return;
      }

      // 3. Technical Grid & Axis Markings (NASA HUD style)
      const gridAlpha =
        phase === 'wakeup'
          ? phaseProgress * 0.15
          : phase === 'diagnostics' || phase === 'construction' || phase === 'online'
          ? 0.18
          : Math.max(0, 0.18 * (1 - phaseProgress));

      if (gridAlpha > 0.01) {
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.lineWidth = 1;
        ctx.globalAlpha = gridAlpha;

        // Subtle crosshair axes
        const crossLength = Math.min(width, height) * 0.38;
        ctx.setLineDash([4, 12]);
        ctx.beginPath();
        ctx.moveTo(cx - crossLength, cy);
        ctx.lineTo(cx + crossLength, cy);
        ctx.moveTo(cx, cy - crossLength);
        ctx.lineTo(cx, cy + crossLength);
        ctx.stroke();
        ctx.setLineDash([]);

        // Small coordinate ticks on axes
        for (let r = 50; r <= crossLength; r += 50) {
          ctx.beginPath();
          ctx.moveTo(cx + r, cy - 3);
          ctx.lineTo(cx + r, cy + 3);
          ctx.moveTo(cx - r, cy - 3);
          ctx.lineTo(cx - r, cy + 3);
          ctx.moveTo(cx - 3, cy + r);
          ctx.lineTo(cx + 3, cy + r);
          ctx.moveTo(cx - 3, cy - r);
          ctx.lineTo(cx + 3, cy - r);
          ctx.stroke();
        }
      }

      // 4. Central Targeting Reticle & Singularity / Sun Progression
      const reticleAngle = totalElapsed * 0.2; // slow, calm rotation

      // PHASE 1: WAKE-UP & SINGULARITY
      if (phase === 'wakeup') {
        const pulse = Math.sin(totalElapsed * 3) * 1.5;
        const coreScale = 0.5 + phaseProgress * 0.5;

        // Small rotating reticle rings
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(reticleAngle);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 14]);
        ctx.beginPath();
        ctx.arc(0, 0, (26 + pulse) * coreScale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.rotate(-reticleAngle * 2);
        ctx.strokeStyle = 'rgba(192, 132, 252, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, (42 + pulse * 0.5) * coreScale, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Pulsing singularity dot
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5 + pulse * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 15;
        ctx.globalAlpha = Math.min(1, phaseProgress * 1.5);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // PHASE 2: MODULE DIAGNOSTICS
      else if (phase === 'diagnostics') {
        const pulse = Math.sin(totalElapsed * 2) * 2;
        const ringProgress = phaseProgress;

        // Expanding concentric telemetry brackets
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(reticleAngle);

        // Reticle 1 (Cyan)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([12, 16]);
        ctx.beginPath();
        ctx.arc(0, 0, 32 + pulse, 0, Math.PI * 2);
        ctx.stroke();

        // Reticle 2 (Purple)
        ctx.rotate(-reticleAngle * 1.5);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.setLineDash([20, 24]);
        ctx.beginPath();
        ctx.arc(0, 0, 60 + ringProgress * 18, 0, Math.PI * 2);
        ctx.stroke();

        // Corner tick brackets on reticle
        ctx.setLineDash([]);
        const bracketR = 75 + pulse;
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2 + Math.PI / 4;
          const bx = Math.cos(a) * bracketR;
          const by = Math.sin(a) * bracketR;
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.fill();
        }

        ctx.restore();

        // Stable central core
        const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
        coreGradient.addColorStop(0, '#ffffff');
        coreGradient.addColorStop(0.3, 'rgba(232, 121, 249, 0.8)');
        coreGradient.addColorStop(0.7, 'rgba(168, 85, 247, 0.3)');
        coreGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');

        ctx.beginPath();
        ctx.arc(cx, cy, 28, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.globalAlpha = 0.85;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 12;
        ctx.globalAlpha = 1;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // PHASE 3, 4, 5: VECTOR SOLAR SYSTEM CONSTRUCTION & ONLINE STATE
      else if (phase === 'construction' || phase === 'online' || phase === 'handoff' || phase === 'ready') {
        const constructionProgress =
          phase === 'construction'
            ? phaseProgress
            : 1.0;

        const fadeOutMultiplier =
          phase === 'handoff'
            ? Math.max(0, 1 - phaseProgress)
            : 1.0;

        // 1. Central Sun Vector Node
        const sunRadius = 14;
        const sunGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 45);
        sunGlow.addColorStop(0, '#ffffff');
        sunGlow.addColorStop(0.2, '#fde047');
        sunGlow.addColorStop(0.5, 'rgba(249, 115, 22, 0.35)');
        sunGlow.addColorStop(1, 'rgba(234, 88, 12, 0)');

        ctx.beginPath();
        ctx.arc(cx, cy, 45, 0, Math.PI * 2);
        ctx.fillStyle = sunGlow;
        ctx.globalAlpha = 0.9 * fadeOutMultiplier;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 18;
        ctx.globalAlpha = 1.0 * fadeOutMultiplier;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 2. Habitable Zone Band (Vector Ring between Earth & Mars)
        const hzInner = maxRadius * 0.27;
        const hzOuter = maxRadius * 0.36;
        const hzAlpha = Math.max(0, Math.min(1, (constructionProgress - 0.4) * 2)) * 0.18 * fadeOutMultiplier;

        if (hzAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(cx, cy, (hzInner + hzOuter) / 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(16, 185, 129, ${hzAlpha})`;
          ctx.lineWidth = hzOuter - hzInner;
          ctx.stroke();
        }

        // 3. Sequentially Drawn Orbit Paths and Celestial Nodes
        BOOT_ORBITS.forEach((orb, idx) => {
          // Staggered reveal across Phase 3 (5.0s - 8.0s)
          const startReveal = idx / (BOOT_ORBITS.length + 1);
          const orbitRevealProgress = Math.max(0, Math.min(1, (constructionProgress - startReveal) * (BOOT_ORBITS.length + 1)));

          if (orbitRevealProgress <= 0) return;

          const r = orb.rFactor * maxRadius;
          const arcLength = orbitRevealProgress * Math.PI * 2;

          // Orbit Path Line (Drawn progressively like a CAD / telemetry line)
          ctx.beginPath();
          ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + arcLength);
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.35 * fadeOutMultiplier})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 7]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Planetary Vector Node on Orbit
          if (orbitRevealProgress > 0.85) {
            const nodeAlpha = Math.min(1, (orbitRevealProgress - 0.85) / 0.15) * fadeOutMultiplier;
            const orbitalAngle = totalElapsed * orb.speed * 2.5 + (idx * 1.1) - Math.PI / 2;
            const px = cx + Math.cos(orbitalAngle) * r;
            const py = cy + Math.sin(orbitalAngle) * r;

            // Small Planet Dot
            ctx.beginPath();
            ctx.arc(px, py, orb.size, 0, Math.PI * 2);
            ctx.fillStyle = orb.color;
            ctx.shadowColor = orb.color;
            ctx.shadowBlur = 8;
            ctx.globalAlpha = nodeAlpha;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Saturn Rings representation
            if (orb.hasRings) {
              ctx.beginPath();
              ctx.ellipse(px, py, orb.size * 2.2, orb.size * 0.8, Math.PI / 4, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(234, 179, 8, ${0.6 * nodeAlpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }

            // Minimal Planet Label
            if (width > 640 && constructionProgress > 0.9) {
              ctx.font = '9px monospace';
              ctx.fillStyle = 'rgba(216, 180, 254, 0.7)';
              ctx.fillText(orb.name.toUpperCase(), px + orb.size + 4, py + 3);
            }
          }
        });

        // 4. Subtle Outer Horizon Boundary
        ctx.beginPath();
        ctx.arc(cx, cy, maxRadius * 0.98, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.2 * constructionProgress * fadeOutMultiplier})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 16]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [phase, phaseProgress, totalElapsed, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}

// Web Audio API synthesized ambient space drone and UI sounds

class SpaceAudioEngine {
  private ctx: AudioContext | null = null;
  private droneGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private lfo: OscillatorNode | null = null;
  private isMuted: boolean = true;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(muted?: boolean): boolean {
    this.initContext();
    if (muted !== undefined) {
      this.isMuted = muted;
    } else {
      this.isMuted = !this.isMuted;
    }

    if (this.isMuted) {
      this.stopDrone();
    } else {
      this.startDrone();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public startDrone() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.droneGain) return; // already playing

    try {
      const now = this.ctx.currentTime;
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.001, now);
      this.droneGain.gain.exponentialRampToValueAtTime(0.12, now + 3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      filter.Q.setValueAtTime(4, now);

      // Low frequency drone oscillators
      this.osc1 = this.ctx.createOscillator();
      this.osc1.type = 'sawtooth';
      this.osc1.frequency.setValueAtTime(55, now); // A1 note

      this.osc2 = this.ctx.createOscillator();
      this.osc2.type = 'triangle';
      this.osc2.frequency.setValueAtTime(55.4, now); // subtle beating pitch

      // LFO for filter breath
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(0.15, now);

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(40, now);

      this.lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      this.osc1.connect(filter);
      this.osc2.connect(filter);
      filter.connect(this.droneGain);
      this.droneGain.connect(this.ctx.destination);

      this.osc1.start(now);
      this.osc2.start(now);
      this.lfo.start(now);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public stopDrone() {
    if (this.droneGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.droneGain.gain.exponentialRampToValueAtTime(0.0001, now + 1);
      setTimeout(() => {
        try {
          this.osc1?.stop();
          this.osc2?.stop();
          this.lfo?.stop();
          this.osc1?.disconnect();
          this.osc2?.disconnect();
          this.lfo?.disconnect();
          this.droneGain?.disconnect();
        } catch {}
        this.droneGain = null;
        this.osc1 = null;
        this.osc2 = null;
        this.lfo = null;
      }, 1000);
    }
  }

  public playSelectSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  public playHoverSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  public playWarpSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.5);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }
}

export const spaceAudio = new SpaceAudioEngine();

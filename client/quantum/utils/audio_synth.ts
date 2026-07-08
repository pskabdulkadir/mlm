export class QuantumAudioEngine {
  private ctx: AudioContext | null = null;
  private mainDestinationGain: GainNode | null = null;
  
  // Binaural Beat Oscillators
  private oscLeft: OscillatorNode | null = null;
  private oscRight: OscillatorNode | null = null;
  private panLeft: StereoPannerNode | null = null;
  private panRight: StereoPannerNode | null = null;
  private binauralMainGain: GainNode | null = null;

  // Nature (Water) Sound procedural synthesizer
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseLFO: OscillatorNode | null = null;
  private noiseLFOGain: GainNode | null = null;

  // Cosmic Synth Pad (Solfeggio background)
  private cosmicOsc1: OscillatorNode | null = null;
  private cosmicOsc2: OscillatorNode | null = null;
  private cosmicFilter: BiquadFilterNode | null = null;
  private cosmicLFO: OscillatorNode | null = null;
  private cosmicGain: GainNode | null = null;

  // Chime module status & timer
  private chimeInterval: any = null;
  private chimeGainValue: number = 0.3; // Local chime gain slider multiplier

  // Granular slider values (normalized 0.0 - 1.0)
  private vols = {
    master: 0.7,
    binaural: 0.4,
    nature: 0.3,
    cosmic: 0.4,
    chime: 0.4
  };

  private isRunning: boolean = false;

  constructor() {}

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.ctx = new AudioContextClass();
  }

  public setTrackVolume(track: 'master' | 'binaural' | 'nature' | 'cosmic' | 'chime', val: number) {
    this.vols[track] = val;
    this.applyVolumes();
  }

  public updateVolume(volume: number) {
    this.setTrackVolume('master', volume);
  }

  public getTrackVolumes() {
    return this.vols;
  }

  private applyVolumes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.mainDestinationGain) {
      this.mainDestinationGain.gain.setTargetAtTime(this.vols.master * 0.8, now, 0.1);
    }
    if (this.binauralMainGain) {
      this.binauralMainGain.gain.setTargetAtTime(this.vols.binaural * 0.5, now, 0.1);
    }
    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(this.vols.nature * 0.35, now, 0.2);
    }
    if (this.cosmicGain) {
      this.cosmicGain.gain.setTargetAtTime(this.vols.cosmic * 0.35, now, 0.15);
    }
    this.chimeGainValue = this.vols.chime;
  }

  public triggerChime(fundamentalHz: number = 528) {
    if (!this.ctx || !this.isRunning) return;

    try {
      const now = this.ctx.currentTime;
      // High-pass node for metallic qualities
      const outNode = this.mainDestinationGain || this.ctx.destination;

      const chimeVolumeNode = this.ctx.createGain();
      chimeVolumeNode.gain.setValueAtTime(this.chimeGainValue * 0.25, now);
      chimeVolumeNode.connect(outNode);

      // Partials of a Tibetan Singing bowl
      const partials = [1.0, 1.414, 2.0, 2.718, 3.16, 4.0];
      const gains = [1.0, 0.6, 0.4, 0.25, 0.15, 0.08];
      const decays = [4.5, 3.5, 2.8, 2.0, 1.5, 1.0]; // higher partials decay faster

      partials.forEach((ratio, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();

        // High purity sine wave mix
        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamentalHz * ratio, now);

        // Exponential decay envelope
        oscGain.gain.setValueAtTime(gains[i], now);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

        osc.connect(oscGain);
        oscGain.connect(chimeVolumeNode);

        osc.start(now);
        osc.stop(now + decays[i] + 0.1);
      });
    } catch (err) {
      console.warn("Chime generation error", err);
    }
  }

  public start(
    carrierHz: number, 
    beatHz: number, 
    solfeggioHz: number, 
    playNature: boolean, 
    playCosmic: boolean, 
    volume: number = 0.7
  ) {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.stop(); // Clear active oscillators first
    this.isRunning = true;
    this.vols.master = volume;

    const now = this.ctx.currentTime;

    // 1. Create central mixer destination
    this.mainDestinationGain = this.ctx.createGain();
    this.mainDestinationGain.connect(this.ctx.destination);

    // ==========================================
    // MODULE A: BINAURAL BEATS WITH STEREO SEPARATION
    // ==========================================
    try {
      this.binauralMainGain = this.ctx.createGain();

      this.oscLeft = this.ctx.createOscillator();
      this.oscLeft.type = 'sine';
      this.oscLeft.frequency.setValueAtTime(carrierHz, now);

      this.oscRight = this.ctx.createOscillator();
      this.oscRight.type = 'sine';
      this.oscRight.frequency.setValueAtTime(carrierHz + beatHz, now);

      this.panLeft = this.ctx.createStereoPanner();
      this.panLeft.pan.setValueAtTime(-1.0, now);

      this.panRight = this.ctx.createStereoPanner();
      this.panRight.pan.setValueAtTime(1.0, now);

      this.oscLeft.connect(this.panLeft);
      this.panLeft.connect(this.binauralMainGain);

      this.oscRight.connect(this.panRight);
      this.panRight.connect(this.binauralMainGain);

      this.binauralMainGain.connect(this.mainDestinationGain);

      this.oscLeft.start(now);
      this.oscRight.start(now);
    } catch (e) {
      console.error("Binaural module fallback error", e);
    }

    // ==========================================
    // MODULE B: OCEAN WAVE PROCEDURAL SYNTHESIS
    // ==========================================
    if (playNature) {
      try {
        this.noiseGain = this.ctx.createGain();

        const bufferSize = 4096;
        this.noiseNode = this.ctx.createScriptProcessor(bufferSize, 1, 1);
        this.noiseNode.onaudioprocess = (e) => {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }
        };

        this.noiseFilter = this.ctx.createBiquadFilter();
        this.noiseFilter.type = 'lowpass';
        this.noiseFilter.Q.setValueAtTime(1.5, now);

        this.noiseLFO = this.ctx.createOscillator();
        this.noiseLFO.type = 'sine';
        this.noiseLFO.frequency.setValueAtTime(0.12, now); // Slow swelling waves (8.3 seconds)

        this.noiseLFOGain = this.ctx.createGain();
        this.noiseLFOGain.gain.setValueAtTime(360, now);

        this.noiseFilter.frequency.setValueAtTime(520, now);

        this.noiseLFO.connect(this.noiseLFOGain);
        this.noiseLFOGain.connect(this.noiseFilter.frequency);

        this.noiseNode.connect(this.noiseFilter);
        this.noiseFilter.connect(this.noiseGain);
        this.noiseGain.connect(this.mainDestinationGain);

        this.noiseLFO.start(now);
      } catch (e) {
        console.error("Nature generator logic error", e);
      }
    }

    // ==========================================
    // MODULE C: SPECTRAL COSMIC SYNTH DRONE
    // ==========================================
    if (playCosmic) {
      try {
        this.cosmicGain = this.ctx.createGain();

        this.cosmicOsc1 = this.ctx.createOscillator();
        this.cosmicOsc1.type = 'triangle';
        this.cosmicOsc1.frequency.setValueAtTime(solfeggioHz / 2, now); // Warm base sub oct

        this.cosmicOsc2 = this.ctx.createOscillator();
        this.cosmicOsc2.type = 'sine';
        this.cosmicOsc2.frequency.setValueAtTime(solfeggioHz, now);

        this.cosmicFilter = this.ctx.createBiquadFilter();
        this.cosmicFilter.type = 'lowpass';
        this.cosmicFilter.frequency.setValueAtTime(380, now);
        this.cosmicFilter.Q.setValueAtTime(2.2, now);

        this.cosmicLFO = this.ctx.createOscillator();
        this.cosmicLFO.type = 'sine';
        this.cosmicLFO.frequency.setValueAtTime(0.2, now); // Chorus modulation

        const cosmicLFOGain2 = this.ctx.createGain();
        cosmicLFOGain2.gain.setValueAtTime(90, now);

        this.cosmicLFO.connect(cosmicLFOGain2);
        cosmicLFOGain2.connect(this.cosmicFilter.frequency);

        this.cosmicOsc1.connect(this.cosmicFilter);
        this.cosmicOsc2.connect(this.cosmicFilter);
        this.cosmicFilter.connect(this.cosmicGain);
        this.cosmicGain.connect(this.mainDestinationGain);

        this.cosmicOsc1.start(now);
        this.cosmicOsc2.start(now);
        this.cosmicLFO.start(now);
      } catch (e) {
        console.error("Cosmic synthesizer failure", e);
      }
    }

    // ==========================================
    // MODULE D: AUTO CHIME TRIGGER TIMER CYCLE
    // ==========================================
    // Generate soft sacred chime sound every 8sec to elevate meditation
    this.applyVolumes(); // syncs track scales
    
    this.triggerChime(solfeggioHz); // Initial welcoming bowl gong
    this.chimeInterval = setInterval(() => {
      if (this.isRunning) {
        this.triggerChime(solfeggioHz);
      }
    }, 8000);
  }

  public stop() {
    this.isRunning = false;

    if (this.chimeInterval) {
      clearInterval(this.chimeInterval);
      this.chimeInterval = null;
    }

    // Stop Binaural oscillators
    if (this.oscLeft) {
      try { this.oscLeft.stop(); } catch(e){ console.debug?.(e); }
      this.oscLeft.disconnect();
      this.oscLeft = null;
    }
    if (this.oscRight) {
      try { this.oscRight.stop(); } catch(e){ console.debug?.(e); }
      this.oscRight.disconnect();
      this.oscRight = null;
    }
    if (this.binauralMainGain) {
      this.binauralMainGain.disconnect();
      this.binauralMainGain = null;
    }

    // Stop Nature elements
    if (this.noiseNode) {
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    if (this.noiseLFO) {
      try { this.noiseLFO.stop(); } catch(e){ console.debug?.(e); }
      this.noiseLFO.disconnect();
      this.noiseLFO = null;
    }
    if (this.noiseFilter) {
      this.noiseFilter.disconnect();
      this.noiseFilter = null;
    }
    if (this.noiseGain) {
      this.noiseGain.disconnect();
      this.noiseGain = null;
    }

    // Stop Cosmic structures
    if (this.cosmicOsc1) {
      try { this.cosmicOsc1.stop(); } catch(e){ console.debug?.(e); }
      this.cosmicOsc1.disconnect();
      this.cosmicOsc1 = null;
    }
    if (this.cosmicOsc2) {
      try { this.cosmicOsc2.stop(); } catch(e){ console.debug?.(e); }
      this.cosmicOsc2.disconnect();
      this.cosmicOsc2 = null;
    }
    if (this.cosmicLFO) {
      try { this.cosmicLFO.stop(); } catch(e){ console.debug?.(e); }
      this.cosmicLFO.disconnect();
      this.cosmicLFO = null;
    }
    if (this.cosmicFilter) {
      this.cosmicFilter.disconnect();
      this.cosmicFilter = null;
    }
    if (this.cosmicGain) {
      this.cosmicGain.disconnect();
      this.cosmicGain = null;
    }

    if (this.mainDestinationGain) {
      this.mainDestinationGain.disconnect();
      this.mainDestinationGain = null;
    }
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}
export const audioService = new QuantumAudioEngine();

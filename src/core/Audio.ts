// Procedural audio synthesizer using Web Audio API
// No external audio files needed

export class Audio {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private musicMasterGain: GainNode | null = null; // Separate master gain for music (~25% of SFX volume)

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Create music master gain node at 25% of SFX volume
      this.musicMasterGain = this.ctx.createGain();
      this.musicMasterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.musicMasterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Jump sound - short upward chirp
  playJump() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  // Wall jump - sharper upward sound
  playWallJump() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  // Dimension shift to blue - cool descending tone
  playShiftBlue() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
    osc2.frequency.setValueAtTime(1200, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 0.25);
  }

  // Dimension shift to red - warm descending tone
  playShiftRed() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc2.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
    osc2.frequency.setValueAtTime(900, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
    osc2.stop(ctx.currentTime + 0.25);
  }

  // Death - harsh noise burst
  playDeath() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    source.start(ctx.currentTime);
  }

  // Victory - ascending arpeggio
  playVictory() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.12;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // Landing thud
  playLand() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // Bounce pad — springy boing
  playBounce() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  // Dimension orb — ethereal chime
  playOrb() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
    osc2.frequency.setValueAtTime(900, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    osc2.stop(ctx.currentTime + 0.3);
  }

  // Checkpoint activated - pleasant chime
  playCheckpoint() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc2.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
    osc2.stop(ctx.currentTime + 0.4);
  }

  // Laser warning - low pulsing beep
  playLaserWarning() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  // Turret fire - sharp ping
  playTurretFire() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  }

  // Gravity flip — whoosh upward
  playGravityFlip() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  }

  // Fragile block break — glass shatter
  playFragileBreak() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = 1 - i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * env * env;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    source.start(ctx.currentTime);
  }

  // ========================
  // UI / Menu Sounds
  // ========================

  // Menu hover/move - soft blip
  playMenuMove() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  }

  // Menu confirm/select - ascending click
  playMenuSelect() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  }

  // Tab/chapter switch - whoosh
  playTabSwitch() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    source.start(ctx.currentTime);
  }

  // Menu locked/error - low buzz
  playMenuLocked() {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  // Toggle mute
  toggleMute(): boolean {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.enabled;
  }

  isMuted(): boolean {
    return !this.enabled;
  }

  // ========================
  // Procedural Synthwave Music
  // ========================
  private musicNodes: { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode }[] = [];
  private musicPlaying = false;
  private musicDimension: Dimension = 'BLUE';

  startMusic() {
    if (!this.enabled || this.musicPlaying) return;
    const ctx = this.getCtx();
    const master = this.musicMasterGain!;
    this.musicPlaying = true;
    const now = ctx.currentTime;
    const fadeTime = 0.3; // smooth fade-in to avoid clicks

    // Bass line — slow arpeggio
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    const bassFilter = ctx.createBiquadFilter();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(55, now); // A1
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(300, now);
    bassFilter.Q.setValueAtTime(5, now);
    bassGain.gain.setValueAtTime(0.001, now);
    bassGain.gain.exponentialRampToValueAtTime(0.06, now + fadeTime);
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(master); // Connect to music master gain
    bassOsc.start(now);
    this.musicNodes.push({ osc: bassOsc, gain: bassGain, filter: bassFilter });

    // Pad — ambient chord
    const padOsc = ctx.createOscillator();
    const padOsc2 = ctx.createOscillator();
    const padGain = ctx.createGain();
    const padFilter = ctx.createBiquadFilter();
    padOsc.type = 'sine';
    padOsc2.type = 'sine';
    padOsc.frequency.setValueAtTime(110, now); // A2
    padOsc2.frequency.setValueAtTime(164.81, now); // E3
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(500, now);
    padGain.gain.setValueAtTime(0.001, now);
    padGain.gain.exponentialRampToValueAtTime(0.03, now + fadeTime);
    padOsc.connect(padFilter);
    padOsc2.connect(padFilter);
    padFilter.connect(padGain);
    padGain.connect(master); // Connect to music master gain
    padOsc.start(now);
    padOsc2.start(now);
    this.musicNodes.push({ osc: padOsc, gain: padGain, filter: padFilter });
    this.musicNodes.push({ osc: padOsc2, gain: padGain, filter: padFilter });

    // Arpeggio — higher notes
    const arpOsc = ctx.createOscillator();
    const arpGain = ctx.createGain();
    const arpFilter = ctx.createBiquadFilter();
    arpOsc.type = 'square';
    arpOsc.frequency.setValueAtTime(220, now);
    arpFilter.type = 'lowpass';
    arpFilter.frequency.setValueAtTime(800, now);
    arpGain.gain.setValueAtTime(0.001, now);
    arpGain.gain.exponentialRampToValueAtTime(0.02, now + fadeTime);
    arpOsc.connect(arpFilter);
    arpFilter.connect(arpGain);
    arpGain.connect(master); // Connect to music master gain
    arpOsc.start(now);
    this.musicNodes.push({ osc: arpOsc, gain: arpGain, filter: arpFilter });

    // Start arpeggio sequencer
    this.playArpeggioLoop();
  }

  private arpInterval: number | null = null;
  private arpNoteIndex = 0;

  private playArpeggioLoop() {
    if (!this.musicPlaying || !this.enabled) return;
    const ctx = this.getCtx();

    // Arpeggio notes (A minor pentatonic pattern)
    const notes = [220, 261.63, 329.63, 392, 440, 392, 329.63, 261.63];

    // Modulate bass
    const bassNode = this.musicNodes[0];
    if (bassNode) {
      const bassNotes = [55, 55, 48.99, 48.99, 55, 55, 61.74, 61.74];
      bassNode.osc.frequency.setValueAtTime(bassNotes[this.arpNoteIndex % bassNotes.length], ctx.currentTime);
    }

    // Modulate arpeggio
    const arpNode = this.musicNodes[3];
    if (arpNode) {
      const note = notes[this.arpNoteIndex % notes.length];
      arpNode.osc.frequency.setValueAtTime(note, ctx.currentTime);
      arpNode.gain.gain.setValueAtTime(0.025, ctx.currentTime);
      arpNode.gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.2);
    }

    this.arpNoteIndex++;
    this.arpInterval = window.setTimeout(() => this.playArpeggioLoop(), 250);
  }

  setMusicDimension(dim: 'BLUE' | 'RED') {
    if (this.musicDimension === dim) return;
    this.musicDimension = dim;

    // Shift filter based on dimension
    for (const node of this.musicNodes) {
      const ctx = this.getCtx();
      if (dim === 'BLUE') {
        node.filter.frequency.exponentialRampToValueAtTime(
          node.filter.type === 'lowpass' ? 600 : 600,
          ctx.currentTime + 0.3
        );
      } else {
        node.filter.frequency.exponentialRampToValueAtTime(
          node.filter.type === 'lowpass' ? 400 : 400,
          ctx.currentTime + 0.3
        );
      }
    }
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.arpInterval !== null) {
      clearTimeout(this.arpInterval);
      this.arpInterval = null;
    }
    const ctx = this.getCtx();
    const now = ctx.currentTime;
    const fadeOutTime = 0.2; // smooth fade-out to avoid clicks

    // Fade out all music gains smoothly
    for (const node of this.musicNodes) {
      try {
        node.gain.gain.cancelScheduledValues(now);
        node.gain.gain.setValueAtTime(node.gain.gain.value, now);
        node.gain.gain.exponentialRampToValueAtTime(0.001, now + fadeOutTime);
        node.osc.stop(now + fadeOutTime + 0.05);
      } catch { /* already stopped */ }
    }
    this.musicNodes = [];
  }
}

// Dimension type for music
type Dimension = 'BLUE' | 'RED';

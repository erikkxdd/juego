// Ghost replay system — records and plays back player runs
// Records position and dimension every 2 frames

export interface GhostFrame {
  x: number;
  y: number;
  dimension: 'BLUE' | 'RED';
}

export interface GhostData {
  frames: GhostFrame[];
  time: number; // total time of the run
}

export class GhostSystem {
  private frames: GhostFrame[] = [];
  private frameCounter = 0;
  private recording = false;
  private recordingTime = 0;

  // Playback state
  private playbackData: GhostData | null = null;
  private playbackTime = 0;
  private playingBack = false;

  // Record a frame (call every 2 game frames)
  record(x: number, y: number, dimension: 'BLUE' | 'RED', dt: number) {
    if (!this.recording) return;
    this.frameCounter++;
    if (this.frameCounter % 2 === 0) {
      this.frames.push({ x, y, dimension });
    }
    this.recordingTime += dt;
  }

  startRecording() {
    this.frames = [];
    this.frameCounter = 0;
    this.recordingTime = 0;
    this.recording = true;
  }

  stopRecording(): GhostData {
    this.recording = false;
    const data: GhostData = {
      frames: [...this.frames],
      time: this.recordingTime,
    };
    this.frames = [];
    return data;
  }

  // Load a ghost for playback
  loadPlayback(data: GhostData) {
    this.playbackData = data;
    this.playbackTime = 0;
    this.playingBack = true;
  }

  clearPlayback() {
    this.playbackData = null;
    this.playbackTime = 0;
    this.playingBack = false;
  }

  // Get ghost position at current elapsed time
  getGhostAt(time: number): GhostFrame | null {
    if (!this.playingBack || !this.playbackData) return null;
    this.playbackTime = time;

    const frames = this.playbackData.frames;
    if (frames.length === 0) return null;

    // Each frame represents ~2/60 seconds
    const frameInterval = 2 / 60;
    const frameIndex = Math.floor(this.playbackTime / frameInterval);

    if (frameIndex >= frames.length) {
      return frames[frames.length - 1];
    }
    if (frameIndex < 0) return frames[0];
    return frames[frameIndex];
  }

  isPlayingBack(): boolean {
    return this.playingBack && this.playbackData !== null;
  }
}

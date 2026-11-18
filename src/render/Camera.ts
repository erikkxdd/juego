// Dynamic camera with smooth follow, lookahead, world bounds, and screen shake
export class Camera {
  private _x = 0;
  private _y = 0;
  get x() { return this._x; }
  get y() { return this._y; }

  private targetX = 0;
  private targetY = 0;

  // Follow settings
  private followSpeed = 8; // lerp speed
  private lookaheadAmount = 60; // pixels to look ahead in movement direction

  // World bounds
  private boundsWidth = 1280;
  private boundsHeight = 720;

  // Screen shake
  private shakeTimer = 0;
  private shakeIntensity = 0;
  private shakeX = 0;
  private shakeY = 0;

  // Viewport size
  private viewW = 1280;
  private viewH = 720;

  constructor(viewW: number = 1280, viewH: number = 720) {
    this.viewW = viewW;
    this.viewH = viewH;
  }

  // Set world bounds
  setBounds(width: number, height: number) {
    this.boundsWidth = width;
    this.boundsHeight = height;
  }

  // Update camera to follow target
  update(dt: number, targetX: number, targetY: number, velX: number, velY: number) {
    // Calculate lookahead based on velocity direction
    let lookX = 0;
    let lookY = 0;

    const speed = Math.sqrt(velX * velX + velY * velY);
    if (speed > 10) {
      lookX = (velX / speed) * this.lookaheadAmount;
      lookY = (velY / speed) * this.lookaheadAmount;
    }

    this.targetX = targetX + lookX - this.viewW / 2 + 32; // offset for player center
    this.targetY = targetY + lookY - this.viewH / 2 + 16;

    // Smooth lerp follow
    const lerpFactor = 1 - Math.exp(-this.followSpeed * dt);
    this._x += (this.targetX - this._x) * lerpFactor;
    this._y += (this.targetY - this._y) * lerpFactor;

    // Clamp to world bounds
    this._x = Math.max(0, Math.min(this._x, this.boundsWidth - this.viewW));
    this._y = Math.max(0, Math.min(this._y, this.boundsHeight - this.viewH));

    // Update screen shake
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer < 0) this.shakeTimer = 0;
      const t = this.shakeTimer;
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2 * t;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2 * t;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }
  }

  // Trigger screen shake
  addShake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  // Get shake offset
  getShakeOffset(): { x: number; y: number } {
    return { x: this.shakeX, y: this.shakeY };
  }

  // Reset camera
  reset() {
    this._x = 0;
    this._y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.shakeTimer = 0;
    this.shakeX = 0;
    this.shakeY = 0;
  }

  // Get world-to-screen transform
  getTransform(): { x: number; y: number } {
    return { x: -this._x + this.shakeX, y: -this._y + this.shakeY };
  }

  // Check if point is visible in viewport
  isVisible(x: number, y: number): boolean {
    return x >= this._x - 50 && x <= this._x + this.viewW + 50 &&
           y >= this._y - 50 && y <= this._y + this.viewH + 50;
  }
}

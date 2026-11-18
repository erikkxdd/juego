import type { Dimension } from '../world/Level';
import { Input } from '../core/Input';

export class Player {
  // Position
  x = 0;
  y = 0;
  private _vx = 0;
  private _vy = 0;
  get vx() { return this._vx; }
  get vy() { return this._vy; }

  // Dimensions
  private readonly w = 20;
  private readonly h = 32;
  get width() { return this.w; }
  get height() { return this.h; }

  // Dimension state
  dimension: Dimension = 'BLUE';

  // Ground state
  private _grounded = false;
  get grounded() { return this._grounded; }
  private _wallSliding = false;
  get wallSliding() { return this._wallSliding; }
  private _wallDir = 0; // -1 left, 1 right
  get wallDir() { return this._wallDir; }

  // Coyote time (0.1s)
  private coyoteTimer = 0;
  private readonly coyoteTime = 0.1;

  // Jump buffering (0.1s)
  private jumpBufferTimer = 0;
  private readonly jumpBufferTime = 0.1;

  // Variable gravity
  private falling = false;

  // Physics constants
  private readonly accel = 1800;
  private readonly decel = 2200;
  private readonly maxSpeed = 280;
  private readonly gravity = 1200;
  private readonly fallGravity = 600; // slower gravity when jumping
  private readonly jumpVelocity = -420;
  private readonly wallSlideGravity = 80;
  private readonly wallJumpVx = 250;
  private readonly wallJumpVy = -400;

  // State flags
  private alive = true;
  get isAlive() { return this.alive; }

  // Air dash
  private dashCharges = 1;
  private dashTimer = 0;
  private readonly dashDuration = 0.14;
  private readonly dashSpeed = 500;
  private dashing = false;
  get isDashing() { return this.dashing; }
  get dashChargesLeft() { return this.dashCharges; }

  // Squash & stretch
  private _scaleX = 1;
  private _scaleY = 1;
  get scaleX() { return this._scaleX; }
  get scaleY() { return this._scaleY; }

  // Skin
  private _skin = 'classic';
  get skin() { return this._skin; }
  setSkin(s: string) { this._skin = s; }

  // Gravity direction: 1 = normal (down), -1 = inverted (up)
  private _gravityDir = 1;
  get gravityDir() { return this._gravityDir; }
  setGravityDir(dir: number) { this._gravityDir = dir; }

  // Get velocity for camera lookahead
  getVelocity(): { vx: number; vy: number } {
    return { vx: this._vx, vy: this._vy };
  }

  constructor() {
    this.resetTimers();
  }

  private resetTimers() {
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.dashCharges = 1;
    this.dashTimer = 0;
    this.dashing = false;
    this._scaleX = 1;
    this._scaleY = 1;
    this._gravityDir = 1;
  }

  respawn(x: number, y: number) {
    this.x = x;
    this.y = y;
    this._vx = 0;
    this._vy = 0;
    this._grounded = false;
    this._wallSliding = false;
    this._wallDir = 0;
    this.alive = true;
    this.falling = false;
    this.resetTimers();
  }

  // Trigger air dash in a direction (-1 left, 0 up/down, 1 right)
  airDash(dirX: number, dirY: number) {
    if (this.dashCharges <= 0 || this.dashing || this._grounded) return false;
    this.dashCharges = 0;
    this.dashing = true;
    this.dashTimer = this.dashDuration;
    // Normalize direction
    const len = Math.sqrt(dirX * dirX + dirY * dirY);
    if (len > 0) {
      dirX /= len;
      dirY /= len;
    } else {
      dirX = 1; // default right
    }
    this._vx = dirX * this.dashSpeed;
    this._vy = dirY * this.dashSpeed;
    // Stretch effect
    this._scaleX = 1.4;
    this._scaleY = 0.6;
    return true;
  }

  // Recalculate squash & stretch each frame
  updateScale(dt: number) {
    // Lerp back to 1
    const lerpSpeed = 10;
    this._scaleX += (1 - this._scaleX) * lerpSpeed * dt;
    this._scaleY += (1 - this._scaleY) * lerpSpeed * dt;
  }

  // Trigger squash on landing
  squashOnLand() {
    this._scaleX = 1.3;
    this._scaleY = 0.7;
  }

  // Trigger stretch on jump
  stretchOnJump() {
    this._scaleX = 0.7;
    this._scaleY = 1.3;
  }

  // Recharge dash on ground/wall/bounce/orb
  rechargeDash() {
    this.dashCharges = 1;
  }

  die() {
    this.alive = false;
  }

  shiftDimension(): Dimension {
    this.dimension = this.dimension === 'BLUE' ? 'RED' : 'BLUE';
    return this.dimension;
  }

  update(dt: number, input: Input) {
    if (!this.alive) return;

    // Update squash & stretch
    this.updateScale(dt);

    // Air dash logic
    if (this.dashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) {
        this.dashing = false;
      }
      // During dash, skip normal physics — just move
      this.x += this._vx * dt;
      this.y += this._vy * dt;
      return;
    }

    // Horizontal movement
    let moveX = 0;
    if (input.moveLeft()) moveX -= 1;
    if (input.moveRight()) moveX += 1;

    if (moveX !== 0) {
      this._vx += moveX * this.accel * dt;
      // Clamp speed
      if (this._vx > this.maxSpeed) this._vx = this.maxSpeed;
      if (this._vx < -this.maxSpeed) this._vx = -this.maxSpeed;
    } else {
      // Deceleration
      if (this._vx > 0) {
        this._vx -= this.decel * dt;
        if (this._vx < 0) this._vx = 0;
      } else if (this._vx < 0) {
        this._vx += this.decel * dt;
        if (this._vx > 0) this._vx = 0;
      }
    }

    // Air dash input
    if (input.dashJustPressed() && !this._grounded) {
      let dirX = moveX;
      let dirY = 0;
      // If no horizontal input, dash in facing direction or right
      if (dirX === 0) {
        dirX = this._vx >= 0 ? 1 : -1;
      }
      this.airDash(dirX, dirY);
    }

    // Jump buffering
    if (input.jumpJustPressed()) {
      this.jumpBufferTimer = this.jumpBufferTime;
    }
    if (this.jumpBufferTimer > 0) {
      this.jumpBufferTimer -= dt;
    }

    // Coyote time
    if (this._grounded) {
      this.coyoteTimer = this.coyoteTime;
    } else {
      if (this.coyoteTimer > 0) {
        this.coyoteTimer -= dt;
      }
    }

    // Wall jump takes priority over normal jump when wall sliding
    if (this.jumpBufferTimer > 0 && this._wallSliding) {
      this._vx = -this._wallDir * this.wallJumpVx;
      this._vy = this.wallJumpVy;
      this._wallSliding = false;
      this.jumpBufferTimer = 0;
      this.falling = false;
    }
    // Normal jump (ground or coyote time) — only if not wall jumping this frame
    else if (this.jumpBufferTimer > 0 && (this._grounded || this.coyoteTimer > 0)) {
      this._vy = this.jumpVelocity;
      this._grounded = false;
      this.jumpBufferTimer = 0;
      this.falling = false;
    }

    // Variable gravity — faster fall when player releases jump
    if (this._vy < 0 && !input.isJumpHeld()) {
      this.falling = true;
    }

    // Apply gravity (respect gravity direction)
    const grav = this._wallSliding ? this.wallSlideGravity : (this.falling ? this.gravity : this.fallGravity);
    this._vy += grav * this._gravityDir * dt;

    // Terminal velocity
    if (this._vy > 800) this._vy = 800;
    if (this._vy < -800) this._vy = -800;

    // Move
    this.x += this._vx * dt;
    this.y += this._vy * dt;
  }

  // Collision resolution — called after update
  setGrounded(grounded: boolean) {
    this._grounded = grounded;
  }

  setWallSliding(sliding: boolean, dir: number) {
    this._wallSliding = sliding;
    this._wallDir = dir;
    if (sliding && this._vy > this.wallSlideGravity) {
      this._vy = this.wallSlideGravity;
    }
  }

  // For collision: get player bounds
  getBounds() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }

  // Reset velocity for collision push
  setVelocity(vx: number, vy: number) {
    this._vx = vx;
    this._vy = vy;
  }
}

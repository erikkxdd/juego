import type { Dimension, EntityDimension, Platform, Wall, Spike, Portal, Medal, LaserState, TurretState, Projectile } from '../world/Level';
import type { EditorEntity, EditorTool } from '../editor/LevelEditor';
import type { Skin } from '../core/Storage';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

// Trail segment for player velocity trail
export interface TrailSegment {
  x: number;
  y: number;
  w: number;
  h: number;
  life: number;
  color: string;
}

// Ghost frame for replay
export interface GhostFrame {
  x: number;
  y: number;
  dimension: 'BLUE' | 'RED';
}

// Scarf segment for physics cloth
export interface ScarfSegment {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private particles: Particle[] = [];
  private trail: TrailSegment[] = [];
  private shakeTimer = 0;
  private shakeIntensity = 0;

  // Shockwave ring for dimension shift
  private shockwaveTimer = 0;
  private shockwaveMaxRadius = 0;
  private shockwaveColor = '#00f0ff';

  // Parallax dust particles
  private dustParticles: { x: number; y: number; size: number; speed: number; phase: number }[] = [];

  // Scarf physics segments
  private scarf: ScarfSegment[] = [];
  private readonly scarfLength = 6;
  private readonly scarfSegLen = 6;

  // Colors — clean modern palette
  private readonly blueColor = '#38bdf8';
  private readonly redColor = '#fb7185';
  private readonly goldColor = '#fbbf24';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    // Initialize dust particles for parallax
    for (let i = 0; i < 50; i++) {
      this.dustParticles.push({
        x: Math.random() * 1280,
        y: Math.random() * 720,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 20 + 10,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  // Trigger shockwave ring
  triggerShockwave(color: string) {
    this.shockwaveTimer = 0.5;
    this.shockwaveMaxRadius = 600;
    this.shockwaveColor = color;
  }

  // Screen shake
  addShake(intensity: number, duration: number) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  // Spawn particles
  spawnParticles(x: number, y: number, count: number, color: string, speed: number, life: number, size: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vel = Math.random() * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * vel,
        vy: Math.sin(angle) * vel,
        life,
        maxLife: life,
        color,
        size,
      });
    }
  }

  spawnJumpParticles(x: number, y: number, dim: Dimension) {
    const color = dim === 'BLUE' ? this.blueColor : this.redColor;
    this.spawnParticles(x, y, 8, color, 100, 0.3, 3);
  }

  spawnLandParticles(x: number, y: number, dim: Dimension) {
    const color = dim === 'BLUE' ? this.blueColor : this.redColor;
    this.spawnParticles(x, y, 5, color, 60, 0.2, 2);
  }

  spawnShiftParticles(x: number, y: number, dim: Dimension) {
    const color = dim === 'BLUE' ? this.blueColor : this.redColor;
    this.spawnParticles(x, y, 20, color, 200, 0.5, 4);
  }

  spawnDeathParticles(x: number, y: number) {
    this.spawnParticles(x, y, 40, '#ffffff', 300, 0.8, 5);
    this.spawnParticles(x, y, 20, this.blueColor, 250, 0.6, 3);
    this.spawnParticles(x, y, 20, this.redColor, 250, 0.6, 3);
  }

  spawnVictoryParticles(x: number, y: number) {
    this.spawnParticles(x, y, 30, '#ffff00', 200, 1.0, 4);
    this.spawnParticles(x, y, 20, this.blueColor, 150, 0.8, 3);
    this.spawnParticles(x, y, 20, this.redColor, 150, 0.8, 3);
  }

  spawnBounceParticles(x: number, y: number, dim: Dimension) {
    const color = dim === 'BLUE' ? this.blueColor : this.redColor;
    this.spawnParticles(x, y, 12, color, 150, 0.4, 3);
    this.spawnParticles(x, y, 6, '#ffffff', 80, 0.2, 2);
  }

  spawnOrbParticles(x: number, y: number) {
    this.spawnParticles(x, y, 15, '#ffff00', 120, 0.5, 3);
    this.spawnParticles(x, y, 10, this.blueColor, 100, 0.4, 2);
    this.spawnParticles(x, y, 10, this.redColor, 100, 0.4, 2);
  }

  // Add trail segment
  addTrail(x: number, y: number, w: number, h: number, dim: Dimension) {
    const color = dim === 'BLUE' ? this.blueColor : this.redColor;
    this.trail.push({ x, y, w, h, life: 0.2, color });
  }

  updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt; // gravity
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update trail
    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].life -= dt;
      if (this.trail[i].life <= 0) {
        this.trail.splice(i, 1);
      }
    }

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer < 0) this.shakeTimer = 0;
    }

    // Update shockwave
    if (this.shockwaveTimer > 0) {
      this.shockwaveTimer -= dt;
      if (this.shockwaveTimer < 0) this.shockwaveTimer = 0;
    }

    // Update dust particles
    for (const d of this.dustParticles) {
      d.y -= d.speed * dt;
      d.x += Math.sin(d.phase + d.y * 0.01) * 0.3;
      if (d.y < -10) {
        d.y = 730;
        d.x = Math.random() * 1280;
      }
    }
  }

  // ========================
  // GAME RENDER
  // ========================
  renderGame(
    activeDim: Dimension,
    platforms: Platform[],
    walls: Wall[],
    spikes: Spike[],
    portal: Portal,
    movingPlatforms: { x: number; y: number; w: number; h: number; dimension: EntityDimension }[],
    bouncePads: { x: number; y: number; w: number; h: number; dimension: EntityDimension }[],
    orbs: { x: number; y: number; w: number; h: number; active: boolean; dimension: EntityDimension }[],
    playerX: number,
    playerY: number,
    playerW: number,
    playerH: number,
    playerDim: Dimension,
    playerAlive: boolean,
    _playerSpeed: number,
    wallSliding: boolean,
    playerVx: number,
    playerVy: number,
    playerGrounded: boolean,
    playerDashing: boolean,
    playerWallDir: number,
    levelName: string,
    levelIndex: number,
    _totalLevels: number,
    timer: number,
    sessionDeaths: number,
    won: boolean,
    muted: boolean,
    scaleX: number,
    scaleY: number,
    dashCharges: number,
    ghostFrame: GhostFrame | null,
    medal: Medal,
    timeDifference: number,
    camX: number = 0,
    camY: number = 0,
    skin: string = 'classic',
    checkpoints: { config: { x: number; y: number; w: number; h: number; dimension: EntityDimension }; active: boolean }[] = [],
    lasers: LaserState[] = [],
    turrets: TurretState[] = [],
    projectiles: Projectile[] = [],
    gravityZones: { x: number; y: number; w: number; h: number; dimension: EntityDimension }[] = [],
    fragileBlocks: { x: number; y: number; w: number; h: number; dimension: EntityDimension; state: string; timer: number }[] = [],
    _gravityDir: number = 1
  ) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Screen shake offset
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeTimer > 0) {
      const t = this.shakeTimer;
      shakeX = (Math.random() - 0.5) * this.shakeIntensity * 2 * t;
      shakeY = (Math.random() - 0.5) * this.shakeIntensity * 2 * t;
    }

    ctx.save();
    ctx.translate(shakeX + camX, shakeY + camY);

    // BACKGROUND — Soft gradient with mountain silhouettes
    // ========================

    // Layer 0: Soft night gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H + 200);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-camX * 0.1 - 10, -camY * 0.1 - 10, W + Math.abs(camX) + 20, H + Math.abs(camY) + 20);

    // Layer 1: Mountain/monolith silhouettes (parallax 0.2x)
    const mOffX = -camX * 0.2;
    const mOffY = -camY * 0.15;
    ctx.fillStyle = '#162033';
    ctx.globalAlpha = 0.5;
    for (let i = 0; i < 6; i++) {
      const mx = i * 260 + mOffX * 0.5 - 100;
      const mh = 80 + (i % 3) * 50 + Math.sin(i * 1.7) * 30;
      const mw = 120 + (i % 4) * 40;
      ctx.beginPath();
      ctx.moveTo(mx, H + mOffY);
      ctx.lineTo(mx + mw / 2, H - mh + mOffY);
      ctx.lineTo(mx + mw, H + mOffY);
      ctx.closePath();
      ctx.fill();
    }
    // Layer 2: Closer monoliths (parallax 0.35x)
    ctx.fillStyle = '#1e293b';
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 5; i++) {
      const mx = i * 300 + mOffX * 0.8 - 50;
      const mh = 50 + (i % 3) * 35;
      const mw = 60 + (i % 3) * 30;
      ctx.fillRect(mx, H - mh + mOffY * 0.8, mw, mh);
    }
    ctx.globalAlpha = 1;

    // Layer 3: Soft floating particles (parallax 0.3x)
    const time = Date.now() * 0.001;
    for (const d of this.dustParticles) {
      const dx = d.x + (-camX * 0.3);
      const dy = d.y + (-camY * 0.3);
      const alpha = 0.12 + Math.sin(time * 2 + d.phase) * 0.08;
      const pColor = activeDim === 'BLUE' ? '56, 189, 248' : '251, 113, 133';
      ctx.fillStyle = `rgba(${pColor}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(dx, dy, d.size, 0, Math.PI * 2);
      ctx.fill();
    }

    const isActive = (dim: EntityDimension): boolean => dim === 'BOTH' || dim === activeDim;
    const isGhost = (dim: EntityDimension): boolean => dim !== 'BOTH' && dim !== activeDim;

    // --- Platforms ---
    for (const p of platforms) {
      this.drawEntity(p, isActive, isGhost, activeDim, 'platform');
    }

    // --- Moving Platforms ---
    for (const mp of movingPlatforms) {
      this.drawEntity(mp, isActive, isGhost, activeDim, 'movingPlatform');
    }

    // --- Walls ---
    for (const w of walls) {
      this.drawEntity(w, isActive, isGhost, activeDim, 'wall');
    }

    // --- Bounce Pads ---
    for (const bp of bouncePads) {
      if (isActive(bp.dimension)) {
        const color = activeDim === 'BLUE' ? this.blueColor : this.redColor;
        this.drawDetailedBouncePad(ctx, bp.x, bp.y, bp.w, bp.h, true, color);
      } else if (isGhost(bp.dimension)) {
        const ghostBase = bp.dimension === 'BLUE' ? '56, 189, 248' : '251, 113, 133';
        ctx.fillStyle = `rgba(${ghostBase}, 0.06)`;
        this.drawRoundedRect(ctx, bp.x, bp.y, bp.w, bp.h, 4);
        ctx.fill();
        ctx.strokeStyle = `rgba(${ghostBase}, 0.2)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        this.drawRoundedRect(ctx, bp.x, bp.y, bp.w, bp.h, 4);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // --- Dimension Orbs ---
    for (const orb of orbs) {
      if (orb.active && isActive(orb.dimension)) {
        this.drawDetailedOrb(ctx, orb.x, orb.y, orb.w, orb.h, true, orb.dimension);
      } else if (orb.active && isGhost(orb.dimension)) {
        const ghostBase = orb.dimension === 'BLUE' ? '56, 189, 248' : '251, 113, 133';
        ctx.strokeStyle = `rgba(${ghostBase}, 0.2)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(orb.x + orb.w / 2, orb.y + orb.h / 2, orb.w / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // --- Spikes ---
    for (const s of spikes) {
      if (isActive(s.dimension)) {
        this.drawDetailedSpikes(ctx, s.x, s.y, s.w, s.h, true);
      } else if (isGhost(s.dimension)) {
        const ghostBase = '251, 113, 133';
        ctx.fillStyle = `rgba(${ghostBase}, 0.06)`;
        this.drawRoundedRect(ctx, s.x, s.y, s.w, s.h, 4);
        ctx.fill();
        ctx.strokeStyle = `rgba(${ghostBase}, 0.2)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        this.drawRoundedRect(ctx, s.x, s.y, s.w, s.h, 4);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // --- Checkpoints ---
    for (const cp of checkpoints) {
      const cpColor = cp.active ? '#00ff88' : '#888888';
      ctx.shadowColor = cpColor;
      ctx.shadowBlur = cp.active ? 6 : 2;
      ctx.strokeStyle = cpColor;
      ctx.lineWidth = 2;
      // Draw flag pole
      ctx.beginPath();
      ctx.moveTo(cp.config.x + cp.config.w / 2, cp.config.y);
      ctx.lineTo(cp.config.x + cp.config.w / 2, cp.config.y - 30);
      ctx.stroke();
      // Draw flag
      if (cp.active) {
        ctx.fillStyle = cpColor;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(cp.config.x + cp.config.w / 2, cp.config.y - 30);
        ctx.lineTo(cp.config.x + cp.config.w / 2 + 15, cp.config.y - 22);
        ctx.lineTo(cp.config.x + cp.config.w / 2, cp.config.y - 14);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      // Base
      ctx.fillStyle = cpColor;
      ctx.globalAlpha = 0.3;
      ctx.fillRect(cp.config.x, cp.config.y, cp.config.w, cp.config.h);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // --- Laser Beams ---
    for (const laser of lasers) {
      const cfg = laser.config;
      this.drawDetailedLaser(ctx, cfg.x1, cfg.y1, cfg.x2, cfg.y2, laser.phase, activeDim === 'BLUE' ? this.blueColor : this.redColor);
    }

    // --- Turrets ---
    for (const turret of turrets) {
      const cfg = turret.config;
      const tColor = activeDim === 'BLUE' ? this.blueColor : this.redColor;
      this.drawDetailedTurret(ctx, cfg.x, cfg.y, cfg.w, cfg.h, cfg.fireDirection.x, cfg.fireDirection.y, tColor, false);
    }

    // --- Projectiles ---
    for (const proj of projectiles) {
      if (!proj.alive) continue;
      const projColor = proj.dimension === 'BLUE' ? this.blueColor : this.redColor;
      ctx.shadowColor = projColor;
      ctx.shadowBlur = 5;
      ctx.fillStyle = projColor;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(proj.x + proj.w / 2, proj.y + proj.h / 2, proj.w / 2, 0, Math.PI * 2);
      ctx.fill();
      // Inner core
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(proj.x + proj.w / 2, proj.y + proj.h / 2, proj.w / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // --- Gravity Zones ---
    const gzTime = Date.now() * 0.001;
    for (const gz of gravityZones) {
      const gzActive = gz.dimension === 'BOTH' || gz.dimension === activeDim;
      const gzColor = activeDim === 'BLUE' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(251, 113, 133, 0.08)';
      const gzBorder = gzActive ? (activeDim === 'BLUE' ? this.blueColor : this.redColor) : 'rgba(100,100,100,0.15)';
      ctx.fillStyle = gzColor;
      ctx.globalAlpha = gzActive ? 0.6 : 0.2;
      ctx.fillRect(gz.x, gz.y, gz.w, gz.h);
      ctx.strokeStyle = gzBorder;
      ctx.lineWidth = gzActive ? 2 : 1;
      ctx.globalAlpha = gzActive ? 0.5 : 0.15;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(gz.x, gz.y, gz.w, gz.h);
      ctx.setLineDash([]);
      // Animated arrows
      if (gzActive) {
        ctx.fillStyle = gzBorder;
        ctx.globalAlpha = 0.4 + Math.sin(gzTime * 3) * 0.2;
        const arrowCount = Math.max(1, Math.floor(gz.w / 40));
        for (let a = 0; a < arrowCount; a++) {
          const ax = gz.x + (gz.w / (arrowCount + 1)) * (a + 1);
          const ay = gz.y + gz.h / 2 + Math.sin(gzTime * 4 + a) * 8;
          // Arrow pointing up (inverted gravity)
          ctx.beginPath();
          ctx.moveTo(ax, ay - 6);
          ctx.lineTo(ax - 4, ay + 2);
          ctx.lineTo(ax + 4, ay + 2);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // --- Fragile Blocks ---
    for (const fb of fragileBlocks) {
      if (fb.state === 'broken') continue;
      const fbActive = fb.dimension === 'BOTH' || fb.dimension === activeDim;
      const fbColor = fbActive
        ? (activeDim === 'BLUE' ? 'rgba(56, 189, 248, 0.6)' : 'rgba(251, 113, 133, 0.6)')
        : 'rgba(100, 100, 100, 0.2)';
      const fbBorder = fbActive
        ? (activeDim === 'BLUE' ? this.blueColor : this.redColor)
        : 'rgba(100, 100, 100, 0.3)';

      if (fb.state === 'regenerating') {
        ctx.globalAlpha = 1 - fb.timer / 0.5; // fade in
      } else if (fb.state === 'shaking') {
        // Shake offset
        const shakeX = (Math.random() - 0.5) * 3;
        const shakeY = (Math.random() - 0.5) * 3;
        ctx.save();
        ctx.translate(shakeX, shakeY);
        ctx.globalAlpha = 0.5 + (fb.timer / 0.6) * 0.5;
      } else {
        ctx.globalAlpha = fbActive ? 0.8 : 0.3;
      }

      ctx.fillStyle = fbColor;
      ctx.shadowColor = fbBorder;
      ctx.shadowBlur = fbActive ? 8 : 0;
      ctx.fillRect(fb.x, fb.y, fb.w, fb.h);
      // Crystal pattern
      ctx.strokeStyle = fbBorder;
      ctx.lineWidth = 1;
      ctx.globalAlpha = (ctx.globalAlpha || 1) * 0.5;
      ctx.beginPath();
      ctx.moveTo(fb.x, fb.y);
      ctx.lineTo(fb.x + fb.w, fb.y + fb.h);
      ctx.moveTo(fb.x + fb.w, fb.y);
      ctx.lineTo(fb.x, fb.y + fb.h);
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (fb.state === 'shaking') {
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    // --- Portal ---
    if (isActive(portal.dimension)) {
      const portalColor = activeDim === 'BLUE' ? this.blueColor : this.redColor;
      this.drawDetailedPortal(ctx, portal.x, portal.y, portal.w, portal.h, true, portalColor);
    } else if (isGhost(portal.dimension)) {
      const ghostBase = portal.dimension === 'BLUE' ? '56, 189, 248' : '251, 113, 133';
      ctx.fillStyle = `rgba(${ghostBase}, 0.06)`;
      this.drawRoundedRect(ctx, portal.x, portal.y, portal.w, portal.h, 6);
      ctx.fill();
      ctx.strokeStyle = `rgba(${ghostBase}, 0.2)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      this.drawRoundedRect(ctx, portal.x, portal.y, portal.w, portal.h, 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // --- Ghost Replay ---
    if (ghostFrame && playerAlive) {
      const gColor = ghostFrame.dimension === 'BLUE' ? 'rgba(56, 189, 248, 0.35)' : 'rgba(251, 113, 133, 0.35)';
      const gGlow = ghostFrame.dimension === 'BLUE' ? this.blueColor : this.redColor;
      ctx.shadowColor = gGlow;
      ctx.shadowBlur = 4;
      ctx.fillStyle = gColor;
      ctx.globalAlpha = 0.5;
      this.drawRoundedRect(ctx, ghostFrame.x, ghostFrame.y, playerW, playerH, 4);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // --- Player Trail ---
    for (const t of this.trail) {
      const alpha = t.life / 0.2;
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = t.color;
      ctx.fillRect(t.x, t.y, t.w, t.h);
    }
    ctx.globalAlpha = 1;


    // --- Player (Articulated Character) ---
    if (playerAlive) {
      const pColor = playerDim === 'BLUE' ? this.blueColor : this.redColor;
      const time = Date.now() * 0.001;

      // Update scarf physics
      this.updateScarf(playerX + playerW / 2, playerY + 6, playerVx, playerVy, pColor);

      ctx.save();
      // Apply squash & stretch around center
      const cx = playerX + playerW / 2;
      const cy = playerY + playerH / 2;
      ctx.translate(cx, cy);
      ctx.scale(scaleX, scaleY);
      ctx.translate(-cx, -cy);

      ctx.shadowColor = pColor;
      ctx.shadowBlur = 4;

      // Determine facing direction
      const facing = playerVx >= 0 ? 1 : -1;
      const absVx = Math.abs(playerVx);

      // Body tilt based on velocity
      let tilt = 0;
      if (playerGrounded && absVx > 10) {
        tilt = (playerVx / 280) * 0.15; // lean forward when running
      }

      // Leg animation phase
      const legPhase = playerGrounded && absVx > 20 ? (time * absVx * 0.05) : 0;
      const legSwing = playerGrounded ? Math.sin(legPhase) * 5 : 0;

      // === DRAW SCARF (behind body) ===
      this.drawScarf(ctx, pColor);

      // === DRAW LEGS ===
      const legY = playerY + playerH - 10;
      const legW = 4;
      const legH = 10;
      ctx.fillStyle = pColor;
      ctx.globalAlpha = 0.8;

      if (playerDashing) {
        // Dash: legs tucked back aerodynamically
        const dashAngle = facing * 0.3;
        // Left leg
        ctx.save();
        ctx.translate(playerX + 5, legY);
        ctx.rotate(dashAngle);
        ctx.fillRect(-legW / 2, 0, legW, legH);
        ctx.restore();
        // Right leg
        ctx.save();
        ctx.translate(playerX + playerW - 5, legY);
        ctx.rotate(dashAngle);
        ctx.fillRect(-legW / 2, 0, legW, legH);
        ctx.restore();
      } else if (!playerGrounded && !wallSliding) {
        // Air: legs slightly tucked
        ctx.fillRect(playerX + 3, legY + 2, legW, legH - 2);
        ctx.fillRect(playerX + playerW - 3 - legW, legY + 2, legW, legH - 2);
      } else if (wallSliding) {
        // Wall slide: legs pressed against wall
        const wallLegOffset = playerWallDir * 3;
        ctx.fillRect(playerX + 3 + wallLegOffset, legY, legW, legH);
        ctx.fillRect(playerX + playerW - 3 - legW + wallLegOffset, legY, legW, legH);
      } else {
        // Running: alternating legs
        ctx.fillRect(playerX + 3 + legSwing, legY, legW, legH);
        ctx.fillRect(playerX + playerW - 3 - legW - legSwing, legY, legW, legH);
      }
      ctx.globalAlpha = 1;

      // === DRAW BODY/TORSO ===
      const torsoX = playerX + 3;
      const torsoY = playerY + 10;
      const torsoW = playerW - 6;
      const torsoH = playerH - 18;

      ctx.save();
      ctx.translate(cx, torsoY + torsoH / 2);
      ctx.rotate(tilt);
      ctx.translate(-cx, -(torsoY + torsoH / 2));

      if (skin === 'classic') {
        ctx.fillStyle = pColor;
        ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = dashCharges > 0 ? 0.4 : 0.15;
        ctx.fillRect(torsoX + 2, torsoY + 2, torsoW - 4, torsoH - 4);
        ctx.globalAlpha = 1;
      } else if (skin === 'prisma') {
        ctx.strokeStyle = pColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(torsoX, torsoY, torsoW, torsoH);
        ctx.fillStyle = pColor;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(torsoX + 2, torsoY + 2, torsoW - 4, torsoH - 4);
        ctx.globalAlpha = 1;
      } else if (skin === 'glitch') {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(torsoX - 2, torsoY, torsoW, torsoH);
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(torsoX + 2, torsoY, torsoW, torsoH);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = pColor;
        ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      } else if (skin === 'fire') {
        ctx.fillStyle = pColor;
        ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
        ctx.shadowColor = '#ff8800';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ff8800';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(torsoX + 2, torsoY + 2, torsoW - 4, torsoH - 4);
        ctx.globalAlpha = 1;
        ctx.shadowColor = pColor;
        ctx.shadowBlur = 4;
      } else if (skin === 'aura') {
        ctx.fillStyle = pColor;
        ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.4;
        ctx.strokeRect(torsoX - 2, torsoY - 2, torsoW + 4, torsoH + 4);
        ctx.globalAlpha = 1;
      } else {
        ctx.fillStyle = pColor;
        ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
      }
      ctx.restore();

      // === DRAW ARMS ===
      ctx.fillStyle = pColor;
      ctx.globalAlpha = 0.7;
      const armY = torsoY + 2;
      const armW = 3;
      const armH = 8;

      if (wallSliding) {
        // Wall slide: arm extended toward wall
        const wallArmX = playerWallDir > 0 ? playerX + playerW : playerX - armW;
        ctx.fillRect(wallArmX, armY, armW, armH);
        ctx.fillStyle = pColor;
        ctx.globalAlpha = 0.7;
      } else if (playerDashing) {
        // Dash: arms back
        const dashArmOffset = -facing * 4;
        ctx.fillRect(playerX + 1 + dashArmOffset, armY, armW, armH);
        ctx.fillRect(playerX + playerW - 1 - armW + dashArmOffset, armY, armW, armH);
      } else {
        // Normal arms
        ctx.fillRect(playerX + 1, armY, armW, armH);
        ctx.fillRect(playerX + playerW - 1 - armW, armY, armW, armH);
      }
      ctx.globalAlpha = 1;

      // === DRAW HEAD (simple rounded, no helmet) ===
      const headX = playerX + 1;
      const headY = playerY;
      const headW = playerW - 2;
      const headH = 13;

      // Simple rounded head
      ctx.fillStyle = pColor;
      this.drawRoundedRect(ctx, headX, headY, headW, headH, 5);
      ctx.fill();

      // Expressive eyes (no visor)
      const eyeY = headY + 5;
      const eyeSize = 2.5;
      const eyeGap = 4;
      const eyeOffX = (playerVx / 280) * 1.5;

      if (wallSliding) {
        // Squint eyes when wall sliding
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.9;
        ctx.fillRect(cx - eyeGap / 2 + eyeOffX - 1.5, eyeY, 3, 1.5);
        ctx.fillRect(cx + eyeGap / 2 + eyeOffX - 1.5, eyeY, 3, 1.5);
      } else if (playerDashing) {
        // Wide determined eyes when dashing
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(cx - eyeGap / 2 + eyeOffX, eyeY + 1, eyeSize + 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + eyeGap / 2 + eyeOffX, eyeY + 1, eyeSize + 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - eyeGap / 2 + eyeOffX + facing, eyeY + 1, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + eyeGap / 2 + eyeOffX + facing, eyeY + 1, 1.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal expressive eyes
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.arc(cx - eyeGap / 2 + eyeOffX, eyeY + 1, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + eyeGap / 2 + eyeOffX, eyeY + 1, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        // Pupils that follow direction
        ctx.fillStyle = '#000000';
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.arc(cx - eyeGap / 2 + eyeOffX + facing * 0.8, eyeY + 1.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + eyeGap / 2 + eyeOffX + facing * 0.8, eyeY + 1.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // === DASH TRAIL (simple motion blur) ===
      if (playerDashing) {
        ctx.fillStyle = pColor;
        ctx.globalAlpha = 0.2;
        this.drawRoundedRect(ctx, playerX - facing * 8, playerY + 2, playerW, playerH - 4, 4);
        ctx.fill();
        ctx.globalAlpha = 0.1;
        this.drawRoundedRect(ctx, playerX - facing * 16, playerY + 4, playerW, playerH - 8, 4);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // --- Particles ---
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 3;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // ========================
    // HUD — Clean minimal cards
    // ========================
    const mins = Math.floor(timer / 60);
    const secs = Math.floor(timer % 60);
    const ms = Math.floor((timer % 1) * 100);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    const hudCardBg = 'rgba(15, 23, 42, 0.72)';
    const hudFont = '"Segoe UI", system-ui, sans-serif';

    // Left card: Level, Timer, Deaths
    const lx = 16;
    const ly = 16;
    const lw = 210;
    const lh = 80;
    ctx.fillStyle = hudCardBg;
    this.drawRoundedRect(ctx, lx, ly, lw, lh, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    this.drawRoundedRect(ctx, lx, ly, lw, lh, 10);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.font = `12px ${hudFont}`;
    ctx.fillText(`Nivel ${levelIndex + 1} — ${levelName}`, lx + 14, ly + 22);

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.9;
    ctx.font = `bold 18px ${hudFont}`;
    ctx.fillText(timeStr, lx + 14, ly + 48);

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.font = `11px ${hudFont}`;
    ctx.fillText(`Muertes: ${sessionDeaths}`, lx + 14, ly + 68);

    // Right card: Dimension, Dash, Mute
    const rx = W - 170;
    const ry = 16;
    const rw = 154;
    const rh = 64;
    ctx.fillStyle = hudCardBg;
    this.drawRoundedRect(ctx, rx, ry, rw, rh, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    this.drawRoundedRect(ctx, rx, ry, rw, rh, 10);
    ctx.stroke();

    // Dimension indicator
    const dimLabel = playerDim === 'BLUE' ? 'Azul' : 'Rojo';
    const dimColor = playerDim === 'BLUE' ? this.blueColor : this.redColor;
    ctx.fillStyle = dimColor;
    ctx.globalAlpha = 0.9;
    ctx.font = `bold 13px ${hudFont}`;
    ctx.textAlign = 'left';
    ctx.fillText(dimLabel, rx + 14, ry + 24);

    // Dim dot
    ctx.fillStyle = dimColor;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(rx + 14, ry + 38, 4, 0, Math.PI * 2);
    ctx.fill();

    // Dash indicator
    const dashLabel = dashCharges > 0 ? '⚡ Dash listo' : '○ Dash gastado';
    const dashColor = dashCharges > 0 ? this.goldColor : 'rgba(255,255,255,0.3)';
    ctx.fillStyle = dashColor;
    ctx.globalAlpha = dashCharges > 0 ? 0.85 : 0.5;
    ctx.font = `11px ${hudFont}`;
    ctx.fillText(dashLabel, rx + 26, ry + 42);

    // Mute icon
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = muted ? 0.9 : 0.5;
    ctx.font = `12px ${hudFont}`;
    ctx.fillText(muted ? '🔇 M' : '🔊 M', rx + rw - 10, ry + 24);

    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    // Controls hint
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.2;
    ctx.font = `11px ${hudFont}`;
    ctx.textAlign = 'center';
    ctx.fillText('A/D Mover  ·  W/ESPACIO Saltar  ·  SHIFT/K Cambiar Dim  ·  L/E Dash  ·  R Reiniciar  ·  ESC Pausa', W / 2, H - 15);
    ctx.textAlign = 'left';

    // Victory overlay with medals
    if (won) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = 'center';

      ctx.fillStyle = this.goldColor;
      ctx.shadowColor = this.goldColor;
      ctx.shadowBlur = 20;
      ctx.font = `bold 42px ${hudFont}`;
      ctx.fillText('¡NIVEL COMPLETADO!', W / 2, H / 2 - 80);
      ctx.shadowBlur = 0;

      // Time
      ctx.font = `bold 20px ${hudFont}`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Tiempo: ${timeStr}`, W / 2, H / 2 - 30);

      // Medal
      if (medal) {
        let medalColor: string;
        let medalEmoji: string;
        if (medal === 'GOLD') { medalColor = '#ffd700'; medalEmoji = '🥇'; }
        else if (medal === 'SILVER') { medalColor = '#c0c0c0'; medalEmoji = '🥈'; }
        else { medalColor = '#cd7f32'; medalEmoji = '🥉'; }

        ctx.fillStyle = medalColor;
        ctx.shadowColor = medalColor;
        ctx.shadowBlur = 15;
        ctx.font = `bold 26px ${hudFont}`;
        ctx.fillText(`${medalEmoji} ${medal} ${medalEmoji}`, W / 2, H / 2 + 10);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = `15px ${hudFont}`;
        ctx.fillText('Sin medalla', W / 2, H / 2 + 10);
      }

      // Time difference
      if (timeDifference < -0.005) {
        ctx.fillStyle = '#00ff88';
        ctx.font = `bold 17px ${hudFont}`;
        ctx.fillText(`-${Math.abs(timeDifference).toFixed(2)}s ¡NUEVO RÉCORD!`, W / 2, H / 2 + 45);
      } else if (timeDifference > 0.005) {
        ctx.fillStyle = '#ff8888';
        ctx.font = `15px ${hudFont}`;
        ctx.fillText(`+${timeDifference.toFixed(2)}s`, W / 2, H / 2 + 45);
      }

      ctx.font = `13px ${hudFont}`;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Presiona ENTER para continuar', W / 2, H / 2 + 80);
      ctx.textAlign = 'left';
    }

    // ========================
    // SHOCKWAVE RING (dimension shift effect)
    // ========================
    if (this.shockwaveTimer > 0) {
      const progress = 1 - this.shockwaveTimer / 0.5;
      const radius = progress * this.shockwaveMaxRadius;
      const alpha = (1 - progress) * 0.6;
      ctx.strokeStyle = this.shockwaveColor;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 3 * (1 - progress);
      ctx.shadowColor = this.shockwaveColor;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(playerX + playerW / 2, playerY + playerH / 2, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // ========================
    // SOFT VIGNETTE
    // ========================
    const vigGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.75);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.restore();
  }

  // ========================
  // MENU RENDER
  // ========================
  renderMenu(
    titleTime: number,
    menuCursor: number,
    menuCursorLerp: number,
    state: string,
    levelSelectCursor: number,
    levelSelectCursorLerp: number,
    levelNames: string[],
    levelStats: { unlocked: boolean; bestTime: number | null; deaths: number; medal?: Medal }[],
    pauseCursor: number,
    pauseCursorLerp: number,
    muted: boolean,
    skinsCursor: number = 0,
    skinsData: { skin: Skin; unlocked: boolean; selected: boolean }[] = [],
    levelSelectPage: number = 0,
    levelSelectPageLerp: number = 0,
    maxPages: number = 1,
    chapterName: string = '',
    transitionAlpha: number = 0,
    totalLevels: number = 0,
    totalGold: number = 0,
    totalSilver: number = 0,
    totalBronze: number = 0,
    totalDeaths: number = 0,
    equippedSkin: { id: string; name: string } | null = null,
    levelsData: any[] = [],
  ) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Night background with soft gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Mute icon
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = muted ? 0.9 : 0.5;
    ctx.font = '14px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(muted ? '🔇 M' : '🔊 M', W - 20, 30);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;

    if (state === 'MENU') {
      this.renderTitleScreen(ctx, W, H, titleTime, menuCursor, menuCursorLerp, totalGold, totalSilver, totalBronze, totalDeaths, totalLevels, equippedSkin);
    } else if (state === 'LEVEL_SELECT') {
      this.renderLevelSelect(ctx, W, H, levelSelectCursor, levelSelectCursorLerp, levelNames, levelStats, levelSelectPage, levelSelectPageLerp, maxPages, chapterName, levelsData);
    } else if (state === 'PAUSED') {
      this.renderPauseMenu(ctx, W, H, pauseCursor, pauseCursorLerp);
    } else if (state === 'VICTORY') {
      this.renderVictoryScreen(ctx, W, H, titleTime);
    } else if (state === 'SKINS') {
      this.renderSkinsMenu(ctx, W, H, skinsCursor, skinsData);
    }

    // Transition overlay
    if (transitionAlpha > 0) {
      this.renderTransitionOverlay(ctx, W, H, transitionAlpha);
    }
  }

  private renderTitleScreen(ctx: CanvasRenderingContext2D, W: number, H: number, titleTime: number, cursor: number, cursorLerp: number, totalGold: number, totalSilver: number, totalBronze: number, totalDeaths: number, totalLevels: number, equippedSkin: { id: string; name: string } | null) {
    // Accent colors
    const accentBlue = '#38bdf8';
    const accentCoral = '#fb7185';
    const accentGold = '#fbbf24';

    // ========================
    // LIVE BACKGROUND — Soft autonomous bot demo
    // ========================
    const demoPlatforms = [
      { x: 80, y: 520, w: 160, h: 16, dim: 'BLUE' as const },
      { x: 280, y: 460, w: 110, h: 16, dim: 'RED' as const },
      { x: 440, y: 400, w: 130, h: 16, dim: 'BLUE' as const },
      { x: 620, y: 460, w: 110, h: 16, dim: 'RED' as const },
      { x: 780, y: 520, w: 160, h: 16, dim: 'BOTH' as const },
      { x: 980, y: 440, w: 110, h: 16, dim: 'BLUE' as const },
      { x: 1130, y: 380, w: 120, h: 16, dim: 'RED' as const },
    ];

    // Soft floating particles in background
    for (let i = 0; i < 30; i++) {
      const px = (Math.sin(titleTime * 0.3 + i * 1.7) * 0.5 + 0.5) * W;
      const py = (Math.cos(titleTime * 0.2 + i * 1.1) * 0.5 + 0.5) * H;
      const pAlpha = 0.06 + Math.sin(titleTime * 0.5 + i) * 0.03;
      const pSize = 2 + Math.sin(titleTime + i * 0.5) * 1;
      ctx.fillStyle = `rgba(255, 255, 255, ${pAlpha})`;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft geometric shapes
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 4; i++) {
      const sx = 200 + i * 280 + Math.sin(titleTime * 0.15 + i * 2) * 40;
      const sy = 150 + Math.cos(titleTime * 0.1 + i * 1.5) * 80;
      const sR = 40 + i * 15;
      ctx.strokeStyle = i % 2 === 0 ? accentBlue : accentCoral;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, sR, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Draw demo platforms (soft rounded)
    for (const dp of demoPlatforms) {
      const c = dp.dim === 'BLUE' ? 'rgba(56, 189, 248, 0.1)' : dp.dim === 'RED' ? 'rgba(251, 113, 133, 0.1)' : 'rgba(255, 255, 255, 0.06)';
      ctx.fillStyle = c;
      this.drawRoundedRect(ctx, dp.x, dp.y, dp.w, dp.h, 4);
      ctx.fill();
    }

    // Simulated bot — autonomous platformer
    const bot = this.updateDemoBot(titleTime, demoPlatforms, W, H);
    const botDimColor = bot.dim === 'BLUE' ? accentBlue : accentCoral;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.shadowColor = botDimColor;
    ctx.shadowBlur = 8;
    this.drawRoundedRect(ctx, bot.x, bot.y, 16, 24, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ========================
    // TITLE — Clean & crisp
    // ========================
    ctx.textAlign = 'center';
    const titleY = H / 2 - 100;

    // "SWAP" in white
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 72px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('SWAP', W / 2 - 130, titleY);

    // "//" with bicolour accent
    ctx.shadowBlur = 10;
    const slashPulse = Math.sin(titleTime * 2) * 0.3 + 0.7;
    ctx.fillStyle = accentBlue;
    ctx.globalAlpha = slashPulse;
    ctx.font = 'bold 56px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('/', W / 2 - 15, titleY);
    ctx.fillStyle = accentCoral;
    ctx.globalAlpha = 1 - slashPulse * 0.5;
    ctx.fillText('/', W / 2 + 10, titleY);
    ctx.globalAlpha = 1;

    // "SHIFT" in white
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.font = 'bold 72px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('SHIFT', W / 2 + 130, titleY);
    ctx.shadowBlur = 0;

    // Subtitle
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    ctx.font = '14px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Plataformas de cambio dimensional', W / 2, titleY + 35);
    ctx.globalAlpha = 1;

    // ========================
    // PROGRESS CARD — Top right (compact & clean)
    // ========================
    const cardX = W - 220;
    const cardY = 40;
    const cardW = 200;
    const cardH = 110;
    const cardR = 12;

    // Card background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 12;
    this.drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardR);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Progress
    const completedLevels = totalLevels > 0 ? Math.min(totalLevels, 24) : 0;
    const progressPct = totalLevels > 0 ? Math.round((completedLevels / Math.max(totalLevels, 1)) * 100) : 0;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(`Progreso: ${progressPct}%`, cardX + 14, cardY + 24);

    // Progress bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.drawRoundedRect(ctx, cardX + 14, cardY + 32, cardW - 28, 6, 3);
    ctx.fill();
    ctx.fillStyle = accentBlue;
    this.drawRoundedRect(ctx, cardX + 14, cardY + 32, (cardW - 28) * (progressPct / 100), 6, 3);
    ctx.fill();

    // Medals
    ctx.fillStyle = accentGold;
    ctx.globalAlpha = 0.8;
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(`★ ${totalGold}  ☆ ${totalSilver}  ○ ${totalBronze}`, cardX + 14, cardY + 56);

    // Deaths
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.fillText(`Muertes: ${totalDeaths}`, cardX + 14, cardY + 74);

    // Equipped skin
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.4;
    ctx.font = '10px "Segoe UI", system-ui, sans-serif';
    ctx.fillText(`Aspecto: ${equippedSkin ? equippedSkin.name : 'Clásico'}`, cardX + 14, cardY + 94);
    ctx.globalAlpha = 1;

    // Mini player preview
    const previewX = cardX + cardW - 30;
    const previewY = cardY + 40;
    const previewColor = bot.dim === 'BLUE' ? accentBlue : accentCoral;
    ctx.shadowColor = previewColor;
    ctx.shadowBlur = 6;
    ctx.fillStyle = previewColor;
    ctx.globalAlpha = 0.7;
    this.drawRoundedRect(ctx, previewX, previewY, 12, 20, 3);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // ========================
    // MENU OPTIONS — Rounded buttons with scale lerp
    // ========================
    const options = ['Jugar', 'Niveles', 'Aspectos', 'Editor', 'Reiniciar Progreso'];
    const menuStartX = W / 2 - 150;
    const menuStartY = H / 2 + 10;
    const optW = 300;
    const optH = 48;
    const optSpacing = 10;

    for (let i = 0; i < options.length; i++) {
      const y = menuStartY + i * (optH + optSpacing);
      const isSelected = i === cursor;

      const lerpScale = isSelected ? 1.04 : 1.0;
      const s = 1 + (lerpScale - 1) * Math.max(0, 1 - Math.abs(cursorLerp - i));
      const dw = (s - 1) * optW;
      const dh = (s - 1) * optH;

      const ox = menuStartX - dw / 2;
      const oy = y - dh / 2;
      const ow = optW + dw;
      const oh = optH + dh;

      // Button background
      if (isSelected) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.strokeStyle = accentBlue;
        ctx.lineWidth = 2;
        ctx.shadowColor = accentBlue;
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }

      this.drawRoundedRect(ctx, ox, oy, ow, oh, 12);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Left indicator bar
      if (isSelected) {
        const barGrad = ctx.createLinearGradient(ox + 6, oy + 8, ox + 6, oy + oh - 8);
        barGrad.addColorStop(0, accentBlue);
        barGrad.addColorStop(1, accentCoral);
        ctx.fillStyle = barGrad;
        this.drawRoundedRect(ctx, ox + 6, oy + 8, 4, oh - 16, 2);
        ctx.fill();
      }

      // Text
      ctx.textAlign = 'left';
      if (isSelected) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 17px "Segoe UI", system-ui, sans-serif';
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.55;
        ctx.font = '16px "Segoe UI", system-ui, sans-serif';
      }
      ctx.fillText(options[i], ox + 22, oy + oh / 2 + 6);
      ctx.globalAlpha = 1;
    }

    // Controls hint
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.2;
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('↑↓ Navegar  ·  Enter/Clic Seleccionar  ·  M Silenciar', W / 2, H - 25);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  private renderLevelSelect(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    cursor: number,
    cursorLerp: number,
    levelNames: string[],
    stats: { unlocked: boolean; bestTime: number | null; deaths: number; medal?: Medal }[],
    page: number = 0,
    pageLerp: number = 0,
    maxPages: number = 1,
    _chapterName: string = '',
    levelsData: any[] = []
  ) {
    const accentBlue = '#38bdf8';
    const accentGold = '#fbbf24';

    // Chapter accent colors (soft)
    const chapterColors = [
      { accent: '#38bdf8', bg: 'rgba(56, 189, 248, 0.04)' },
      { accent: '#a78bfa', bg: 'rgba(167, 139, 250, 0.04)' },
      { accent: '#fb923c', bg: 'rgba(251, 146, 60, 0.04)' },
      { accent: '#fb7185', bg: 'rgba(251, 113, 133, 0.04)' },
    ];
    const ch = chapterColors[page % chapterColors.length];

    // Chapter accent background tint
    ctx.fillStyle = ch.bg;
    ctx.fillRect(0, 0, W, H);

    // ========================
    // CHAPTER TABS — Clean pills
    // ========================
    const tabW = 180;
    const tabH = 40;
    const tabStartX = (W - (Math.min(maxPages, 4) * (tabW + 12) - 12)) / 2;
    const tabY = 24;
    const chapterNames = ['Capítulo 1', 'Capítulo 2', 'Capítulo 3', 'Capítulo 4'];

    for (let p = 0; p < Math.min(maxPages, 4); p++) {
      const tx = tabStartX + p * (tabW + 12);
      const isActive = p === page;

      // Tab background
      ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)';
      this.drawRoundedRect(ctx, tx, tabY, tabW, tabH, 10);
      ctx.fill();

      // Active underline bar (animated slide)
      if (isActive) {
        const barW = 40 + (pageLerp - p) * 0;
        const barX = tx + (tabW - barW) / 2;
        ctx.fillStyle = ch.accent;
        this.drawRoundedRect(ctx, barX, tabY + tabH - 3, barW, 3, 1.5);
        ctx.fill();
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
      ctx.font = isActive ? 'bold 13px "Segoe UI", system-ui, sans-serif' : '12px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(chapterNames[p], tx + tabW / 2, tabY + tabH / 2 + 5);
    }

    // ========================
    // LEVEL CARDS — Clean 5x2 grid
    // ========================
    const pageStart = page * 10;
    const pageEnd = Math.min(pageStart + 10, levelNames.length);

    const cardW = 180;
    const cardH = 90;
    const cardGapX = 20;
    const cardGapY = 16;
    const cols = 5;
    const gridTotalW = cols * cardW + (cols - 1) * cardGapX;
    const gridStartX = (W - gridTotalW) / 2;
    const gridStartY = 80;

    for (let i = pageStart; i < pageEnd; i++) {
      const localIndex = i - pageStart;
      const col = localIndex % cols;
      const row = Math.floor(localIndex / cols);

      const cx = gridStartX + col * (cardW + cardGapX);
      const cy = gridStartY + row * (cardH + cardGapY);

      const s = stats[i];
      const isSelected = i === cursor;
      const scale = isSelected ? 1.06 : 1.0;
      const sFactor = 1 + (scale - 1) * Math.max(0, 1 - Math.abs(cursorLerp - localIndex));
      const dw = (sFactor - 1) * cardW;
      const dh = (sFactor - 1) * cardH;

      const ox = cx - dw / 2;
      const oy = cy - dh / 2;
      const ow = cardW + dw;
      const oh = cardH + dh;

      // Card background
      if (s.unlocked) {
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.05)';
        ctx.strokeStyle = isSelected ? accentBlue : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = isSelected ? 2 : 1;
        if (isSelected) {
          ctx.shadowColor = accentBlue;
          ctx.shadowBlur = 15;
        }
      } else {
        ctx.fillStyle = 'rgba(30, 30, 50, 0.4)';
        ctx.strokeStyle = 'rgba(80, 80, 100, 0.2)';
        ctx.lineWidth = 1;
      }

      this.drawRoundedRect(ctx, ox, oy, ow, oh, 12);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Level number (large)
      ctx.textAlign = 'center';
      ctx.fillStyle = s.unlocked ? '#ffffff' : 'rgba(100, 100, 100, 0.4)';
      ctx.font = 'bold 28px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(String(i + 1), ox + ow / 2, oy + oh / 2 - 6);

      // Level name
      ctx.fillStyle = s.unlocked ? 'rgba(255, 255, 255, 0.6)' : 'rgba(100, 100, 100, 0.3)';
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(levelNames[i] || `Nivel ${i + 1}`, ox + ow / 2, oy + oh / 2 + 16);

      // Medal badge
      if (s.medal) {
        const medalColor = s.medal === 'GOLD' ? accentGold : s.medal === 'SILVER' ? '#c0c0c0' : '#cd7f32';
        const medalIcon = s.medal === 'GOLD' ? '★' : s.medal === 'SILVER' ? '☆' : '○';
        ctx.fillStyle = medalColor;
        ctx.globalAlpha = 0.9;
        ctx.font = '14px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(medalIcon, ox + ow - 18, oy + 18);
        ctx.globalAlpha = 1;
      }

      // Locked icon
      if (!s.unlocked) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.font = '16px "Segoe UI", system-ui, sans-serif';
        ctx.fillText('🔒', ox + ow / 2, oy + oh / 2 + 5);
      }
    }

    // ========================
    // DETAIL PANEL — Bottom
    // ========================
    if (cursor >= pageStart && cursor < pageEnd && stats[cursor]) {
      const s = stats[cursor];
      const panelW = 700;
      const panelH = 150;
      const panelX = W / 2 - panelW / 2;
      const panelY = H - panelH - 16;

      // Panel background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 12;
      this.drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 14);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Left — Level info
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`${cursor + 1}. ${levelNames[cursor] || 'Nivel ' + (cursor + 1)}`, panelX + 20, panelY + 26);

      // Difficulty
      const diff = Math.min(5, Math.ceil((cursor + 1) / 5));
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('Dificultad:', panelX + 20, panelY + 46);
      for (let d = 0; d < 5; d++) {
        ctx.fillStyle = d < diff ? ch.accent : 'rgba(255, 255, 255, 0.08)';
        this.drawRoundedRect(ctx, panelX + 100 + d * 18, panelY + 36, 14, 10, 3);
        ctx.fill();
      }

      // Best time
      if (s.bestTime !== null) {
        const mins = Math.floor(s.bestTime / 60);
        const secs = Math.floor(s.bestTime % 60);
        const ms = Math.floor((s.bestTime % 1) * 100);
        ctx.fillStyle = accentGold;
        ctx.font = '12px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(`Mejor: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(ms).padStart(2, '0')}`, panelX + 20, panelY + 66);
      }

      // Deaths
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`Muertes: ${s.deaths}`, panelX + 20, panelY + 86);

      // Medal
      if (s.medal) {
        const medalColor = s.medal === 'GOLD' ? accentGold : s.medal === 'SILVER' ? '#c0c0c0' : '#cd7f32';
        const medalIcon = s.medal === 'GOLD' ? '★' : s.medal === 'SILVER' ? '☆' : '○';
        ctx.fillStyle = medalColor;
        ctx.font = '13px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(`${medalIcon} ${s.medal === 'GOLD' ? 'Oro' : s.medal === 'SILVER' ? 'Plata' : 'Bronce'}`, panelX + 20, panelY + 106);
      }

      // Ghost
      ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(s.bestTime !== null ? '👻 Ghost disponible' : '', panelX + 20, panelY + 126);

      // Map type
      const levelData = levelsData[cursor];
      if (levelData) {
        const ww = levelData.worldWidth || 1280;
        const wh = levelData.worldHeight || 720;
        ctx.fillStyle = ch.accent;
        ctx.globalAlpha = 0.5;
        const mapLabel = wh > 1000 ? '⬆ Vertical' : ww > 2000 ? '➡ Horizontal' : '⬚ Único';
        ctx.fillText(mapLabel, panelX + 20, panelY + 140);
        ctx.globalAlpha = 1;
      }

      // Right — Mini map preview
      const mmX = panelX + 280;
      const mmY = panelY + 10;
      const mmW = 400;
      const mmH = 130;

      // Mini map background
      ctx.fillStyle = 'rgba(0, 20, 40, 0.4)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, mmX, mmY, mmW, mmH, 8);
      ctx.fill();
      ctx.stroke();

      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      for (let gx = mmX; gx < mmX + mmW; gx += 20) {
        ctx.beginPath(); ctx.moveTo(gx, mmY); ctx.lineTo(gx, mmY + mmH); ctx.stroke();
      }
      for (let gy = mmY; gy < mmY + mmH; gy += 20) {
        ctx.beginPath(); ctx.moveTo(mmX, gy); ctx.lineTo(mmX + mmW, gy); ctx.stroke();
      }

      // Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '9px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`MAPA // ${levelData ? (levelData.worldWidth || 1280) : 1280}×${levelData ? (levelData.worldHeight || 720) : 720}`, mmX + 8, mmY + 14);

      // Draw level blueprint
      if (levelData) {
        const ww = levelData.worldWidth || 1280;
        const wh = levelData.worldHeight || 720;
        const scale = Math.min((mmW - 16) / ww, (mmH - 16) / wh);
        const offX = mmX + 8 + (mmW - 16 - ww * scale) / 2;
        const offY = mmY + 16 + (mmH - 16 - wh * scale) / 2;

        const drawScaled = (x: number, y: number, w: number, h: number) => ({
          x: offX + x * scale, y: offY + y * scale, w: w * scale, h: h * scale
        });

        for (const p of (levelData.platforms || [])) {
          const r = drawScaled(p.x, p.y, p.w, p.h);
          ctx.fillStyle = p.dimension === 'BLUE' ? 'rgba(56, 189, 248, 0.5)' : p.dimension === 'RED' ? 'rgba(251, 113, 133, 0.5)' : 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        for (const sp of (levelData.spikes || [])) {
          const r = drawScaled(sp.x, sp.y, sp.w, sp.h);
          ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        for (const bp of (levelData.bouncePads || [])) {
          const r = drawScaled(bp.x, bp.y, bp.w, bp.h);
          ctx.fillStyle = 'rgba(0, 255, 136, 0.5)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        for (const o of (levelData.dimensionOrbs || [])) {
          const r = drawScaled(o.x, o.y, o.w, o.h);
          ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        for (const l of (levelData.lasers || [])) {
          const x1 = offX + l.x1 * scale, y1 = offY + l.y1 * scale;
          const x2 = offX + l.x2 * scale, y2 = offY + l.y2 * scale;
          ctx.strokeStyle = 'rgba(255, 0, 68, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
        for (const t of (levelData.turrets || [])) {
          const r = drawScaled(t.x, t.y, 16, 16);
          ctx.fillStyle = 'rgba(255, 170, 0, 0.5)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        for (const c of (levelData.checkpoints || [])) {
          const r = drawScaled(c.x, c.y, c.w, c.h);
          ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        for (const gz of (levelData.gravityZones || [])) {
          const r = drawScaled(gz.x, gz.y, gz.w, gz.h);
          ctx.fillStyle = 'rgba(180, 0, 255, 0.2)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        for (const fb of (levelData.fragileBlocks || [])) {
          const r = drawScaled(fb.x, fb.y, fb.w, fb.h);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        if (levelData.spawnX !== undefined) {
          const r = drawScaled(levelData.spawnX, levelData.spawnY, 20, 32);
          ctx.fillStyle = 'rgba(0, 255, 0, 0.6)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
        if (levelData.portal) {
          const r = drawScaled(levelData.portal.x, levelData.portal.y, levelData.portal.w, levelData.portal.h);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
      }

      ctx.globalAlpha = 1;
    }

    // Hint
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.2;
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('↑↓ Navegar  ·  Q/E Capítulo  ·  Enter Seleccionar  ·  Esc Volver', W / 2, H - 12);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  private renderPauseMenu(ctx: CanvasRenderingContext2D, W: number, H: number, cursor: number, cursorLerp: number) {
    const accentBlue = '#38bdf8';

    // Dim overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, W, H);

    // Floating centered window
    const panelW = 340;
    const panelH = 260;
    const panelX = W / 2 - panelW / 2;
    const panelY = H / 2 - panelH / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20;
    this.drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 16);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    // Title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Pausa', W / 2, panelY + 44);

    // Options
    const options = ['Continuar', 'Reiniciar Nivel', 'Menú Principal'];
    const optW = panelW - 40;
    const optH = 46;
    const optSpacing = 8;
    const startX = W / 2 - optW / 2;
    const startY = panelY + 70;

    for (let i = 0; i < options.length; i++) {
      const y = startY + i * (optH + optSpacing);
      const isSelected = i === cursor;
      const scale = isSelected ? 1.03 : 1.0;
      const s = 1 + (scale - 1) * Math.max(0, 1 - Math.abs(cursorLerp - i));
      const dw = (s - 1) * optW;
      const dh = (s - 1) * optH;

      const ox = startX - dw / 2;
      const oy = y - dh / 2;
      const ow = optW + dw;
      const oh = optH + dh;

      if (isSelected) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.strokeStyle = accentBlue;
        ctx.lineWidth = 2;
        ctx.shadowColor = accentBlue;
        ctx.shadowBlur = 10;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }

      this.drawRoundedRect(ctx, ox, oy, ow, oh, 10);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Left indicator
      if (isSelected) {
        ctx.fillStyle = accentBlue;
        this.drawRoundedRect(ctx, ox + 8, oy + 8, 4, oh - 16, 2);
        ctx.fill();
      }

      ctx.textAlign = 'left';
      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.55)';
      ctx.font = isSelected ? 'bold 16px "Segoe UI", system-ui, sans-serif' : '15px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(options[i], ox + 22, oy + oh / 2 + 5);
    }

    // Hint
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.2;
    ctx.font = '11px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('↑↓ Navegar  ·  Enter Seleccionar  ·  Esc/P Reanudar', W / 2, panelY + panelH - 14);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // ========================
  // HITBOXES — Interactive areas for mouse hover/click
  // ========================
  getMenuHitboxes(state: string, _menuCursor: number, _levelSelectCursor: number, levelSelectPage: number, _pauseCursor: number, _skinsCursor: number, skinsData: { skin: Skin; unlocked: boolean; selected: boolean }[], levelNames: string[]): Array<{ id: string; x: number; y: number; w: number; h: number; action: string }> {
    const W = this.canvas.width;
    const H = this.canvas.height;
    const hitboxes: Array<{ id: string; x: number; y: number; w: number; h: number; action: string }> = [];

    if (state === 'MENU') {
      const options = ['Jugar', 'Niveles', 'Aspectos', 'Editor', 'Reiniciar Progreso'];
      const menuStartX = W / 2 - 150;
      const menuStartY = H / 2 + 10;
      const optW = 300;
      const optH = 48;
      const optSpacing = 10;
      for (let i = 0; i < options.length; i++) {
        const y = menuStartY + i * (optH + optSpacing);
        hitboxes.push({ id: `menu_${i}`, x: menuStartX, y, w: optW, h: optH, action: `menu_select_${i}` });
      }
    } else if (state === 'LEVEL_SELECT') {
      // Chapter tabs
      const tabW = 180;
      const tabH = 40;
      const maxPages = Math.min(4, Math.ceil(levelNames.length / 10));
      const tabStartX = (W - (maxPages * (tabW + 12) - 12)) / 2;
      const tabY = 24;
      for (let p = 0; p < maxPages; p++) {
        const tx = tabStartX + p * (tabW + 12);
        hitboxes.push({ id: `tab_${p}`, x: tx, y: tabY, w: tabW, h: tabH, action: `tab_select_${p}` });
      }
      // Level cards — 5x2 grid
      const pageStart = levelSelectPage * 10;
      const cardW = 180;
      const cardH = 90;
      const cardGapX = 20;
      const cardGapY = 16;
      const cols = 5;
      const gridTotalW = cols * cardW + (cols - 1) * cardGapX;
      const gridStartX = (W - gridTotalW) / 2;
      const gridStartY = 80;
      for (let i = 0; i < 10; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = gridStartX + col * (cardW + cardGapX);
        const cy = gridStartY + row * (cardH + cardGapY);
        const levelIdx = pageStart + i;
        if (levelIdx < levelNames.length) {
          hitboxes.push({ id: `level_${levelIdx}`, x: cx, y: cy, w: cardW, h: cardH, action: `level_select_${levelIdx}` });
        }
      }
    } else if (state === 'PAUSED') {
      const panelW = 340;
      const panelH = 260;
      const panelY = H / 2 - panelH / 2;
      const optW = panelW - 40;
      const optH = 46;
      const optSpacing = 8;
      const startX = W / 2 - optW / 2;
      const startY = panelY + 70;
      for (let i = 0; i < 3; i++) {
        const y = startY + i * (optH + optSpacing);
        hitboxes.push({ id: `pause_${i}`, x: startX, y, w: optW, h: optH, action: `pause_select_${i}` });
      }
    } else if (state === 'SKINS') {
      // Skin cards — 3 columns
      const cols = 3;
      const cardW = 220;
      const cardH = 160;
      const gap = 18;
      const startX = (W - (cols * (cardW + gap) - gap)) / 2;
      const startY = 100;
      for (let i = 0; i < skinsData.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = startX + col * (cardW + gap);
        const cy = startY + row * (cardH + gap);
        hitboxes.push({ id: `skin_${i}`, x: cx, y: cy, w: cardW, h: cardH, action: `skin_select_${i}` });
      }
    } else if (state === 'LEVEL_COMPLETE') {
      hitboxes.push({ id: 'level_complete_continue', x: W / 2 - 150, y: H / 2 + 60, w: 300, h: 42, action: 'level_complete_continue' });
    } else if (state === 'VICTORY') {
      hitboxes.push({ id: 'victory_back', x: W / 2 - 150, y: H / 2 + 60, w: 300, h: 42, action: 'victory_back' });
    }

    return hitboxes;
  }

  // ========================
  // TRANSITION OVERLAY — Cybernetic curtain
  // ========================
  private renderTransitionOverlay(ctx: CanvasRenderingContext2D, W: number, H: number, alpha: number) {
    const panelCount = 6;
    const panelH = H / panelCount;

    for (let i = 0; i < panelCount; i++) {
      const panelY = i * panelH;
      const slideDir = i % 2 === 0 ? 1 : -1;
      const panelW = W * alpha * 0.6;
      const px = slideDir > 0 ? W - panelW : panelW * 0.3;

      ctx.fillStyle = `rgba(0, 240, 255, ${alpha * 0.08})`;
      ctx.fillRect(px, panelY, panelW, panelH - 1);

      ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.4})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(px, panelY, panelW, panelH - 1);
    }

    // Center flash
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.15})`;
    ctx.fillRect(0, 0, W, H);
  }

  private renderVictoryScreen(ctx: CanvasRenderingContext2D, W: number, H: number, titleTime: number) {
    const accentGold = '#fbbf24';
    const accentBlue = '#38bdf8';
    const accentCoral = '#fb7185';

    // Floating particles
    for (let i = 0; i < 25; i++) {
      const px = W / 2 + Math.sin(titleTime * 1.5 + i * 0.8) * (180 + i * 8);
      const py = H / 2 + Math.cos(titleTime * 1.2 + i * 0.6) * (100 + i * 6);
      const pAlpha = 0.08 + Math.sin(titleTime + i) * 0.04;
      const pSize = 2 + Math.sin(titleTime * 0.8 + i * 0.4) * 1;
      const colors = [accentBlue, accentCoral, accentGold, '#ffffff'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = pAlpha;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Floating centered window
    const panelW = 420;
    const panelH = 240;
    const panelX = W / 2 - panelW / 2;
    const panelY = H / 2 - panelH / 2;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 20;
    this.drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 16);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.stroke();

    ctx.textAlign = 'center';

    // Celebration title
    const pulse = Math.sin(titleTime * 3) * 0.3 + 0.7;
    ctx.shadowColor = accentGold;
    ctx.shadowBlur = 20 * pulse;
    ctx.fillStyle = accentGold;
    ctx.font = 'bold 40px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('¡Victoria!', W / 2, panelY + 55);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.7;
    ctx.font = '16px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Has completado todos los niveles', W / 2, panelY + 95);

    ctx.globalAlpha = 0.4;
    ctx.font = '13px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Enter o Esc para volver al menú', W / 2, panelY + 130);
    ctx.globalAlpha = 1;

    // Medal stars
    for (let i = 0; i < 3; i++) {
      const sx = W / 2 - 40 + i * 40;
      const sy = panelY + 170;
      ctx.fillStyle = accentGold;
      ctx.globalAlpha = 0.5 + Math.sin(titleTime * 2 + i) * 0.3;
      ctx.font = '20px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('★', sx, sy);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // ========================
  // SKINS MENU RENDER
  // ========================
  private renderSkinsMenu(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
    cursor: number,
    skinsData: { skin: Skin; unlocked: boolean; selected: boolean }[]
  ) {
    const accentBlue = '#38bdf8';
    const accentGold = '#fbbf24';

    ctx.textAlign = 'center';

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Aspectos', W / 2, 50);

    // Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '13px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('Personaliza la apariencia de tu personaje', W / 2, 74);

    // Grid of skins — 3 columns
    const cols = 3;
    const cellW = 220;
    const cellH = 160;
    const gap = 18;
    const startX = (W - (cols * (cellW + gap) - gap)) / 2;
    const startY = 100;

    for (let i = 0; i < skinsData.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cellW + gap);
      const y = startY + row * (cellH + gap);

      const { skin, unlocked, selected } = skinsData[i];
      const isSelected = i === cursor;
      const scale = isSelected ? 1.05 : 1.0;
      const s = 1 + (scale - 1) * Math.max(0, 1 - Math.abs(cursor - i));
      const dw = (s - 1) * cellW;
      const dh = (s - 1) * cellH;

      const ox = x - dw / 2;
      const oy = y - dh / 2;
      const ow = cellW + dw;
      const oh = cellH + dh;

      // Cell background
      if (unlocked) {
        ctx.fillStyle = selected ? 'rgba(56, 189, 248, 0.12)' : isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)';
        ctx.strokeStyle = selected ? accentBlue : isSelected ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = selected ? 2 : 1;
        if (isSelected) {
          ctx.shadowColor = accentBlue;
          ctx.shadowBlur = 12;
        }
      } else {
        ctx.fillStyle = 'rgba(30, 30, 50, 0.3)';
        ctx.strokeStyle = 'rgba(80, 80, 100, 0.2)';
        ctx.lineWidth = 1;
      }

      this.drawRoundedRect(ctx, ox, oy, ow, oh, 14);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.stroke();

      // Skin preview — larger character
      const previewX = ox + ow / 2 - 15;
      const previewY = oy + 20;
      const previewColor = accentBlue;

      if (unlocked) {
        ctx.shadowColor = previewColor;
        ctx.shadowBlur = 10;
        if (skin.id === 'classic') {
          ctx.fillStyle = previewColor;
          this.drawRoundedRect(ctx, previewX, previewY, 30, 48, 6);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.5;
          this.drawRoundedRect(ctx, previewX + 3, previewY + 3, 24, 42, 4);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (skin.id === 'prisma') {
          ctx.strokeStyle = previewColor;
          ctx.lineWidth = 3;
          this.drawRoundedRect(ctx, previewX, previewY, 30, 48, 6);
          ctx.stroke();
          ctx.fillStyle = previewColor;
          ctx.globalAlpha = 0.2;
          this.drawRoundedRect(ctx, previewX + 2, previewY + 2, 26, 44, 4);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (skin.id === 'glitch') {
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = '#ff00ff';
          this.drawRoundedRect(ctx, previewX - 2, previewY, 30, 48, 6);
          ctx.fill();
          ctx.fillStyle = '#00ffff';
          this.drawRoundedRect(ctx, previewX + 2, previewY, 30, 48, 6);
          ctx.fill();
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = previewColor;
          this.drawRoundedRect(ctx, previewX, previewY, 30, 48, 6);
          ctx.fill();
        } else if (skin.id === 'fire') {
          ctx.fillStyle = previewColor;
          this.drawRoundedRect(ctx, previewX, previewY, 30, 48, 6);
          ctx.fill();
          ctx.shadowColor = '#ff8800';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#ff8800';
          ctx.globalAlpha = 0.4;
          this.drawRoundedRect(ctx, previewX + 3, previewY + 3, 24, 42, 4);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else if (skin.id === 'aura') {
          ctx.fillStyle = previewColor;
          this.drawRoundedRect(ctx, previewX, previewY, 30, 48, 6);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.5;
          this.drawRoundedRect(ctx, previewX - 4, previewY - 4, 38, 56, 8);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        ctx.shadowBlur = 0;
      }

      // Skin name
      ctx.fillStyle = unlocked ? '#ffffff' : 'rgba(100, 100, 100, 0.5)';
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(skin.name, ox + ow / 2, oy + oh / 2 + 20);

      // Description
      ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.5)' : 'rgba(100,100,100,0.3)';
      ctx.font = '10px "Segoe UI", system-ui, sans-serif';
      const desc = skin.description.length > 35 ? skin.description.substring(0, 35) + '...' : skin.description;
      ctx.fillText(desc, ox + ow / 2, oy + oh / 2 + 38);

      // Unlock requirement
      if (!unlocked) {
        const req = skin.unlockRequirement;
        let reqText = '';
        if (req.gold > 0) reqText = `★ x${req.gold}`;
        else if (req.silver > 0) reqText = `☆ x${req.silver}`;
        else if (req.bronze > 0) reqText = `○ x${req.bronze}`;
        ctx.fillStyle = accentGold;
        ctx.globalAlpha = 0.5;
        ctx.font = '11px "Segoe UI", system-ui, sans-serif';
        ctx.fillText(reqText, ox + ow / 2, oy + oh - 20);
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
        ctx.font = '16px "Segoe UI", system-ui, sans-serif';
        ctx.fillText('🔒', ox + ow / 2, oy + oh - 38);
      } else if (selected) {
        ctx.fillStyle = accentBlue;
        ctx.font = 'bold 12px "Segoe UI", system-ui, sans-serif';
        ctx.fillText('✓ Equipado', ox + ow / 2, oy + oh - 18);
      }
    }

    // Hint
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.2;
    ctx.font = '12px "Segoe UI", system-ui, sans-serif';
    ctx.fillText('←/→ Navegar  ·  Enter Equipar  ·  Esc Volver', W / 2, H - 20);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  // Helper: draw entity based on type
  private drawEntity(
    entity: { x: number; y: number; w: number; h: number; dimension: EntityDimension },
    isActive: (dim: EntityDimension) => boolean,
    isGhost: (dim: EntityDimension) => boolean,
    activeDim: Dimension,
    type: 'platform' | 'movingPlatform' | 'wall'
  ) {
    const ctx = this.ctx;

    if (isActive(entity.dimension)) {
      const color = activeDim === 'BLUE' ? this.blueColor : this.redColor;

      if (type === 'wall') {
        // Clean rounded wall
        this.drawRoundedRect(ctx, entity.x, entity.y, entity.w, entity.h, 4);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      } else {
        // Platform — clean rounded rect
        const r = Math.min(6, entity.h / 2);
        this.drawRoundedRect(ctx, entity.x, entity.y, entity.w, entity.h, r);
        ctx.fillStyle = '#1e293b';
        ctx.fill();

        // Soft neon border
        ctx.shadowColor = color;
        ctx.shadowBlur = type === 'movingPlatform' ? 10 : 8;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Bright top edge highlight (3px)
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.25;
        this.drawRoundedRect(ctx, entity.x + 1, entity.y, entity.w - 2, 3, 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Moving platform indicator
        if (type === 'movingPlatform') {
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = 0.08;
          this.drawRoundedRect(ctx, entity.x + 2, entity.y + 2, entity.w - 4, entity.h - 4, Math.max(1, r - 1));
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    } else if (isGhost(entity.dimension)) {
      // Clean ghost outline — simple dashed rounded rect
      const ghostBase = entity.dimension === 'BLUE' ? '56, 189, 248' : '251, 113, 133';

      // Subtle fill
      ctx.fillStyle = `rgba(${ghostBase}, 0.06)`;
      this.drawRoundedRect(ctx, entity.x, entity.y, entity.w, entity.h, 6);
      ctx.fill();

      // Dashed outline
      ctx.strokeStyle = `rgba(${ghostBase}, 0.2)`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      this.drawRoundedRect(ctx, entity.x, entity.y, entity.w, entity.h, 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  clearParticles() {
    this.particles = [];
    this.trail = [];
    this.scarf = [];
  }

  // ========================
  // SCARF PHYSICS
  // ========================
  private updateScarf(anchorX: number, anchorY: number, vx: number, _vy: number, _color: string) {
    // Initialize scarf segments
    while (this.scarf.length < this.scarfLength) {
      this.scarf.push({ x: anchorX, y: anchorY, vx: 0, vy: 0 });
    }

    // First segment follows anchor point
    const s0 = this.scarf[0];
    s0.x += (anchorX - s0.x) * 0.8;
    s0.y += (anchorY - s0.y) * 0.8;

    // Verlet integration for remaining segments
    for (let i = 1; i < this.scarf.length; i++) {
      const s = this.scarf[i];
      const prevX = s.x;
      const prevY = s.y;
      s.x += (s.x - prevX) * 0.9 - vx * 0.02; // inertia + wind
      s.y += (s.y - prevY) * 0.9 + 2; // gravity
      s.x += vx * 0.01; // wind from player movement
    }

    // Constraint: maintain segment length
    for (let iter = 0; iter < 3; iter++) {
      for (let i = 0; i < this.scarf.length - 1; i++) {
        const a = this.scarf[i];
        const b = this.scarf[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const diff = (this.scarfSegLen - dist) / dist * 0.5;
          const ox = dx * diff;
          const oy = dy * diff;
          if (i > 0) {
            a.x -= ox;
            a.y -= oy;
          }
          b.x += ox;
          b.y += oy;
        }
      }
    }
  }

  private drawScarf(ctx: CanvasRenderingContext2D, color: string) {
    if (this.scarf.length < 2) return;

    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    for (let i = 0; i < this.scarf.length - 1; i++) {
      const a = this.scarf[i];
      const b = this.scarf[i + 1];
      const alpha = 1 - (i / this.scarf.length) * 0.6;
      const width = 4 * (1 - i / this.scarf.length * 0.5);

      ctx.strokeStyle = color;
      ctx.globalAlpha = alpha * 0.8;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // ========================
  // HELPER: Rounded Rectangle
  // ========================
  // ========================
  // CLEAN SPIKE DRAWING
  // ========================
  private drawDetailedSpikes(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, active: boolean) {
    const spikeCount = Math.max(1, Math.floor(w / 12));
    const spikeW = w / spikeCount;

    if (active) {
      for (let i = 0; i < spikeCount; i++) {
        const sx = x + i * spikeW;
        const cx = sx + spikeW / 2;

        // Clean triangle with soft metallic gradient
        const spikeGrad = ctx.createLinearGradient(cx, y, cx, y + h);
        spikeGrad.addColorStop(0, '#fb7185');
        spikeGrad.addColorStop(0.6, '#f97316');
        spikeGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = spikeGrad;
        ctx.beginPath();
        ctx.moveTo(sx + 1, y + h);
        ctx.lineTo(cx, y + 2);
        ctx.lineTo(sx + spikeW - 1, y + h);
        ctx.closePath();
        ctx.fill();

        // Soft inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(cx - 2, y + h - 3);
        ctx.lineTo(cx, y + 5);
        ctx.lineTo(cx + 2, y + h - 3);
        ctx.closePath();
        ctx.fill();
      }
      // Rounded base
      ctx.fillStyle = '#78350f';
      this.drawRoundedRect(ctx, x, y + h - 3, w, 3, 2);
      ctx.fill();
    }
  }

  // ========================
  // SIMPLE ORB DRAWING
  // ========================
  private drawDetailedOrb(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, active: boolean, dim: EntityDimension) {
    if (!active) return;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = w / 2;
    const time = Date.now() * 0.001;

    // Simple pulsing circle
    const pulse = Math.sin(time * 3) * 0.15 + 0.85;
    const orbColor = dim === 'BLUE' ? this.blueColor : dim === 'RED' ? this.redColor : '#ffffff';
    ctx.shadowColor = orbColor;
    ctx.shadowBlur = 6;
    ctx.fillStyle = orbColor;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // Soft inner highlight
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.3 * pulse;
    ctx.beginPath();
    ctx.arc(cx - r * 0.2, cy - r * 0.2, r * 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // ========================
  // SIMPLE BOUNCE PAD DRAWING
  // ========================
  private drawDetailedBouncePad(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, active: boolean, color: string) {
    if (!active) return;
    const time = Date.now() * 0.001;

    // Simple rounded pad with soft glow
    const pulse = Math.sin(time * 3) * 0.15 + 0.85;
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
    ctx.fillStyle = color;
    ctx.globalAlpha = pulse;
    this.drawRoundedRect(ctx, x, y + h - 6, w, 6, 3);
    ctx.fill();

    // Arrow indicator above
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.4 + Math.sin(time * 4) * 0.2;
    const arrowY = y - 6;
    ctx.beginPath();
    ctx.moveTo(x + w / 2, arrowY - 4);
    ctx.lineTo(x + w / 2 - 4, arrowY + 2);
    ctx.lineTo(x + w / 2 + 4, arrowY + 2);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // ========================
  // SIMPLE PORTAL DRAWING
  // ========================
  private drawDetailedPortal(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, active: boolean, color: string) {
    if (!active) return;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const time = Date.now() * 0.001;
    const pulse = Math.sin(time * 2) * 0.2 + 0.8;
    const r = Math.min(w, h) / 2;

    // Soft glowing circle
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Inner fill
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.globalAlpha = 0.3 * pulse;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // ========================
  // SIMPLE TURRET DRAWING
  // ========================
  private drawDetailedTurret(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, dirX: number, dirY: number, _color: string, _firing: boolean) {
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Simple rounded body
    ctx.fillStyle = '#475569';
    this.drawRoundedRect(ctx, x + 2, y + 2, w - 4, h - 4, 4);
    ctx.fill();

    // Direction indicator (simple arrow)
    const arrowLen = 10;
    ctx.fillStyle = _color;
    ctx.shadowColor = _color;
    ctx.shadowBlur = 4;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + dirX * arrowLen, cy + dirY * arrowLen);
    ctx.lineTo(cx - dirX * 3 + dirY * 4, cy - dirY * 3 - dirX * 4);
    ctx.lineTo(cx - dirX * 3 - dirY * 4, cy - dirY * 3 + dirX * 4);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  // ========================
  // SIMPLE LASER DRAWING
  // ========================
  private drawDetailedLaser(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, phase: string, _color: string) {
    const time = Date.now() * 0.001;

    // Endpoints (simple dots)
    ctx.fillStyle = phase === 'on' ? '#fb7185' : phase === 'warning' ? '#f97316' : '#475569';
    ctx.beginPath();
    ctx.arc(x1, y1, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x2, y2, 3, 0, Math.PI * 2);
    ctx.fill();

    if (phase === 'on') {
      // Active beam — clean line with soft glow
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.7;
      ctx.shadowColor = '#fb7185';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // White core
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (phase === 'warning') {
      // Warning — thin pulsing line
      const pulse = Math.sin(time * 10) * 0.3 + 0.5;
      ctx.strokeStyle = `rgba(249, 115, 22, ${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // Off - very faint line
      ctx.strokeStyle = 'rgba(251, 113, 133, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  // ========================
  // EDITOR RENDER
  // ========================
  renderEditor(
    entities: EditorEntity[],
    spawnX: number,
    spawnY: number,
    portalX: number,
    portalY: number,
    tool: EditorTool,
    dimension: EntityDimension,
    dimensionLabel: string,
    levelName: string,
    dragRect: { x: number; y: number; w: number; h: number } | null,
    muted: boolean
  ) {
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Grid
    const gridSize = 20;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, H);
      ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();
    }

    // Draw entities
    for (const e of entities) {
      this.drawEditorEntity(e, dimension);
    }

    // Draw spawn point
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(spawnX, spawnY, 20, 32);
    ctx.fillStyle = '#00ff00';
    ctx.globalAlpha = 0.3;
    ctx.fillRect(spawnX, spawnY, 20, 32);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ff00';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SPAWN', spawnX + 10, spawnY - 5);
    ctx.textAlign = 'left';

    // Draw portal
    const portalColor = this.blueColor;
    ctx.shadowColor = portalColor;
    ctx.shadowBlur = 15;
    ctx.strokeStyle = portalColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(portalX, portalY, 40, 60);
    ctx.fillStyle = portalColor;
    ctx.globalAlpha = 0.3;
    ctx.fillRect(portalX, portalY, 40, 60);
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.fillStyle = portalColor;
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('META', portalX + 20, portalY - 5);
    ctx.textAlign = 'left';

    // Draw drag rectangle
    if (dragRect) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(dragRect.x, dragRect.y, dragRect.w, dragRect.h);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(dragRect.x, dragRect.y, dragRect.w, dragRect.h);
    }

    // ========================
    // Editor Toolbar (top — 2 rows: tools + actions)
    // ========================
    const toolbarH = 80;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, 0, W, toolbarH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, toolbarH);
    ctx.lineTo(W, toolbarH);
    ctx.stroke();

    // --- Row 1: Tool buttons (y=8, h=30) ---
    const tools: { key: EditorTool; label: string; shortcut: string }[] = [
      { key: 'platform', label: 'Plataforma', shortcut: '1' },
      { key: 'spike', label: 'Pinchos', shortcut: '2' },
      { key: 'bouncePad', label: 'Muelle', shortcut: '3' },
      { key: 'dimensionOrb', label: 'Orbe', shortcut: '4' },
      { key: 'spawn', label: 'Spawn', shortcut: '5' },
      { key: 'goal', label: 'Meta', shortcut: '6' },
      { key: 'eraser', label: 'Borrador', shortcut: '7' },
      { key: 'checkpoint', label: 'Checkpoint', shortcut: '8' },
      { key: 'laser', label: 'Láser', shortcut: '9' },
      { key: 'turret', label: 'Torreta', shortcut: '0' },
      { key: 'gravityZone', label: 'Gravedad', shortcut: '-' },
      { key: 'fragileBlock', label: 'Frágil', shortcut: '=' },
    ];

    const toolH = 28;
    const toolGap = 5;
    const toolStartX = 10;
    const toolRowY = 8;

    let toolX = toolStartX;
    for (const t of tools) {
      const isActive = t.key === tool;
      const tw = ctx.measureText(t.label).width + 22;

      if (isActive) {
        ctx.fillStyle = this.blueColor;
        ctx.shadowColor = this.blueColor;
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.shadowBlur = 0;
      }

      this.drawRoundedRect(ctx, toolX, toolRowY, tw, toolH, 6);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = isActive ? '#000000' : '#ffffff';
      ctx.globalAlpha = isActive ? 1 : 0.7;
      ctx.font = `bold 11px "Segoe UI", system-ui, sans-serif`;
      ctx.fillText(`${t.shortcut} ${t.label}`, toolX + 8, toolRowY + 19);
      ctx.globalAlpha = 1;

      toolX += tw + toolGap;
    }

    // --- Row 2: Action buttons (y=44, h=30) ---
    const actionRowY = 44;
    const actionH = 30;
    const actionGap = 8;
    const actionStartX = 10;
    const actions: { label: string; shortcut: string }[] = [
      { label: `Dim: ${dimensionLabel}`, shortcut: '[Tab/C]' },
      { label: 'Probar', shortcut: '[P]' },
      { label: 'Exportar', shortcut: '[Ctrl+E]' },
      { label: 'Importar', shortcut: '[Ctrl+I]' },
      { label: 'Limpiar', shortcut: '' },
      { label: 'Salir', shortcut: '[ESC]' },
    ];

    let actX = actionStartX;
    for (const a of actions) {
      const text = a.shortcut ? `${a.label} ${a.shortcut}` : a.label;
      const aw = ctx.measureText(text).width + 24;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      this.drawRoundedRect(ctx, actX, actionRowY, aw, actionH, 6);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      this.drawRoundedRect(ctx, actX, actionRowY, aw, actionH, 6);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.7;
      ctx.font = `11px "Segoe UI", system-ui, sans-serif`;
      ctx.fillText(text, actX + 10, actionRowY + 20);
      ctx.globalAlpha = 1;

      actX += aw + actionGap;
    }

    // Level name (right-aligned, row 2)
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.6;
    ctx.font = `12px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(`Nivel: ${levelName}`, W - 140, actionRowY + 20);
    ctx.textAlign = 'left';

    // Mute icon (far right, row 2)
    ctx.textAlign = 'right';
    ctx.globalAlpha = muted ? 0.9 : 0.5;
    ctx.fillText(muted ? '🔇 M' : '🔊 M', W - 20, actionRowY + 20);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;

    // ========================
    // Editor Help (bottom — compact strip)
    // ========================
    const helpH = 26;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(0, H - helpH, W, helpH);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(0, H - helpH);
    ctx.lineTo(W, H - helpH);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.35;
    ctx.font = `11px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(
      'Clic Izq: Colocar  ·  Clic Der: Borrar  ·  1-0: Herramienta  ·  Tab/C: Dimensión  ·  P: Playtest  ·  Ctrl+E: Exportar  ·  Ctrl+I: Importar  ·  ESC: Menú',
      W / 2,
      H - 12
    );
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // ========================
  // DEMO BOT — Autonomous background character
  // ========================
  private demoBotX = 100;
  private demoBotY = 400;
  private demoBotVx = 0;
  private demoBotVy = 0;
  private demoBotDim: 'BLUE' | 'RED' = 'BLUE';
  private demoBotTimer = 0;
  private demoBotAction = 'move_right';
  private demoBotActionTimer = 0;

  private updateDemoBot(
    _titleTime: number,
    platforms: { x: number; y: number; w: number; h: number; dim: 'BLUE' | 'RED' | 'BOTH' }[],
    W: number,
    H: number
  ): { x: number; y: number; dim: 'BLUE' | 'RED' } {
    const dt = 1 / 60;
    this.demoBotTimer += dt;
    this.demoBotActionTimer += dt;

    // Simple AI: move, jump, shift dimension
    if (this.demoBotActionTimer > 1.5 + Math.random() * 2) {
      this.demoBotActionTimer = 0;
      const actions = ['move_right', 'move_left', 'jump', 'shift'];
      this.demoBotAction = actions[Math.floor(Math.random() * actions.length)];
    }

    // Apply actions
    if (this.demoBotAction === 'move_right') this.demoBotVx = 80;
    else if (this.demoBotAction === 'move_left') this.demoBotVx = -80;
    else if (this.demoBotAction === 'jump' && this.demoBotVy === 0) this.demoBotVy = -250;
    else if (this.demoBotAction === 'shift') {
      this.demoBotDim = this.demoBotDim === 'BLUE' ? 'RED' : 'BLUE';
    }

    // Gravity
    this.demoBotVy += 600 * dt;

    // Move
    this.demoBotX += this.demoBotVx * dt;
    this.demoBotY += this.demoBotVy * dt;

    // Platform collision
    let grounded = false;
    for (const p of platforms) {
      if (p.dim === 'BOTH' || p.dim === this.demoBotDim) {
        if (
          this.demoBotX + 16 > p.x && this.demoBotX < p.x + p.w &&
          this.demoBotY + 24 > p.y && this.demoBotY + 24 < p.y + p.h + 10 &&
          this.demoBotVy >= 0
        ) {
          this.demoBotY = p.y - 24;
          this.demoBotVy = 0;
          grounded = true;
        }
      }
    }

    // Wrap around
    if (this.demoBotX > W + 50) this.demoBotX = -50;
    if (this.demoBotX < -50) this.demoBotX = W + 50;
    if (this.demoBotY > H + 50) {
      this.demoBotY = 100;
      this.demoBotVy = 0;
    }

    // Dampen horizontal
    if (grounded) this.demoBotVx *= 0.95;

    return { x: this.demoBotX, y: this.demoBotY, dim: this.demoBotDim };
  }

  // ========================
  // HELPER: Rounded Rectangle
  // ========================
  private drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private drawEditorEntity(e: EditorEntity, _dimension: EntityDimension) {
    const ctx = this.ctx;

    // Color based on dimension
    let color: string;
    if (e.dimension === 'BLUE') color = this.blueColor;
    else if (e.dimension === 'RED') color = this.redColor;
    else color = '#ffffff';

    switch (e.type) {
      case 'platform':
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(e.x, e.y, e.w, e.h);
        break;

      case 'spike':
        ctx.fillStyle = '#ff4444';
        ctx.shadowColor = '#ff4444';
        ctx.shadowBlur = 4;
        const spikeCount = Math.max(1, Math.floor(e.w / 10));
        const spikeW = e.w / spikeCount;
        for (let i = 0; i < spikeCount; i++) {
          ctx.beginPath();
          ctx.moveTo(e.x + i * spikeW, e.y + e.h);
          ctx.lineTo(e.x + i * spikeW + spikeW / 2, e.y);
          ctx.lineTo(e.x + (i + 1) * spikeW, e.y + e.h);
          ctx.closePath();
          ctx.fill();
        }
        ctx.shadowBlur = 0;
        // Dimension indicator
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.strokeRect(e.x, e.y, e.w, e.h);
        ctx.globalAlpha = 1;
        break;

      case 'bouncePad':
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.moveTo(e.x + e.w / 2, e.y);
        ctx.lineTo(e.x + e.w, e.y + e.h);
        ctx.lineTo(e.x, e.y + e.h);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        break;

      case 'dimensionOrb':
        const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10 * pulse;
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.globalAlpha = pulse;
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y + e.h / 2, e.w / 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffff00';
        ctx.globalAlpha = 0.3 * pulse;
        ctx.beginPath();
        ctx.arc(e.x + e.w / 2, e.y + e.h / 2, e.w / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        break;

      case 'checkpoint':
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        // Flag pole
        ctx.beginPath();
        ctx.moveTo(e.x + e.w / 2, e.y + e.h);
        ctx.lineTo(e.x + e.w / 2, e.y - 15);
        ctx.stroke();
        // Flag
        ctx.fillStyle = '#00ff88';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(e.x + e.w / 2, e.y - 15);
        ctx.lineTo(e.x + e.w / 2 + 10, e.y - 8);
        ctx.lineTo(e.x + e.w / 2, e.y - 1);
        ctx.closePath();
        ctx.fill();
        // Base
        ctx.fillStyle = '#00ff88';
        ctx.globalAlpha = 0.3;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        break;

      case 'laser':
        const lx2 = (e as any).x2 || e.x + 200;
        const ly2 = (e as any).y2 || e.y;
        ctx.strokeStyle = 'rgba(255, 0, 68, 0.6)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ff0044';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(lx2, ly2);
        ctx.stroke();
        // Endpoints
        ctx.fillStyle = '#ff0044';
        ctx.fillRect(e.x - 3, e.y - 3, 6, 6);
        ctx.fillRect(lx2 - 3, ly2 - 3, 6, 6);
        ctx.shadowBlur = 0;
        break;

      case 'turret':
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        // Barrel direction
        const dirX = (e as any).fireDirX || 0;
        const dirY = (e as any).fireDirY || -1;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(e.x + e.w / 2, e.y + e.h / 2);
        ctx.lineTo(e.x + e.w / 2 + dirX * 15, e.y + e.h / 2 + dirY * 15);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        break;

      case 'gravityZone':
        ctx.fillStyle = 'rgba(180, 0, 255, 0.1)';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.strokeStyle = '#b400ff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(e.x, e.y, e.w, e.h);
        ctx.setLineDash([]);
        // Arrow indicators
        ctx.fillStyle = '#b400ff';
        ctx.globalAlpha = 0.5;
        const gzArrowCount = Math.max(1, Math.floor(e.w / 40));
        for (let a = 0; a < gzArrowCount; a++) {
          const ax = e.x + (e.w / (gzArrowCount + 1)) * (a + 1);
          const ay = e.y + e.h / 2;
          ctx.beginPath();
          ctx.moveTo(ax, ay - 6);
          ctx.lineTo(ax - 4, ay + 2);
          ctx.lineTo(ax + 4, ay + 2);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;

      case 'fragileBlock':
        ctx.shadowColor = color;
        ctx.shadowBlur = 4;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(e.x, e.y, e.w, e.h);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(e.x, e.y, e.w, e.h);
        // Crystal cross pattern
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x + e.w, e.y + e.h);
        ctx.moveTo(e.x + e.w, e.y);
        ctx.lineTo(e.x, e.y + e.h);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        break;
    }
  }
}

// Active hazards: Laser beams and Dimensional Turrets
import type { LaserBeam, Turret, LaserState, TurretState, Projectile, Dimension } from '../world/Level';

export class Hazards {
  private lasers: LaserState[] = [];
  private turrets: TurretState[] = [];

  constructor() {}

  // Initialize lasers from level config
  initLasers(configs: LaserBeam[]) {
    this.lasers = [];
    for (const cfg of configs) {
      this.lasers.push({
        config: cfg,
        phase: 'off',
        timer: cfg.cycleTime - cfg.onTime - (cfg.warnTime || 0.5), // start in off phase
      });
    }
  }

  // Initialize turrets from level config
  initTurrets(configs: Turret[]) {
    this.turrets = [];
    for (const cfg of configs) {
      this.turrets.push({
        config: cfg,
        fireTimer: cfg.fireInterval / 2, // stagger first shot
        projectiles: [],
      });
    }
  }

  // Reset all hazards
  reset() {
    this.lasers = [];
    this.turrets = [];
  }

  // Update lasers
  updateLasers(dt: number) {
    for (const laser of this.lasers) {
      const cfg = laser.config;
      const warnTime = cfg.warnTime || 0.5;
      const offTime = cfg.cycleTime - cfg.onTime - warnTime;

      laser.timer -= dt;

      if (laser.timer <= 0) {
        if (laser.phase === 'off') {
          laser.phase = 'warning';
          laser.timer = warnTime;
        } else if (laser.phase === 'warning') {
          laser.phase = 'on';
          laser.timer = cfg.onTime;
        } else {
          laser.phase = 'off';
          laser.timer = offTime;
        }
      }
    }
  }

  // Update turrets and projectiles
  updateTurrets(dt: number, worldBounds: { width: number; height: number }) {
    for (const turret of this.turrets) {
      turret.fireTimer -= dt;

      if (turret.fireTimer <= 0) {
        // Fire projectile
        const cfg = turret.config;
        const proj: Projectile = {
          x: cfg.x + cfg.w / 2 - 6,
          y: cfg.y + cfg.h / 2 - 6,
          w: 12,
          h: 12,
          vx: cfg.fireDirection.x * cfg.projectileSpeed,
          vy: cfg.fireDirection.y * cfg.projectileSpeed,
          dimension: cfg.projectileDimension,
          alive: true,
        };
        turret.projectiles.push(proj);
        turret.fireTimer = cfg.fireInterval;
      }

      // Update projectiles
      for (let i = turret.projectiles.length - 1; i >= 0; i--) {
        const p = turret.projectiles[i];
        if (!p.alive) {
          turret.projectiles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Remove if out of bounds
        if (p.x < -50 || p.x > worldBounds.width + 50 || p.y < -50 || p.y > worldBounds.height + 50) {
          p.alive = false;
          turret.projectiles.splice(i, 1);
        }
      }
    }
  }

  // Check if laser is solid in current dimension
  isLaserActive(laser: LaserState, playerDim: Dimension): boolean {
    if (laser.phase !== 'on') return false;
    const dim = laser.config.dimension;
    if (dim === 'BOTH') return true;
    return dim === playerDim;
  }

  // Get all active projectiles
  getAllProjectiles(): Projectile[] {
    const all: Projectile[] = [];
    for (const turret of this.turrets) {
      for (const p of turret.projectiles) {
        if (p.alive) all.push(p);
      }
    }
    return all;
  }

  // Get laser states for rendering
  getLasers(): LaserState[] {
    return this.lasers;
  }

  // Get turret states for rendering
  getTurrets(): TurretState[] {
    return this.turrets;
  }

  // Check if point is inside laser beam (line segment collision)
  isPointInLaser(px: number, py: number, laser: LaserState, playerDim: Dimension): boolean {
    if (!this.isLaserActive(laser, playerDim)) return false;
    const cfg = laser.config;
    // Check distance from point to line segment
    const dist = this.pointToSegmentDistance(px, py, cfg.x1, cfg.y1, cfg.x2, cfg.y2);
    return dist < 8; // laser width threshold
  }

  // Check if projectile hits player
  isProjectileHitPlayer(proj: Projectile, playerDim: Dimension, px: number, py: number, pw: number, ph: number): boolean {
    // Projectile only damages if same dimension
    if (proj.dimension !== playerDim) return false;
    // AABB check
    return px < proj.x + proj.w && px + pw > proj.x && py < proj.y + proj.h && py + ph > proj.y;
  }

  private pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;

    if (lenSq === 0) {
      // Point endpoint
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    return Math.sqrt((px - closestX) * (px - closestX) + (py - closestY) * (py - closestY));
  }
}

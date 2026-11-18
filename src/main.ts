import { Input } from './core/Input';
import { Audio } from './core/Audio';
import { Storage } from './core/Storage';
import { GhostSystem } from './core/GhostSystem';
import { Player } from './entities/Player';
import { Hazards } from './entities/Hazards';
import { Renderer } from './render/Renderer';
import { Camera } from './render/Camera';
import { MenuManager } from './ui/MenuManager';
import { LevelEditor } from './editor/LevelEditor';
import { levelsData } from './world/levelsData';
import type {
  LevelData, Dimension, EntityDimension,
  MovingPlatform, DimensionOrb, Medal, Checkpoint, GravityZone, FragileBlock
} from './world/Level';

// Constants
const CANVAS_W = 1280;
const CANVAS_H = 720;
const FIXED_DT = 1 / 60;
const MAX_ACCUMULATOR = 0.25;

// AABB collision check
function aabbOverlap(
  ax: number, ay: number, aw: number, ah: number,
  bx: number, by: number, bw: number, bh: number
): boolean {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Check if entity is solid in current dimension
function isSolid(dim: EntityDimension, activeDim: Dimension): boolean {
  if (dim === 'BOTH') return true;
  return dim === activeDim;
}

// Runtime state for moving platforms
interface MovingPlatformState {
  config: MovingPlatform;
  x: number;
  y: number;
  t: number; // 0..1 progress from start to end
  direction: number; // 1 = toward end, -1 = toward start
  waitTimer: number;
  dist: number; // total distance
}

// Runtime state for dimension orbs
interface OrbState {
  config: DimensionOrb;
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  cooldownTimer: number;
  dimension: EntityDimension;
}

// Runtime state for fragile blocks
interface FragileBlockState {
  config: FragileBlock;
  x: number;
  y: number;
  w: number;
  h: number;
  dimension: EntityDimension;
  state: 'intact' | 'shaking' | 'broken' | 'regenerating';
  timer: number; // shake timer, regen timer
}

class Game {
  private canvas: HTMLCanvasElement;
  private input: Input;
  private audio: Audio;
  private storage: Storage;
  private player: Player;
  private renderer: Renderer;
  private menu: MenuManager;

  private currentLevelIndex = 0;
  private level!: LevelData;
  private won = false;
  private wonTimer = 0;

  // Game loop
  private lastTime = 0;
  private accumulator = 0;

  // Timer & deaths
  private levelTimer = 0;
  private sessionDeaths = 0;

  // Track previous grounded state
  private wasGrounded = false;
  private prevWallSliding = false;
  private prevDashing = false; // Track dash state for hitstop detection

  // Moving platforms runtime
  private movingPlatforms: MovingPlatformState[] = [];

  // Orbs runtime
  private orbs: OrbState[] = [];

  // Trail timer
  private trailTimer = 0;

  // Ghost system
  private ghost = new GhostSystem();
  private ghostFrameCounter = 0;

  // Hitstop (freeze frames for impact feel)
  private hitstopTimer = 0;

  // Medal tracking
  private currentMedal: Medal = null;
  private timeDifference = 0; // negative = faster than best

  // Level Editor
  private editor = new LevelEditor();
  private editorPlaytestLevel: LevelData | null = null;

  // Camera
  private camera = new Camera(CANVAS_W, CANVAS_H);

  // Hazards
  private hazards = new Hazards();

  // Checkpoints
  private checkpoints: { config: Checkpoint; active: boolean }[] = [];
  private checkpointSpawnX = 0;
  private checkpointSpawnY = 0;
  private checkpointActivated = false;

  // Laser warning sound timer
  private laserWarningTimer = 0;

  // Gravity zones
  private gravityZones: GravityZone[] = [];

  // Fragile blocks runtime
  private fragileBlocks: FragileBlockState[] = [];

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.canvas.width = CANVAS_W;
    this.canvas.height = CANVAS_H;
    this.canvas.tabIndex = 0;
    this.canvas.focus();

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.input = new Input(this.canvas);
    this.audio = new Audio();
    this.storage = new Storage();
    this.player = new Player();
    this.renderer = new Renderer(this.canvas);
    this.menu = new MenuManager(this.storage, this.audio);
    this.ghost = new GhostSystem();

    // Set player skin from storage
    this.player.setSkin(this.storage.getSelectedSkin());

    // Editor mouse events
    this.setupEditorMouseEvents();

    // Load editor autosave
    this.editor.loadFromLocalStorage();

    // Start in menu
    this.loadLevel(0);

    // Unlock audio on first interaction
    const unlockAudio = () => {
      this.audio.playLand();
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
    };
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);

    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  private resizeCanvas() {
    const aspect = CANVAS_W / CANVAS_H;
    const windowAspect = window.innerWidth / window.innerHeight;
    let cssW: number, cssH: number;

    if (windowAspect > aspect) {
      cssH = window.innerHeight;
      cssW = cssH * aspect;
    } else {
      cssW = window.innerWidth;
      cssH = cssW / aspect;
    }

    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.canvas.style.display = 'block';
    this.canvas.style.margin = '0 auto';
    this.canvas.style.imageRendering = 'pixelated';
  }

  private initMovingPlatforms() {
    this.movingPlatforms = [];
    const configs = this.level.movingPlatforms || [];
    for (const cfg of configs) {
      const dx = cfg.endX - cfg.startX;
      const dy = cfg.endY - cfg.startY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.movingPlatforms.push({
        config: cfg,
        x: cfg.startX,
        y: cfg.startY,
        t: 0,
        direction: 1,
        waitTimer: 0,
        dist,
      });
    }
  }

  private initOrbs() {
    this.orbs = [];
    const configs = this.level.dimensionOrbs || [];
    for (const cfg of configs) {
      this.orbs.push({
        config: cfg,
        x: cfg.x,
        y: cfg.y,
        w: cfg.w,
        h: cfg.h,
        active: true,
        cooldownTimer: 0,
        dimension: cfg.dimension,
      });
    }
  }

  private initGravityZones() {
    this.gravityZones = this.level.gravityZones || [];
  }

  private initFragileBlocks() {
    this.fragileBlocks = [];
    const configs = this.level.fragileBlocks || [];
    for (const cfg of configs) {
      this.fragileBlocks.push({
        config: cfg,
        x: cfg.x,
        y: cfg.y,
        w: cfg.w,
        h: cfg.h,
        dimension: cfg.dimension,
        state: 'intact',
        timer: 0,
      });
    }
  }

  private loadLevel(index: number) {
    this.currentLevelIndex = index;
    // Special index -1 for editor playtest
    if (index === -1 && this.editorPlaytestLevel) {
      this.level = this.editorPlaytestLevel;
    } else {
      this.level = levelsData[index];
    }
    this.player.respawn(this.level.spawnX, this.level.spawnY);
    this.player.dimension = 'BLUE';
    this.won = false;
    this.wonTimer = 0;
    this.levelTimer = 0;
    this.sessionDeaths = 0;
    this.wasGrounded = false;
    this.prevWallSliding = false;
    this.prevDashing = false;
    this.trailTimer = 0;
    this.hitstopTimer = 0;
    this.currentMedal = null;
    this.timeDifference = 0;
    this.ghostFrameCounter = 0;
    this.renderer.clearParticles();
    this.laserWarningTimer = 0;
    this.initMovingPlatforms();
    this.initOrbs();
    this.initGravityZones();
    this.initFragileBlocks();

    // Initialize camera bounds
    const worldW = this.level.worldWidth || CANVAS_W;
    const worldH = this.level.worldHeight || CANVAS_H;
    this.camera.setBounds(worldW, worldH);
    this.camera.reset();

    // Initialize hazards
    this.hazards.reset();
    if (this.level.lasers) {
      this.hazards.initLasers(this.level.lasers);
    }
    if (this.level.turrets) {
      this.hazards.initTurrets(this.level.turrets);
    }

    // Initialize checkpoints
    this.checkpoints = [];
    this.checkpointSpawnX = this.level.spawnX;
    this.checkpointSpawnY = this.level.spawnY;
    this.checkpointActivated = false;
    if (this.level.checkpoints) {
      for (const cp of this.level.checkpoints) {
        this.checkpoints.push({ config: cp, active: false });
      }
    }

    // Load ghost from storage if available
    const savedGhost = this.storage.getGhost(index);
    if (savedGhost) {
      this.ghost.loadPlayback(savedGhost);
    } else {
      this.ghost.clearPlayback();
    }
  }

  private startGhostRecording() {
    this.ghost.startRecording();
    this.ghostFrameCounter = 0;
  }

  private loop(now: number) {
    let frameTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    if (frameTime > MAX_ACCUMULATOR) frameTime = MAX_ACCUMULATOR;
    this.accumulator += frameTime;

    // Hitstop — freeze physics but keep rendering
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= FIXED_DT;
      if (this.hitstopTimer < 0) this.hitstopTimer = 0;
      this.render();
      this.input.updateArr(FIXED_DT);
      this.input.endFrame();
      requestAnimationFrame((t) => this.loop(t));
      return;
    }

    while (this.accumulator >= FIXED_DT) {
      this.update(FIXED_DT);
      this.accumulator -= FIXED_DT;
    }

    this.render();
    this.input.updateArr(FIXED_DT);
    this.input.endFrame();

    requestAnimationFrame((t) => this.loop(t));
  }

  private triggerHitstop(duration: number) {
    this.hitstopTimer = duration;
  }

  private update(dt: number) {
    this.renderer.updateParticles(dt);

    // Toggle mute
    if (this.input.justPress('KeyM')) {
      this.audio.toggleMute();
    }

    // Update menu state
    this.menu.update(dt, this.input, levelsData.length);

    const state = this.menu.state;

    // Check for state transition from menu to PLAYING
    if (state === 'PLAYING') {
      // Was in menu/level select, now transitioning to playing
      // (level already loaded from menu selection)
    }

    if (state === 'MENU' || state === 'LEVEL_SELECT' || state === 'VICTORY') {
      // Stop music in menu
      this.audio.stopMusic();
      return;
    }

    if (state === 'SKINS') {
      this.audio.stopMusic();
      // Handle skin selection
      if (this.input.justPress('Enter') || this.input.justPress('NumpadEnter') || this.input.spaceJustPressed()) {
        const skins = this.storage.getAllSkins();
        const cursor = this.menu.getSkinsCursor();
        if (cursor < skins.length && skins[cursor].unlocked) {
          this.storage.setSelectedSkin(skins[cursor].skin.id);
          this.player.setSkin(skins[cursor].skin.id);
        }
      }
      return;
    }

    if (state === 'PAUSED') {
      // Stop music when paused
      this.audio.stopMusic();
      // Check pause action
      const action = this.menu.getPauseAction();
      if (action === 'RESTART') {
        this.loadLevel(this.currentLevelIndex);
        this.menu.state = 'PLAYING';
        this.audio.startMusic();
      } else if (action === 'MENU') {
        this.menu.state = 'MENU';
        this.audio.stopMusic();
        this.menu.update(0, this.input, levelsData.length);
      }
      // RESUME is handled by menu setting state back to PLAYING
      return;
    }

    // === PLAYING state ===

    // Start ghost recording when playing begins
    if (this.levelTimer === 0) {
      this.startGhostRecording();
      // Start music when entering playing state
      this.audio.startMusic();
    }

    // Update music dimension filter
    this.audio.setMusicDimension(this.player.dimension);

    // Level complete screen
    if (this.won) {
      this.wonTimer += dt;
      if (this.input.justPress('Enter') || this.input.justPress('NumpadEnter') || this.input.spaceJustPressed()) {
        if (this.currentLevelIndex < levelsData.length - 1) {
          this.loadLevel(this.currentLevelIndex + 1);
        } else {
          // All levels complete — victory!
          this.menu.state = 'VICTORY';
        }
      }
      if (this.input.restartJustPressed()) {
        this.loadLevel(this.currentLevelIndex);
      }
      return;
    }

    if (!this.player.isAlive) return;

    // Restart
    if (this.input.restartJustPressed()) {
      this.loadLevel(this.currentLevelIndex);
      return;
    }

    // Timer
    this.levelTimer += dt;

    // Ghost recording — every 2 frames
    this.ghostFrameCounter++;
    if (this.ghostFrameCounter % 2 === 0) {
      this.ghost.record(this.player.x, this.player.y, this.player.dimension, dt);
    }

    // Save wall sliding state
    this.prevWallSliding = this.player.wallSliding;

    // Dimension shift
    if (this.input.shiftJustPressed()) {
      const newDim = this.player.shiftDimension();
      this.renderer.spawnShiftParticles(
        this.player.x + this.player.width / 2,
        this.player.y + this.player.height / 2,
        newDim
      );
      this.renderer.triggerShockwave(newDim === 'BLUE' ? '#00f0ff' : '#ff2a55');
      this.renderer.addShake(4, 0.15);
      if (newDim === 'BLUE') {
        this.audio.playShiftBlue();
      } else {
        this.audio.playShiftRed();
      }
      this.checkDimensionShiftDeath();
      if (!this.player.isAlive) return;
    }

    // Update moving platforms
    this.updateMovingPlatforms(dt);

    // Update orbs
    this.updateOrbs(dt);

    // Update gravity zones
    this.updateGravityZones(dt);

    // Update fragile blocks
    this.updateFragileBlocks(dt);

    // Update hazards
    const worldWidth = this.level.worldWidth || CANVAS_W;
    const worldHeight = this.level.worldHeight || CANVAS_H;
    this.hazards.updateLasers(dt);
    this.hazards.updateTurrets(dt, { width: worldWidth, height: worldHeight });

    // Laser warning sound
    this.laserWarningTimer -= dt;
    if (this.laserWarningTimer <= 0) {
      for (const laser of this.hazards.getLasers()) {
        if (laser.phase === 'warning') {
          this.audio.playLaserWarning();
          this.laserWarningTimer = 0.3;
          break;
        }
      }
    }

    // Update player physics
    this.player.update(dt, this.input);

    // Dash hitstop — trigger on first frame of dash
    if (this.player.isDashing && !this.prevDashing) {
      this.triggerHitstop(0.04);
    }
    this.prevDashing = this.player.isDashing;

    // Collision detection
    this.handleCollisions();

    // Recharge dash on ground or wall slide
    if (this.player.wallSliding || (this.player.isAlive && this.player.getVelocity().vy === 0 && this.wasGrounded === false)) {
      // Wall slide recharge
      if (this.player.wallSliding) {
        this.player.rechargeDash();
      }
    }
    // Recharge dash on landing
    if (this.wasGrounded === false && this.player.isAlive) {
      const currentVel = this.player.getVelocity();
      if (currentVel.vy === 0) {
        this.player.rechargeDash();
        this.player.squashOnLand();
      }
    }

    // Check bounce pads
    this.checkBouncePads();

    // Recharge dash on bounce pad
    if (this.player.isAlive) {
      const vel = this.player.getVelocity();
      if (vel.vy < -400) {
        this.player.rechargeDash();
      }
    }

    // Check dimension orbs
    this.checkOrbs();

    // Recharge dash on orb touch
    // (handled in checkOrbs below)

    // Check spikes
    this.checkSpikes();

    // Check laser hazards
    this.checkLaserHazards();

    // Check turret projectiles
    this.checkTurretProjectiles();

    // Check checkpoints
    this.checkCheckpoints();

    // Check portal
    this.checkPortal();

    // Fall off screen (respect gravity direction)
    const fallCheckH = this.level.worldHeight || CANVAS_H;
    const fallCheckW = this.level.worldWidth || CANVAS_W;
    if (this.player.y > fallCheckH + 200 || this.player.y < -200 || this.player.x > fallCheckW + 200 || this.player.x < -200) {
      this.killPlayer();
    }

    // Update camera
    const camVel = this.player.getVelocity();
    this.camera.update(dt, this.player.x, this.player.y, camVel.vx, camVel.vy);

    // Trail — add when at high speed
    this.trailTimer += dt;
    const vel = this.player.getVelocity();
    const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);
    if (speed > 200 && this.trailTimer > 0.03) {
      this.renderer.addTrail(
        this.player.x, this.player.y,
        this.player.width, this.player.height,
        this.player.dimension
      );
      this.trailTimer = 0;
    }
  }

  private updateMovingPlatforms(dt: number) {
    for (const mp of this.movingPlatforms) {
      if (mp.waitTimer > 0) {
        mp.waitTimer -= dt;
        continue;
      }

      const speed = mp.config.speed;
      const step = (speed / mp.dist) * dt;

      mp.t += step * mp.direction;

      if (mp.t >= 1) {
        mp.t = 1;
        mp.direction = -1;
        mp.waitTimer = mp.config.waitTime || 0;
      } else if (mp.t <= 0) {
        mp.t = 0;
        mp.direction = 1;
        mp.waitTimer = mp.config.waitTime || 0;
      }

      const dx = mp.config.endX - mp.config.startX;
      const dy = mp.config.endY - mp.config.startY;
      mp.x = mp.config.startX + dx * mp.t;
      mp.y = mp.config.startY + dy * mp.t;
    }
  }

  private updateOrbs(dt: number) {
    for (const orb of this.orbs) {
      if (!orb.active) {
        orb.cooldownTimer -= dt;
        if (orb.cooldownTimer <= 0) {
          orb.active = true;
        }
      }
    }
  }

  private updateGravityZones(_dt: number) {
    if (!this.player.isAlive) return;
    const activeDim = this.player.dimension;
    const pb = this.player.getBounds();
    const px = pb.x + pb.w / 2;
    const py = pb.y + pb.h / 2;

    let inZone = false;
    for (const gz of this.gravityZones) {
      if (!isSolid(gz.dimension, activeDim)) continue;
      if (px >= gz.x && px <= gz.x + gz.w && py >= gz.y && py <= gz.y + gz.h) {
        inZone = true;
        break;
      }
    }

    const newDir = inZone ? -1 : 1;
    if (newDir !== this.player.gravityDir) {
      this.player.setGravityDir(newDir);
      this.audio.playGravityFlip();
      this.renderer.addShake(3, 0.15);
    }
  }

  private updateFragileBlocks(dt: number) {
    for (const fb of this.fragileBlocks) {
      switch (fb.state) {
        case 'shaking':
          fb.timer -= dt;
          if (fb.timer <= 0) {
            fb.state = 'broken';
            fb.timer = 2.5; // regen time
            this.audio.playFragileBreak();
            this.renderer.spawnParticles(
              fb.x + fb.w / 2, fb.y + fb.h / 2,
              12, '#ffffff', 120, 0.4, 3
            );
          }
          break;
        case 'broken':
          fb.timer -= dt;
          if (fb.timer <= 0) {
            fb.state = 'regenerating';
            fb.timer = 0.5; // fade in time
          }
          break;
        case 'regenerating':
          fb.timer -= dt;
          if (fb.timer <= 0) {
            fb.state = 'intact';
          }
          break;
      }
    }
  }

  private triggerFragileBlock(fb: FragileBlockState) {
    if (fb.state === 'intact') {
      fb.state = 'shaking';
      fb.timer = 0.6;
    }
  }

  private checkDimensionShiftDeath() {
    const pb = this.player.getBounds();
    const activeDim = this.player.dimension;
    const snapThreshold = 6; // pixels — small overlap is snapped out, larger kills

    // Collect all solids in the new dimension
    const solids: { x: number; y: number; w: number; h: number }[] = [];
    for (const p of this.level.platforms) {
      if (isSolid(p.dimension, activeDim)) solids.push(p);
    }
    for (const w of this.level.walls) {
      if (isSolid(w.dimension, activeDim)) solids.push(w);
    }
    for (const mp of this.movingPlatforms) {
      if (isSolid(mp.config.dimension, activeDim)) {
        solids.push({ x: mp.x, y: mp.y, w: mp.config.w, h: mp.config.h });
      }
    }
    // Fragile blocks (intact or shaking)
    for (const fb of this.fragileBlocks) {
      if ((fb.state === 'intact' || fb.state === 'shaking') && isSolid(fb.dimension, activeDim)) {
        solids.push({ x: fb.x, y: fb.y, w: fb.w, h: fb.h });
      }
    }

    for (const s of solids) {
      if (aabbOverlap(pb.x, pb.y, pb.w, pb.h, s.x, s.y, s.w, s.h)) {
        // Calculate overlap on each axis
        const overlapLeft = (pb.x + pb.w) - s.x;
        const overlapRight = (s.x + s.w) - pb.x;
        const overlapTop = (pb.y + pb.h) - s.y;
        const overlapBottom = (s.y + s.h) - pb.y;

        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        if (minOverlapX <= snapThreshold || minOverlapY <= snapThreshold) {
          // Snap the player out of the solid along the shortest axis
          if (minOverlapX < minOverlapY) {
            // Push horizontally
            if (overlapLeft < overlapRight) {
              this.player.x = s.x - pb.w;
            } else {
              this.player.x = s.x + s.w;
            }
          } else {
            // Push vertically
            if (overlapTop < overlapBottom) {
              this.player.y = s.y - pb.h;
            } else {
              this.player.y = s.y + s.h;
            }
          }
          // Don't kill — the player was snapped out safely
        } else {
          // Deep overlap — player is truly inside a solid block
          this.killPlayer();
          return;
        }
      }
    }
  }

  private handleCollisions() {
    const activeDim = this.player.dimension;
    let grounded = false;
    let wallSliding = false;
    let wallDir = 0;

    const pb = this.player.getBounds();
    const vel = this.player.getVelocity();

    // Collect all solid entities
    const solids: { x: number; y: number; w: number; h: number; fragile?: FragileBlockState }[] = [];
    for (const p of this.level.platforms) {
      if (isSolid(p.dimension, activeDim)) solids.push(p);
    }
    for (const w of this.level.walls) {
      if (isSolid(w.dimension, activeDim)) solids.push(w);
    }
    // Add moving platforms
    for (const mp of this.movingPlatforms) {
      if (isSolid(mp.config.dimension, activeDim)) {
        solids.push({ x: mp.x, y: mp.y, w: mp.config.w, h: mp.config.h });
      }
    }
    // Add fragile blocks (only intact or shaking)
    for (const fb of this.fragileBlocks) {
      if (fb.state === 'intact' || fb.state === 'shaking') {
        if (isSolid(fb.dimension, activeDim)) {
          solids.push({ x: fb.x, y: fb.y, w: fb.w, h: fb.h, fragile: fb });
        }
      }
    }

    // --- Vertical collision FIRST (prevents horizontal push from ground overlap) ---
    let playerX = this.player.x;
    let playerY = this.player.y;
    let playerVx = vel.vx;
    let playerVy = vel.vy;
    let onMovingPlatform = false;
    let mpDx = 0;

    for (let si = 0; si < solids.length; si++) {
      const s = solids[si];
      if (aabbOverlap(playerX, playerY, pb.w, pb.h, s.x, s.y, s.w, s.h)) {
        // Trigger fragile block on landing
        if (s.fragile) {
          this.triggerFragileBlock(s.fragile);
        }
        if (vel.vy > 0) {
          playerY = s.y - pb.h;
          playerVy = 0;
          grounded = true;

          // Check if this solid is a moving platform — carry player
          for (const mp of this.movingPlatforms) {
            if (Math.abs(mp.x - s.x) < 1 && Math.abs(mp.y - s.y) < 1) {
              onMovingPlatform = true;
              // Calculate platform velocity
              const step = (mp.config.speed / mp.dist) * FIXED_DT;
              mpDx = step * mp.direction * (mp.config.endX - mp.config.startX);
              if (mp.waitTimer > 0) mpDx = 0;
              break;
            }
          }

          // Landing particles
          if (!this.wasGrounded) {
            this.renderer.spawnLandParticles(
              playerX + pb.w / 2,
              playerY + pb.h,
              this.player.dimension
            );
            this.audio.playLand();
          }
        } else if (vel.vy < 0) {
          playerY = s.y + s.h;
          playerVy = 0;
        } else {
          const overlapDown = (playerY + pb.h) - s.y;
          const overlapUp = (s.y + s.h) - playerY;
          if (overlapDown < overlapUp) {
            playerY = s.y - pb.h;
            grounded = true;
          } else {
            playerY = s.y + s.h;
          }
        }
      }
    }

    // --- Horizontal collision (after vertical, so ground overlap is already resolved) ---
    for (const s of solids) {
      if (aabbOverlap(playerX, playerY, pb.w, pb.h, s.x, s.y, s.w, s.h)) {
        // Trigger fragile block on wall slide contact
        if (s.fragile) {
          this.triggerFragileBlock(s.fragile);
        }
        if (vel.vx > 0) {
          playerX = s.x - pb.w;
          playerVx = 0;
          if (!grounded && playerY + pb.h > s.y + 2) {
            wallSliding = true;
            wallDir = 1;
          }
        } else if (vel.vx < 0) {
          playerX = s.x + s.w;
          playerVx = 0;
          if (!grounded && playerY + pb.h > s.y + 2) {
            wallSliding = true;
            wallDir = -1;
          }
        } else {
          // vx === 0: push out the shortest horizontal distance
          const overlapLeft = (playerX + pb.w) - s.x;
          const overlapRight = (s.x + s.w) - playerX;
          if (overlapLeft < overlapRight) {
            playerX = s.x - pb.w;
          } else {
            playerX = s.x + s.w;
          }
        }
      }
    }

    // Apply moving platform carry
    if (onMovingPlatform && grounded) {
      playerX += mpDx;
    }

    // Apply resolved positions
    this.player.x = playerX;
    this.player.y = playerY;
    this.player.setVelocity(playerVx, playerVy);
    this.player.setGrounded(grounded);
    this.player.setWallSliding(wallSliding, wallDir);

    // Jump particles
    if (this.wasGrounded && !grounded && playerVy < -50) {
      this.renderer.spawnJumpParticles(
        this.player.x + pb.w / 2,
        this.player.y + pb.h,
        this.player.dimension
      );
      this.audio.playJump();
    }

    // Wall jump detection
    if (this.prevWallSliding && !this.player.wallSliding && !grounded) {
      this.audio.playWallJump();
      this.renderer.spawnJumpParticles(
        this.player.x + pb.w / 2,
        this.player.y + pb.h / 2,
        this.player.dimension
      );
    }

    this.wasGrounded = grounded;
  }

  private checkBouncePads() {
    if (!this.player.isAlive) return;
    const activeDim = this.player.dimension;
    const pb = this.player.getBounds();
    const pads = this.level.bouncePads || [];

    for (const pad of pads) {
      if (isSolid(pad.dimension, activeDim)) {
        if (aabbOverlap(pb.x, pb.y, pb.w, pb.h, pad.x, pad.y, pad.w, pad.h)) {
          // Only bounce if falling onto it
          const vel = this.player.getVelocity();
          if (vel.vy >= 0) {
            this.player.setVelocity(vel.vx, -pad.bounceForce);
            this.player.setGrounded(false);
            this.renderer.spawnBounceParticles(
              this.player.x + pb.w / 2,
              this.player.y + pb.h,
              this.player.dimension
            );
            this.audio.playBounce();
            this.renderer.addShake(3, 0.1);
          }
        }
      }
    }
  }

  private checkOrbs() {
    if (!this.player.isAlive) return;
    const activeDim = this.player.dimension;
    const pb = this.player.getBounds();

    for (const orb of this.orbs) {
      if (!orb.active) continue;
      if (!isSolid(orb.dimension, activeDim)) continue;

      if (aabbOverlap(pb.x, pb.y, pb.w, pb.h, orb.x, orb.y, orb.w, orb.h)) {
        // Force dimension shift
        const newDim = this.player.shiftDimension();
        this.renderer.spawnOrbParticles(orb.x + orb.w / 2, orb.y + orb.h / 2);
        this.renderer.spawnShiftParticles(
          this.player.x + pb.w / 2,
          this.player.y + pb.h / 2,
          newDim
        );
        this.audio.playOrb();
        this.renderer.addShake(3, 0.12);

        // Regenerate jump ability (reset vy to allow mid-air jump)
        const vel = this.player.getVelocity();
        this.player.setVelocity(vel.vx, -200);

        // Deactivate orb with cooldown
        orb.active = false;
        orb.cooldownTimer = orb.config.cooldown || 1.5;

        // Recharge dash on orb
        this.player.rechargeDash();
      }
    }
  }

  private checkSpikes() {
    if (!this.player.isAlive) return;
    const activeDim = this.player.dimension;
    const pb = this.player.getBounds();

    for (const s of this.level.spikes) {
      if (isSolid(s.dimension, activeDim)) {
        const spikePad = 3;
        if (aabbOverlap(
          pb.x + spikePad, pb.y + spikePad,
          pb.w - spikePad * 2, pb.h - spikePad,
          s.x, s.y, s.w, s.h
        )) {
          this.killPlayer();
          return;
        }
      }
    }
  }

  private checkPortal() {
    if (!this.player.isAlive || this.won) return;
    const activeDim = this.player.dimension;
    const pb = this.player.getBounds();
    const p = this.level.portal;

    if (isSolid(p.dimension, activeDim)) {
      if (aabbOverlap(pb.x, pb.y, pb.w, pb.h, p.x, p.y, p.w, p.h)) {
        this.won = true;
        this.wonTimer = 0;
        this.audio.playVictory();
        this.renderer.spawnVictoryParticles(
          this.player.x + pb.w / 2,
          this.player.y + pb.h / 2
        );
        this.renderer.addShake(3, 0.3);

        // Stop ghost recording and get data
        const ghostData = this.ghost.stopRecording();

        // Calculate medal
        const parTimes = this.level.parTimes;
        let medal: Medal = null;
        let timeDiff = 0;
        if (parTimes) {
          medal = this.storage.calculateMedal(this.levelTimer, parTimes.gold, parTimes.silver, parTimes.bronze);
          this.storage.updateMedal(this.currentLevelIndex, medal);
        }

        // Calculate time difference vs best
        const stats = this.storage.getLevelStats(this.currentLevelIndex);
        if (stats.bestTime !== null && this.levelTimer < stats.bestTime) {
          timeDiff = this.levelTimer - stats.bestTime;
        }

        // Save progress with ghost
        this.storage.recordLevelComplete(this.currentLevelIndex, this.levelTimer, ghostData);

        this.currentMedal = medal;
        this.timeDifference = timeDiff;
        this.menu.state = 'LEVEL_COMPLETE';

        // Stop music on level complete
        this.audio.stopMusic();
      }
    }
  }

  private killPlayer() {
    const pb = this.player.getBounds();
    this.player.die();
    this.audio.playDeath();
    this.renderer.spawnDeathParticles(pb.x + pb.w / 2, pb.y + pb.h / 2);
    this.renderer.addShake(6, 0.2);
    this.triggerHitstop(0.04);
    this.sessionDeaths++;
    this.storage.recordDeath(this.currentLevelIndex);

    // Stop ghost recording on death
    this.ghost.stopRecording();

    setTimeout(() => {
      if (!this.player.isAlive && !this.won) {
        // Respawn at checkpoint if activated, otherwise at spawn
        const respawnX = this.checkpointActivated ? this.checkpointSpawnX : this.level.spawnX;
        const respawnY = this.checkpointActivated ? this.checkpointSpawnY : this.level.spawnY;
        this.player.respawn(respawnX, respawnY);
        this.wasGrounded = false;
        // Reset hitstop timer on respawn
        this.hitstopTimer = 0;
      }
    }, 500);
  }

  private checkLaserHazards() {
    if (!this.player.isAlive) return;
    const pb = this.player.getBounds();
    const px = pb.x + pb.w / 2;
    const py = pb.y + pb.h / 2;

    for (const laser of this.hazards.getLasers()) {
      if (this.hazards.isPointInLaser(px, py, laser, this.player.dimension)) {
        this.killPlayer();
        return;
      }
    }
  }

  private checkTurretProjectiles() {
    if (!this.player.isAlive) return;
    const pb = this.player.getBounds();

    for (const proj of this.hazards.getAllProjectiles()) {
      if (this.hazards.isProjectileHitPlayer(proj, this.player.dimension, pb.x, pb.y, pb.w, pb.h)) {
        this.killPlayer();
        return;
      }
    }
  }

  private checkCheckpoints() {
    if (!this.player.isAlive) return;
    const activeDim = this.player.dimension;
    const pb = this.player.getBounds();

    for (const cp of this.checkpoints) {
      if (cp.active) continue;
      if (!isSolid(cp.config.dimension, activeDim)) continue;

      if (aabbOverlap(pb.x, pb.y, pb.w, pb.h, cp.config.x, cp.config.y, cp.config.w, cp.config.h)) {
        cp.active = true;
        this.checkpointActivated = true;
        this.checkpointSpawnX = cp.config.x;
        this.checkpointSpawnY = cp.config.y - pb.h - 5;
        this.audio.playCheckpoint();
        this.renderer.spawnParticles(
          cp.config.x + cp.config.w / 2,
          cp.config.y + cp.config.h / 2,
          15,
          '#00ff88',
          100,
          0.5,
          3
        );
      }
    }
  }

  // ========================
  // Mouse Hover/Click for Menus
  // ========================
  private handleMenuMouse(state: string, levelNames: string[], stats: { unlocked: boolean; bestTime: number | null; deaths: number; medal?: any }[]) {
    const skinsData = this.storage.getAllSkins();
    const hitboxes = this.renderer.getMenuHitboxes(
      state,
      this.menu.getMenuCursor(),
      this.menu.getLevelSelectCursor(),
      this.menu.getLevelSelectPage(),
      this.menu.getPauseCursor(),
      this.menu.getSkinsCursor(),
      skinsData,
      levelNames
    );

    const mx = this.input.getMouseX();
    const my = this.input.getMouseY();

    // Check if mouse is over any hitbox — set CSS cursor
    let hovering = false;
    for (const hb of hitboxes) {
      if (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h) {
        hovering = true;
        break;
      }
    }
    this.canvas.style.cursor = hovering ? 'pointer' : 'default';

    // Handle click
    if (!this.input.getMouseClickJustPressed()) return;

    for (const hb of hitboxes) {
      if (mx >= hb.x && mx <= hb.x + hb.w && my >= hb.y && my <= hb.y + hb.h) {
        this.executeMenuAction(hb.action, levelNames, stats);
        break;
      }
    }
  }

  private executeMenuAction(action: string, _levelNames: string[], stats: { unlocked: boolean; bestTime: number | null; deaths: number; medal?: any }[]) {
    this.audio.playMenuSelect();

    if (action.startsWith('menu_select_')) {
      const idx = parseInt(action.replace('menu_select_', ''));
      this.menu.setMenuCursor(idx);
      // Simulate confirm
      if (idx === 0) {
        this.menu.state = 'PLAYING';
      } else if (idx === 1) {
        this.menu.state = 'LEVEL_SELECT';
        const firstUnlocked = stats.findIndex(s => s.unlocked);
        this.menu.setLevelSelectCursor(firstUnlocked >= 0 ? firstUnlocked : 0);
      } else if (idx === 2) {
        this.menu.state = 'SKINS';
        this.menu.setSkinsCursor(0);
      } else if (idx === 3) {
        this.menu.state = 'EDITOR';
      } else if (idx === 4) {
        this.storage.reset();
      }
    } else if (action.startsWith('tab_select_')) {
      const page = parseInt(action.replace('tab_select_', ''));
      this.menu.setLevelSelectPage(page);
      this.menu.setLevelSelectCursor(page * MenuManager.LEVELS_PER_PAGE);
      this.audio.playTabSwitch();
    } else if (action.startsWith('level_select_')) {
      const levelIdx = parseInt(action.replace('level_select_', ''));
      this.menu.setLevelSelectCursor(levelIdx);
      if (stats[levelIdx]?.unlocked) {
        this.menu.state = 'PLAYING';
      } else {
        this.audio.playMenuLocked();
      }
    } else if (action.startsWith('pause_select_')) {
      const idx = parseInt(action.replace('pause_select_', ''));
      this.menu.setPauseCursor(idx);
      if (idx === 0) {
        this.menu.state = 'PLAYING';
      } else if (idx === 1) {
        this.loadLevel(this.currentLevelIndex);
        this.menu.state = 'PLAYING';
        this.audio.startMusic();
      } else if (idx === 2) {
        this.menu.state = 'MENU';
        this.audio.stopMusic();
      }
    } else if (action.startsWith('skin_select_')) {
      const idx = parseInt(action.replace('skin_select_', ''));
      const skinsData = this.storage.getAllSkins();
      this.menu.setSkinsCursor(idx);
      if (idx < skinsData.length && skinsData[idx].unlocked) {
        this.storage.setSelectedSkin(skinsData[idx].skin.id);
        this.player.setSkin(skinsData[idx].skin.id);
      }
    } else if (action === 'level_complete_continue') {
      // Handled by update() — just trigger the same as Enter
      if (this.currentLevelIndex < levelsData.length - 1) {
        this.loadLevel(this.currentLevelIndex + 1);
      } else {
        this.menu.state = 'VICTORY';
      }
    } else if (action === 'victory_back') {
      this.menu.state = 'MENU';
      this.menu.setMenuCursor(0);
    }
  }

  private render() {
    const state = this.menu.state;

    if (state === 'EDITOR') {
      // Render editor
      const spawn = this.editor.getSpawn();
      const portal = this.editor.getPortal();
      this.renderer.renderEditor(
        this.editor.getEntities(),
        spawn.x,
        spawn.y,
        portal.x,
        portal.y,
        this.editor.tool,
        this.editor.dimension,
        this.editor.getDimensionLabel(),
        this.editor.levelName,
        this.editor.getDragRect(),
        this.audio.isMuted()
      );
      return;
    }

    if (state === 'MENU' || state === 'LEVEL_SELECT' || state === 'PAUSED' || state === 'VICTORY' || state === 'SKINS') {
      // Render menu screens
      const levelNames = levelsData.map(l => l.name);
      const stats = this.storage.getAllStats(levelsData.length);

      // Calculate totals for profile card
      let totalGold = 0, totalSilver = 0, totalBronze = 0, totalDeaths = 0;
      for (const s of stats) {
        if (s.medal === 'GOLD') totalGold++;
        else if (s.medal === 'SILVER') totalSilver++;
        else if (s.medal === 'BRONZE') totalBronze++;
        totalDeaths += s.deaths;
      }

      // Get equipped skin
      const equippedSkin = this.storage.getEquippedSkin();

      // Mouse hover/click handling for menus
      this.handleMenuMouse(state, levelNames, stats);

      this.renderer.renderMenu(
        this.menu.getTitleTime(),
        this.menu.getMenuCursor(),
        this.menu.getMenuCursorLerp(),
        state,
        this.menu.getLevelSelectCursor(),
        this.menu.getLevelSelectCursorLerp(),
        levelNames,
        stats,
        this.menu.getPauseCursor(),
        this.menu.getPauseCursorLerp(),
        this.audio.isMuted(),
        this.menu.getSkinsCursor(),
        this.storage.getAllSkins(),
        this.menu.getLevelSelectPage(),
        this.menu.getLevelSelectPageLerp(),
        this.menu.getMaxPages(levelsData.length),
        this.menu.getChapterName(this.menu.getLevelSelectPage()),
        this.menu.transitionProgress,
        levelsData.length,
        totalGold,
        totalSilver,
        totalBronze,
        totalDeaths,
        equippedSkin,
        levelsData
      );

      // If paused, also render the game behind it
      if (state === 'PAUSED') {
        this.renderGameScene();
      }
    } else {
      // PLAYING or LEVEL_COMPLETE
      this.renderGameScene();
    }
  }

  // ========================
  // Editor Mouse Events
  // ========================
  private setupEditorMouseEvents() {
    const getCanvasCoords = (e: MouseEvent) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_W / rect.width;
      const scaleY = CANVAS_H / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.menu.state !== 'EDITOR') return;
      e.preventDefault();
      const { x, y } = getCanvasCoords(e);
      this.editor.onMouseDown(x, y, e.button);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.menu.state !== 'EDITOR') return;
      const { x, y } = getCanvasCoords(e);
      this.editor.onMouseMove(x, y);
    });

    this.canvas.addEventListener('mouseup', (_e) => {
      if (this.menu.state !== 'EDITOR') return;
      this.editor.onMouseUp();
      this.editor.saveToLocalStorage();
    });

    // Prevent context menu on canvas
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Keyboard shortcuts for editor
    document.addEventListener('keydown', (e) => {
      if (this.menu.state !== 'EDITOR') return;

      // Tool shortcuts 1-0, -, =
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        this.editor.setToolByNumber(num - 1);
        return;
      }
      if (e.key === '0') {
        this.editor.setToolByNumber(9); // turret
        return;
      }
      if (e.key === '-' || e.key === '_') {
        this.editor.setToolByNumber(10); // gravityZone
        return;
      }
      if (e.key === '=' || e.key === '+') {
        this.editor.setToolByNumber(11); // fragileBlock
        return;
      }

      // Tab or C to cycle dimension
      if (e.key === 'Tab') {
        e.preventDefault();
        this.editor.cycleDimension();
        return;
      }
      if (e.code === 'KeyC' && !e.ctrlKey) {
        this.editor.cycleDimension();
        return;
      }

      // P for playtest
      if (e.code === 'KeyP' && !e.ctrlKey) {
        this.startEditorPlaytest();
        return;
      }

      // Ctrl+E to export
      if (e.ctrlKey && e.code === 'KeyE') {
        e.preventDefault();
        this.exportEditorJSON();
        return;
      }

      // Ctrl+I to import
      if (e.ctrlKey && e.code === 'KeyI') {
        e.preventDefault();
        this.importEditorJSON();
        return;
      }
    });
  }

  private startEditorPlaytest() {
    this.editorPlaytestLevel = this.editor.exportLevelData();
    this.editor.saveToLocalStorage();
    this.loadLevel(-1); // Special index for editor playtest
    this.menu.state = 'PLAYING';
  }

  private exportEditorJSON() {
    const json = this.editor.exportJSON();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json);
    } else {
      // Fallback: prompt with JSON
      const p = prompt('Copia este JSON:', json);
      // p is unused, just for display
      void p;
    }
  }

  private importEditorJSON() {
    const json = prompt('Pega el JSON del nivel:');
    if (json) {
      if (this.editor.importJSON(json)) {
        this.editor.saveToLocalStorage();
      } else {
        alert('JSON inválido');
      }
    }
  }

  private renderGameScene() {
    // Build moving platform render data
    const mpRender = this.movingPlatforms.map(mp => ({
      x: mp.x,
      y: mp.y,
      w: mp.config.w,
      h: mp.config.h,
      dimension: mp.config.dimension,
    }));

    // Build bounce pad render data
    const bpRender = (this.level.bouncePads || []).map(bp => ({
      x: bp.x,
      y: bp.y,
      w: bp.w,
      h: bp.h,
      dimension: bp.dimension,
    }));

    // Build orb render data
    const orbRender = this.orbs.map(o => ({
      x: o.x,
      y: o.y,
      w: o.w,
      h: o.h,
      active: o.active,
      dimension: o.dimension,
    }));

    const vel = this.player.getVelocity();
    const speed = Math.sqrt(vel.vx * vel.vx + vel.vy * vel.vy);

    // Get ghost position
    const ghostFrame = this.ghost.isPlayingBack() ? this.ghost.getGhostAt(this.levelTimer) : null;

    // Camera transform
    const cam = this.camera.getTransform();

    // Build gravity zone render data
    const gzRender = this.gravityZones.map(gz => ({
      x: gz.x, y: gz.y, w: gz.w, h: gz.h, dimension: gz.dimension,
    }));

    // Build fragile block render data
    const fbRender = this.fragileBlocks.map(fb => ({
      x: fb.x, y: fb.y, w: fb.w, h: fb.h, dimension: fb.dimension,
      state: fb.state, timer: fb.timer,
    }));

    this.renderer.renderGame(
      this.player.dimension,
      this.level.platforms,
      this.level.walls,
      this.level.spikes,
      this.level.portal,
      mpRender,
      bpRender,
      orbRender,
      this.player.x,
      this.player.y,
      this.player.width,
      this.player.height,
      this.player.dimension,
      this.player.isAlive,
      speed,
      this.player.wallSliding,
      this.player.vx,
      this.player.vy,
      this.player.grounded,
      this.player.isDashing,
      this.player.wallDir,
      this.level.name,
      this.currentLevelIndex,
      levelsData.length,
      this.levelTimer,
      this.sessionDeaths,
      this.won,
      this.audio.isMuted(),
      this.player.scaleX,
      this.player.scaleY,
      this.player.dashChargesLeft,
      ghostFrame,
      this.currentMedal,
      this.timeDifference,
      cam.x,
      cam.y,
      this.player.skin,
      this.checkpoints,
      this.hazards.getLasers(),
      this.hazards.getTurrets(),
      this.hazards.getAllProjectiles(),
      gzRender,
      fbRender,
      this.player.gravityDir
    );
  }
}

// Start game
window.addEventListener('DOMContentLoaded', () => {
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.background = '#000000';
  document.body.style.display = 'flex';
  document.body.style.justifyContent = 'center';
  document.body.style.alignItems = 'center';
  document.body.style.height = '100vh';

  new Game();
});

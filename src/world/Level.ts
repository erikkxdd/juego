export type Dimension = 'BLUE' | 'RED';
export type EntityDimension = 'BOTH' | 'BLUE' | 'RED';
export type Medal = 'GOLD' | 'SILVER' | 'BRONZE' | null;

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Platform extends Rect {
  dimension: EntityDimension;
}

export interface Wall extends Rect {
  dimension: EntityDimension;
}

export interface Spike extends Rect {
  dimension: EntityDimension;
}

export interface Portal extends Rect {
  dimension: EntityDimension;
}

export interface ParTimes {
  gold: number;
  silver: number;
  bronze: number;
}

export interface LevelData {
  name: string;
  platforms: Platform[];
  walls: Wall[];
  spikes: Spike[];
  portal: Portal;
  spawnX: number;
  spawnY: number;
  // World size (for camera bounds)
  worldWidth?: number;
  worldHeight?: number;
  // Medal par times (seconds)
  parTimes?: ParTimes;
  // New entities
  movingPlatforms?: MovingPlatform[];
  bouncePads?: BouncePad[];
  dimensionOrbs?: DimensionOrb[];
  checkpoints?: Checkpoint[];
  lasers?: LaserBeam[];
  turrets?: Turret[];
  gravityZones?: GravityZone[];
  fragileBlocks?: FragileBlock[];
}

// --- Moving Platform ---
export interface MovingPlatform extends Rect {
  dimension: EntityDimension;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed: number; // pixels per second
  waitTime?: number; // seconds to wait at each end (default 0)
}

// --- Bounce Pad ---
export interface BouncePad extends Rect {
  dimension: EntityDimension;
  bounceForce: number; // vertical impulse
}

// --- Dimension Orb ---
export interface DimensionOrb extends Rect {
  dimension: EntityDimension;
  cooldown: number; // seconds before respawning (default 1.5)
}

// --- Checkpoint ---
export interface Checkpoint extends Rect {
  dimension: EntityDimension;
}

// --- Laser Beam ---
export interface LaserBeam {
  x1: number; // start point
  y1: number;
  x2: number; // end point
  y2: number;
  dimension: EntityDimension;
  cycleTime: number; // total cycle duration (on + off)
  onTime: number; // how long the laser stays active
  warnTime: number; // warning time before activation (default 0.5s)
}

// --- Turret ---
export interface Turret extends Rect {
  dimension: EntityDimension;
  fireDirection: { x: number; y: number }; // normalized direction
  fireInterval: number; // seconds between shots
  projectileSpeed: number; // pixels per second
  projectileDimension: Dimension; // dimension of fired projectiles
}

// --- Projectile (runtime) ---
export interface Projectile {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  dimension: Dimension;
  alive: boolean;
}

// --- Runtime state for hazards ---
export interface LaserState {
  config: LaserBeam;
  phase: 'off' | 'warning' | 'on';
  timer: number; // countdown within current phase
}

export interface TurretState {
  config: Turret;
  fireTimer: number;
  projectiles: Projectile[];
}

// --- Gravity Zone ---
export interface GravityZone extends Rect {
  dimension: EntityDimension;
}

// --- Fragile Block ---
export interface FragileBlock extends Rect {
  dimension: EntityDimension;
}

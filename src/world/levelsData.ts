import type { LevelData } from './Level';

const W = 1280;

export const levelsData: LevelData[] = [
  // === LEVEL 1: "First Shift" — Tutorial básico ===
  {
    name: 'First Shift',
    spawnX: 60,
    spawnY: 500,
    platforms: [
      // Starting ground
      { x: 0, y: 600, w: 300, h: 20, dimension: 'BOTH' },
      // First gap — must shift to blue
      { x: 350, y: 560, w: 120, h: 16, dimension: 'BLUE' },
      // Red platform after blue
      { x: 520, y: 520, w: 120, h: 16, dimension: 'RED' },
      // Blue platform
      { x: 690, y: 480, w: 120, h: 16, dimension: 'BLUE' },
      // Both platform — safe rest
      { x: 860, y: 440, w: 150, h: 20, dimension: 'BOTH' },
      // Final stretch — alternating
      { x: 1060, y: 400, w: 100, h: 16, dimension: 'RED' },
      { x: 1180, y: 360, w: 100, h: 16, dimension: 'BLUE' },
      // Floor under portal
      { x: 1100, y: 500, w: 180, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: W - 16, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 300, y: 610, w: 50, h: 10, dimension: 'BOTH' },
    ],
    portal: { x: 1180, y: 320, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 12, silver: 18, bronze: 28 },
  },

  // === LEVEL 2: "Wall Runner" — Wall slide & wall jump ===
  {
    name: 'Wall Runner',
    spawnX: 60,
    spawnY: 500,
    platforms: [
      // Start
      { x: 0, y: 600, w: 200, h: 20, dimension: 'BOTH' },
      // Shaft floor
      { x: 0, y: 700, w: 500, h: 20, dimension: 'BOTH' },
      // Wall jump shaft — left wall
      { x: 250, y: 200, w: 16, h: 400, dimension: 'BOTH' },
      // Wall jump shaft — right wall
      { x: 450, y: 200, w: 16, h: 400, dimension: 'BOTH' },
      // Platform above shaft (blue only)
      { x: 250, y: 180, w: 220, h: 16, dimension: 'BLUE' },
      // After shaft — red platform
      { x: 500, y: 300, w: 100, h: 16, dimension: 'RED' },
      // Blue platform
      { x: 650, y: 250, w: 100, h: 16, dimension: 'BLUE' },
      // Red platform
      { x: 800, y: 300, w: 100, h: 16, dimension: 'RED' },
      // Wall jump section 2
      { x: 950, y: 150, w: 16, h: 350, dimension: 'BOTH' },
      { x: 1050, y: 150, w: 16, h: 350, dimension: 'BOTH' },
      // Platform above shaft 2 (red only)
      { x: 950, y: 130, w: 120, h: 16, dimension: 'RED' },
      // Blue bridge
      { x: 1100, y: 200, w: 100, h: 16, dimension: 'BLUE' },
      // Final platform
      { x: 1150, y: 300, w: 130, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: W - 16, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 610, w: 50, h: 10, dimension: 'BOTH' },
      { x: 900, y: 400, w: 50, h: 10, dimension: 'BOTH' },
    ],
    portal: { x: 1200, y: 260, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 18, silver: 26, bronze: 40 },
  },

  // === LEVEL 3: "Bounce Intro" — Muelles ===
  {
    name: 'Bounce Intro',
    spawnX: 60,
    spawnY: 500,
    platforms: [
      // Start
      { x: 0, y: 600, w: 250, h: 20, dimension: 'BOTH' },
      // First bounce pad launches to upper platform
      { x: 350, y: 400, w: 120, h: 16, dimension: 'BLUE' },
      // Landing after bounce
      { x: 550, y: 350, w: 100, h: 16, dimension: 'RED' },
      // Second bounce
      { x: 700, y: 500, w: 150, h: 20, dimension: 'BOTH' },
      { x: 700, y: 200, w: 120, h: 16, dimension: 'BLUE' },
      // After second bounce
      { x: 880, y: 180, w: 100, h: 16, dimension: 'RED' },
      // Drop down to final section
      { x: 1050, y: 300, w: 100, h: 16, dimension: 'BOTH' },
      // Final platforms
      { x: 1150, y: 400, w: 130, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: W - 16, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 250, y: 610, w: 100, h: 10, dimension: 'BOTH' },
      { x: 600, y: 500, w: 100, h: 10, dimension: 'BOTH' },
    ],
    bouncePads: [
      // Bounce from ground to blue platform
      { x: 150, y: 580, w: 30, h: 20, dimension: 'BOTH', bounceForce: 550 },
      // Bounce from mid to upper blue
      { x: 750, y: 480, w: 30, h: 20, dimension: 'BOTH', bounceForce: 500 },
    ],
    portal: { x: 1200, y: 360, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 14, silver: 20, bronze: 32 },
  },

  // === LEVEL 4: "Color Cascade" — Muelles + cambios rápidos ===
  {
    name: 'Color Cascade',
    spawnX: 60,
    spawnY: 500,
    platforms: [
      // Start
      { x: 0, y: 600, w: 200, h: 20, dimension: 'BOTH' },
      // Quick alternating — must shift mid-air after bounce
      { x: 300, y: 500, w: 80, h: 16, dimension: 'BLUE' },
      { x: 420, y: 450, w: 80, h: 16, dimension: 'RED' },
      { x: 540, y: 400, w: 80, h: 16, dimension: 'BLUE' },
      { x: 660, y: 350, w: 80, h: 16, dimension: 'RED' },
      // Rest
      { x: 780, y: 350, w: 120, h: 20, dimension: 'BOTH' },
      // Bounce to top section
      { x: 950, y: 150, w: 100, h: 16, dimension: 'BLUE' },
      { x: 1100, y: 150, w: 100, h: 16, dimension: 'RED' },
      // Final
      { x: 1150, y: 300, w: 130, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: W - 16, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 610, w: 100, h: 10, dimension: 'BOTH' },
      { x: 700, y: 500, w: 80, h: 10, dimension: 'BOTH' },
    ],
    bouncePads: [
      // Launch to cascade
      { x: 120, y: 580, w: 30, h: 20, dimension: 'BOTH', bounceForce: 520 },
      // Launch to top section
      { x: 830, y: 330, w: 30, h: 20, dimension: 'BOTH', bounceForce: 500 },
    ],
    portal: { x: 1200, y: 260, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 16, silver: 24, bronze: 36 },
  },

  // === LEVEL 5: "Moving Targets" — Plataformas móviles ===
  {
    name: 'Moving Targets',
    spawnX: 60,
    spawnY: 500,
    platforms: [
      // Start
      { x: 0, y: 600, w: 200, h: 20, dimension: 'BOTH' },
      // After first moving platform
      { x: 400, y: 500, w: 100, h: 16, dimension: 'BLUE' },
      // Red platform
      { x: 550, y: 450, w: 100, h: 16, dimension: 'RED' },
      // Rest
      { x: 700, y: 400, w: 120, h: 20, dimension: 'BOTH' },
      // After second moving platform
      { x: 950, y: 300, w: 100, h: 16, dimension: 'BLUE' },
      // Final
      { x: 1100, y: 350, w: 180, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: W - 16, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 610, w: 200, h: 10, dimension: 'BOTH' },
      { x: 650, y: 550, w: 50, h: 10, dimension: 'BOTH' },
    ],
    movingPlatforms: [
      // Horizontal moving platform — blue
      {
        x: 250, y: 550, w: 100, h: 16, dimension: 'BLUE',
        startX: 250, startY: 550, endX: 380, endY: 550,
        speed: 120, waitTime: 0.5,
      },
      // Vertical moving platform — red
      {
        x: 800, y: 400, w: 100, h: 16, dimension: 'RED',
        startX: 800, startY: 450, endX: 800, endY: 250,
        speed: 100, waitTime: 0.3,
      },
    ],
    portal: { x: 1200, y: 310, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 20, silver: 30, bronze: 45 },
  },

  // === LEVEL 6: "Dimensional Walls" — Plataformas móviles + wall-jump ===
  {
    name: 'Dimensional Walls',
    spawnX: 60,
    spawnY: 500,
    platforms: [
      // Start
      { x: 0, y: 600, w: 200, h: 20, dimension: 'BOTH' },
      // Wall jump shaft with dimension-specific walls
      { x: 300, y: 200, w: 16, h: 400, dimension: 'BLUE' },
      { x: 450, y: 200, w: 16, h: 400, dimension: 'RED' },
      // Platform above shaft
      { x: 300, y: 180, w: 170, h: 16, dimension: 'BOTH' },
      // Moving platform to next section
      { x: 550, y: 300, w: 100, h: 16, dimension: 'BLUE' },
      // Wall jump section 2
      { x: 700, y: 150, w: 16, h: 350, dimension: 'RED' },
      { x: 800, y: 150, w: 16, h: 350, dimension: 'BLUE' },
      // Platform above
      { x: 700, y: 130, w: 120, h: 16, dimension: 'BOTH' },
      // Final stretch
      { x: 900, y: 250, w: 100, h: 16, dimension: 'RED' },
      { x: 1050, y: 200, w: 100, h: 16, dimension: 'BLUE' },
      // End
      { x: 1150, y: 300, w: 130, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: W - 16, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 610, w: 100, h: 10, dimension: 'BOTH' },
      { x: 300, y: 600, w: 160, h: 10, dimension: 'BOTH' },
      { x: 700, y: 500, w: 120, h: 10, dimension: 'BOTH' },
    ],
    movingPlatforms: [
      // Diagonal moving platform
      {
        x: 550, y: 300, w: 100, h: 16, dimension: 'BLUE',
        startX: 500, startY: 350, endX: 650, endY: 250,
        speed: 80, waitTime: 0.5,
      },
    ],
    portal: { x: 1200, y: 260, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 22, silver: 32, bronze: 50 },
  },

  // === LEVEL 7: "Orbital Shift" — Orbes de cambio forzado ===
  {
    name: 'Orbital Shift',
    spawnX: 60,
    spawnY: 500,
    platforms: [
      // Start
      { x: 0, y: 600, w: 200, h: 20, dimension: 'BOTH' },
      // Gap with orb in middle
      { x: 300, y: 500, w: 100, h: 16, dimension: 'RED' },
      // After first orb
      { x: 450, y: 450, w: 100, h: 16, dimension: 'BLUE' },
      // Rest
      { x: 600, y: 400, w: 120, h: 20, dimension: 'BOTH' },
      // Second orb section
      { x: 780, y: 350, w: 80, h: 16, dimension: 'RED' },
      { x: 900, y: 300, w: 80, h: 16, dimension: 'BLUE' },
      // Wall jump with orb
      { x: 1050, y: 150, w: 16, h: 300, dimension: 'BOTH' },
      { x: 1150, y: 150, w: 16, h: 300, dimension: 'BOTH' },
      // Top
      { x: 1050, y: 130, w: 120, h: 16, dimension: 'BOTH' },
      // Final
      { x: 1150, y: 250, w: 130, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: W - 16, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 610, w: 100, h: 10, dimension: 'BOTH' },
      { x: 550, y: 550, w: 50, h: 10, dimension: 'BOTH' },
      { x: 750, y: 500, w: 50, h: 10, dimension: 'BOTH' },
    ],
    dimensionOrbs: [
      // Orb between start and red platform — shifts to RED
      { x: 250, y: 470, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
      // Orb between rest and second section
      { x: 700, y: 320, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
      // Orb in wall jump shaft
      { x: 1100, y: 250, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
    ],
    portal: { x: 1200, y: 210, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 20, silver: 30, bronze: 45 },
  },

  // === LEVEL 8: "Final Gauntlet" — Todo combinado ===
  {
    name: 'Final Gauntlet',
    spawnX: 60,
    spawnY: 500,
    platforms: [
      // Start
      { x: 0, y: 600, w: 180, h: 20, dimension: 'BOTH' },
      // Bounce to first section
      { x: 250, y: 450, w: 80, h: 16, dimension: 'BLUE' },
      { x: 370, y: 400, w: 80, h: 16, dimension: 'RED' },
      // Moving platform section
      { x: 550, y: 350, w: 100, h: 16, dimension: 'BOTH' },
      // Wall jump shaft
      { x: 700, y: 150, w: 16, h: 300, dimension: 'BLUE' },
      { x: 800, y: 150, w: 16, h: 300, dimension: 'RED' },
      // Top of shaft
      { x: 700, y: 130, w: 120, h: 16, dimension: 'BOTH' },
      // Drop to final section
      { x: 870, y: 300, w: 80, h: 16, dimension: 'RED' },
      { x: 990, y: 250, w: 80, h: 16, dimension: 'BLUE' },
      // Final wall jump
      { x: 1100, y: 100, w: 16, h: 250, dimension: 'BOTH' },
      { x: 1200, y: 100, w: 16, h: 250, dimension: 'BOTH' },
      // End platform
      { x: 1130, y: 80, w: 150, h: 16, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: W - 16, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 180, y: 610, w: 70, h: 10, dimension: 'BOTH' },
      { x: 450, y: 550, w: 100, h: 10, dimension: 'BOTH' },
      { x: 700, y: 460, w: 120, h: 10, dimension: 'BOTH' },
      { x: 900, y: 450, w: 90, h: 10, dimension: 'BOTH' },
    ],
    bouncePads: [
      // Launch to first section
      { x: 100, y: 580, w: 30, h: 20, dimension: 'BOTH', bounceForce: 520 },
    ],
    movingPlatforms: [
      // Moving platform between sections
      {
        x: 500, y: 350, w: 80, h: 16, dimension: 'BLUE',
        startX: 460, startY: 380, endX: 540, endY: 320,
        speed: 90, waitTime: 0.4,
      },
    ],
    dimensionOrbs: [
      // Orb before wall jump
      { x: 620, y: 250, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
      // Orb in final section
      { x: 1050, y: 200, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
    ],
    portal: { x: 1180, y: 40, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 28, silver: 40, bronze: 60 },
  },

  // === LEVEL 9: "TORRE DE ASCENSO" — Vertical map with checkpoints & lasers ===
  {
    name: 'Torre de Ascenso',
    spawnX: 600,
    spawnY: 2300,
    worldWidth: 1280,
    worldHeight: 2400,
    platforms: [
      // Start platform
      { x: 500, y: 2350, w: 280, h: 20, dimension: 'BOTH' },
      // Section 1 — climb up
      { x: 400, y: 2200, w: 120, h: 16, dimension: 'BLUE' },
      { x: 700, y: 2100, w: 120, h: 16, dimension: 'RED' },
      { x: 400, y: 2000, w: 120, h: 16, dimension: 'BLUE' },
      { x: 700, y: 1900, w: 120, h: 16, dimension: 'RED' },
      // Checkpoint 1 platform
      { x: 300, y: 1750, w: 200, h: 20, dimension: 'BOTH' },
      // Section 2 — tighter climb
      { x: 200, y: 1600, w: 100, h: 16, dimension: 'RED' },
      { x: 900, y: 1500, w: 100, h: 16, dimension: 'BLUE' },
      { x: 200, y: 1400, w: 100, h: 16, dimension: 'BLUE' },
      { x: 900, y: 1300, w: 100, h: 16, dimension: 'RED' },
      // Checkpoint 2 platform
      { x: 500, y: 1150, w: 200, h: 20, dimension: 'BOTH' },
      // Section 3 — wall jump shaft
      { x: 300, y: 800, w: 16, h: 300, dimension: 'BOTH' },
      { x: 960, y: 800, w: 16, h: 300, dimension: 'BOTH' },
      { x: 300, y: 780, w: 680, h: 16, dimension: 'BOTH' },
      // Section 4 — final climb
      { x: 200, y: 650, w: 100, h: 16, dimension: 'RED' },
      { x: 900, y: 550, w: 100, h: 16, dimension: 'BLUE' },
      { x: 200, y: 450, w: 100, h: 16, dimension: 'BLUE' },
      { x: 900, y: 350, w: 100, h: 16, dimension: 'RED' },
      // Top platform
      { x: 500, y: 200, w: 280, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 2400, dimension: 'BOTH' },
      { x: 1264, y: 0, w: 16, h: 2400, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 300, y: 2360, w: 200, h: 10, dimension: 'BOTH' },
      { x: 100, y: 1760, w: 200, h: 10, dimension: 'BOTH' },
      { x: 900, y: 1160, w: 200, h: 10, dimension: 'BOTH' },
    ],
    checkpoints: [
      { x: 350, y: 1730, w: 40, h: 20, dimension: 'BOTH' },
      { x: 550, y: 1130, w: 40, h: 20, dimension: 'BOTH' },
    ],
    lasers: [
      // Horizontal laser between sections
      { x1: 100, y1: 1850, x2: 1180, y2: 1850, dimension: 'BOTH', cycleTime: 4, onTime: 2, warnTime: 0.5 },
      { x1: 100, y1: 1250, x2: 1180, y2: 1250, dimension: 'BOTH', cycleTime: 3.5, onTime: 1.5, warnTime: 0.5 },
      { x1: 100, y1: 700, x2: 1180, y2: 700, dimension: 'BOTH', cycleTime: 3, onTime: 1.5, warnTime: 0.5 },
    ],
    portal: { x: 620, y: 160, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 35, silver: 50, bronze: 75 },
  },

  // === LEVEL 10: "FUEGO CRUZADO" — Horizontal map with turrets ===
  {
    name: 'Fuego Cruzado',
    spawnX: 50,
    spawnY: 800,
    worldWidth: 2800,
    worldHeight: 900,
    platforms: [
      // Start
      { x: 0, y: 850, w: 200, h: 20, dimension: 'BOTH' },
      // Section 1 — dodge turret fire
      { x: 300, y: 750, w: 120, h: 16, dimension: 'BLUE' },
      { x: 500, y: 650, w: 120, h: 16, dimension: 'RED' },
      { x: 700, y: 750, w: 120, h: 16, dimension: 'BOTH' },
      // Section 2 — crossfire
      { x: 900, y: 600, w: 100, h: 16, dimension: 'RED' },
      { x: 1100, y: 500, w: 100, h: 16, dimension: 'BLUE' },
      { x: 1300, y: 600, w: 100, h: 16, dimension: 'RED' },
      { x: 1500, y: 700, w: 150, h: 20, dimension: 'BOTH' },
      // Section 3 — intense crossfire
      { x: 1700, y: 600, w: 80, h: 16, dimension: 'BLUE' },
      { x: 1850, y: 500, w: 80, h: 16, dimension: 'RED' },
      { x: 2000, y: 600, w: 80, h: 16, dimension: 'BLUE' },
      { x: 2150, y: 700, w: 120, h: 16, dimension: 'BOTH' },
      // Section 4 — final stretch
      { x: 2350, y: 600, w: 100, h: 16, dimension: 'RED' },
      { x: 2500, y: 500, w: 100, h: 16, dimension: 'BLUE' },
      // End
      { x: 2650, y: 600, w: 150, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 900, dimension: 'BOTH' },
      { x: 2784, y: 0, w: 16, h: 900, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 860, w: 100, h: 10, dimension: 'BOTH' },
      { x: 800, y: 860, w: 100, h: 10, dimension: 'BOTH' },
      { x: 1600, y: 860, w: 100, h: 10, dimension: 'BOTH' },
      { x: 2200, y: 860, w: 150, h: 10, dimension: 'BOTH' },
    ],
    turrets: [
      // Turrets firing at player path
      { x: 400, y: 800, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 250, projectileDimension: 'BLUE' },
      { x: 600, y: 800, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 1.8, projectileSpeed: 280, projectileDimension: 'RED' },
      { x: 1000, y: 400, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 1, y: 0 }, fireInterval: 2.5, projectileSpeed: 300, projectileDimension: 'BLUE' },
      { x: 1400, y: 400, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: -1, y: 0 }, fireInterval: 2.5, projectileSpeed: 300, projectileDimension: 'RED' },
      { x: 1900, y: 350, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: 1 }, fireInterval: 2, projectileSpeed: 260, projectileDimension: 'BLUE' },
      { x: 2100, y: 350, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: 1 }, fireInterval: 2, projectileSpeed: 260, projectileDimension: 'RED' },
      { x: 2400, y: 800, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 1.5, projectileSpeed: 320, projectileDimension: 'BLUE' },
    ],
    portal: { x: 2700, y: 560, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 40, silver: 55, bronze: 80 },
  },

  // === LEVEL 11: "CAÍDA LIBRE" — Vertical descent with lasers & orbs ===
  {
    name: 'Caída Libre',
    spawnX: 600,
    spawnY: 50,
    worldWidth: 1280,
    worldHeight: 2600,
    platforms: [
      // Start at top
      { x: 500, y: 100, w: 280, h: 20, dimension: 'BOTH' },
      // Section 1 — controlled descent
      { x: 300, y: 250, w: 120, h: 16, dimension: 'BLUE' },
      { x: 800, y: 350, w: 120, h: 16, dimension: 'RED' },
      { x: 300, y: 450, w: 120, h: 16, dimension: 'RED' },
      { x: 800, y: 550, w: 120, h: 16, dimension: 'BLUE' },
      // Orb section — use orbs to slow down
      { x: 200, y: 700, w: 100, h: 16, dimension: 'BOTH' },
      { x: 900, y: 800, w: 100, h: 16, dimension: 'BOTH' },
      // Section 2 — laser gauntlet
      { x: 400, y: 950, w: 120, h: 16, dimension: 'BLUE' },
      { x: 700, y: 1050, w: 120, h: 16, dimension: 'RED' },
      { x: 400, y: 1150, w: 120, h: 16, dimension: 'RED' },
      { x: 700, y: 1250, w: 120, h: 16, dimension: 'BLUE' },
      // Mid checkpoint
      { x: 500, y: 1400, w: 200, h: 20, dimension: 'BOTH' },
      // Section 3 — intense descent
      { x: 200, y: 1550, w: 100, h: 16, dimension: 'BLUE' },
      { x: 900, y: 1650, w: 100, h: 16, dimension: 'RED' },
      { x: 200, y: 1750, w: 100, h: 16, dimension: 'RED' },
      { x: 900, y: 1850, w: 100, h: 16, dimension: 'BLUE' },
      // Section 4 — final drop
      { x: 400, y: 2000, w: 120, h: 16, dimension: 'BOTH' },
      { x: 700, y: 2100, w: 120, h: 16, dimension: 'BOTH' },
      // Wall jump descent
      { x: 300, y: 2200, w: 16, h: 200, dimension: 'BOTH' },
      { x: 960, y: 2200, w: 16, h: 200, dimension: 'BOTH' },
      // Bottom
      { x: 500, y: 2500, w: 280, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 2600, dimension: 'BOTH' },
      { x: 1264, y: 0, w: 16, h: 2600, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 100, y: 2510, w: 400, h: 10, dimension: 'BOTH' },
      { x: 780, y: 2510, w: 400, h: 10, dimension: 'BOTH' },
    ],
    checkpoints: [
      { x: 550, y: 1380, w: 40, h: 20, dimension: 'BOTH' },
    ],
    lasers: [
      // Vertical lasers blocking descent
      { x1: 600, y1: 600, x2: 600, y2: 750, dimension: 'BOTH', cycleTime: 3, onTime: 1.5, warnTime: 0.5 },
      { x1: 600, y1: 900, x2: 600, y2: 1100, dimension: 'BOTH', cycleTime: 3.5, onTime: 2, warnTime: 0.5 },
      { x1: 600, y1: 1500, x2: 600, y2: 1700, dimension: 'BOTH', cycleTime: 3, onTime: 1.5, warnTime: 0.5 },
      { x1: 200, y1: 1950, x2: 1080, y2: 1950, dimension: 'BOTH', cycleTime: 4, onTime: 2, warnTime: 0.5 },
    ],
    dimensionOrbs: [
      // Orbs to help with descent
      { x: 550, y: 600, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
      { x: 600, y: 1300, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
      { x: 550, y: 1900, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
    ],
    portal: { x: 620, y: 2460, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 38, silver: 55, bronze: 80 },
  },

  // === LEVEL 12: "SÍNTESIS" — Long final level combining everything ===
  {
    name: 'Síntesis',
    spawnX: 50,
    spawnY: 1100,
    worldWidth: 3400,
    worldHeight: 1200,
    platforms: [
      // Start
      { x: 0, y: 1150, w: 200, h: 20, dimension: 'BOTH' },
      // Section 1 — warm up
      { x: 300, y: 1050, w: 120, h: 16, dimension: 'BLUE' },
      { x: 500, y: 950, w: 120, h: 16, dimension: 'RED' },
      { x: 700, y: 1050, w: 120, h: 16, dimension: 'BOTH' },
      // Section 2 — moving platforms
      { x: 950, y: 900, w: 100, h: 16, dimension: 'BLUE' },
      { x: 1150, y: 800, w: 100, h: 16, dimension: 'RED' },
      // Checkpoint 1
      { x: 1350, y: 900, w: 150, h: 20, dimension: 'BOTH' },
      // Section 3 — turret gauntlet
      { x: 1550, y: 750, w: 80, h: 16, dimension: 'RED' },
      { x: 1700, y: 650, w: 80, h: 16, dimension: 'BLUE' },
      { x: 1850, y: 750, w: 80, h: 16, dimension: 'RED' },
      { x: 2000, y: 850, w: 120, h: 16, dimension: 'BOTH' },
      // Section 4 — laser + orb combo
      { x: 2200, y: 700, w: 100, h: 16, dimension: 'BLUE' },
      { x: 2400, y: 600, w: 100, h: 16, dimension: 'RED' },
      // Checkpoint 2
      { x: 2600, y: 700, w: 150, h: 20, dimension: 'BOTH' },
      // Section 5 — wall jump finale
      { x: 2800, y: 400, w: 16, h: 400, dimension: 'BOTH' },
      { x: 2950, y: 400, w: 16, h: 400, dimension: 'BOTH' },
      { x: 2800, y: 380, w: 170, h: 16, dimension: 'BOTH' },
      // Final stretch
      { x: 3050, y: 500, w: 100, h: 16, dimension: 'BLUE' },
      { x: 3200, y: 400, w: 100, h: 16, dimension: 'RED' },
      // End
      { x: 3300, y: 500, w: 100, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 1200, dimension: 'BOTH' },
      { x: 3384, y: 0, w: 16, h: 1200, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 1160, w: 100, h: 10, dimension: 'BOTH' },
      { x: 800, y: 1160, w: 150, h: 10, dimension: 'BOTH' },
      { x: 2100, y: 1160, w: 100, h: 10, dimension: 'BOTH' },
      { x: 2700, y: 1160, w: 100, h: 10, dimension: 'BOTH' },
    ],
    checkpoints: [
      { x: 1380, y: 880, w: 40, h: 20, dimension: 'BOTH' },
      { x: 2630, y: 680, w: 40, h: 20, dimension: 'BOTH' },
    ],
    movingPlatforms: [
      {
        x: 950, y: 900, w: 100, h: 16, dimension: 'BLUE',
        startX: 900, startY: 950, endX: 1000, endY: 850,
        speed: 100, waitTime: 0.5,
      },
    ],
    lasers: [
      { x1: 2300, y1: 500, x2: 2300, y2: 800, dimension: 'BOTH', cycleTime: 3, onTime: 1.5, warnTime: 0.5 },
      { x1: 2500, y1: 400, x2: 2500, y2: 700, dimension: 'BOTH', cycleTime: 3.5, onTime: 2, warnTime: 0.5 },
    ],
    turrets: [
      { x: 1600, y: 900, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 280, projectileDimension: 'BLUE' },
      { x: 1900, y: 900, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 280, projectileDimension: 'RED' },
    ],
    dimensionOrbs: [
      { x: 2100, y: 600, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
      { x: 2500, y: 500, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
    ],
    portal: { x: 3320, y: 460, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 55, silver: 75, bronze: 110 },
  },

  // === LEVEL 13: "SUELO FRÁGIL" — Introduction to FragileBlocks ===
  {
    name: 'Suelo Frágil',
    spawnX: 50,
    spawnY: 600,
    worldWidth: 1280,
    worldHeight: 720,
    platforms: [
      { x: 0, y: 650, w: 150, h: 20, dimension: 'BOTH' },
      { x: 300, y: 550, w: 100, h: 16, dimension: 'BLUE' },
      { x: 500, y: 450, w: 100, h: 16, dimension: 'RED' },
      { x: 700, y: 550, w: 100, h: 16, dimension: 'BOTH' },
      { x: 900, y: 450, w: 100, h: 16, dimension: 'BLUE' },
      { x: 1100, y: 350, w: 150, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: 1264, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 150, y: 660, w: 1130, h: 10, dimension: 'BOTH' },
    ],
    fragileBlocks: [
      { x: 200, y: 600, w: 80, h: 16, dimension: 'BLUE' },
      { x: 400, y: 500, w: 80, h: 16, dimension: 'RED' },
      { x: 600, y: 400, w: 80, h: 16, dimension: 'BLUE' },
      { x: 800, y: 500, w: 80, h: 16, dimension: 'RED' },
      { x: 1000, y: 400, w: 80, h: 16, dimension: 'BLUE' },
    ],
    portal: { x: 1150, y: 310, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 15, silver: 22, bronze: 35 },
  },

  // === LEVEL 14: "PUENTE DE CRISTAL" — FragileBlocks + dimension shifts ===
  {
    name: 'Puente de Cristal',
    spawnX: 50,
    spawnY: 600,
    worldWidth: 1600,
    worldHeight: 720,
    platforms: [
      { x: 0, y: 650, w: 150, h: 20, dimension: 'BOTH' },
      { x: 400, y: 500, w: 100, h: 16, dimension: 'BOTH' },
      { x: 800, y: 400, w: 100, h: 16, dimension: 'BOTH' },
      { x: 1200, y: 300, w: 100, h: 16, dimension: 'BOTH' },
      { x: 1450, y: 250, w: 150, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: 1584, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 150, y: 660, w: 1434, h: 10, dimension: 'BOTH' },
    ],
    fragileBlocks: [
      // Chain of fragile blocks requiring quick dimension shifts
      { x: 180, y: 580, w: 60, h: 16, dimension: 'BLUE' },
      { x: 260, y: 520, w: 60, h: 16, dimension: 'RED' },
      { x: 340, y: 460, w: 60, h: 16, dimension: 'BLUE' },
      { x: 520, y: 440, w: 60, h: 16, dimension: 'RED' },
      { x: 600, y: 380, w: 60, h: 16, dimension: 'BLUE' },
      { x: 680, y: 320, w: 60, h: 16, dimension: 'RED' },
      { x: 920, y: 340, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1000, y: 280, w: 60, h: 16, dimension: 'RED' },
      { x: 1080, y: 220, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1320, y: 240, w: 60, h: 16, dimension: 'RED' },
    ],
    portal: { x: 1500, y: 210, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 18, silver: 28, bronze: 45 },
  },

  // === LEVEL 15: "CRISTAL CAOS" — FragileBlocks + wall-jump + air-dash ===
  {
    name: 'Cristal Caos',
    spawnX: 50,
    spawnY: 600,
    worldWidth: 1280,
    worldHeight: 900,
    platforms: [
      { x: 0, y: 850, w: 150, h: 20, dimension: 'BOTH' },
      { x: 300, y: 700, w: 80, h: 16, dimension: 'BOTH' },
      { x: 900, y: 600, w: 80, h: 16, dimension: 'BOTH' },
      { x: 300, y: 400, w: 80, h: 16, dimension: 'BOTH' },
      { x: 900, y: 300, w: 80, h: 16, dimension: 'BOTH' },
      { x: 500, y: 150, w: 280, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 900, dimension: 'BOTH' },
      { x: 1264, y: 0, w: 16, h: 900, dimension: 'BOTH' },
      { x: 200, y: 200, w: 16, h: 400, dimension: 'BOTH' },
      { x: 1060, y: 100, w: 16, h: 500, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 150, y: 860, w: 1130, h: 10, dimension: 'BOTH' },
    ],
    fragileBlocks: [
      { x: 180, y: 750, w: 60, h: 16, dimension: 'BLUE' },
      { x: 400, y: 650, w: 60, h: 16, dimension: 'RED' },
      { x: 600, y: 550, w: 60, h: 16, dimension: 'BLUE' },
      { x: 800, y: 450, w: 60, h: 16, dimension: 'RED' },
      { x: 500, y: 350, w: 60, h: 16, dimension: 'BLUE' },
      { x: 300, y: 250, w: 60, h: 16, dimension: 'RED' },
      { x: 700, y: 200, w: 60, h: 16, dimension: 'BLUE' },
    ],
    portal: { x: 620, y: 110, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 22, silver: 32, bronze: 50 },
  },

  // === LEVEL 16: "GRAVEDAD INVERTIDA" — Introduction to GravityZone ===
  {
    name: 'Gravedad Invertida',
    spawnX: 50,
    spawnY: 600,
    worldWidth: 1280,
    worldHeight: 720,
    platforms: [
      { x: 0, y: 650, w: 200, h: 20, dimension: 'BOTH' },
      { x: 0, y: 50, w: 200, h: 20, dimension: 'BOTH' }, // ceiling platform
      { x: 400, y: 650, w: 120, h: 16, dimension: 'BOTH' },
      { x: 400, y: 50, w: 120, h: 16, dimension: 'BOTH' },
      { x: 800, y: 650, w: 120, h: 16, dimension: 'BOTH' },
      { x: 800, y: 50, w: 120, h: 16, dimension: 'BOTH' },
      { x: 1100, y: 300, w: 150, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: 1264, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 660, w: 900, h: 10, dimension: 'BOTH' },
      { x: 200, y: 40, w: 900, h: 10, dimension: 'BOTH' },
    ],
    gravityZones: [
      // Zone that inverts gravity in the middle
      { x: 300, y: 100, w: 200, h: 520, dimension: 'BOTH' },
      { x: 700, y: 100, w: 200, h: 520, dimension: 'BOTH' },
    ],
    portal: { x: 1150, y: 260, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 20, silver: 30, bronze: 45 },
  },

  // === LEVEL 17: "TECHO MORTAL" — GravityZone + spikes on ceiling ===
  {
    name: 'Techo Mortal',
    spawnX: 50,
    spawnY: 600,
    worldWidth: 1600,
    worldHeight: 720,
    platforms: [
      { x: 0, y: 650, w: 200, h: 20, dimension: 'BOTH' },
      { x: 0, y: 50, w: 200, h: 20, dimension: 'BOTH' },
      { x: 400, y: 50, w: 150, h: 16, dimension: 'BLUE' },
      { x: 650, y: 50, w: 150, h: 16, dimension: 'RED' },
      { x: 900, y: 50, w: 150, h: 16, dimension: 'BLUE' },
      { x: 1150, y: 50, w: 150, h: 16, dimension: 'RED' },
      { x: 1400, y: 300, w: 200, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: 1584, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 660, w: 1384, h: 10, dimension: 'BOTH' },
      // Ceiling spikes — only dangerous when gravity is inverted
      { x: 400, y: 40, w: 100, h: 10, dimension: 'BOTH' },
      { x: 700, y: 40, w: 100, h: 10, dimension: 'BOTH' },
      { x: 1000, y: 40, w: 100, h: 10, dimension: 'BOTH' },
    ],
    gravityZones: [
      { x: 250, y: 80, w: 1300, h: 560, dimension: 'BOTH' },
    ],
    portal: { x: 1480, y: 260, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 25, silver: 38, bronze: 55 },
  },

  // === LEVEL 18: "FLIP FLOP" — GravityZone + air-dash + dimension shifts ===
  {
    name: 'Flip Flop',
    spawnX: 50,
    spawnY: 600,
    worldWidth: 1280,
    worldHeight: 900,
    platforms: [
      { x: 0, y: 850, w: 200, h: 20, dimension: 'BOTH' },
      { x: 0, y: 50, w: 200, h: 20, dimension: 'BOTH' },
      { x: 300, y: 700, w: 100, h: 16, dimension: 'BLUE' },
      { x: 300, y: 120, w: 100, h: 16, dimension: 'RED' },
      { x: 600, y: 500, w: 100, h: 16, dimension: 'RED' },
      { x: 600, y: 320, w: 100, h: 16, dimension: 'BLUE' },
      { x: 900, y: 700, w: 100, h: 16, dimension: 'BLUE' },
      { x: 900, y: 120, w: 100, h: 16, dimension: 'RED' },
      { x: 1100, y: 400, w: 150, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 900, dimension: 'BOTH' },
      { x: 1264, y: 0, w: 16, h: 900, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 860, w: 1064, h: 10, dimension: 'BOTH' },
      { x: 200, y: 40, w: 1064, h: 10, dimension: 'BOTH' },
    ],
    gravityZones: [
      { x: 250, y: 100, w: 200, h: 700, dimension: 'BOTH' },
      { x: 550, y: 100, w: 200, h: 700, dimension: 'BOTH' },
      { x: 850, y: 100, w: 200, h: 700, dimension: 'BOTH' },
    ],
    dimensionOrbs: [
      { x: 450, y: 450, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
      { x: 750, y: 450, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
    ],
    portal: { x: 1150, y: 360, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 28, silver: 42, bronze: 60 },
  },

  // === LEVEL 19: "VERTICAL MIX" — GravityZone + FragileBlock + Checkpoints ===
  {
    name: 'Vertical Mix',
    spawnX: 600,
    spawnY: 2100,
    worldWidth: 1280,
    worldHeight: 2200,
    platforms: [
      { x: 500, y: 2150, w: 280, h: 20, dimension: 'BOTH' },
      { x: 300, y: 1950, w: 120, h: 16, dimension: 'BLUE' },
      { x: 800, y: 1800, w: 120, h: 16, dimension: 'RED' },
      { x: 300, y: 1600, w: 120, h: 16, dimension: 'BOTH' },
      // Checkpoint 1
      { x: 500, y: 1400, w: 200, h: 20, dimension: 'BOTH' },
      { x: 800, y: 1200, w: 120, h: 16, dimension: 'BLUE' },
      { x: 300, y: 1000, w: 120, h: 16, dimension: 'RED' },
      { x: 800, y: 800, w: 120, h: 16, dimension: 'BOTH' },
      // Checkpoint 2
      { x: 500, y: 600, w: 200, h: 20, dimension: 'BOTH' },
      { x: 300, y: 400, w: 120, h: 16, dimension: 'RED' },
      { x: 800, y: 250, w: 120, h: 16, dimension: 'BLUE' },
      { x: 500, y: 100, w: 280, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 2200, dimension: 'BOTH' },
      { x: 1264, y: 0, w: 16, h: 2200, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 100, y: 2160, w: 400, h: 10, dimension: 'BOTH' },
      { x: 780, y: 2160, w: 400, h: 10, dimension: 'BOTH' },
    ],
    checkpoints: [
      { x: 550, y: 1380, w: 40, h: 20, dimension: 'BOTH' },
      { x: 550, y: 580, w: 40, h: 20, dimension: 'BOTH' },
    ],
    gravityZones: [
      { x: 200, y: 1200, w: 880, h: 200, dimension: 'BOTH' },
      { x: 200, y: 400, w: 880, h: 200, dimension: 'BOTH' },
    ],
    fragileBlocks: [
      { x: 500, y: 1850, w: 80, h: 16, dimension: 'BLUE' },
      { x: 600, y: 1500, w: 80, h: 16, dimension: 'RED' },
      { x: 500, y: 1100, w: 80, h: 16, dimension: 'BLUE' },
      { x: 600, y: 700, w: 80, h: 16, dimension: 'RED' },
      { x: 500, y: 300, w: 80, h: 16, dimension: 'BLUE' },
    ],
    bouncePads: [
      { x: 600, y: 580, w: 40, h: 16, dimension: 'BOTH', bounceForce: 600 },
    ],
    portal: { x: 620, y: 60, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 35, silver: 50, bronze: 75 },
  },

  // === LEVEL 20: "CAÍDA INVERTIDA" — Vertical descent with gravity flips ===
  {
    name: 'Caída Invertida',
    spawnX: 600,
    spawnY: 50,
    worldWidth: 1280,
    worldHeight: 2200,
    platforms: [
      { x: 500, y: 100, w: 280, h: 20, dimension: 'BOTH' },
      { x: 300, y: 300, w: 120, h: 16, dimension: 'BLUE' },
      { x: 800, y: 400, w: 120, h: 16, dimension: 'RED' },
      { x: 300, y: 550, w: 120, h: 16, dimension: 'BOTH' },
      // Checkpoint 1
      { x: 500, y: 700, w: 200, h: 20, dimension: 'BOTH' },
      { x: 800, y: 900, w: 120, h: 16, dimension: 'RED' },
      { x: 300, y: 1050, w: 120, h: 16, dimension: 'BLUE' },
      { x: 800, y: 1200, w: 120, h: 16, dimension: 'BOTH' },
      // Checkpoint 2
      { x: 500, y: 1400, w: 200, h: 20, dimension: 'BOTH' },
      { x: 300, y: 1600, w: 120, h: 16, dimension: 'BLUE' },
      { x: 800, y: 1750, w: 120, h: 16, dimension: 'RED' },
      { x: 500, y: 1950, w: 280, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 2200, dimension: 'BOTH' },
      { x: 1264, y: 0, w: 16, h: 2200, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 100, y: 1960, w: 400, h: 10, dimension: 'BOTH' },
      { x: 780, y: 1960, w: 400, h: 10, dimension: 'BOTH' },
    ],
    checkpoints: [
      { x: 550, y: 680, w: 40, h: 20, dimension: 'BOTH' },
      { x: 550, y: 1380, w: 40, h: 20, dimension: 'BOTH' },
    ],
    gravityZones: [
      { x: 200, y: 600, w: 880, h: 150, dimension: 'BOTH' },
      { x: 200, y: 1300, w: 880, h: 150, dimension: 'BOTH' },
    ],
    fragileBlocks: [
      { x: 500, y: 450, w: 80, h: 16, dimension: 'RED' },
      { x: 600, y: 950, w: 80, h: 16, dimension: 'BLUE' },
      { x: 500, y: 1500, w: 80, h: 16, dimension: 'RED' },
      { x: 600, y: 1800, w: 80, h: 16, dimension: 'BLUE' },
    ],
    portal: { x: 620, y: 1910, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 32, silver: 48, bronze: 70 },
  },

  // === LEVEL 21: "LABERINTO INVERSO" — Large level combining everything ===
  {
    name: 'Laberinto Inverso',
    spawnX: 50,
    spawnY: 1100,
    worldWidth: 2400,
    worldHeight: 1200,
    platforms: [
      { x: 0, y: 1150, w: 200, h: 20, dimension: 'BOTH' },
      { x: 300, y: 1000, w: 100, h: 16, dimension: 'BLUE' },
      { x: 500, y: 850, w: 100, h: 16, dimension: 'RED' },
      { x: 700, y: 1000, w: 100, h: 16, dimension: 'BOTH' },
      // Checkpoint 1
      { x: 900, y: 900, w: 150, h: 20, dimension: 'BOTH' },
      { x: 1100, y: 750, w: 100, h: 16, dimension: 'RED' },
      { x: 1300, y: 600, w: 100, h: 16, dimension: 'BLUE' },
      { x: 1500, y: 750, w: 100, h: 16, dimension: 'BOTH' },
      // Checkpoint 2
      { x: 1700, y: 600, w: 150, h: 20, dimension: 'BOTH' },
      { x: 1900, y: 450, w: 100, h: 16, dimension: 'RED' },
      { x: 2100, y: 300, w: 100, h: 16, dimension: 'BLUE' },
      { x: 2250, y: 400, w: 150, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 1200, dimension: 'BOTH' },
      { x: 2384, y: 0, w: 16, h: 1200, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 1160, w: 2200, h: 10, dimension: 'BOTH' },
    ],
    checkpoints: [
      { x: 930, y: 880, w: 40, h: 20, dimension: 'BOTH' },
      { x: 1730, y: 580, w: 40, h: 20, dimension: 'BOTH' },
    ],
    gravityZones: [
      { x: 800, y: 200, w: 300, h: 900, dimension: 'BOTH' },
      { x: 1600, y: 200, w: 300, h: 900, dimension: 'BOTH' },
    ],
    fragileBlocks: [
      { x: 400, y: 900, w: 60, h: 16, dimension: 'BLUE' },
      { x: 600, y: 750, w: 60, h: 16, dimension: 'RED' },
      { x: 1000, y: 650, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1200, y: 500, w: 60, h: 16, dimension: 'RED' },
      { x: 1400, y: 650, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1800, y: 500, w: 60, h: 16, dimension: 'RED' },
      { x: 2000, y: 350, w: 60, h: 16, dimension: 'BLUE' },
    ],
    bouncePads: [
      { x: 1550, y: 730, w: 40, h: 16, dimension: 'BOTH', bounceForce: 600 },
    ],
    portal: { x: 2300, y: 360, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 40, silver: 58, bronze: 85 },
  },

  // === LEVEL 22: "RITMO LETAL" — Cap. 3: Fast-paced with turrets + fragile ===
  {
    name: 'Ritmo Letal',
    spawnX: 50,
    spawnY: 600,
    worldWidth: 2000,
    worldHeight: 720,
    platforms: [
      { x: 0, y: 650, w: 150, h: 20, dimension: 'BOTH' },
      { x: 300, y: 550, w: 100, h: 16, dimension: 'BLUE' },
      { x: 500, y: 450, w: 100, h: 16, dimension: 'RED' },
      { x: 700, y: 550, w: 100, h: 16, dimension: 'BOTH' },
      { x: 900, y: 450, w: 100, h: 16, dimension: 'BLUE' },
      { x: 1100, y: 550, w: 100, h: 16, dimension: 'RED' },
      { x: 1300, y: 450, w: 100, h: 16, dimension: 'BOTH' },
      { x: 1500, y: 350, w: 100, h: 16, dimension: 'BLUE' },
      { x: 1700, y: 250, w: 100, h: 16, dimension: 'RED' },
      { x: 1850, y: 350, w: 150, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 720, dimension: 'BOTH' },
      { x: 1984, y: 0, w: 16, h: 720, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 150, y: 660, w: 1834, h: 10, dimension: 'BOTH' },
    ],
    fragileBlocks: [
      { x: 200, y: 580, w: 60, h: 16, dimension: 'RED' },
      { x: 400, y: 480, w: 60, h: 16, dimension: 'BLUE' },
      { x: 600, y: 580, w: 60, h: 16, dimension: 'RED' },
      { x: 800, y: 480, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1000, y: 580, w: 60, h: 16, dimension: 'RED' },
      { x: 1200, y: 480, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1400, y: 380, w: 60, h: 16, dimension: 'RED' },
      { x: 1600, y: 280, w: 60, h: 16, dimension: 'BLUE' },
    ],
    turrets: [
      { x: 350, y: 680, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 260, projectileDimension: 'BLUE' },
      { x: 750, y: 680, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 1.8, projectileSpeed: 280, projectileDimension: 'RED' },
      { x: 1150, y: 680, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 260, projectileDimension: 'BLUE' },
      { x: 1550, y: 680, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 1.5, projectileSpeed: 300, projectileDimension: 'RED' },
    ],
    portal: { x: 1900, y: 310, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 30, silver: 45, bronze: 65 },
  },

  // === LEVEL 23: "FUEGO Y CRISTAL" — Turrets + lasers + fragile blocks ===
  {
    name: 'Fuego y Cristal',
    spawnX: 50,
    spawnY: 600,
    worldWidth: 2400,
    worldHeight: 900,
    platforms: [
      { x: 0, y: 850, w: 150, h: 20, dimension: 'BOTH' },
      { x: 300, y: 700, w: 100, h: 16, dimension: 'BLUE' },
      { x: 500, y: 550, w: 100, h: 16, dimension: 'RED' },
      { x: 700, y: 700, w: 100, h: 16, dimension: 'BOTH' },
      // Checkpoint
      { x: 900, y: 600, w: 150, h: 20, dimension: 'BOTH' },
      { x: 1100, y: 450, w: 100, h: 16, dimension: 'RED' },
      { x: 1300, y: 300, w: 100, h: 16, dimension: 'BLUE' },
      { x: 1500, y: 450, w: 100, h: 16, dimension: 'BOTH' },
      { x: 1700, y: 300, w: 100, h: 16, dimension: 'RED' },
      { x: 1900, y: 450, w: 100, h: 16, dimension: 'BLUE' },
      { x: 2100, y: 300, w: 100, h: 16, dimension: 'BOTH' },
      { x: 2250, y: 400, w: 150, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 900, dimension: 'BOTH' },
      { x: 2384, y: 0, w: 16, h: 900, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 150, y: 860, w: 2234, h: 10, dimension: 'BOTH' },
    ],
    checkpoints: [
      { x: 930, y: 580, w: 40, h: 20, dimension: 'BOTH' },
    ],
    fragileBlocks: [
      { x: 200, y: 650, w: 60, h: 16, dimension: 'BLUE' },
      { x: 400, y: 500, w: 60, h: 16, dimension: 'RED' },
      { x: 600, y: 650, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1000, y: 400, w: 60, h: 16, dimension: 'RED' },
      { x: 1200, y: 250, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1400, y: 400, w: 60, h: 16, dimension: 'RED' },
      { x: 1600, y: 250, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1800, y: 400, w: 60, h: 16, dimension: 'RED' },
      { x: 2000, y: 250, w: 60, h: 16, dimension: 'BLUE' },
    ],
    lasers: [
      { x1: 800, y1: 200, x2: 800, y2: 700, dimension: 'BOTH', cycleTime: 3, onTime: 1.5, warnTime: 0.5 },
      { x1: 1400, y1: 200, x2: 1400, y2: 700, dimension: 'BOTH', cycleTime: 3.5, onTime: 2, warnTime: 0.5 },
      { x1: 1800, y1: 200, x2: 1800, y2: 700, dimension: 'BOTH', cycleTime: 3, onTime: 1.5, warnTime: 0.5 },
    ],
    turrets: [
      { x: 400, y: 800, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 260, projectileDimension: 'BLUE' },
      { x: 1000, y: 800, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 260, projectileDimension: 'RED' },
      { x: 1600, y: 800, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 1.8, projectileSpeed: 280, projectileDimension: 'BLUE' },
    ],
    portal: { x: 2300, y: 360, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 42, silver: 60, bronze: 90 },
  },

  // === LEVEL 24: "SOBRECARGA TOTAL" — Cap. 3 finale: everything combined ===
  {
    name: 'Sobrecarga Total',
    spawnX: 50,
    spawnY: 1100,
    worldWidth: 3000,
    worldHeight: 1200,
    platforms: [
      { x: 0, y: 1150, w: 200, h: 20, dimension: 'BOTH' },
      { x: 300, y: 1000, w: 100, h: 16, dimension: 'BLUE' },
      { x: 500, y: 850, w: 100, h: 16, dimension: 'RED' },
      { x: 700, y: 1000, w: 100, h: 16, dimension: 'BOTH' },
      // Checkpoint 1
      { x: 900, y: 900, w: 150, h: 20, dimension: 'BOTH' },
      { x: 1100, y: 750, w: 100, h: 16, dimension: 'RED' },
      { x: 1300, y: 600, w: 100, h: 16, dimension: 'BLUE' },
      { x: 1500, y: 750, w: 100, h: 16, dimension: 'BOTH' },
      // Checkpoint 2
      { x: 1700, y: 600, w: 150, h: 20, dimension: 'BOTH' },
      { x: 1900, y: 450, w: 100, h: 16, dimension: 'RED' },
      { x: 2100, y: 300, w: 100, h: 16, dimension: 'BLUE' },
      { x: 2300, y: 450, w: 100, h: 16, dimension: 'BOTH' },
      // Checkpoint 3
      { x: 2500, y: 300, w: 150, h: 20, dimension: 'BOTH' },
      { x: 2700, y: 400, w: 100, h: 16, dimension: 'RED' },
      { x: 2850, y: 300, w: 150, h: 20, dimension: 'BOTH' },
    ],
    walls: [
      { x: 0, y: 0, w: 16, h: 1200, dimension: 'BOTH' },
      { x: 2984, y: 0, w: 16, h: 1200, dimension: 'BOTH' },
    ],
    spikes: [
      { x: 200, y: 1160, w: 2800, h: 10, dimension: 'BOTH' },
    ],
    checkpoints: [
      { x: 930, y: 880, w: 40, h: 20, dimension: 'BOTH' },
      { x: 1730, y: 580, w: 40, h: 20, dimension: 'BOTH' },
      { x: 2530, y: 280, w: 40, h: 20, dimension: 'BOTH' },
    ],
    gravityZones: [
      { x: 1000, y: 200, w: 300, h: 900, dimension: 'BOTH' },
      { x: 2000, y: 200, w: 300, h: 900, dimension: 'BOTH' },
    ],
    fragileBlocks: [
      { x: 400, y: 900, w: 60, h: 16, dimension: 'BLUE' },
      { x: 600, y: 750, w: 60, h: 16, dimension: 'RED' },
      { x: 1000, y: 650, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1200, y: 500, w: 60, h: 16, dimension: 'RED' },
      { x: 1400, y: 650, w: 60, h: 16, dimension: 'BLUE' },
      { x: 1800, y: 500, w: 60, h: 16, dimension: 'RED' },
      { x: 2000, y: 350, w: 60, h: 16, dimension: 'BLUE' },
      { x: 2200, y: 500, w: 60, h: 16, dimension: 'RED' },
      { x: 2400, y: 350, w: 60, h: 16, dimension: 'BLUE' },
      { x: 2600, y: 250, w: 60, h: 16, dimension: 'RED' },
      { x: 2750, y: 350, w: 60, h: 16, dimension: 'BLUE' },
    ],
    lasers: [
      { x1: 800, y1: 200, x2: 800, y2: 1000, dimension: 'BOTH', cycleTime: 3, onTime: 1.5, warnTime: 0.5 },
      { x1: 1600, y1: 200, x2: 1600, y2: 1000, dimension: 'BOTH', cycleTime: 3.5, onTime: 2, warnTime: 0.5 },
      { x1: 2200, y1: 200, x2: 2200, y2: 1000, dimension: 'BOTH', cycleTime: 3, onTime: 1.5, warnTime: 0.5 },
      { x1: 2600, y1: 200, x2: 2600, y2: 1000, dimension: 'BOTH', cycleTime: 2.5, onTime: 1.2, warnTime: 0.5 },
    ],
    turrets: [
      { x: 350, y: 1100, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 260, projectileDimension: 'BLUE' },
      { x: 750, y: 1100, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 1.8, projectileSpeed: 280, projectileDimension: 'RED' },
      { x: 1150, y: 1100, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 260, projectileDimension: 'BLUE' },
      { x: 1550, y: 1100, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 1.5, projectileSpeed: 300, projectileDimension: 'RED' },
      { x: 1950, y: 1100, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 2, projectileSpeed: 260, projectileDimension: 'BLUE' },
      { x: 2350, y: 1100, w: 24, h: 24, dimension: 'BOTH', fireDirection: { x: 0, y: -1 }, fireInterval: 1.5, projectileSpeed: 300, projectileDimension: 'RED' },
    ],
    dimensionOrbs: [
      { x: 1050, y: 500, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
      { x: 2050, y: 200, w: 24, h: 24, dimension: 'BOTH', cooldown: 1.5 },
    ],
    bouncePads: [
      { x: 1550, y: 730, w: 40, h: 16, dimension: 'BOTH', bounceForce: 600 },
    ],
    portal: { x: 2900, y: 260, w: 40, h: 40, dimension: 'BOTH' },
    parTimes: { gold: 55, silver: 75, bronze: 110 },
  },
];

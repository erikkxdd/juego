// Persistent storage using localStorage
// Saves unlocked levels, best times, death counts, ghost replays, and medals

import type { GhostData } from './GhostSystem';
import type { Medal } from '../world/Level';

const STORAGE_KEY = 'swap-shift-save';

// Player skins - unlocked by medal count
export interface Skin {
  id: string;
  name: string;
  description: string;
  unlockRequirement: { gold: number; silver: number; bronze: number }; // medals needed
}

export const ALL_SKINS: Skin[] = [
  {
    id: 'classic',
    name: 'Núcleo Clásico',
    description: 'El estilo original con núcleo brillante.',
    unlockRequirement: { gold: 0, silver: 0, bronze: 0 }, // always unlocked
  },
  {
    id: 'prisma',
    name: 'Prisma Hollow',
    description: 'Contorno hueco con efecto prisma.',
    unlockRequirement: { gold: 0, silver: 1, bronze: 0 }, // 1 silver
  },
  {
    id: 'glitch',
    name: 'Glitch Fantasma',
    description: 'Estilo fantasma con efecto glitch.',
    unlockRequirement: { gold: 1, silver: 0, bronze: 0 }, // 1 gold
  },
  {
    id: 'fire',
    name: 'Estela de Fuego Neón',
    description: 'Estela de partículas de fuego neón.',
    unlockRequirement: { gold: 2, silver: 0, bronze: 0 }, // 2 golds
  },
  {
    id: 'aura',
    name: 'Aura Corona',
    description: 'Corona de aura alrededor del jugador.',
    unlockRequirement: { gold: 3, silver: 0, bronze: 0 }, // 3 golds
  },
];

export interface LevelStats {
  unlocked: boolean;
  bestTime: number | null; // seconds, null if not completed
  deaths: number;
  ghost: GhostData | null; // best run ghost replay
  medal: Medal; // medal earned on best time
}

export interface SaveData {
  levels: Record<number, LevelStats>;
  totalDeaths: number;
  selectedSkin: string;
}

const DEFAULT_STATS: LevelStats = {
  unlocked: false,
  bestTime: null,
  deaths: 0,
  ghost: null,
  medal: null,
};

export class Storage {
  private load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw) as SaveData;
      }
    } catch {
      // Corrupted save — start fresh
    }
    return { levels: {}, totalDeaths: 0, selectedSkin: 'classic' };
  }

  private save(data: SaveData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage full or unavailable — silent fail
    }
  }

  getLevelStats(levelIndex: number): LevelStats {
    const data = this.load();
    return data.levels[levelIndex] ?? { ...DEFAULT_STATS };
  }

  isLevelUnlocked(levelIndex: number): boolean {
    // Level 0 is always unlocked
    if (levelIndex === 0) return true;
    const data = this.load();
    return (data.levels[levelIndex] ?? DEFAULT_STATS).unlocked;
  }

  recordLevelComplete(levelIndex: number, time: number, ghost?: GhostData) {
    const data = this.load();
    const stats = data.levels[levelIndex] ?? { ...DEFAULT_STATS };

    // Unlock this level
    stats.unlocked = true;

    // Update best time and save ghost of best run
    if (stats.bestTime === null || time < stats.bestTime) {
      stats.bestTime = time;
      if (ghost) {
        stats.ghost = ghost;
      }
    }

    data.levels[levelIndex] = stats;

    // Unlock next level
    const nextStats = data.levels[levelIndex + 1] ?? { ...DEFAULT_STATS };
    nextStats.unlocked = true;
    data.levels[levelIndex + 1] = nextStats;

    this.save(data);
  }

  // Calculate medal based on time and par times
  calculateMedal(time: number, gold: number, silver: number, bronze: number): Medal {
    if (time <= gold) return 'GOLD';
    if (time <= silver) return 'SILVER';
    if (time <= bronze) return 'BRONZE';
    return null;
  }

  // Update medal for a level
  updateMedal(levelIndex: number, medal: Medal) {
    const data = this.load();
    const stats = data.levels[levelIndex] ?? { ...DEFAULT_STATS };
    stats.medal = medal;
    data.levels[levelIndex] = stats;
    this.save(data);
  }

  getGhost(levelIndex: number): GhostData | null {
    const data = this.load();
    const stats = data.levels[levelIndex];
    return stats?.ghost ?? null;
  }

  getMedal(levelIndex: number): Medal {
    const data = this.load();
    const stats = data.levels[levelIndex];
    return stats?.medal ?? null;
  }

  recordDeath(levelIndex: number) {
    const data = this.load();
    const stats = data.levels[levelIndex] ?? { ...DEFAULT_STATS };
    stats.deaths += 1;
    data.levels[levelIndex] = stats;
    data.totalDeaths += 1;
    this.save(data);
  }

  getTotalDeaths(): number {
    const data = this.load();
    return data.totalDeaths;
  }

  getAllStats(levelCount: number): LevelStats[] {
    const data = this.load();
    const stats: LevelStats[] = [];
    for (let i = 0; i < levelCount; i++) {
      // Level 0 is always unlocked
      if (i === 0) {
        const s = data.levels[i] ?? { ...DEFAULT_STATS };
        s.unlocked = true;
        stats.push(s);
      } else {
        stats.push(data.levels[i] ?? { ...DEFAULT_STATS });
      }
    }
    return stats;
  }

  // Reset all progress
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ========================
  // Skin system
  // ========================

  // Get total medal counts across all levels
  getMedalCounts(): { gold: number; silver: number; bronze: number } {
    const data = this.load();
    let gold = 0, silver = 0, bronze = 0;
    for (const key of Object.keys(data.levels)) {
      const stats = data.levels[Number(key)];
      if (stats.medal === 'GOLD') gold++;
      else if (stats.medal === 'SILVER') silver++;
      else if (stats.medal === 'BRONZE') bronze++;
    }
    return { gold, silver, bronze };
  }

  // Check if a skin is unlocked
  isSkinUnlocked(skinId: string): boolean {
    const skin = ALL_SKINS.find(s => s.id === skinId);
    if (!skin) return false;
    const counts = this.getMedalCounts();
    const req = skin.unlockRequirement;
    if (req.gold > 0 && counts.gold < req.gold) return false;
    if (req.silver > 0 && counts.silver < req.silver) return false;
    if (req.bronze > 0 && counts.bronze < req.bronze) return false;
    return true;
  }

  // Get selected skin
  getSelectedSkin(): string {
    const data = this.load();
    return data.selectedSkin || 'classic';
  }

  // Get equipped skin object
  getEquippedSkin(): { id: string; name: string } | null {
    const skinId = this.getSelectedSkin();
    const skin = ALL_SKINS.find(s => s.id === skinId);
    return skin ? { id: skin.id, name: skin.name } : null;
  }

  // Set selected skin
  setSelectedSkin(skinId: string) {
    if (!ALL_SKINS.find(s => s.id === skinId)) return;
    const data = this.load();
    data.selectedSkin = skinId;
    this.save(data);
  }

  // Get all skins with unlock status
  getAllSkins(): { skin: Skin; unlocked: boolean; selected: boolean }[] {
    const selected = this.getSelectedSkin();
    return ALL_SKINS.map(skin => ({
      skin,
      unlocked: this.isSkinUnlocked(skin.id),
      selected: skin.id === selected,
    }));
  }
}

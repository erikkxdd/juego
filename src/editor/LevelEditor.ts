// Visual level editor with grid snapping, tools, and JSON export/import
import type { EntityDimension, LevelData, Platform, Spike, BouncePad, DimensionOrb, Portal, Checkpoint, LaserBeam, Turret, GravityZone, FragileBlock } from '../world/Level';

export type EditorTool = 'platform' | 'spike' | 'bouncePad' | 'dimensionOrb' | 'spawn' | 'goal' | 'eraser' | 'checkpoint' | 'laser' | 'turret' | 'gravityZone' | 'fragileBlock';

export interface EditorEntity {
  type: 'platform' | 'spike' | 'bouncePad' | 'dimensionOrb' | 'spawn' | 'goal' | 'checkpoint' | 'laser' | 'turret' | 'gravityZone' | 'fragileBlock';
  x: number;
  y: number;
  w: number;
  h: number;
  dimension: EntityDimension;
  // Extra properties for special entities
  bounceForce?: number;
  cooldown?: number;
  // Laser properties
  x2?: number; // end point for laser
  y2?: number;
  cycleTime?: number;
  onTime?: number;
  // Turret properties
  fireDirX?: number;
  fireDirY?: number;
  fireInterval?: number;
  projectileSpeed?: number;
  projectileDimension?: 'BLUE' | 'RED';
}

export class LevelEditor {
  private readonly gridSize = 20;
  
  // Editor state
  private _tool: EditorTool = 'platform';
  get tool(): EditorTool { return this._tool; }
  set tool(t: EditorTool) { this._tool = t; }

  private _dimension: EntityDimension = 'BOTH';
  get dimension(): EntityDimension { return this._dimension; }
  set dimension(d: EntityDimension) { this._dimension = d; }

  private entities: EditorEntity[] = [];
  private spawnX = 100;
  private spawnY = 500;
  private portalX = 1100;
  private portalY = 500;

  // Drag state
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragCurrentX = 0;
  private dragCurrentY = 0;

  // Level name
  private _levelName = 'Custom Level';
  get levelName(): string { return this._levelName; }
  set levelName(n: string) { this._levelName = n; }

  constructor() {}

  // Snap a coordinate to grid
  snap(value: number): number {
    return Math.round(value / this.gridSize) * this.gridSize;
  }

  // Set tool by number (1-0)
  setToolByNumber(n: number) {
    const tools: EditorTool[] = ['platform', 'spike', 'bouncePad', 'dimensionOrb', 'spawn', 'goal', 'eraser', 'checkpoint', 'laser', 'turret', 'gravityZone', 'fragileBlock'];
    if (n >= 0 && n < tools.length) {
      this._tool = tools[n];
    }
  }

  // Cycle dimension: BOTH -> BLUE -> RED -> BOTH
  cycleDimension() {
    if (this._dimension === 'BOTH') this._dimension = 'BLUE';
    else if (this._dimension === 'BLUE') this._dimension = 'RED';
    else this._dimension = 'BOTH';
  }

  // Get dimension label for UI
  getDimensionLabel(): string {
    const labels: Record<EntityDimension, string> = { BOTH: 'AMBOS', BLUE: 'AZUL', RED: 'ROJO' };
    return labels[this._dimension];
  }

  // Mouse down — start placing or dragging
  onMouseDown(x: number, y: number, button: number) {
    const gx = this.snap(x);
    const gy = this.snap(y);

    if (button === 2) {
      // Right click — erase entity at position
      this.eraseAt(gx, gy);
      return;
    }

    if (this._tool === 'eraser') {
      this.eraseAt(gx, gy);
      return;
    }

    if (this._tool === 'spawn') {
      this.spawnX = gx;
      this.spawnY = gy;
      return;
    }

    if (this._tool === 'goal') {
      this.portalX = gx;
      this.portalY = gy;
      return;
    }

    if (this._tool === 'bouncePad') {
      this.entities.push({
        type: 'bouncePad',
        x: gx,
        y: gy,
        w: this.gridSize * 2,
        h: this.gridSize,
        dimension: this._dimension,
        bounceForce: 600,
      });
      return;
    }

    if (this._tool === 'dimensionOrb') {
      this.entities.push({
        type: 'dimensionOrb',
        x: gx,
        y: gy,
        w: this.gridSize,
        h: this.gridSize,
        dimension: this._dimension,
        cooldown: 1.5,
      });
      return;
    }

    if (this._tool === 'checkpoint') {
      this.entities.push({
        type: 'checkpoint',
        x: gx,
        y: gy,
        w: this.gridSize * 2,
        h: this.gridSize,
        dimension: this._dimension,
      });
      return;
    }

    if (this._tool === 'laser') {
      // Place laser start point, drag to set end point
      this.dragging = true;
      this.dragStartX = gx;
      this.dragStartY = gy;
      this.dragCurrentX = gx;
      this.dragCurrentY = gy;
      return;
    }

    if (this._tool === 'turret') {
      this.entities.push({
        type: 'turret',
        x: gx,
        y: gy,
        w: this.gridSize,
        h: this.gridSize,
        dimension: this._dimension,
        fireDirX: 0,
        fireDirY: -1,
        fireInterval: 2,
        projectileSpeed: 280,
        projectileDimension: 'BLUE',
      });
      return;
    }

    if (this._tool === 'gravityZone' || this._tool === 'fragileBlock') {
      // Drag to set size for gravity zones and fragile blocks
      this.dragging = true;
      this.dragStartX = gx;
      this.dragStartY = gy;
      this.dragCurrentX = gx;
      this.dragCurrentY = gy;
      return;
    }

    // Platform, spike, or laser — start drag for size
    this.dragging = true;
    this.dragStartX = gx;
    this.dragStartY = gy;
    this.dragCurrentX = gx;
    this.dragCurrentY = gy;
  }

  // Mouse move — update drag rectangle
  onMouseMove(x: number, y: number) {
    if (!this.dragging) return;
    this.dragCurrentX = this.snap(x);
    this.dragCurrentY = this.snap(y);
  }

  // Mouse up — finalize placement
  onMouseUp() {
    if (!this.dragging) {
      this.dragging = false;
      return;
    }

    // Calculate rectangle from drag
    const x = Math.min(this.dragStartX, this.dragCurrentX);
    const y = Math.min(this.dragStartY, this.dragCurrentY);
    const w = Math.abs(this.dragCurrentX - this.dragStartX) || this.gridSize;
    const h = Math.abs(this.dragCurrentY - this.dragStartY) || this.gridSize;

    // Ensure minimum size
    const finalW = Math.max(w, this.gridSize);
    const finalH = Math.max(h, this.gridSize);

    if (this._tool === 'platform') {
      this.entities.push({
        type: 'platform',
        x,
        y,
        w: finalW,
        h: finalH,
        dimension: this._dimension,
      });
    } else if (this._tool === 'spike') {
      this.entities.push({
        type: 'spike',
        x,
        y,
        w: finalW,
        h: finalH,
        dimension: this._dimension,
      });
    } else if (this._tool === 'laser') {
      // Laser: drag from start to end point
      this.entities.push({
        type: 'laser',
        x: this.dragStartX,
        y: this.dragStartY,
        w: 4, // line width visual
        h: 4,
        dimension: this._dimension,
        x2: this.dragCurrentX,
        y2: this.dragCurrentY,
        cycleTime: 3,
        onTime: 1.5,
      });
    } else if (this._tool === 'gravityZone') {
      this.entities.push({
        type: 'gravityZone',
        x,
        y,
        w: finalW,
        h: finalH,
        dimension: this._dimension,
      });
    } else if (this._tool === 'fragileBlock') {
      this.entities.push({
        type: 'fragileBlock',
        x,
        y,
        w: finalW,
        h: Math.min(finalH, this.gridSize * 2), // limit height
        dimension: this._dimension,
      });
    }

    this.dragging = false;
  }

  // Erase entity at grid position
  eraseAt(gx: number, gy: number) {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      const e = this.entities[i];
      if (gx >= e.x && gx < e.x + e.w && gy >= e.y && gy < e.y + e.h) {
        this.entities.splice(i, 1);
        return;
      }
    }
  }

  // Get drag rectangle for rendering
  getDragRect() {
    if (!this.dragging) return null;
    const x = Math.min(this.dragStartX, this.dragCurrentX);
    const y = Math.min(this.dragStartY, this.dragCurrentY);
    const w = Math.abs(this.dragCurrentX - this.dragStartX) || this.gridSize;
    const h = Math.abs(this.dragCurrentY - this.dragStartY) || this.gridSize;
    return { x, y, w: Math.max(w, this.gridSize), h: Math.max(h, this.gridSize) };
  }

  // Get spawn position
  getSpawn(): { x: number; y: number } {
    return { x: this.spawnX, y: this.spawnY };
  }

  // Get portal position
  getPortal(): { x: number; y: number } {
    return { x: this.portalX, y: this.portalY };
  }

  // Get all entities
  getEntities(): EditorEntity[] {
    return [...this.entities];
  }

  // Export to LevelData
  exportLevelData(): LevelData {
    const platforms: Platform[] = [];
    const spikes: Spike[] = [];
    const bouncePads: BouncePad[] = [];
    const dimensionOrbs: DimensionOrb[] = [];
    const checkpoints: Checkpoint[] = [];
    const lasers: LaserBeam[] = [];
    const turrets: Turret[] = [];
    const gravityZones: GravityZone[] = [];
    const fragileBlocks: FragileBlock[] = [];

    for (const e of this.entities) {
      if (e.type === 'platform') {
        platforms.push({ x: e.x, y: e.y, w: e.w, h: e.h, dimension: e.dimension });
      } else if (e.type === 'spike') {
        spikes.push({ x: e.x, y: e.y, w: e.w, h: e.h, dimension: e.dimension });
      } else if (e.type === 'bouncePad') {
        bouncePads.push({ x: e.x, y: e.y, w: e.w, h: e.h, dimension: e.dimension, bounceForce: e.bounceForce || 600 });
      } else if (e.type === 'dimensionOrb') {
        dimensionOrbs.push({ x: e.x, y: e.y, w: e.w, h: e.h, dimension: e.dimension, cooldown: e.cooldown || 1.5 });
      } else if (e.type === 'checkpoint') {
        checkpoints.push({ x: e.x, y: e.y, w: e.w, h: e.h, dimension: e.dimension });
      } else if (e.type === 'laser') {
        lasers.push({
          x1: e.x, y1: e.y,
          x2: e.x2 || e.x + 200, y2: e.y2 || e.y,
          dimension: e.dimension,
          cycleTime: e.cycleTime || 3,
          onTime: e.onTime || 1.5,
          warnTime: 0.5,
        });
      } else if (e.type === 'turret') {
        turrets.push({
          x: e.x, y: e.y, w: e.w, h: e.h, dimension: e.dimension,
          fireDirection: { x: e.fireDirX || 0, y: e.fireDirY || -1 },
          fireInterval: e.fireInterval || 2,
          projectileSpeed: e.projectileSpeed || 280,
          projectileDimension: e.projectileDimension || 'BLUE',
        });
      } else if (e.type === 'gravityZone') {
        gravityZones.push({ x: e.x, y: e.y, w: e.w, h: e.h, dimension: e.dimension });
      } else if (e.type === 'fragileBlock') {
        fragileBlocks.push({ x: e.x, y: e.y, w: e.w, h: e.h, dimension: e.dimension });
      }
    }

    const portal: Portal = {
      x: this.portalX,
      y: this.portalY,
      w: 40,
      h: 60,
      dimension: 'BOTH',
    };

    return {
      name: this._levelName,
      platforms,
      walls: [],
      spikes,
      portal,
      spawnX: this.spawnX,
      spawnY: this.spawnY,
      bouncePads: bouncePads.length > 0 ? bouncePads : undefined,
      dimensionOrbs: dimensionOrbs.length > 0 ? dimensionOrbs : undefined,
      checkpoints: checkpoints.length > 0 ? checkpoints : undefined,
      lasers: lasers.length > 0 ? lasers : undefined,
      turrets: turrets.length > 0 ? turrets : undefined,
      gravityZones: gravityZones.length > 0 ? gravityZones : undefined,
      fragileBlocks: fragileBlocks.length > 0 ? fragileBlocks : undefined,
    };
  }

  // Export to JSON string
  exportJSON(): string {
    const data = {
      name: this._levelName,
      spawnX: this.spawnX,
      spawnY: this.spawnY,
      portalX: this.portalX,
      portalY: this.portalY,
      entities: this.entities,
    };
    return JSON.stringify(data, null, 2);
  }

  // Import from JSON string
  importJSON(json: string): boolean {
    try {
      const data = JSON.parse(json);
      this._levelName = data.name || 'Imported Level';
      this.spawnX = data.spawnX ?? 100;
      this.spawnY = data.spawnY ?? 500;
      this.portalX = data.portalX ?? 1100;
      this.portalY = data.portalY ?? 500;
      this.entities = data.entities || [];
      return true;
    } catch {
      return false;
    }
  }

  // Save to localStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('swap-shift-editor-autosave', this.exportJSON());
    } catch { /* storage full */ }
  }

  // Load from localStorage
  loadFromLocalStorage(): boolean {
    try {
      const raw = localStorage.getItem('swap-shift-editor-autosave');
      if (raw) {
        return this.importJSON(raw);
      }
    } catch { /* corrupted */ }
    return false;
  }

  // Clear all entities
  clear() {
    this.entities = [];
    this.spawnX = 100;
    this.spawnY = 500;
    this.portalX = 1100;
    this.portalY = 500;
    this._levelName = 'Custom Level';
  }

  // Get tool label
  getToolLabel(): string {
    const labels: Record<EditorTool, string> = {
      platform: 'Plataforma',
      spike: 'Pinchos',
      bouncePad: 'Muelle',
      dimensionOrb: 'Orbe',
      spawn: 'Spawn',
      goal: 'Meta',
      eraser: 'Borrador',
      checkpoint: 'Checkpoint',
      laser: 'Láser',
      turret: 'Torreta',
      gravityZone: 'Gravedad',
      fragileBlock: 'Frágil',
    };
    return labels[this._tool];
  }

  // Get grid size
  getGridSize(): number {
    return this.gridSize;
  }
}

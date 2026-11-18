// Game state machine and UI manager
// Handles MENU, PLAYING, PAUSED, LEVEL_COMPLETE, VICTORY states

import { Input } from '../core/Input';
import { Storage } from '../core/Storage';
import { Audio } from '../core/Audio';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_SELECT' | 'LEVEL_COMPLETE' | 'VICTORY' | 'EDITOR' | 'SKINS';

// Menu cursor state for level select
export class MenuManager {
  private _state: GameState = 'MENU';
  get state(): GameState { return this._state; }
  set state(s: GameState) { this._state = s; }

  private menuCursor = 0; // 0 = Play, 1 = Level Select, 2 = Reset Save
  private menuCursorLerp = 0; // Smooth lerp position for animation
  private levelSelectCursor = 0;
  private levelSelectCursorLerp = 0;
  private levelSelectPage = 0; // Page for 40 levels (10 per page, 4 pages)
  private levelSelectPageLerp = 0; // Smooth page transition
  private pauseCursor = 0; // 0 = Resume, 1 = Restart, 2 = Menu
  private pauseCursorLerp = 0;
  private skinsCursor = 0;
  private skinsCursorLerp = 0;

  // Screen transition
  private transitionAlpha = 0; // 0 = no transition, 1 = fully covered
  private transitioning = false;
  private transitionCallback: (() => void) | null = null;
  get transitionProgress(): number { return this.transitionAlpha; }


  // Last menu index for sound
  private lastMenuCursor = -1;
  private lastLevelSelectCursor = -1;
  private lastLevelSelectPage = -1;

  // Audio reference for UI sounds
  private audioRef: Audio;

  static readonly LEVELS_PER_PAGE = 10;
  static readonly TOTAL_PAGES = 4; // 40 levels / 10 per page
  static readonly CHAPTER_NAMES = ['Iniciación', 'Inversión', 'Sobrecarga', 'Núcleo Crítico'];

  // Title animation
  private titleTime = 0;

  private storageRef: Storage;

  constructor(storage: Storage, audio: Audio) {
    this.storageRef = storage;
    this.audioRef = audio;
  }

  /** Start a screen transition. During transition, the screen fills with panels. */
  startTransition(callback: () => void) {
    this.transitioning = true;
    this.transitionAlpha = 0;
    this.transitionCallback = callback;
  }

  update(dt: number, input: Input, totalLevels: number) {
    this.titleTime += dt;

    // Update transition
    if (this.transitioning) {
      const speed = 4.0; // how fast transition progresses
      this.transitionAlpha += dt * speed;
      if (this.transitionAlpha >= 1.0) {
        this.transitionAlpha = 1.0;
        // Execute callback at midpoint
        if (this.transitionCallback) {
          this.transitionCallback();
          this.transitionCallback = null;
        }
        // Now reverse
        this.transitioning = false;
        // We'll handle fade-out in the next branch
      }
    }
    // Fade out after transition callback
    if (!this.transitioning && this.transitionAlpha > 0) {
      this.transitionAlpha -= dt * 4.0;
      if (this.transitionAlpha < 0) this.transitionAlpha = 0;
    }

    // Skip input during transition
    if (this.transitionAlpha > 0.3) return;

    const enterPressed = input.justPress('Enter') || input.justPress('NumpadEnter');
    const spacePressed = input.spaceJustPressed();
    const escapePressed = input.justPress('Escape');
    const pPressed = input.justPress('KeyP');
    const upPressed = input.justPress('ArrowUp');
    const downPressed = input.justPress('ArrowDown');

    // Lerp cursors
    const lerpSpeed = 12 * dt;
    this.menuCursorLerp += (this.menuCursor - this.menuCursorLerp) * lerpSpeed;
    this.levelSelectCursorLerp += (this.levelSelectCursor - this.levelSelectCursorLerp) * lerpSpeed;
    this.levelSelectPageLerp += (this.levelSelectPage - this.levelSelectPageLerp) * lerpSpeed;
    this.pauseCursorLerp += (this.pauseCursor - this.pauseCursorLerp) * lerpSpeed;
    this.skinsCursorLerp += (this.skinsCursor - this.skinsCursorLerp) * lerpSpeed;

    switch (this._state) {
      case 'MENU':
        this.updateMenu(dt, input, enterPressed || spacePressed, upPressed, downPressed, totalLevels);
        break;
      case 'LEVEL_SELECT':
        this.updateLevelSelect(dt, input, enterPressed || spacePressed, escapePressed, upPressed, downPressed, totalLevels);
        break;
      case 'PLAYING':
        if (escapePressed || pPressed) {
          this._state = 'PAUSED';
          this.pauseCursor = 0;
        }
        break;
      case 'PAUSED':
        this.updatePaused(dt, input, enterPressed || spacePressed, upPressed, downPressed);
        break;
      case 'LEVEL_COMPLETE':
        if (enterPressed || spacePressed) {
          // Handled by Game class — we just signal
        }
        break;
      case 'VICTORY':
        if (escapePressed || enterPressed || spacePressed) {
          this._state = 'MENU';
          this.menuCursor = 0;
        }
        break;
      case 'EDITOR':
        if (escapePressed) {
          this.audioRef.playMenuSelect();
          this._state = 'MENU';
          this.menuCursor = 0;
        }
        break;
      case 'SKINS':
        if (escapePressed) {
          this.audioRef.playMenuSelect();
          this._state = 'MENU';
          this.menuCursor = 0;
        }
        const leftPressed = input.justPress('ArrowLeft');
        const rightPressed = input.justPress('ArrowRight');
        if (leftPressed && this.skinsCursor > 0) {
          this.skinsCursor--;
          this.audioRef.playMenuMove();
        }
        if (rightPressed && this.skinsCursor < 4) {
          this.skinsCursor++;
          this.audioRef.playMenuMove();
        }
        if (enterPressed || spacePressed) {
          // Select skin — handled by Game class via getSkinsCursor()
        }
        break;
    }

  }

  private updateMenu(_dt: number, _input: Input, confirm: boolean, up: boolean, down: boolean, totalLevels: number) {
    const options = ['JUGAR', 'SELECCIONAR NIVEL', 'ASPECTOS', 'EDITOR DE NIVELES', 'REINICIAR PROGRESO'];

    // Track cursor changes for sound
    const prevCursor = this.menuCursor;

    if (up && this.menuCursor > 0) this.menuCursor--;
    if (down && this.menuCursor < options.length - 1) this.menuCursor++;

    // Play sound if cursor actually changed
    if (this.menuCursor !== prevCursor) {
      this.audioRef.playMenuMove();
    }

    if (confirm) {
      this.audioRef.playMenuSelect();
      if (this.menuCursor === 0) {
        // Start from first unlocked level
        this._state = 'PLAYING';
      } else if (this.menuCursor === 1) {
        this._state = 'LEVEL_SELECT';
        this.levelSelectCursor = 0;
        // Find first unlocked level
        const stats = this.storageRef.getAllStats(totalLevels);
        for (let i = 0; i < stats.length; i++) {
          if (stats[i].unlocked) { this.levelSelectCursor = i; break; }
        }
      } else if (this.menuCursor === 2) {
        // Skins / Aspectos
        this._state = 'SKINS';
        this.skinsCursor = 0;
      } else if (this.menuCursor === 3) {
        // Level Editor
        this._state = 'EDITOR';
      } else if (this.menuCursor === 4) {
        // Reset save
        this.storageRef.reset();
      }
    }
  }

  private updateLevelSelect(_dt: number, input: Input, confirm: boolean, escape: boolean, up: boolean, down: boolean, totalLevels: number) {
    if (escape) {
      this.audioRef.playMenuSelect();
      this._state = 'MENU';
      return;
    }

    // Track cursor changes for sound
    const prevCursor = this.levelSelectCursor;

    // Page navigation with Q/E or Left/Right
    const qPressed = input.justPress('KeyQ') || input.justPress('ArrowLeft');
    const ePressed = input.justPress('KeyE') || input.justPress('ArrowRight');

    const maxPages = Math.min(MenuManager.TOTAL_PAGES, Math.ceil(totalLevels / MenuManager.LEVELS_PER_PAGE));
    if (qPressed && this.levelSelectPage > 0) {
      this.levelSelectPage--;
      this.levelSelectCursor = this.levelSelectPage * MenuManager.LEVELS_PER_PAGE;
      this.audioRef.playTabSwitch();
    }
    if (ePressed && this.levelSelectPage < maxPages - 1) {
      this.levelSelectPage++;
      this.levelSelectCursor = this.levelSelectPage * MenuManager.LEVELS_PER_PAGE;
      this.audioRef.playTabSwitch();
    }

    const stats = this.storageRef.getAllStats(totalLevels);
    const pageStart = this.levelSelectPage * MenuManager.LEVELS_PER_PAGE;
    const pageEnd = Math.min(pageStart + MenuManager.LEVELS_PER_PAGE, stats.length);

    if (up && this.levelSelectCursor > pageStart) this.levelSelectCursor--;
    if (down && this.levelSelectCursor < pageEnd - 1) this.levelSelectCursor++;

    // Play sound if cursor actually changed
    if (this.levelSelectCursor !== prevCursor) {
      this.audioRef.playMenuMove();
    }

    if (confirm) {
      if (stats[this.levelSelectCursor].unlocked) {
        this.audioRef.playMenuSelect();
        this._state = 'PLAYING';
      } else {
        this.audioRef.playMenuLocked();
      }
    }
  }

  private updatePaused(_dt: number, _input: Input, confirm: boolean, up: boolean, down: boolean) {
    const options = ['REANUDAR', 'REINICIAR NIVEL', 'VOLVER AL MENÚ'];

    // Track cursor changes for sound
    const prevCursor = this.pauseCursor;

    if (up && this.pauseCursor > 0) this.pauseCursor--;
    if (down && this.pauseCursor < options.length - 1) this.pauseCursor++;

    // Play sound if cursor actually changed
    if (this.pauseCursor !== prevCursor) {
      this.audioRef.playMenuMove();
    }

    if (confirm) {
      this.audioRef.playMenuSelect();
      if (this.pauseCursor === 0) {
        this._state = 'PLAYING';
      }
      // pauseCursor 1 and 2 are handled by Game class via getPauseAction()
      else if (this.pauseCursor === 1 || this.pauseCursor === 2) {
        // State stays PAUSED; Game class will check getPauseAction()
      }
    }
  }

  getPauseAction(): 'RESUME' | 'RESTART' | 'MENU' | null {
    if (this._state !== 'PAUSED') return null;
    if (this.pauseCursor === 0) return 'RESUME';
    if (this.pauseCursor === 1) return 'RESTART';
    if (this.pauseCursor === 2) return 'MENU';
    return null;
  }

  getSelectedLevelIndex(): number {
    return this.levelSelectCursor;
  }

  getLevelSelectPage(): number {
    return this.levelSelectPage;
  }

  setLevelSelectPage(page: number) {
    this.levelSelectPage = page;
  }

  getLevelsPerPage(): number {
    return MenuManager.LEVELS_PER_PAGE;
  }

  getChapterName(page: number): string {
    return MenuManager.CHAPTER_NAMES[page] || '';
  }

  getMaxPages(totalLevels: number): number {
    return Math.min(MenuManager.TOTAL_PAGES, Math.ceil(totalLevels / MenuManager.LEVELS_PER_PAGE));
  }

  getTitleTime(): number {
    return this.titleTime;
  }

  getMenuCursor(): number {
    return this.menuCursor;
  }

  setMenuCursor(c: number) {
    this.menuCursor = c;
  }

  getPauseCursor(): number {
    return this.pauseCursor;
  }

  setPauseCursor(c: number) {
    this.pauseCursor = c;
  }

  getLevelSelectCursor(): number {
    return this.levelSelectCursor;
  }

  setLevelSelectCursor(c: number) {
    this.levelSelectCursor = c;
  }

  getSkinsCursor(): number {
    return this.skinsCursor;
  }

  setSkinsCursor(c: number) {
    this.skinsCursor = c;
  }

  getMenuCursorLerp(): number { return this.menuCursorLerp; }
  getLevelSelectCursorLerp(): number { return this.levelSelectCursorLerp; }
  getLevelSelectPageLerp(): number { return this.levelSelectPageLerp; }
  getPauseCursorLerp(): number { return this.pauseCursorLerp; }
  getSkinsCursorLerp(): number { return this.skinsCursorLerp; }

  getLastMenuCursor(): number { return this.lastMenuCursor; }
  setLastMenuCursor(v: number) { this.lastMenuCursor = v; }
  getLastLevelSelectCursor(): number { return this.lastLevelSelectCursor; }
  setLastLevelSelectCursor(v: number) { this.lastLevelSelectCursor = v; }
  getLastLevelSelectPage(): number { return this.lastLevelSelectPage; }
  setLastLevelSelectPage(v: number) { this.lastLevelSelectPage = v; }
}

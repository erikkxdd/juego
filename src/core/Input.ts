export class Input {
  private keys = new Set<string>();
  private justPressed = new Set<string>();
  private clickPressed = false;

  // Mouse position for UI hover (scaled to canvas internal resolution)
  private mouseX = 0;
  private mouseY = 0;
  private mouseClickJustPressed = false;
  private _canvasRef: HTMLCanvasElement;

  // DAS/ARR auto-repeat for menu navigation
  private arrTimers = new Map<string, number>(); // key -> time held
  private arrFired = new Map<string, boolean>(); // key -> has fired this hold
  private readonly dasDelay = 0.22; // seconds before auto-repeat starts
  private readonly arrRate = 0.06; // seconds between auto-repeats
  private arrAccumulator = 0; // shared accumulator for repeat interval

  getMouseX(): number { return this.mouseX; }
  getMouseY(): number { return this.mouseY; }
  getMouseClickJustPressed(): boolean { return this.mouseClickJustPressed; }

  constructor(canvas: HTMLCanvasElement) {
    this._canvasRef = canvas;
    window.addEventListener('keydown', (e) => {
      // Use e.code for layout-independent key detection
      const code = e.code;
      if (!this.keys.has(code)) {
        this.justPressed.add(code);
      }
      this.keys.add(code);
      // Prevent scrolling with game keys
      if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight' || code === 'Space') {
        e.preventDefault();
      }
      // Also prevent default for Shift to avoid caps lock issues
      if (code === 'ShiftLeft' || code === 'ShiftRight') {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      // Don't track KeyK/KeyJ/KeyR/KeyN as held keys for movement,
      // but still remove from keys set so justPressed works correctly
      this.keys.delete(e.code);
    });

    // Use window for mouse events too, so clicking outside canvas still works
    window.addEventListener('mousemove', (e) => {
      const rect = this._canvasRef.getBoundingClientRect();
      // Scale from CSS pixel coordinates to canvas internal resolution
      const scaleX = this._canvasRef.width / rect.width;
      const scaleY = this._canvasRef.height / rect.height;
      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.clickPressed = true;
        this.mouseClickJustPressed = true;
      }
      // Right click for air dash
      if (e.button === 2) {
        this.rightClickPressed = true;
        e.preventDefault(); // Prevent context menu
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.clickPressed = false;
      }
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  justPress(code: string): boolean {
    return this.justPressed.has(code);
  }

  get clickJustPressed(): boolean {
    return this.clickPressed;
  }

  // Check for any dimension shift trigger
  shiftJustPressed(): boolean {
    return (
      this.justPress('ShiftLeft') ||
      this.justPress('ShiftRight') ||
      this.justPress('KeyK') ||
      this.mouseClickJustPressed
    );
  }

  // Check for any jump trigger (gameplay only — NOT for menu confirm)
  jumpJustPressed(): boolean {
    return (
      this.justPress('KeyW') ||
      this.justPress('Space') ||
      this.justPress('ArrowUp')
    );
  }

  // Space-only confirm for menus (ArrowUp is navigation, not confirm)
  spaceJustPressed(): boolean {
    return this.justPress('Space');
  }

  // Check if any jump key is currently held (for variable jump height)
  isJumpHeld(): boolean {
    return this.isDown('KeyW') || this.isDown('Space') || this.isDown('ArrowUp');
  }

  // Check for restart
  restartJustPressed(): boolean {
    return this.justPress('KeyR');
  }

  // Check for level skip (debug)
  nextLevelJustPressed(): boolean {
    return this.justPress('KeyN');
  }

  moveLeft(): boolean {
    return this.isDown('KeyA') || this.isDown('ArrowLeft');
  }

  moveRight(): boolean {
    return this.isDown('KeyD') || this.isDown('ArrowRight');
  }

  // Air dash input
  private rightClickPressed = false;

  dashJustPressed(): boolean {
    return (
      this.justPress('KeyL') ||
      this.justPress('KeyE') ||
      this.rightClickPressed
    );
  }

  /**
   * Update DAS/ARR auto-repeat timers. Call once per frame with deltaTime.
   * This enables held arrow keys to repeat navigation after a short delay.
   */
  updateArr(dt: number) {
    // Menu navigation keys that support auto-repeat
    const navKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD'];

    for (const code of navKeys) {
      if (this.keys.has(code)) {
        // Key is held down
        if (!this.arrTimers.has(code)) {
          this.arrTimers.set(code, 0);
          this.arrFired.set(code, false);
        }
        const heldTime = (this.arrTimers.get(code) ?? 0) + dt;
        this.arrTimers.set(code, heldTime);

        // After DAS delay, start auto-repeating
        if (heldTime >= this.dasDelay && !(this.arrFired.get(code) ?? false)) {
          this.arrFired.set(code, true);
          this.arrAccumulator = 0; // Reset shared accumulator on first fire
        }
      } else {
        // Key released — reset immediately
        this.arrTimers.delete(code);
        this.arrFired.delete(code);
      }
    }

    // If any key has fired and is still held, accumulate for next repeat
    let anyHeldAndFired = false;
    for (const [code, fired] of this.arrFired) {
      if (fired && this.keys.has(code)) {
        anyHeldAndFired = true;
        break;
      }
    }

    if (anyHeldAndFired) {
      this.arrAccumulator += dt;
      if (this.arrAccumulator >= this.arrRate) {
        // Fire auto-repeat for all held keys that have passed DAS
        for (const [code, heldTime] of this.arrTimers) {
          if (heldTime >= this.dasDelay && this.keys.has(code)) {
            this.justPressed.add(code);
          }
        }
        this.arrAccumulator = 0;
      }
    } else {
      this.arrAccumulator = 0;
    }
  }

  /**
   * Returns the direction of menu navigation triggered by held keys (auto-repeat).
   * Call this after justPressed checks in menu logic.
   * Returns: 'up', 'down', 'left', 'right', or null.
   */
  menuNavHeld(): 'up' | 'down' | 'left' | 'right' | null {
    // Check which held keys have passed DAS and are ready to fire
    for (const [code, heldTime] of this.arrTimers) {
      if (heldTime >= this.dasDelay && this.arrFired.get(code) && this.keys.has(code)) {
        if (code === 'ArrowUp' || code === 'KeyW') return 'up';
        if (code === 'ArrowDown' || code === 'KeyS') return 'down';
        if (code === 'ArrowLeft' || code === 'KeyA') return 'left';
        if (code === 'ArrowRight' || code === 'KeyD') return 'right';
      }
    }
    return null;
  }

  endFrame() {
    this.justPressed.clear();
    this.clickPressed = false;
    this.rightClickPressed = false;
    this.mouseClickJustPressed = false;
  }
}

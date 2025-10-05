/**
 * Input handling with key state tracking and buffering
 * Supports coyote time and jump buffering for responsive controls
 */

export class Input {
  constructor() {
    this.keys = new Map();
    this.justPressed = new Map();
    this.justReleased = new Map();
    
    // Jump buffering
    this.jumpBuffer = 0;
    this.coyoteTime = 0;
    this.jumpBufferTime = 0.12; // 120ms
    this.coyoteTimeMax = 0.12; // 120ms
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      console.log('Key pressed:', e.code, e.key);
      
      if (this.keys.get(e.code)) return; // Already pressed
      
      this.keys.set(e.code, true);
      this.justPressed.set(e.code, true);
      
      // Prevent default for game keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
        console.log('Game key pressed:', e.code);
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys.set(e.code, false);
      this.justReleased.set(e.code, true);
    });

    // Prevent context menu on right click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  update(deltaTime) {
    // Update jump buffer
    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= deltaTime;
    }
    
    // Update coyote time
    if (this.coyoteTime > 0) {
      this.coyoteTime -= deltaTime;
    }
    
    // Don't clear justPressed here - let it persist for the frame
    // this.justPressed.clear();
    // this.justReleased.clear();
  }

  // Key state queries
  isPressed(key) {
    return this.keys.get(key) || false;
  }

  isJustPressed(key) {
    return this.justPressed.get(key) || false;
  }

  isJustReleased(key) {
    return this.justReleased.get(key) || false;
  }

  // Movement input
  getHorizontal() {
    let dir = 0;
    if (this.isPressed('ArrowLeft') || this.isPressed('KeyA')) dir -= 1;
    if (this.isPressed('ArrowRight') || this.isPressed('KeyD')) dir += 1;
    return dir;
  }

  getVertical() {
    let dir = 0;
    if (this.isPressed('ArrowUp') || this.isPressed('KeyW')) dir -= 1;
    if (this.isPressed('ArrowDown') || this.isPressed('KeyS')) dir += 1;
    return dir;
  }

  // Jump input with buffering
  isJumpPressed() {
    return this.isPressed('Space') || this.isPressed('ArrowUp') || this.isPressed('KeyW');
  }

  isJumpJustPressed() {
    const spacePressed = this.isJustPressed('Space');
    const upPressed = this.isJustPressed('ArrowUp');
    const wPressed = this.isJustPressed('KeyW');
    const result = spacePressed || upPressed || wPressed;
    
    // Debug: Always log jump check
    if (spacePressed || upPressed || wPressed) {
      console.log('Jump key detected! Space:', spacePressed, 'Up:', upPressed, 'W:', wPressed);
    }
    
    // Debug: Log all key states
    console.log('Jump check - Space:', spacePressed, 'Up:', upPressed, 'W:', wPressed, 'Result:', result);
    
    return result;
  }

  // Jump buffering
  bufferJump() {
    this.jumpBuffer = this.jumpBufferTime;
  }

  consumeJumpBuffer() {
    if (this.jumpBuffer > 0) {
      this.jumpBuffer = 0;
      return true;
    }
    return false;
  }

  // Coyote time
  setCoyoteTime() {
    this.coyoteTime = this.coyoteTimeMax;
  }

  hasCoyoteTime() {
    return this.coyoteTime > 0;
  }

  // Other inputs
  isInteractPressed() {
    return this.isJustPressed('KeyE');
  }

  isDashPressed() {
    return this.isPressed('ShiftLeft') || this.isPressed('ShiftRight');
  }

  isPausePressed() {
    return this.isJustPressed('Escape');
  }

  // Clear just pressed/released states after processing
  clearJustPressed() {
    this.justPressed.clear();
    this.justReleased.clear();
  }
}
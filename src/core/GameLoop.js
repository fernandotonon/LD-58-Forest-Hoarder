/**
 * Main game loop using requestAnimationFrame
 * Handles timing, frame rate limiting, and update/render cycles
 */

export class GameLoop {
  constructor() {
    this.isRunning = false;
    this.lastTime = 0;
    this.accumulator = 0;
    this.timestep = 1000 / 60; // 60 FPS target
    this.maxFrameTime = 250; // Prevent spiral of death
    
    this.update = null;
    this.render = null;
    
    this.frame = this.frame.bind(this);
  }

  start(updateFn, renderFn) {
    this.update = updateFn;
    this.render = renderFn;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    requestAnimationFrame(this.frame);
  }

  stop() {
    this.isRunning = false;
  }

  frame(currentTime) {
    if (!this.isRunning) return;

    let deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Prevent spiral of death
    if (deltaTime > this.maxFrameTime) {
      deltaTime = this.maxFrameTime;
    }

    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= this.timestep) {
      this.update(this.timestep / 1000); // Convert to seconds
      this.accumulator -= this.timestep;
    }

    // Render with interpolation
    const alpha = this.accumulator / this.timestep;
    this.render(alpha);

    requestAnimationFrame(this.frame);
  }
}
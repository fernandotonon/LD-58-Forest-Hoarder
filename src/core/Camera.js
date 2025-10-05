/**
 * Camera system for following the player and managing viewport
 * Supports smooth following and parallax backgrounds
 */

export class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.followSpeed = 5;
    this.shakeX = 0;
    this.shakeY = 0;
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    
    // Parallax layers
    this.layers = [
      { speed: 0.1, offset: 0 }, // Far background
      { speed: 0.3, offset: 0 }, // Mid background  
      { speed: 0.6, offset: 0 }, // Near background
      { speed: 1.0, offset: 0 }  // Foreground
    ];
  }

  // Follow a target (usually the player)
  follow(target, deltaTime) {
    this.targetX = target.x - this.canvas.width / 2;
    // Keep vertical camera fixed so the world doesn't bob when the player jumps
    this.targetY = 0;
    
    // Smooth following
    const lerpFactor = 1 - Math.exp(-this.followSpeed * deltaTime);
    this.x += (this.targetX - this.x) * lerpFactor;
    this.y += (this.targetY - this.y) * lerpFactor;
    
    // Update parallax layers
    this.layers.forEach(layer => {
      layer.offset = this.x * layer.speed;
    });
    
    // Apply screen shake
    this.x += this.shakeX;
    this.y += this.shakeY;
    
    // Decay shake
    this.shakeX *= this.shakeDecay;
    this.shakeY *= this.shakeDecay;
    
    if (Math.abs(this.shakeX) < 0.1) this.shakeX = 0;
    if (Math.abs(this.shakeY) < 0.1) this.shakeY = 0;
  }

  // Add screen shake
  shake(intensity = 5) {
    this.shakeIntensity = intensity;
    this.shakeX = (Math.random() - 0.5) * intensity;
    this.shakeY = (Math.random() - 0.5) * intensity;
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  // Check if a world position is visible on screen
  isVisible(worldX, worldY, margin = 100) {
    return worldX >= this.x - margin &&
           worldX <= this.x + this.canvas.width + margin &&
           worldY >= this.y - margin &&
           worldY <= this.y + this.canvas.height + margin;
  }

  // Get parallax offset for a layer
  getParallaxOffset(layerIndex) {
    return this.layers[layerIndex]?.offset || 0;
  }

  // Set camera position directly
  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
  }

  // Get camera bounds
  getBounds() {
    return {
      left: this.x,
      right: this.x + this.canvas.width,
      top: this.y,
      bottom: this.y + this.canvas.height
    };
  }
}
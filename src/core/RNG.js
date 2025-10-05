/**
 * Random Number Generator with seeded random for consistent gameplay
 * Supports both seeded and unseeded random generation
 */

export class RNG {
  constructor(seed = null) {
    this.seed = seed || Math.random() * 2147483647;
    this.current = this.seed;
  }

  // Linear congruential generator
  next() {
    this.current = (this.current * 1664525 + 1013904223) % 2147483647;
    return this.current / 2147483647;
  }

  // Get random float between min and max
  float(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }

  // Get random integer between min and max (inclusive)
  int(min, max) {
    return Math.floor(this.float(min, max + 1));
  }

  // Get random boolean
  bool() {
    return this.next() < 0.5;
  }

  // Get random element from array
  choice(array) {
    return array[this.int(0, array.length - 1)];
  }

  // Shuffle array in place
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Get random point in circle
  pointInCircle(radius = 1) {
    const angle = this.float(0, Math.PI * 2);
    const r = Math.sqrt(this.next()) * radius;
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r
    };
  }

  // Get random point in rectangle
  pointInRect(x, y, width, height) {
    return {
      x: x + this.float(0, width),
      y: y + this.float(0, height)
    };
  }

  // Weighted random choice
  weightedChoice(weights) {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let random = this.float(0, total);
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return i;
      }
    }
    
    return weights.length - 1;
  }

  // Gaussian (normal) distribution
  gaussian(mean = 0, stdDev = 1) {
    // Box-Muller transform
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  // Reset to initial seed
  reset() {
    this.current = this.seed;
  }

  // Set new seed
  setSeed(seed) {
    this.seed = seed;
    this.current = seed;
  }

  // Get current state (for saving)
  getState() {
    return {
      seed: this.seed,
      current: this.current
    };
  }

  // Restore state (for loading)
  setState(state) {
    this.seed = state.seed;
    this.current = state.current;
  }
}
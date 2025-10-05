/**
 * Game entities and their behaviors
 * Handles player, pickups, pushables, and other game objects
 */

import { useStore } from '../state/useStore';
import { ITEM_WEIGHT, ITEM_STACK_SIZE } from './constants';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 32;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 'right';
    this.stamina = 100;
    this.inventory = [];
    this.carryWeight = 0;
    this.maxCarryWeight = 20;
  }

  update(deltaTime, input, physics, level) {
    // Handle movement input
    const horizontal = input.getHorizontal();
    const isJumpPressed = input.isJumpPressed();
    const isJumpJustPressed = input.isJumpJustPressed();
    const isDashPressed = input.isDashPressed();
    
    // Update facing
    if (horizontal !== 0) {
      this.facing = horizontal > 0 ? 'right' : 'left';
    }
    
    // Apply movement with encumbrance
    const speedMultiplier = Math.max(0.3, 1 - (this.carryWeight / this.maxCarryWeight) * 0.7);
    
    if (horizontal !== 0) {
      this.vx += horizontal * 2200 * speedMultiplier * deltaTime;
      this.vx = Math.max(-190 * speedMultiplier, Math.min(190 * speedMultiplier, this.vx));
    } else {
      this.vx *= 0.85; // Friction
    }
    
    // Apply gravity
    if (!this.onGround) {
      this.vy += 1600 * deltaTime;
    }
    
    // Handle jumping
    if (isJumpJustPressed && (this.onGround || input.hasCoyoteTime())) {
      this.vy = -520;
      this.onGround = false;
      input.setCoyoteTime(0);
    }
    
    // Handle dashing
    if (isDashPressed && this.stamina >= 25) {
      this.vx = horizontal * 320;
      this.stamina -= 25 * deltaTime;
    }
    
    // Stamina recovery
    if (!isDashPressed) {
      this.stamina = Math.min(100, this.stamina + 18 * deltaTime);
    }
    
    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Check collisions with level
    this.checkCollisions(level);
    
    // Update coyote time
    if (this.onGround) {
      input.setCoyoteTime();
    }
  }

  checkCollisions(level) {
    // Check ground collision
    const groundCollision = level.checkTileCollision(this.x, this.y + this.height, this.width, 1);
    if (groundCollision.collided) {
      this.y = groundCollision.y - this.height;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    
    // Check wall collisions
    const leftCollision = level.checkTileCollision(this.x - 1, this.y, 1, this.height);
    const rightCollision = level.checkTileCollision(this.x + this.width, this.y, 1, this.height);
    
    if (leftCollision.collided) {
      this.x = leftCollision.x + 32;
      this.vx = 0;
    }
    
    if (rightCollision.collided) {
      this.x = rightCollision.x - this.width;
      this.vx = 0;
    }
  }

  addToInventory(item, quantity = 1) {
    const existingIndex = this.inventory.findIndex(slot => slot.item === item);
    
    if (existingIndex >= 0) {
      this.inventory[existingIndex].quantity += quantity;
    } else {
      this.inventory.push({ item, quantity });
    }
    
    this.updateCarryWeight();
  }

  removeFromInventory(item, quantity = 1) {
    const existingIndex = this.inventory.findIndex(slot => slot.item === item);
    
    if (existingIndex >= 0) {
      this.inventory[existingIndex].quantity -= quantity;
      if (this.inventory[existingIndex].quantity <= 0) {
        this.inventory.splice(existingIndex, 1);
      }
    }
    
    this.updateCarryWeight();
  }

  updateCarryWeight() {
    this.carryWeight = this.inventory.reduce((total, slot) => {
      return total + (slot.quantity * (ITEM_WEIGHT[slot.item] || 0));
    }, 0);
  }

  canCarry(item, quantity = 1) {
    const weight = (ITEM_WEIGHT[item] || 0) * quantity;
    return this.carryWeight + weight <= this.maxCarryWeight;
  }
}

export class Pickup {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.type = type;
    this.collected = false;
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  update(deltaTime) {
    // Simple bobbing animation
    this.bobOffset += deltaTime * 2;
  }

  getBobY() {
    return this.y + Math.sin(this.bobOffset) * 2;
  }

  checkCollision(player) {
    if (this.collected) return false;
    
    return player.x < this.x + this.width &&
           player.x + player.width > this.x &&
           player.y < this.y + this.height &&
           player.y + player.height > this.y;
  }

  collect() {
    this.collected = true;
  }
}

export class Pushable {
  constructor(x, y, type = 'log') {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 16;
    this.type = type;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
  }

  update(deltaTime, level) {
    // Apply gravity
    if (!this.onGround) {
      this.vy += 1600 * deltaTime;
    }
    
    // Apply friction
    this.vx *= 0.9;
    
    // Update position
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    
    // Check ground collision
    const groundCollision = level.checkTileCollision(this.x, this.y + this.height, this.width, 1);
    if (groundCollision.collided) {
      this.y = groundCollision.y - this.height;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }
  }

  push(direction, strength = 1) {
    this.vx += direction * 200 * strength;
  }

  checkCollision(player) {
    return player.x < this.x + this.width &&
           player.x + player.width > this.x &&
           player.y < this.y + this.height &&
           player.y + player.height > this.y;
  }
}

export class Trigger {
  constructor(x, y, width, height, type, id) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.id = id;
    this.activated = false;
  }

  checkCollision(player) {
    return player.x < this.x + this.width &&
           player.x + player.width > this.x &&
           player.y < this.y + this.height &&
           player.y + player.height > this.y;
  }

  activate() {
    this.activated = true;
  }
}
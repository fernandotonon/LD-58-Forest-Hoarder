/**
 * Simple 2D physics system for platformer
 * Handles gravity, movement, and AABB collision detection
 */

import { GRAVITY, MOVE_ACCEL, MAX_RUN_SPEED, JUMP_VELOCITY } from '../game/constants.js';

export class Physics {
  constructor() {
    this.gravity = GRAVITY;
    this.friction = 0.85;
    this.airFriction = 0.95;
  }

  // Apply gravity to velocity
  applyGravity(velocity, deltaTime, onGround = false) {
    if (!onGround) {
      velocity.y += this.gravity * deltaTime;
    }
  }

  // Apply horizontal movement with acceleration and friction
  applyMovement(velocity, input, deltaTime, onGround = true) {
    const friction = onGround ? this.friction : this.airFriction;
    
    if (input !== 0) {
      velocity.x += input * MOVE_ACCEL * deltaTime;
      velocity.x = Math.max(-MAX_RUN_SPEED, Math.min(MAX_RUN_SPEED, velocity.x));
    } else {
      velocity.x *= friction;
    }
  }

  // Apply jump velocity
  applyJump(velocity, jumpVelocity = JUMP_VELOCITY) {
    velocity.y = jumpVelocity;
  }

  // Apply dash
  applyDash(velocity, direction, dashSpeed = 320) {
    velocity.x = direction * dashSpeed;
  }

  // Update position based on velocity
  updatePosition(position, velocity, deltaTime) {
    position.x += velocity.x * deltaTime;
    position.y += velocity.y * deltaTime;
  }

  // AABB collision detection
  checkAABB(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  // Swept AABB collision detection
  sweptAABB(rect1, rect2, velocity) {
    const xInvEntry = velocity.x > 0 ? rect2.x - (rect1.x + rect1.width) : (rect2.x + rect2.width) - rect1.x;
    const yInvEntry = velocity.y > 0 ? rect2.y - (rect1.y + rect1.height) : (rect2.y + rect2.height) - rect1.y;
    
    const xInvExit = velocity.x > 0 ? (rect2.x + rect2.width) - rect1.x : rect2.x - (rect1.x + rect1.width);
    const yInvExit = velocity.y > 0 ? (rect2.y + rect2.height) - rect1.y : rect2.y - (rect1.y + rect1.height);
    
    const xEntry = velocity.x === 0 ? -Infinity : xInvEntry / velocity.x;
    const yEntry = velocity.y === 0 ? -Infinity : yInvEntry / velocity.y;
    const xExit = velocity.x === 0 ? Infinity : xInvExit / velocity.x;
    const yExit = velocity.y === 0 ? Infinity : yInvExit / velocity.y;
    
    const entryTime = Math.max(xEntry, yEntry);
    const exitTime = Math.min(xExit, yExit);
    
    if (entryTime > exitTime || xEntry < 0 && yEntry < 0 || xEntry > 1 || yEntry > 1) {
      return { hit: false };
    }
    
    const normalX = xEntry > yEntry ? (xInvEntry < 0 ? 1 : -1) : 0;
    const normalY = yEntry > xEntry ? (yInvEntry < 0 ? 1 : -1) : 0;
    
    return {
      hit: true,
      time: entryTime,
      normal: { x: normalX, y: normalY }
    };
  }

  // Resolve collision by separating objects
  resolveCollision(position, velocity, collision, deltaTime) {
    if (!collision.hit) return false;
    
    const time = collision.time;
    const normal = collision.normal;
    
    // Move back to collision point
    position.x -= velocity.x * deltaTime * (1 - time);
    position.y -= velocity.y * deltaTime * (1 - time);
    
    // Stop velocity in collision direction
    if (normal.x !== 0) {
      velocity.x = 0;
    }
    if (normal.y !== 0) {
      velocity.y = 0;
    }
    
    return true;
  }
}
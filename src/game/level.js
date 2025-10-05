/**
 * Level data and tilemap generation
 * Defines the game world layout and entity placement
 */

import { TILE_TYPES, TILE_SIZE, WORLD_WIDTH, WORLD_HEIGHT } from './constants';

export class Level {
  constructor() {
    this.width = WORLD_WIDTH * 800; // 4 screens wide
    this.height = WORLD_HEIGHT * 600; // 3 screens tall
    this.tileSize = TILE_SIZE;
    this.tiles = [];
    this.entities = [];
    this.pickups = [];
    this.pushables = [];
    this.triggers = [];
    
    this.generateLevel();
  }

  generateLevel() {
    this.generateTerrain();
    this.generateEntities();
    this.generatePickups();
    this.generatePushables();
    this.generateTriggers();
  }

  generateTerrain() {
    const tileWidth = Math.ceil(this.width / this.tileSize);
    const tileHeight = Math.ceil(this.height / this.tileSize);
    
    this.tiles = Array(tileHeight).fill().map(() => Array(tileWidth).fill(TILE_TYPES.AIR));
    
    // Generate ground
    for (let x = 0; x < tileWidth; x++) {
      const groundY = Math.floor(this.height * 0.8 / this.tileSize);
      for (let y = groundY; y < tileHeight; y++) {
        this.tiles[y][x] = TILE_TYPES.SOLID;
      }
    }
    
    // Add some platforms
    this.addPlatform(200, 400, 3);
    this.addPlatform(500, 350, 2);
    this.addPlatform(800, 300, 4);
    this.addPlatform(1200, 400, 3);
    
    // Add some slopes (if time allows)
    // this.addSlope(600, 450, 4, 'left');
    // this.addSlope(1000, 450, 4, 'right');
  }

  addPlatform(x, y, width) {
    const startX = Math.floor(x / this.tileSize);
    const startY = Math.floor(y / this.tileSize);
    
    for (let i = 0; i < width; i++) {
      if (startX + i < this.tiles[0].length && startY < this.tiles.length) {
        this.tiles[startY][startX + i] = TILE_TYPES.SOLID;
      }
    }
  }

  addSlope(x, y, width, direction) {
    const startX = Math.floor(x / this.tileSize);
    const startY = Math.floor(y / this.tileSize);
    
    for (let i = 0; i < width; i++) {
      const tileX = startX + i;
      const tileY = startY - i;
      
      if (tileX < this.tiles[0].length && tileY >= 0 && tileY < this.tiles.length) {
        this.tiles[tileY][tileX] = direction === 'left' ? TILE_TYPES.SLOPE_L : TILE_TYPES.SLOPE_R;
      }
    }
  }

  generateEntities() {
    // Nest (home base)
    this.entities.push({
      type: 'nest',
      x: 100,
      y: 400,
      width: 80,
      height: 60,
      id: 'nest'
    });
    
    // Trees for decoration
    for (let i = 0; i < 15; i++) {
      this.entities.push({
        type: 'tree',
        x: 150 + i * 200,
        y: 300 + Math.sin(i) * 50,
        width: 40,
        height: 80,
        id: `tree_${i}`
      });
    }
  }

  generatePickups() {
    const pickupTypes = ['acorn', 'hazelnut', 'berry', 'mushroom'];
    
    // Scatter pickups around the level
    for (let i = 0; i < 50; i++) {
      const type = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
      const x = 200 + Math.random() * (this.width - 400);
      const y = 200 + Math.random() * 200;
      
      this.pickups.push({
        type,
        x,
        y,
        width: 16,
        height: 16,
        id: `pickup_${i}`,
        collected: false
      });
    }
  }

  generatePushables() {
    // Add some pushable logs
    for (let i = 0; i < 5; i++) {
      this.pushables.push({
        type: 'log',
        x: 300 + i * 300,
        y: 400,
        width: 32,
        height: 16,
        id: `log_${i}`,
        vx: 0,
        vy: 0
      });
    }
  }

  generateTriggers() {
    // Nest trigger zone
    this.triggers.push({
      type: 'nest_zone',
      x: 80,
      y: 380,
      width: 120,
      height: 100,
      id: 'nest_trigger'
    });
    
    // Lever triggers for puzzles
    this.triggers.push({
      type: 'lever',
      x: 600,
      y: 350,
      width: 20,
      height: 40,
      id: 'lever_1',
      activated: false
    });
  }

  // Get tile at world coordinates
  getTileAt(x, y) {
    const tileX = Math.floor(x / this.tileSize);
    const tileY = Math.floor(y / this.tileSize);
    
    if (tileX < 0 || tileX >= this.tiles[0].length || 
        tileY < 0 || tileY >= this.tiles.length) {
      return TILE_TYPES.AIR;
    }
    
    return this.tiles[tileY][tileX];
  }

  // Check collision with tiles
  checkTileCollision(x, y, width, height) {
    const left = Math.floor(x / this.tileSize);
    const right = Math.floor((x + width) / this.tileSize);
    const top = Math.floor(y / this.tileSize);
    const bottom = Math.floor((y + height) / this.tileSize);
    
    for (let ty = top; ty <= bottom; ty++) {
      for (let tx = left; tx <= right; tx++) {
        if (ty >= 0 && ty < this.tiles.length && 
            tx >= 0 && tx < this.tiles[0].length) {
          const tile = this.tiles[ty][tx];
          if (tile === TILE_TYPES.SOLID || tile === TILE_TYPES.SPIKES) {
            return {
              collided: true,
              tile,
              x: tx * this.tileSize,
              y: ty * this.tileSize
            };
          }
        }
      }
    }
    
    return { collided: false };
  }

  // Get all entities in a region
  getEntitiesInRegion(x, y, width, height) {
    return this.entities.filter(entity => 
      entity.x < x + width &&
      entity.x + entity.width > x &&
      entity.y < y + height &&
      entity.y + entity.height > y
    );
  }

  // Get all pickups in a region
  getPickupsInRegion(x, y, width, height) {
    return this.pickups.filter(pickup => 
      !pickup.collected &&
      pickup.x < x + width &&
      pickup.x + pickup.width > x &&
      pickup.y < y + height &&
      pickup.y + pickup.height > y
    );
  }
}
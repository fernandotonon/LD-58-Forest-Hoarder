/**
 * Game constants and configuration
 * All the magic numbers that control gameplay balance
 */

// Time and seasons
export const DAYS_PER_SEASON = 6;
export const SECONDS_PER_DAY = 360; // 6 minutes per day
export const TOTAL_DAYS = 24; // 4 seasons * 6 days

// Physics constants
export const GRAVITY = 1600;        // px/s^2
export const MOVE_ACCEL = 2200;     // px/s^2
export const MAX_RUN_SPEED = 190;   // px/s
export const JUMP_VELOCITY = -520;  // px/s
export const COYOTE_TIME = 0.12;    // s
export const JUMP_BUFFER = 0.12;    // s
export const DASH_SPEED = 320;      // px/s
export const DASH_DURATION = 0.2;   // s
export const STAMINA_MAX = 100;
export const STAMINA_RECOVERY = 18; // per s
export const STAMINA_DASH_COST = 25;

// Player properties
export const PLAYER_WIDTH = 24;
export const PLAYER_HEIGHT = 32;
export const PLAYER_SPEED_MULTIPLIER = 0.8; // When carrying items

// Inventory
export const INV_BASE_SLOTS = 10;
export const INV_BASKET_BONUS = 5;

// Winter survival
export const CALORIES_PER_DAY_WINTER = 10;
export const WARMTH_PER_DAY_WINTER = 5;
export const INSULATION_BONUS = 2; // Reduces warmth drain

// Item properties
export const ITEM_CALORIES = {
  acorn: 2,
  berry: 1,
  pine: 2,
  leaf: 0,
};

export const ITEM_WEIGHT = {
  acorn: 1,
  berry: 0.5,
  pine: 1,
  leaf: 0.2,
  twig: 0.3,
};

export const ITEM_STACK_SIZE = {
  acorn: 10,
  berry: 20,
  pine: 10,
  leaf: 50,
  twig: 30,
  preserved: 10
};

// Core collectible kinds with sprite coverage
export const ITEM_KINDS = ['acorn', 'berry', 'pine', 'leaf'];

// Tile types
export const TILE_TYPES = {
  AIR: 0,
  SOLID: 1,
  SLOPE_L: 2,
  SLOPE_R: 3,
  ONE_WAY: 4,
  SPIKES: 5,
  WATER: 6,
  NEST: 7
};

// Upgrade costs
export const UPGRADE_COSTS = {
  basket: { leaf: 20, pine: 10 },
  insulation: { leaf: 30, pine: 15 },
  rack: { pine: 25, leaf: 15 },
  pillow: { leaf: 40, pine: 5 },
  map: { pine: 20, leaf: 10 }
};

// Visual constants
export const TILE_SIZE = 32;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const WORLD_WIDTH = 4; // screens wide
export const WORLD_HEIGHT = 3; // screens tall

// Seasonal palettes
export const SEASONAL_PALETTES = {
  Spring: {
    primary: '#8FBC8F',
    secondary: '#98FB98',
    accent: '#90EE90',
    background: '#F0FFF0'
  },
  Summer: {
    primary: '#228B22',
    secondary: '#32CD32',
    accent: '#00FF00',
    background: '#F5FFFA'
  },
  Fall: {
    primary: '#CD853F',
    secondary: '#DEB887',
    accent: '#FF8C00',
    background: '#FFF8DC'
  },
  Winter: {
    primary: '#4682B4',
    secondary: '#87CEEB',
    accent: '#B0E0E6',
    background: '#F0F8FF'
  }
};

// Weather effects
export const WEATHER_EFFECTS = {
  sunny: { friction: 1.0, visibility: 1.0 },
  cloudy: { friction: 1.0, visibility: 0.9 },
  rainy: { friction: 0.7, visibility: 0.7 },
  hot: { friction: 1.0, visibility: 1.0 },
  windy: { friction: 0.8, visibility: 0.8 },
  snowy: { friction: 0.6, visibility: 0.6 },
  stormy: { friction: 0.5, visibility: 0.5 }
};

// Debug flags
export const DEBUG = {
  SHOW_COLLIDERS: false,
  SHOW_FPS: false,
  SHOW_GRID: false,
  INVINCIBLE: false,
  FAST_TIME: false
};
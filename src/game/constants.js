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
export const PLAYER_MAX_HEALTH = 5;
export const PLAYER_INVINCIBILITY_TIME = 1.0; // seconds
export const PLAYER_ATTACK_RANGE = 35;
export const PLAYER_ATTACK_DAMAGE = 1;

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

// Enemy types and properties
export const ENEMY_TYPES = {
  WOLF: {
    name: 'wolf',
    health: 3,
    speed: 80,
    damage: 1,
    detectionRange: 120,
    attackRange: 30,
    chaseSpeed: 120,
    patrolDistance: 100,
    color: '#8B4513'
  },
  BEAR: {
    name: 'bear',
    health: 5,
    speed: 40,
    damage: 2,
    detectionRange: 80,
    attackRange: 40,
    chaseSpeed: 60,
    patrolDistance: 60,
    color: '#654321'
  },
  HAWK: {
    name: 'hawk',
    health: 2,
    speed: 100,
    damage: 1,
    detectionRange: 150,
    attackRange: 25,
    chaseSpeed: 140,
    patrolDistance: 200,
    color: '#8B4513',
    flying: true
  }
};

// Enemy spawn rates by season
export const ENEMY_SPAWN_RATES = {
  Spring: { wolf: 0.1, bear: 0.05, hawk: 0.15 },
  Summer: { wolf: 0.15, bear: 0.08, hawk: 0.2 },
  Fall: { wolf: 0.2, bear: 0.12, hawk: 0.25 },
  Winter: { wolf: 0.3, bear: 0.2, hawk: 0.1 }
};

// Quest system
export const QUEST_TYPES = {
  COLLECT: 'collect',
  KILL: 'kill',
  SURVIVE: 'survive',
  BUILD: 'build',
  EXPLORE: 'explore'
};

export const QUEST_REWARDS = {
  MATERIALS: 'materials',
  HEALTH: 'health',
  STAMINA: 'stamina',
  ITEMS: 'items'
};

export const DAILY_QUESTS = [
  {
    id: 'collect_acorns',
    type: QUEST_TYPES.COLLECT,
    title: 'Acorn Collector',
    description: 'Collect 10 acorns today',
    target: { item: 'acorn', quantity: 10 },
    reward: { type: QUEST_REWARDS.MATERIALS, leaf: 5, pine: 2 },
    difficulty: 1
  },
  {
    id: 'collect_berries',
    type: QUEST_TYPES.COLLECT,
    title: 'Berry Picker',
    description: 'Collect 15 berries today',
    target: { item: 'berry', quantity: 15 },
    reward: { type: QUEST_REWARDS.HEALTH, amount: 1 },
    difficulty: 1
  },
  {
    id: 'kill_wolves',
    type: QUEST_TYPES.KILL,
    title: 'Wolf Hunter',
    description: 'Defeat 3 wolves today',
    target: { enemy: 'wolf', quantity: 3 },
    reward: { type: QUEST_REWARDS.MATERIALS, leaf: 10, pine: 5 },
    difficulty: 2
  },
  {
    id: 'survive_day',
    type: QUEST_TYPES.SURVIVE,
    title: 'Survivor',
    description: 'Survive the day without dying',
    target: { time: 1 },
    reward: { type: QUEST_REWARDS.STAMINA, amount: 20 },
    difficulty: 1
  }
];

export const SEASONAL_QUESTS = {
  Spring: [
    {
      id: 'spring_harvest',
      type: QUEST_TYPES.COLLECT,
      title: 'Spring Harvest',
      description: 'Collect 50 items this season',
      target: { total: 50 },
      reward: { type: QUEST_REWARDS.MATERIALS, leaf: 20, pine: 10 },
      difficulty: 2
    }
  ],
  Summer: [
    {
      id: 'summer_stockpile',
      type: QUEST_TYPES.COLLECT,
      title: 'Summer Stockpile',
      description: 'Collect 100 items this season',
      target: { total: 100 },
      reward: { type: QUEST_REWARDS.MATERIALS, leaf: 30, pine: 15 },
      difficulty: 3
    }
  ],
  Fall: [
    {
      id: 'fall_preparation',
      type: QUEST_TYPES.COLLECT,
      title: 'Fall Preparation',
      description: 'Collect 150 items this season',
      target: { total: 150 },
      reward: { type: QUEST_REWARDS.MATERIALS, leaf: 40, pine: 20 },
      difficulty: 3
    }
  ],
  Winter: [
    {
      id: 'winter_survival',
      type: QUEST_TYPES.SURVIVE,
      title: 'Winter Survival',
      description: 'Survive the entire winter',
      target: { days: 6 },
      reward: { type: QUEST_REWARDS.HEALTH, amount: 2 },
      difficulty: 4
    }
  ]
};

// Achievement system
export const ACHIEVEMENTS = [
  {
    id: 'first_collection',
    title: 'First Steps',
    description: 'Collect your first item',
    icon: '🌰',
    condition: { type: 'collect', total: 1 },
    reward: { materials: { leaf: 5 } }
  },
  {
    id: 'hoarder',
    title: 'Hoarder',
    description: 'Collect 100 items total',
    icon: '📦',
    condition: { type: 'collect', total: 100 },
    reward: { materials: { leaf: 20, pine: 10 } }
  },
  {
    id: 'master_hoarder',
    title: 'Master Hoarder',
    description: 'Collect 500 items total',
    icon: '🏆',
    condition: { type: 'collect', total: 500 },
    reward: { materials: { leaf: 50, pine: 25 } }
  },
  {
    id: 'first_kill',
    title: 'Hunter',
    description: 'Defeat your first enemy',
    icon: '⚔️',
    condition: { type: 'kill', total: 1 },
    reward: { materials: { leaf: 10, pine: 5 } }
  },
  {
    id: 'wolf_slayer',
    title: 'Wolf Slayer',
    description: 'Defeat 10 wolves',
    icon: '🐺',
    condition: { type: 'kill', enemy: 'wolf', total: 10 },
    reward: { materials: { leaf: 30, pine: 15 } }
  },
  {
    id: 'bear_hunter',
    title: 'Bear Hunter',
    description: 'Defeat 5 bears',
    icon: '🐻',
    condition: { type: 'kill', enemy: 'bear', total: 5 },
    reward: { materials: { leaf: 40, pine: 20 } }
  },
  {
    id: 'survivor',
    title: 'Survivor',
    description: 'Survive 10 days',
    icon: '💪',
    condition: { type: 'survive', days: 10 },
    reward: { health: 1 }
  },
  {
    id: 'season_master',
    title: 'Season Master',
    description: 'Complete all 4 seasons',
    icon: '🌍',
    condition: { type: 'season', total: 4 },
    reward: { materials: { leaf: 100, pine: 50 } }
  },
  {
    id: 'nest_builder',
    title: 'Nest Builder',
    description: 'Build 5 nest upgrades',
    icon: '🏠',
    condition: { type: 'upgrade', total: 5 },
    reward: { materials: { leaf: 25, pine: 12 } }
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete 20 quests',
    icon: '⭐',
    condition: { type: 'quest', total: 20 },
    reward: { materials: { leaf: 60, pine: 30 } }
  }
];

// Power-up system
export const POWERUP_TYPES = {
  HEALTH_POTION: {
    name: 'health_potion',
    title: 'Health Potion',
    description: 'Restores 2 health points',
    icon: '❤️',
    duration: 0, // Instant effect
    effect: { type: 'health', amount: 2 },
    rarity: 'common',
    color: '#FF6B6B'
  },
  STAMINA_BOOST: {
    name: 'stamina_boost',
    title: 'Stamina Boost',
    description: 'Increases max stamina by 20 for 30 seconds',
    icon: '⚡',
    duration: 30,
    effect: { type: 'stamina_boost', amount: 20 },
    rarity: 'common',
    color: '#FFD700'
  },
  SPEED_BOOST: {
    name: 'speed_boost',
    title: 'Speed Boost',
    description: 'Increases movement speed by 50% for 20 seconds',
    icon: '💨',
    duration: 20,
    effect: { type: 'speed_boost', multiplier: 1.5 },
    rarity: 'uncommon',
    color: '#87CEEB'
  },
  INVINCIBILITY: {
    name: 'invincibility',
    title: 'Invincibility',
    description: 'Makes you invincible for 10 seconds',
    icon: '🛡️',
    duration: 10,
    effect: { type: 'invincibility' },
    rarity: 'rare',
    color: '#9370DB'
  },
  MAGNET: {
    name: 'magnet',
    title: 'Item Magnet',
    description: 'Attracts nearby items for 15 seconds',
    icon: '🧲',
    duration: 15,
    effect: { type: 'magnet', range: 100 },
    rarity: 'uncommon',
    color: '#FF8C00'
  },
  DOUBLE_POINTS: {
    name: 'double_points',
    title: 'Double Points',
    description: 'Double quest progress for 30 seconds',
    icon: '⭐',
    duration: 30,
    effect: { type: 'double_points', multiplier: 2 },
    rarity: 'rare',
    color: '#FFD700'
  }
};

export const POWERUP_SPAWN_RATES = {
  Spring: { health_potion: 0.3, stamina_boost: 0.2, speed_boost: 0.1, invincibility: 0.05, magnet: 0.1, double_points: 0.05 },
  Summer: { health_potion: 0.25, stamina_boost: 0.25, speed_boost: 0.15, invincibility: 0.08, magnet: 0.12, double_points: 0.08 },
  Fall: { health_potion: 0.2, stamina_boost: 0.2, speed_boost: 0.2, invincibility: 0.1, magnet: 0.15, double_points: 0.1 },
  Winter: { health_potion: 0.4, stamina_boost: 0.3, speed_boost: 0.1, invincibility: 0.15, magnet: 0.2, double_points: 0.15 }
};

// Tile types
export const TILE_TYPES = {
  AIR: 0,
  SOLID: 1,
  SLOPE_L: 2,
  SLOPE_R: 3,
  ONE_WAY: 4,
  SPIKES: 5,
  WATER: 6,
  NEST: 7,
  PLATFORM: 8,
  PIT: 9
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

// Challenge layout (screen-space coordinates)
export const CHALLENGES = {
  pits: [
    // x, width, depth (y follows ground, depth makes pit deeper)
    { x: 420, width: 100, depth: 80 },
    { x: 980, width: 120, depth: 100 },
  ],
  spikes: [
    // x, y (baseline 560), width
    { x: 700, y: 560, width: 80 },
  ],
  platforms: [
    // Static platforms: x, y, width
    { x: 600, y: 480, width: 100 },
    { x: 1050, y: 440, width: 120 },
  ],
  movers: [
    // Moving platforms: x, y, width, dx, dy, range
    { x: 800, y: 500, width: 90, dx: 0, dy: -40, range: 80 },
  ]
};
/**
 * Main game systems for updating game state
 * Handles player movement, physics, interactions, and game logic
 */

import { useStore } from '../state/useStore';
import audioManager from '../audio/AudioManager';
import { 
  GRAVITY, 
  MOVE_ACCEL, 
  MAX_RUN_SPEED, 
  JUMP_VELOCITY,
  DASH_SPEED,
  STAMINA_DASH_COST,
  STAMINA_RECOVERY,
  CALORIES_PER_DAY_WINTER,
  CANVAS_WIDTH,
  WORLD_WIDTH,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_INVINCIBILITY_TIME,
  PLAYER_ATTACK_RANGE,
  PLAYER_ATTACK_DAMAGE,
  ENEMY_TYPES,
  ENEMY_SPAWN_RATES,
  QUEST_TYPES,
  POWERUP_TYPES,
  POWERUP_SPAWN_RATES
} from './constants';
import { CHALLENGES } from './constants';

export function updateGame(deltaTime, { input, camera, physics, time, rng, canvas }) {
  const { 
    player, 
    updatePlayer, 
    setPlayerVelocity, 
    movePlayer,
    addToInventory,
    addToPantry,
    addMaterials,
    setSeason,
    setDay,
    setWeather,
    setTimeOfDay,
    showWinLose,
    toggleNest,
    addNotification,
    damagePlayer,
    addEnemy,
    removeEnemy,
    updateEnemy,
    world
  } = useStore.getState();



  // Update time
  time.update(deltaTime);
  
  // Update input
  input.update(deltaTime);

  // Update player
  updatePlayerMovement(deltaTime, input, physics, player, updatePlayer, setPlayerVelocity);
  
  // Update player combat and invincibility
  updatePlayerCombat(deltaTime, input, player, updatePlayer, world.enemies, updateEnemy, addNotification);

  // Auto-close nest UI if player moves left/right
  if (input.getHorizontal() !== 0) {
    const { ui, toggleNest } = useStore.getState();
    if (ui.showNest) toggleNest();
  }

  // Spawn and update collectibles
  updateCollectibles(deltaTime, rng);
  handlePickupCollisions(addToPantry, addNotification);
  
  // Spawn and update power-ups
  updatePowerupSpawns(deltaTime, rng, time);
  handlePowerupCollisions(addNotification);
  
  // Update enemies
  updateEnemies(deltaTime, rng, time, addEnemy, removeEnemy, updateEnemy, damagePlayer, addNotification);
  
  // Update quest system
  updateQuestSystem(deltaTime, time);
  
  // Update power-up system
  updatePowerupSystem(deltaTime, time);
  
  // Update camera
  camera.follow(player, deltaTime);
  
  // Update game state
  setTimeOfDay(time.getTimeOfDay());
  setWeather(time.weather);
  setSeason(time.season);
  setDay(time.day);

  // Handle interactions
  handleInteractions(input, player, toggleNest, addToInventory, addNotification);
  
  // Handle quest UI
  if (input.isQuestPressed()) {
    const { ui, toggleQuests } = useStore.getState();
    toggleQuests();
  }
  
  // Handle achievement UI
  if (input.isAchievementPressed()) {
    const { ui, toggleAchievements } = useStore.getState();
    toggleAchievements();
  }
  
  // Update audio manager
  audioManager.updateBattle(deltaTime);

  // Clear just pressed states after all systems that consume input
  input.clearJustPressed();

  // Check win/lose conditions
  checkWinLoseConditions(time, showWinLose);
}

function updatePlayerMovement(deltaTime, input, physics, player, updatePlayer, setPlayerVelocity) {
  let { x, y, vx, vy, onGround, stamina, facing, carryWeight, maxCarryWeight } = player;
  
  // Get input
  const horizontal = input.getHorizontal();
  const isJumpPressed = input.isJumpPressed();
  const isJumpJustPressed = input.isJumpJustPressed();
  const isDashPressed = input.isDashPressed();
  
  // Update facing
  if (horizontal !== 0) {
    facing = horizontal > 0 ? 'right' : 'left';
  }
  
  // Apply movement with encumbrance
  const speedMultiplier = Math.max(0.3, 1 - (carryWeight / maxCarryWeight) * 0.7);
  const moveAccel = MOVE_ACCEL * speedMultiplier;
  const maxSpeed = MAX_RUN_SPEED * speedMultiplier;
  
  if (horizontal !== 0) {
    vx += horizontal * moveAccel * deltaTime;
    vx = Math.max(-maxSpeed, Math.min(maxSpeed, vx));
  } else {
    vx *= 0.85; // Friction
  }
  
  // Apply gravity
  if (!onGround) {
    vy += GRAVITY * deltaTime;
  }
  
  // Handle jumping
  if (isJumpJustPressed) {
    if (onGround || input.hasCoyoteTime()) {
      vy = JUMP_VELOCITY;
      onGround = false;
      input.setCoyoteTime(0); // Consume coyote time
      audioManager.onPlayerJump();
    }
  }
  
  // Handle dashing
  if (isDashPressed && stamina >= STAMINA_DASH_COST) {
    vx = horizontal * DASH_SPEED;
    stamina -= STAMINA_DASH_COST * deltaTime;
  }
  
  // Stamina recovery
  if (!isDashPressed) {
    stamina = Math.min(100, stamina + STAMINA_RECOVERY * deltaTime);
  }
  
  // Update position first
  x += vx * deltaTime;
  y += vy * deltaTime;
  
  // Check ground collision AFTER updating position
  const groundY = 500;
  const wasOnGround = onGround;
  
  if (y + PLAYER_HEIGHT/2 >= groundY) {
    y = groundY - PLAYER_HEIGHT/2; // Position player on ground
    vy = 0;
    onGround = true;
    if (!wasOnGround) {
      input.setCoyoteTime(); // Only set coyote time when landing
    }
  } else {
    onGround = false;
  }
  
  
  // Clamp to world bounds
  const maxX = WORLD_WIDTH * CANVAS_WIDTH;
  if (x < 0) x = 0;
  if (x > maxX) x = maxX;
  
  // Platform landing (one-way from above)
  CHALLENGES.platforms.forEach(pl => {
    const withinX = (x > pl.x - PLAYER_WIDTH/2) && (x < pl.x + pl.width + PLAYER_WIDTH/2);
    const landingY = pl.y;
    if (vy >= 0 && withinX) {
      // If feet cross the platform level this frame
      const feetY = y + PLAYER_HEIGHT/2; // Use bottom of player
      if (feetY >= landingY && feetY <= landingY + 20) {
        y = landingY - PLAYER_HEIGHT/2; // Position player on top of platform
        vy = 0;
        onGround = true;
      }
    }
  });

  // Pit collision - check if player falls into pit
  CHALLENGES.pits.forEach(pit => {
    const withinX = (x > pit.x) && (x < pit.x + pit.width);
    const pitY = groundY; // Pit starts at ground level
    const pitDepth = pit.depth || 80;
    
    if (withinX && y + PLAYER_HEIGHT/2 >= pitY) {
      // Player is in pit area and below ground level
      if (y + PLAYER_HEIGHT/2 >= pitY + pitDepth) {
        // Player fell too deep - reset to spawn or take damage
        const { damagePlayer } = useStore.getState();
        damagePlayer(1);
        // Reset player position to nest area
        x = 100;
        y = 400;
        vx = 0;
        vy = 0;
        onGround = false;
      }
    }
  });

  // Update player state
  updatePlayer({
    x, y, vx, vy, onGround, stamina, facing
  });
}

function handleInteractions(input, player, toggleNest, addToInventory, addNotification) {
  // Check for nest interaction
  if (input.isInteractPressed()) {
    const nestX = 100;
    const nestY = 500; // align with ground baseline used in draw
    const nestWidth = 80;
    const nestHeight = 60;
    
    // Check if player is near nest
    if (player.x < nestX + nestWidth &&
        player.x + 24 > nestX &&
        player.y < nestY + nestHeight &&
        player.y + 32 > nestY) {
      // Open nest UI only; deposit is done via button inside Nest UI
      toggleNest();
      addNotification('Nest opened', 'info', 800);
      return;
    }
    
    // Spawn random pickups for demo
    const pickupTypes = ITEM_KINDS;
    const randomType = pickupTypes[Math.floor(Math.random() * pickupTypes.length)];
    
    if (player.inventory.length < 10) {
      addToInventory(randomType, 1);
      addNotification(`Found ${randomType}!`, 'success');
    } else {
      addNotification('Inventory full!', 'warning');
    }
  }
}

function checkWinLoseConditions(time, showWinLose) {
  const { nest, player } = useStore.getState();
  
  // Check if player is dead
  if (player.health <= 0) {
    showWinLose('lose', 'attack');
    return;
  }
  
  // Check if it's the last day of winter
  if (time.isLastDay()) {
    showWinLose('win');
    return;
  }
  
  // Check if winter and no food
  if (time.isWinter()) {
    const totalFood = Object.values(nest.pantry).reduce((total, count) => total + count, 0);
    if (totalFood === 0) {
      showWinLose('lose', 'starvation');
      return;
    }
  }
}

// --- Collectibles world spawning and pickup ---
const worldState = {
  pickups: [] // {id, x, y, kind, bob}
};

import { ITEM_KINDS } from './constants';
const PICKUP_KINDS = ITEM_KINDS;

function updateCollectibles(deltaTime, rng) {
  // Keep a small number of pickups active near the play area
  const targetCount = 8;
  if (worldState.pickups.length < targetCount) {
    const toSpawn = targetCount - worldState.pickups.length;
    for (let i = 0; i < toSpawn; i++) {
      const kind = PICKUP_KINDS[Math.floor(Math.random() * PICKUP_KINDS.length)];
      // Spawn items further from the nest, across a wider area
      const x = 200 + Math.random() * 2000; // spread across wider area
      const y = 468 + Math.random() * 8; // near ground (500 minus half sprite)
      worldState.pickups.push({ id: Date.now() + Math.random(), x, y, kind, bob: Math.random() * Math.PI * 2 });
    }
  }

  // Bob animation
  worldState.pickups.forEach(p => {
    p.bob += deltaTime * 2;
  });
}

function handlePickupCollisions(addToPantry, addNotification) {
  const { player } = useStore.getState();
  const px = player.x;
  const py = player.y;
  const pw = 24;
  const ph = 32;

  for (let i = worldState.pickups.length - 1; i >= 0; i--) {
    const p = worldState.pickups[i];
    // simple AABB overlap with small radius
    const dx = Math.abs((px) - (p.x));
    const dy = Math.abs((py) - (p.y));
    if (dx < 20 && dy < 24) {
      // collect into inventory (not pantry)
      const { addToInventory } = useStore.getState();
      addToInventory(p.kind, 1);
      addNotification(`Picked ${p.kind}`, 'success', 1000);
      audioManager.onItemPickup();
      
      // Update quest progress
      checkQuestCompletion(p.kind, 1);
      
      // Update achievement stats
      const { updateAchievementStats, checkAchievements } = useStore.getState();
      updateAchievementStats('itemsCollected', 1);
      checkAchievements();
      
      worldState.pickups.splice(i, 1);
    }
  }
}

export function getWorldPickups() {
  return worldState.pickups;
}

// --- Power-up Spawning and Collision ---
const powerupWorldState = {
  powerups: [] // {id, x, y, type, bob}
};

function updatePowerupSpawns(deltaTime, rng, time) {
  // Keep a small number of power-ups active near the play area
  const targetCount = 3;
  if (powerupWorldState.powerups.length < targetCount) {
    const toSpawn = targetCount - powerupWorldState.powerups.length;
    for (let i = 0; i < toSpawn; i++) {
      // Spawn power-ups further from the nest, across a wider area
      const x = 300 + Math.random() * 1800; // spread across wider area
      const y = 468 + Math.random() * 8; // near ground
      const powerup = spawnPowerup(x, y, time);
      if (powerup) {
        powerupWorldState.powerups.push(powerup);
      }
    }
  }

  // Bob animation
  powerupWorldState.powerups.forEach(p => {
    p.bob += deltaTime * 2;
  });
}

function handlePowerupCollisions(addNotification) {
  const { player } = useStore.getState();
  const px = player.x;
  const py = player.y;
  const pw = 24;
  const ph = 32;

  for (let i = powerupWorldState.powerups.length - 1; i >= 0; i--) {
    const p = powerupWorldState.powerups[i];
    // simple AABB overlap with small radius
    const dx = Math.abs((px) - (p.x));
    const dy = Math.abs((py) - (p.y));
    if (dx < 20 && dy < 24) {
      // collect power-up
      const { addPowerup } = useStore.getState();
      addPowerup(p);
      addNotification(`Found ${p.title}!`, 'success', 2000);
      powerupWorldState.powerups.splice(i, 1);
    }
  }
}

export function getWorldPowerups() {
  return powerupWorldState.powerups;
}

// --- Enemy System ---
function updateEnemies(deltaTime, rng, time, addEnemy, removeEnemy, updateEnemy, damagePlayer, addNotification) {
  const { player } = useStore.getState();
  
  // Spawn enemies based on season
  if (Math.random() < 0.001) { // Low chance per frame
    const spawnRates = ENEMY_SPAWN_RATES[time.season] || ENEMY_SPAWN_RATES.Spring;
    const enemyTypes = Object.keys(spawnRates);
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    if (Math.random() < spawnRates[randomType]) {
      const enemyType = ENEMY_TYPES[randomType.toUpperCase()];
      if (enemyType) {
        // Spawn enemies much further from the nest (player starts at x=100)
        const spawnDistance = 600 + Math.random() * 800; // 600-1400 pixels away
        const spawnX = player.x + (Math.random() > 0.5 ? spawnDistance : -spawnDistance);
        const enemy = createEnemy(enemyType, spawnX, 500);
        addEnemy(enemy);
      }
    }
  }
  
  // Update existing enemies
  const { world } = useStore.getState();
  world.enemies.forEach(enemy => {
    updateEnemyAI(enemy, player, deltaTime, updateEnemy, damagePlayer, addNotification);
  });
}

function createEnemy(type, x, y) {
  return {
    id: Date.now() + Math.random(),
    type: type.name,
    x: x,
    y: y,
    vx: 0,
    vy: 0,
    health: type.health,
    maxHealth: type.health,
    state: 'patrol', // 'patrol', 'chase', 'attack', 'dead'
    direction: Math.random() > 0.5 ? 1 : -1,
    patrolStartX: x,
    lastAttackTime: 0,
    attackCooldown: 1.0,
    ...type
  };
}

function updateEnemyAI(enemy, player, deltaTime, updateEnemy, damagePlayer, addNotification) {
  if (enemy.health <= 0) {
    updateEnemy(enemy.id, { state: 'dead' });
    setTimeout(() => {
      const { removeEnemy } = useStore.getState();
      removeEnemy(enemy.id);
    }, 1000);
    return;
  }
  
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // State machine
  if (enemy.state === 'patrol') {
    // Move back and forth
    enemy.vx = enemy.speed * enemy.direction * 0.3;
    enemy.x += enemy.vx * deltaTime;
    
    // Check if reached patrol limit
    if (Math.abs(enemy.x - enemy.patrolStartX) > enemy.patrolDistance) {
      enemy.direction *= -1;
    }
    
    // Check if player is in detection range
    if (distance < enemy.detectionRange) {
      updateEnemy(enemy.id, { state: 'chase' });
    }
  }
  
  else if (enemy.state === 'chase') {
    // Move towards player
    const moveX = dx > 0 ? 1 : -1;
    enemy.vx = enemy.chaseSpeed * moveX;
    enemy.x += enemy.vx * deltaTime;
    
    // Check if player is in attack range
    if (distance < enemy.attackRange) {
      updateEnemy(enemy.id, { state: 'attack' });
    }
    
    // Check if player is too far away
    if (distance > enemy.detectionRange * 1.5) {
      updateEnemy(enemy.id, { state: 'patrol' });
    }
  }
  
  else if (enemy.state === 'attack') {
    // Attack player
    const now = performance.now() / 1000;
    if (now - enemy.lastAttackTime > enemy.attackCooldown) {
      damagePlayer(enemy.damage);
      addNotification(`Attacked by ${enemy.type}!`, 'warning');
      enemy.lastAttackTime = now;
    }
    
    // Check if player moved away
    if (distance > enemy.attackRange) {
      updateEnemy(enemy.id, { state: 'chase' });
    }
  }
  
  // Apply gravity for ground enemies
  if (!enemy.flying) {
    enemy.vy += GRAVITY * deltaTime;
    enemy.y += enemy.vy * deltaTime;
    
    // Ground collision
    if (enemy.y >= 500) {
      enemy.y = 500;
      enemy.vy = 0;
    }
  }
  
  // Update enemy position
  updateEnemy(enemy.id, { x: enemy.x, y: enemy.y, vx: enemy.vx, vy: enemy.vy });
}

// --- Player Combat System ---
function updatePlayerCombat(deltaTime, input, player, updatePlayer, enemies, updateEnemy, addNotification) {
  // Update invincibility timer
  if (player.invincibilityTime > 0) {
    updatePlayer({ invincibilityTime: Math.max(0, player.invincibilityTime - deltaTime) });
  }
  
  // Update attack cooldown
  if (player.attackCooldown > 0) {
    updatePlayer({ attackCooldown: Math.max(0, player.attackCooldown - deltaTime) });
  }
  
  // Handle attack input
  if (input.isAttackPressed() && player.attackCooldown <= 0) {
    attackEnemies(player, enemies, updateEnemy, addNotification);
    updatePlayer({ attackCooldown: 0.5 }); // 0.5 second cooldown
  }
  
  // Check for enemy collisions
  checkEnemyCollisions(player, enemies, updatePlayer);
}

function attackEnemies(player, enemies, updateEnemy, addNotification) {
  const attackX = player.x + (player.facing === 'right' ? PLAYER_ATTACK_RANGE : -PLAYER_ATTACK_RANGE);
  const attackY = player.y;
  
  enemies.forEach(enemy => {
    if (enemy.health <= 0) return;
    
    const dx = enemy.x - attackX;
    const dy = enemy.y - attackY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < PLAYER_ATTACK_RANGE) {
      const newHealth = Math.max(0, enemy.health - PLAYER_ATTACK_DAMAGE);
      updateEnemy(enemy.id, { health: newHealth });
      addNotification(`Hit ${enemy.type}!`, 'success');
      
      if (newHealth <= 0) {
        addNotification(`${enemy.type} defeated!`, 'success');
        // Update quest progress for kills
        checkKillQuest(enemy.type);
        
        // Update achievement stats
        const { updateAchievementStats, checkAchievements } = useStore.getState();
        updateAchievementStats('enemiesKilled', 1);
        checkAchievements();
        audioManager.onPlayerAttacked(); // Extend battle music
      }
    }
  });
}

function checkEnemyCollisions(player, enemies, updatePlayer) {
  if (player.invincibilityTime > 0) return;
  
  enemies.forEach(enemy => {
    if (enemy.health <= 0 || enemy.state === 'dead') return;
    
    const dx = Math.abs(player.x - enemy.x);
    const dy = Math.abs(player.y - enemy.y);
    
    // Much larger collision range for much larger enemies
    if (dx < 60 && dy < 70) {
      const { damagePlayer } = useStore.getState();
      damagePlayer(enemy.damage);
      audioManager.onPlayerHit();
    }
  });
}

// --- Quest System ---
export function updateQuestSystem(deltaTime, time) {
  const { quests, updateQuestProgress, generateDailyQuests } = useStore.getState();
  
  // Generate daily quests at start of each day
  if (time.dayChanged && quests.daily.length === 0) {
    generateDailyQuests();
  }
  
  // Update quest progress
  updateQuestProgress('survive_day', time.day);
  
  // Update achievement stats for days survived
  if (time.dayChanged) {
    const { updateAchievementStats, checkAchievements } = useStore.getState();
    updateAchievementStats('daysSurvived', 1);
    checkAchievements();
  }
}

export function updateQuestProgress(questId, progress) {
  const { updateQuestProgress } = useStore.getState();
  updateQuestProgress(questId, progress);
}

export function completeQuest(questId) {
  const { completeQuest, updateAchievementStats, checkAchievements } = useStore.getState();
  completeQuest(questId);
  updateAchievementStats('questsCompleted', 1);
  checkAchievements();
}

export function checkQuestCompletion(itemType, quantity = 1) {
  const { quests, updateQuestProgress } = useStore.getState();
  
  quests.daily.forEach(quest => {
    if (quest.type === QUEST_TYPES.COLLECT && quest.target.item === itemType) {
      const currentProgress = quests.progress[quest.id] || 0;
      updateQuestProgress(quest.id, currentProgress + quantity);
    }
  });
  
  quests.seasonal.forEach(quest => {
    if (quest.type === QUEST_TYPES.COLLECT && quest.target.total) {
      const currentProgress = quests.progress[quest.id] || 0;
      updateQuestProgress(quest.id, currentProgress + quantity);
    }
  });
}

export function checkKillQuest(enemyType) {
  const { quests, updateQuestProgress } = useStore.getState();
  
  quests.daily.forEach(quest => {
    if (quest.type === QUEST_TYPES.KILL && quest.target.enemy === enemyType) {
      const currentProgress = quests.progress[quest.id] || 0;
      updateQuestProgress(quest.id, currentProgress + 1);
    }
  });
}

// --- Power-up System ---
export function updatePowerupSystem(deltaTime, time) {
  const { powerups, removePowerup, updatePowerupDuration } = useStore.getState();
  
  // Update active power-ups
  powerups.active.forEach(powerup => {
    if (powerup.duration > 0) {
      const elapsed = (Date.now() - powerup.startTime) / 1000;
      const remaining = Math.max(0, powerup.duration - elapsed);
      
      if (remaining <= 0) {
        removePowerup(powerup.id);
      } else {
        updatePowerupDuration(powerup.id, remaining);
      }
    }
  });
}

export function spawnPowerup(x, y, time) {
  const spawnRates = POWERUP_SPAWN_RATES[time.season] || POWERUP_SPAWN_RATES.Spring;
  const powerupTypes = Object.keys(spawnRates);
  
  // Randomly select a power-up based on season rates
  let selectedType = null;
  const random = Math.random();
  let cumulative = 0;
  
  for (const type of powerupTypes) {
    cumulative += spawnRates[type];
    if (random <= cumulative) {
      selectedType = type;
      break;
    }
  }
  
  if (selectedType) {
    const powerupType = POWERUP_TYPES[selectedType.toUpperCase()];
    if (powerupType) {
      const powerup = {
        id: Date.now() + Math.random(),
        ...powerupType,
        x: x,
        y: y,
        bob: Math.random() * Math.PI * 2
      };
      
      const { addPowerup } = useStore.getState();
      addPowerup(powerup);
      return powerup;
    }
  }
  
  return null;
}

export function applyPowerupEffect(powerup, player, updatePlayer) {
  const { effect } = powerup;
  
  switch (effect.type) {
    case 'health':
      const { healPlayer } = useStore.getState();
      healPlayer(effect.amount);
      break;
      
    case 'stamina_boost':
      updatePlayer({ 
        maxStamina: 100 + effect.amount,
        stamina: Math.min(100 + effect.amount, player.stamina + effect.amount)
      });
      break;
      
    case 'speed_boost':
      // This would be handled in movement system
      break;
      
    case 'invincibility':
      updatePlayer({ invincibilityTime: effect.duration || 10 });
      break;
      
    case 'magnet':
      // This would be handled in pickup system
      break;
      
    case 'double_points':
      // This would be handled in quest system
      break;
  }
}

export function getActivePowerupEffects() {
  const { powerups } = useStore.getState();
  const effects = {};
  
  powerups.active.forEach(powerup => {
    const { effect } = powerup;
    
    switch (effect.type) {
      case 'speed_boost':
        effects.speedMultiplier = effect.multiplier;
        break;
      case 'magnet':
        effects.magnetRange = effect.range;
        break;
      case 'double_points':
        effects.questMultiplier = effect.multiplier;
        break;
    }
  });
  
  return effects;
}
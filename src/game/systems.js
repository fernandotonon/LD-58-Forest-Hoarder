/**
 * Main game systems for updating game state
 * Handles player movement, physics, interactions, and game logic
 */

import { useStore } from '../state/useStore';
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
  WORLD_WIDTH
} from './constants';

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
    addNotification
  } = useStore.getState();


  // Update time
  time.update(deltaTime);
  
  // Update input
  input.update(deltaTime);

  // Update player
  updatePlayerMovement(deltaTime, input, physics, player, updatePlayer, setPlayerVelocity);

  // Spawn and update collectibles
  updateCollectibles(deltaTime, rng);
  handlePickupCollisions(addToPantry, addNotification);
  
  // Update camera
  camera.follow(player, deltaTime);
  
  // Update game state
  setTimeOfDay(time.getTimeOfDay());
  setWeather(time.weather);
  setSeason(time.season);
  setDay(time.day);

  // Handle interactions
  handleInteractions(input, player, toggleNest, addToInventory, addNotification);

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
  
  if (y >= groundY) {
    y = groundY;
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
      // Deposit all inventory to pantry when at nest
      const { addToPantry, updatePlayer, getItemWeight } = useStore.getState();
      const inv = [...player.inventory];
      let depositCount = 0;
      for (let i = 0; i < inv.length; i++) {
        const slot = inv[i];
        if (slot && slot.quantity > 0) {
          addToPantry(slot.item, slot.quantity);
          depositCount += slot.quantity;
        }
      }
      // Clear inventory and carry weight
      updatePlayer({ inventory: [], carryWeight: 0 });
      if (depositCount > 0) {
        addNotification(`Deposited ${depositCount} item(s)`, 'info', 1200);
      } else {
        addNotification('Nothing to deposit', 'info', 800);
      }
      // Optionally open nest UI
      toggleNest();
      return;
    }
    
    // Spawn random pickups for demo
    const pickupTypes = ['acorn', 'hazelnut', 'berry', 'mushroom', 'leaf', 'twig'];
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
  const { nest } = useStore.getState();
  
  // Check if it's the last day of winter
  if (time.isLastDay()) {
    showWinLose('win');
    return;
  }
  
  // Check if winter and no food
  if (time.isWinter()) {
    const totalFood = Object.values(nest.pantry).reduce((total, count) => total + count, 0);
    if (totalFood === 0) {
      showWinLose('lose');
      return;
    }
  }
}

// --- Collectibles world spawning and pickup ---
const worldState = {
  pickups: [] // {id, x, y, kind, bob}
};

const PICKUP_KINDS = ['acorn', 'berry', 'cone', 'leaf'];

function updateCollectibles(deltaTime, rng) {
  // Keep a small number of pickups active near the play area
  const targetCount = 8;
  if (worldState.pickups.length < targetCount) {
    const toSpawn = targetCount - worldState.pickups.length;
    for (let i = 0; i < toSpawn; i++) {
      const kind = PICKUP_KINDS[Math.floor(Math.random() * PICKUP_KINDS.length)];
      const x = 160 + Math.random() * 1200; // spread across first screens
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
      worldState.pickups.splice(i, 1);
    }
  }
}

export function getWorldPickups() {
  return worldState.pickups;
}
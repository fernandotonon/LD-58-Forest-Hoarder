/**
 * Main rendering system using Canvas 2D and roughjs
 * Handles all visual drawing including sprites, backgrounds, and UI
 */

import rough from 'roughjs';
import { whenImagesReady } from './assets';
import { SEASONAL_PALETTES, TILE_SIZE } from '../game/constants';
import { drawSquirrel, drawTree, drawCollectible, drawBackground, drawNest, drawGround } from './sprites';
import { getWorldPickups } from '../game/systems';
import { useStore } from '../state/useStore';

let roughCanvas = null;

export function draw(ctx, canvas, { camera, time, alpha }) {

  // Wait for image assets once (no blocking; drawing will fallback until ready)
  whenImagesReady(()=>{ /* noop: ensures browser caches are primed */ });

  // Initialize roughjs
  if (!roughCanvas) {
    roughCanvas = rough.canvas(canvas);
  }

  // Get current season palette
  const palette = SEASONAL_PALETTES[time.season] || SEASONAL_PALETTES.Spring;
  
  // Get player data
  const { player } = useStore.getState();
  
  // Clear canvas with seasonal background
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw parallax backgrounds
  drawParallaxBackgrounds(ctx, roughCanvas, camera, time, palette, canvas);

  // Draw world
  drawWorld(ctx, roughCanvas, camera, time, palette, canvas);

  // Draw entities
  drawEntities(ctx, roughCanvas, camera, time, palette, player);

  // Draw UI overlays
  drawUIOverlays(ctx, roughCanvas, time, palette, canvas);
}

function drawParallaxBackgrounds(ctx, rc, camera, time, palette, canvas) {
  const { x, y } = camera;
  
  // Far background (mountains)
  drawBackground(ctx, canvas.width, canvas.height);

  // Mid background (trees)
  drawBackground(ctx, canvas.width, canvas.height);

  // Near background (grass)
  drawBackground(ctx, canvas.width, canvas.height);
}

function drawWorld(ctx, rc, camera, time, palette, canvas) {
  // Ground line
  const groundY = 600; // baseline aligned with physics

  // Draw tiled ground from tilesheet
  drawGround(ctx, groundY, camera.x, canvas.width, 0.6);

  // Trees
  for (let i = 0; i < 10; i++) {
    const treeX = i * 200 - camera.x;
    const treeY = groundY - 50 - camera.y;
    
    if (camera.isVisible(treeX, treeY, 100)) {
      drawTree(ctx, rc, treeX, treeY, 0.4);
    }
  }
}

function drawEntities(ctx, rc, camera, time, palette, player) {
  // Draw the player squirrel
  const playerX = player.x - camera.x;
  const playerY = player.y - camera.y;
  
  if (camera.isVisible(player.x, player.y, 50)) {
    drawSquirrel(ctx, rc, playerX, playerY, {
      palette,
      season: time.season,
      facing: player.facing,
      scale: 0.5
    });
  }
  
  // Draw world pickups
  const pickups = getWorldPickups();
  for (let i = 0; i < pickups.length; i++) {
    const p = pickups[i];
    const px = p.x - camera.x;
    const py = p.y - camera.y + Math.sin(p.bob) * 3; // bobbing
    if (camera.isVisible(p.x, p.y, 60)) {
      drawCollectible(ctx, px, py, p.kind, 0.18);
    }
  }

  // Draw nest with upgrade level
  const nestX = 100 - camera.x;
  const nestY = 560 - camera.y; // Position at ground level
  
  if (camera.isVisible(100, 500, 100)) {
    // Calculate nest upgrade level based on collected items
    const { nest } = useStore.getState();
    // Level reflects upgrades: sum upgrade levels capped to 3
    const upgradeSum = Object.values(nest.upgrades || {}).reduce((s, v) => s + (v || 0), 0);
    const nestLevel = Math.max(0, Math.min(3, upgradeSum));
    
    drawNest(ctx, rc, nestX + 40, nestY, nestLevel, 0.3); 
  }
}

function drawUIOverlays(ctx, rc, time, palette, canvas) {
  // Draw weather effects
  if (time.weather === 'rainy') {
    drawRain(ctx, rc, palette, canvas);
  } else if (time.weather === 'snowy') {
    drawSnow(ctx, rc, palette, canvas);
  }
}

function drawRain(ctx, rc, palette, canvas) {
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const length = 20 + Math.random() * 10;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + length);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

function drawSnow(ctx, rc, palette, canvas) {
  ctx.fillStyle = 'white';
  ctx.globalAlpha = 0.8;
  
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const size = 2 + Math.random() * 3;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1;
}
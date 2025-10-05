/**
 * Main rendering system using Canvas 2D and roughjs
 * Handles all visual drawing including sprites, backgrounds, and UI
 */

import rough from 'roughjs';
import { SEASONAL_PALETTES, TILE_SIZE } from '../game/constants';
import { drawSquirrel, drawTree, drawNut, drawBackground } from './sprites';
import { useStore } from '../state/useStore';

let roughCanvas = null;

export function draw(ctx, canvas, { camera, time, alpha }) {
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
  drawBackground(ctx, rc, x * 0.1, y * 0.1, canvas.width, canvas.height, {
    type: 'mountains',
    palette,
    season: time.season
  });

  // Mid background (trees)
  drawBackground(ctx, rc, x * 0.3, y * 0.3, canvas.width, canvas.height, {
    type: 'trees',
    palette,
    season: time.season
  });

  // Near background (grass)
  drawBackground(ctx, rc, x * 0.6, y * 0.6, canvas.width, canvas.height, {
    type: 'grass',
    palette,
    season: time.season
  });
}

function drawWorld(ctx, rc, camera, time, palette, canvas) {
  // This would draw the tilemap
  // For now, draw a simple ground
  const groundY = canvas.height - 100;
  
  rc.rectangle(
    -camera.x,
    groundY - camera.y,
    canvas.width + 2000,
    100,
    {
      fill: palette.primary,
      stroke: palette.secondary,
      strokeWidth: 2,
      roughness: 1.5
    }
  );

  // Draw some trees
  for (let i = 0; i < 10; i++) {
    const treeX = i * 200 - camera.x;
    const treeY = groundY - 150 - camera.y;
    
    if (camera.isVisible(treeX, treeY, 100)) {
      drawTree(ctx, rc, treeX, treeY, i, {
        palette,
        season: time.season
      });
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
      facing: player.facing
    });
  }
  
  // Draw nest
  const nestX = 100 - camera.x;
  const nestY = 400 - camera.y;
  
  if (camera.isVisible(100, 400, 100)) {
    rc.rectangle(nestX, nestY, 80, 60, {
      fill: '#8B4513',
      stroke: '#654321',
      strokeWidth: 2,
      roughness: 1.0
    });
    
    // Draw nest entrance
    rc.ellipse(nestX + 40, nestY + 30, 20, 15, {
      fill: '#000000',
      stroke: '#654321',
      strokeWidth: 1,
      roughness: 0.5
    });
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
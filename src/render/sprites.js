
/**
 * Sprite-based drawing using pre-rendered images (hand-drawn style).
 * Falls back to roughjs procedurals if images aren't ready.
 */
import rough from 'roughjs';
import { images } from './assets';

// Helper to make white/light backgrounds transparent
function makeTransparent(img) {
  if (!img || img.width === 0) return img;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = img.width;
  canvas.height = img.height;
  
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Make white/light backgrounds transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // If pixel is white or very light, make it transparent
    if (r > 230 && g > 220 && b > 200) {
      data[i + 3] = 0; // Set alpha to 0 (transparent)
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// Helper to draw a frame from a grid spritesheet
function drawFrame(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh, flip=false) {
  ctx.save();
  
  // Ensure proper transparency handling
  ctx.globalCompositeOperation = 'source-over';
  
  if (flip) {
    ctx.translate(dx + dw/2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(dx + dw/2), 0);
  }
  
  // Draw with transparency support
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
  ctx.restore();
}

// === SQUIRREL ===
// Assume a 3x2 grid on the squirrel.png (each ~1/3 width x 1/2 height)
let squirrelGrid = null;
function getSquirrelGrid() {
  const img = images.squirrel;
  if (!img || !img.width) return null;
  if (!squirrelGrid) {
    const cw = Math.floor(img.width / 3);
    const ch = Math.floor(img.height / 2);
    squirrelGrid = {
      cw, ch,
      frames: {
        idle: [{x:0,y:0},{x:cw,y:0}],                 // 2 frames
        run:  [{x:2*cw,y:0},{x:0,y:ch},{x:cw,y:ch},{x:2*cw,y:ch}], // 4 frames
        jump: [{x:2*cw,y:1*ch},{x:2*cw,y:0}],         // 2 frames
        dash: [{x:1*cw,y:1*ch}],                      // 1 frame
        dead: [{x:0,y:1*ch}],                          // 1 frame (placeholder)
        carry:[{x:1*cw,y:0}]                           // 1 frame (placeholder)
      }
    };
  }
  return squirrelGrid;
}

export function drawSquirrel(ctx, rc, x, y, options = {}) {
  const { action='idle', facing='right', scale=1 } = options;
  const grid = getSquirrelGrid();
  const img = images.squirrel;
  if (grid && img.width) {
    // choose frame by time
    const t = (performance.now()/120) | 0;
    const arr = grid.frames[action] || grid.frames.idle;
    const f = arr[t % arr.length];
    const dw = Math.floor(grid.cw * 0.35 * scale);
    const dh = Math.floor(grid.ch * 0.35 * scale);
    
    // Use transparency processing
    const transparentImg = makeTransparent(img);
    drawFrame(ctx, transparentImg, f.x, f.y, grid.cw, grid.ch, Math.floor(x - dw/2), Math.floor(y - dh/2), dw, dh, facing==='left');
    return;
  }
  // Fallback: tiny procedural
  rc.ellipse(x, y, 20, 30, { fill: '#c08a58', stroke: '#7a5437', roughness: 1.2 });
  rc.ellipse(x + (facing==='left'?-14:14), y-2, 10, 26, { fill: '#c08a58', stroke: '#7a5437', roughness: 1.6 });
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(x+(facing==='left'?-4:4), y-6, 2, 0, Math.PI*2); ctx.fill();
}

// === COLLECTIBLES ===
// Assume 2x2 grid for the collectibles image (we'll map types to crops)
let collGrid = null;
function getCollectibleGrid() {
  const img = images.collectibles;
  if (!img || !img.width) return null;
  if (!collGrid) {
    const cols = 2, rows = 2;
    const cw = Math.floor(img.width / cols);
    const ch = Math.floor(img.height / rows);
    collGrid = { cw, ch };
  }
  return collGrid;
}

export function drawCollectible(ctx, x, y, kind='acorn', scale=0.25) {
  const grid = getCollectibleGrid();
  const img = images.collectibles;
  if (grid && img.width) {
    let index = 0;
    switch(kind){
      case 'acorn': index = 0; break;
      case 'berry': index = 1; break; // uses apple-ish placeholder as berry
      case 'cone': index = 2; break;
      case 'leaf': index = 3; break;
      default: index = 0;
    }
    const sx = (index % 2) * grid.cw;
    const sy = Math.floor(index / 2) * grid.ch;
    const dw = Math.floor(grid.cw * scale);
    const dh = Math.floor(grid.ch * scale);
    
    // Use transparency processing
    const transparentImg = makeTransparent(img);
    drawFrame(ctx, transparentImg, sx, sy, grid.cw, grid.ch, Math.floor(x - dw/2), Math.floor(y - dh/2), dw, dh, false);
    return;
  }
  // fallback simple circle
  ctx.fillStyle = '#7c4a1a';
  ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2); ctx.fill();
}

// === TREES/LOGS/CAVE (from tiles image) ===
export function drawTree(ctx, rc, x, y, scale=0.4) {
  const img = images.tiles;
  if (img && img.width) {
    // draw one of the trees (right side of sheet) — approximate crop
    const sx = Math.floor(img.width*0.64), sy = Math.floor(img.height*0.12);
    const sw = Math.floor(img.width*0.30), sh = Math.floor(img.height*0.62);
    const dw = Math.floor(sw*scale), dh = Math.floor(sh*scale);
    
    // Use transparency processing
    const transparentImg = makeTransparent(img);
    ctx.drawImage(transparentImg, sx, sy, sw, sh, Math.floor(x - dw/2), Math.floor(y - dh), dw, dh);
    return;
  }
  // fallback procedural bushy tree
  rc.ellipse(x, y-30, 80, 60, { fill: '#9bbf75', stroke:'#3e3e3e' });
  rc.rectangle(x-12, y-30, 24, 40, { fill:'#916b40', stroke:'#3e3e3e' });
}

export function drawLogPlatform(ctx, rc, x, y, w=160, scale=1) {
  const img = images.tiles;
  if (img && img.width) {
    // crop a horizontal log from mid of sheet
    const sx = Math.floor(img.width*0.34), sy = Math.floor(img.height*0.54);
    const sw = Math.floor(img.width*0.28), sh = Math.floor(img.height*0.10);
    ctx.drawImage(img, sx, sy, sw, sh, Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(sh* (w/sw)));
    return;
  }
  rc.rectangle(x, y, w, 16, { fill:'#b88a5a', stroke:'#5b3a1f' });
}

export function drawCaveEntrance(ctx, rc, x, y, scale=0.5) {
  const img = images.tiles;
  if (img && img.width) {
    const sx = Math.floor(img.width*0.78), sy = Math.floor(img.height*0.78);
    const sw = Math.floor(img.width*0.18), sh = Math.floor(img.height*0.18);
    const dw = Math.floor(sw*scale), dh = Math.floor(sh*scale);
    ctx.drawImage(img, sx, sy, sw, sh, Math.floor(x - dw/2), Math.floor(y - dh), dw, dh);
    return;
  }
  rc.arc(x, y, 40, { fill:'#9c805e', stroke:'#3e3e3e' });
}

// === NEST WITH UPGRADE LEVELS ===
export function drawNest(ctx, rc, x, y, level=0, scale=0.5) {
  const img = images.nest;
  if (img && img.width) {
    // Nest has 4 levels (0-3), arranged in a 2x2 grid
    const gridWidth = 2;
    const gridHeight = 2;
    const cellWidth = Math.floor(img.width / gridWidth);
    const cellHeight = Math.floor(img.height / gridHeight);
    
    // Calculate which cell to use based on level
    const cellX = level % gridWidth;
    const cellY = Math.floor(level / gridWidth);
    
    const sx = cellX * cellWidth;
    const sy = cellY * cellHeight;
    const dw = Math.floor(cellWidth * scale);
    const dh = Math.floor(cellHeight * scale);
    
    // Use transparency processing
    const transparentImg = makeTransparent(img);
    ctx.drawImage(transparentImg, sx, sy, cellWidth, cellHeight, 
                  Math.floor(x - dw/2), Math.floor(y - dh), dw, dh);
    return;
  }
  
  // Fallback: procedural nest based on level
  const nestColors = ['#8B4513', '#A0522D', '#CD853F', '#DEB887'];
  const nestSizes = [40, 50, 60, 70];
  const color = nestColors[Math.min(level, 3)];
  const size = nestSizes[Math.min(level, 3)];
  
  rc.ellipse(x, y, size, size * 0.8, { 
    fill: color, 
    stroke: '#654321', 
    strokeWidth: 2, 
    roughness: 1.0 
  });
}

export function drawBackground(ctx, width, height) {
  // simple parchment backdrop if needed (actual season tint handled elsewhere)
  ctx.clearRect(0,0,width,height);
}

/**
 * Procedural sprite generation using roughjs
 * Creates hand-drawn style sprites for all game objects
 */

import rough from 'roughjs';

export function drawSquirrel(ctx, rc, x, y, options = {}) {
  const { palette, season, facing = 'right' } = options;
  const flip = facing === 'left';
  
  // Squirrel body
  rc.ellipse(x, y, 20, 30, {
    fill: '#8B4513',
    stroke: '#654321',
    strokeWidth: 2,
    roughness: 1.2
  });
  
  // Head
  rc.ellipse(x, y - 20, 16, 18, {
    fill: '#8B4513',
    stroke: '#654321',
    strokeWidth: 2,
    roughness: 1.0
  });
  
  // Ears
  rc.ellipse(x - 8, y - 28, 6, 8, {
    fill: '#8B4513',
    stroke: '#654321',
    strokeWidth: 1,
    roughness: 0.8
  });
  
  rc.ellipse(x + 8, y - 28, 6, 8, {
    fill: '#8B4513',
    stroke: '#654321',
    strokeWidth: 1,
    roughness: 0.8
  });
  
  // Tail
  rc.ellipse(x + (flip ? -25 : 25), y, 12, 40, {
    fill: '#8B4513',
    stroke: '#654321',
    strokeWidth: 2,
    roughness: 1.5
  });
  
  // Eye
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(x + (flip ? -4 : 4), y - 18, 3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(x + (flip ? -3 : 5), y - 18, 2, 0, Math.PI * 2);
  ctx.fill();
}

export function drawTree(ctx, rc, x, y, seed = 0, options = {}) {
  const { palette, season } = options;
  
  // Trunk
  rc.rectangle(x - 8, y, 16, 60, {
    fill: '#8B4513',
    stroke: '#654321',
    strokeWidth: 2,
    roughness: 1.0
  });
  
  // Canopy
  const canopyColor = season === 'Winter' ? '#E6E6FA' : palette.primary;
  rc.ellipse(x, y - 20, 40 + seed * 5, 50 + seed * 3, {
    fill: canopyColor,
    stroke: palette.secondary,
    strokeWidth: 2,
    roughness: 1.5
  });
  
  // Branches
  for (let i = 0; i < 3; i++) {
    const angle = (seed + i) * 0.5;
    const branchX = x + Math.cos(angle) * 15;
    const branchY = y - 10 + Math.sin(angle) * 10;
    
    rc.line(branchX, branchY, branchX + Math.cos(angle) * 20, branchY + Math.sin(angle) * 20, {
      stroke: '#8B4513',
      strokeWidth: 3,
      roughness: 1.0
    });
  }
}

export function drawNut(ctx, rc, x, y, kind = 'acorn', options = {}) {
  const { palette } = options;
  
  switch (kind) {
    case 'acorn':
      // Acorn cap
      rc.ellipse(x, y - 8, 12, 8, {
        fill: '#8B4513',
        stroke: '#654321',
        strokeWidth: 1,
        roughness: 0.8
      });
      // Acorn body
      rc.ellipse(x, y, 10, 12, {
        fill: '#DEB887',
        stroke: '#CD853F',
        strokeWidth: 1,
        roughness: 0.6
      });
      break;
      
    case 'hazelnut':
      rc.ellipse(x, y, 8, 10, {
        fill: '#D2691E',
        stroke: '#A0522D',
        strokeWidth: 1,
        roughness: 0.7
      });
      break;
      
    case 'berry':
      rc.ellipse(x, y, 6, 6, {
        fill: '#FF6347',
        stroke: '#DC143C',
        strokeWidth: 1,
        roughness: 0.5
      });
      break;
      
    case 'mushroom':
      // Cap
      rc.ellipse(x, y - 4, 12, 8, {
        fill: '#FF6B6B',
        stroke: '#DC143C',
        strokeWidth: 1,
        roughness: 0.8
      });
      // Stem
      rc.rectangle(x - 2, y, 4, 8, {
        fill: '#F5F5DC',
        stroke: '#DCDCDC',
        strokeWidth: 1,
        roughness: 0.6
      });
      break;
  }
}

export function drawBackground(ctx, rc, offsetX, offsetY, width, height, options = {}) {
  const { type, palette, season } = options;
  
  switch (type) {
    case 'mountains':
      drawMountains(ctx, rc, offsetX, offsetY, width, height, palette);
      break;
    case 'trees':
      drawTreeLine(ctx, rc, offsetX, offsetY, width, height, palette, season);
      break;
    case 'grass':
      drawGrass(ctx, rc, offsetX, offsetY, width, height, palette, season);
      break;
  }
}

function drawMountains(ctx, rc, offsetX, offsetY, width, height, palette) {
  const mountainColor = palette.primary;
  
  for (let i = 0; i < 5; i++) {
    const x = (i * 200) - offsetX;
    const y = height - 150 - offsetY;
    const mountainHeight = 100 + (i % 3) * 30;
    
    rc.polygon([
      [x, y + mountainHeight],
      [x + 50, y],
      [x + 100, y + mountainHeight],
      [x + 150, y + 20],
      [x + 200, y + mountainHeight]
    ], {
      fill: mountainColor,
      stroke: palette.secondary,
      strokeWidth: 1,
      roughness: 1.5
    });
  }
}

function drawTreeLine(ctx, rc, offsetX, offsetY, width, height, palette, season) {
  const treeColor = season === 'Winter' ? '#E6E6FA' : palette.primary;
  
  for (let i = 0; i < 8; i++) {
    const x = (i * 150) - offsetX;
    const y = height - 200 - offsetY;
    const treeHeight = 80 + (i % 3) * 20;
    
    // Trunk
    rc.rectangle(x - 5, y + treeHeight - 40, 10, 40, {
      fill: '#8B4513',
      stroke: '#654321',
      strokeWidth: 1,
      roughness: 0.8
    });
    
    // Canopy
    rc.ellipse(x, y + treeHeight - 60, 30, 40, {
      fill: treeColor,
      stroke: palette.secondary,
      strokeWidth: 1,
      roughness: 1.2
    });
  }
}

function drawGrass(ctx, rc, offsetX, offsetY, width, height, palette, season) {
  const grassColor = season === 'Winter' ? '#E6E6FA' : palette.secondary;
  
  for (let i = 0; i < width; i += 20) {
    const x = i - offsetX;
    const y = height - 50 - offsetY;
    
    // Grass blades
    for (let j = 0; j < 5; j++) {
      const bladeX = x + j * 4;
      const bladeHeight = 10 + Math.random() * 15;
      
      rc.line(bladeX, y, bladeX + Math.random() * 2 - 1, y - bladeHeight, {
        stroke: grassColor,
        strokeWidth: 1,
        roughness: 0.5
      });
    }
  }
}
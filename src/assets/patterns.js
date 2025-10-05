/**
 * Visual patterns and textures for the hand-drawn aesthetic
 * Provides paper grain, fills, and other visual effects
 */

export function createPaperGrain(width, height, intensity = 0.1) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Create noise pattern
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity;
    data[i] = 255;     // R
    data[i + 1] = 255; // G
    data[i + 2] = 255; // B
    data[i + 3] = Math.max(0, Math.min(255, 255 + noise * 255)); // A
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function createGrassPattern(width, height, color = '#90EE90') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Draw grass blades
  ctx.strokeStyle = '#228B22';
  ctx.lineWidth = 1;
  
  for (let x = 0; x < width; x += 4) {
    for (let y = 0; y < height; y += 8) {
      const bladeHeight = 3 + Math.random() * 5;
      const angle = (Math.random() - 0.5) * 0.5;
      
      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(
        x + Math.sin(angle) * bladeHeight,
        y + height - bladeHeight
      );
      ctx.stroke();
    }
  }
  
  return canvas;
}

export function createWoodPattern(width, height, color = '#8B4513') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Draw wood grain
  ctx.strokeStyle = '#654321';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 5; i++) {
    const y = (height / 5) * i;
    const wave = Math.sin(i * 0.5) * 2;
    
    ctx.beginPath();
    ctx.moveTo(0, y + wave);
    for (let x = 0; x < width; x += 10) {
      const nextY = y + wave + Math.sin(x * 0.1 + i) * 1;
      ctx.lineTo(x, nextY);
    }
    ctx.stroke();
  }
  
  return canvas;
}

export function createLeafPattern(width, height, color = '#228B22') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Draw leaf shapes
  ctx.fillStyle = '#32CD32';
  ctx.strokeStyle = '#006400';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 8 + Math.random() * 12;
    
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * 0.6, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  
  return canvas;
}

export function createWaterPattern(width, height, color = '#4682B4') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  // Draw water ripples
  ctx.strokeStyle = '#87CEEB';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.6;
  
  for (let i = 0; i < 10; i++) {
    const centerX = Math.random() * width;
    const centerY = Math.random() * height;
    const radius = 20 + Math.random() * 40;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
  return canvas;
}

export function createSnowPattern(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#F0F8FF';
  ctx.fillRect(0, 0, width, height);
  
  // Draw snowflakes
  ctx.fillStyle = 'white';
  ctx.strokeStyle = '#E6E6FA';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 4;
    
    // Draw snowflake
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw snowflake arms
    for (let arm = 0; arm < 6; arm++) {
      const angle = (arm * Math.PI) / 3;
      const armLength = size * 2;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * armLength,
        y + Math.sin(angle) * armLength
      );
      ctx.stroke();
    }
  }
  
  return canvas;
}

export function createSeasonalOverlay(season, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  switch (season) {
    case 'Spring':
      // Light green tint
      ctx.fillStyle = 'rgba(144, 238, 144, 0.1)';
      ctx.fillRect(0, 0, width, height);
      break;
      
    case 'Summer':
      // Warm yellow tint
      ctx.fillStyle = 'rgba(255, 255, 0, 0.05)';
      ctx.fillRect(0, 0, width, height);
      break;
      
    case 'Fall':
      // Orange/red tint
      ctx.fillStyle = 'rgba(255, 165, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);
      break;
      
    case 'Winter':
      // Blue/white tint
      ctx.fillStyle = 'rgba(176, 224, 230, 0.15)';
      ctx.fillRect(0, 0, width, height);
      break;
  }
  
  return canvas;
}
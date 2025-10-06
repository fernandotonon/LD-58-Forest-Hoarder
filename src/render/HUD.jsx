import React, { useMemo, useRef, useEffect } from 'react';
import { useStore } from '../state/useStore';
import { images } from './assets';

export default function HUD() {
  const { 
    season, 
    day, 
    weather, 
    timeOfDay,
    player,
    nest,
    powerups,
    ui
  } = useStore();

  const getTimeString = () => {
    const hours = Math.floor(timeOfDay * 24);
    const minutes = Math.floor((timeOfDay * 24 * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getStaminaPercent = () => {
    return Math.max(0, Math.min(100, (player.stamina / 100) * 100));
  };

  const getPantryTotal = () => {
    return Object.values(nest.pantry).reduce((total, count) => total + count, 0);
  };

  const getActivePowerups = () => {
    return powerups.active || [];
  };

  const getAchievementProgress = () => {
    const { achievements } = useStore.getState();
    const totalAchievements = 10; // Total number of achievements
    const unlockedCount = achievements.unlocked.length;
    return { current: unlockedCount, total: totalAchievements, percent: (unlockedCount / totalAchievements) * 100 };
  };

  return (
    <div className="hud">
      {/* Top left - Game info */}
      <div className="hud-overlay hud-top-left">
        <div>Season: {season}</div>
        <div>Day: {day}</div>
        <div>Time: {getTimeString()}</div>
        <div>Weather: {weather}</div>
        
        {/* Achievement Progress */}
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 12, marginBottom: 2 }}>Achievements</div>
          <div className="status-bar" style={{ width: 80, height: 6 }}>
            <div 
              className="status-fill" 
              style={{ 
                width: `${getAchievementProgress().percent}%`,
                background: 'linear-gradient(90deg, #FFD700, #FFA500)'
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: '#FFD700' }}>
            {getAchievementProgress().current}/{getAchievementProgress().total}
          </div>
        </div>
      </div>

      {/* Top right - Status bars */}
      <div className="hud-overlay hud-top-right">
        <div>Health</div>
        <div className="status-bar">
          <div 
            className="status-fill health" 
            style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
          />
        </div>
        <div style={{ marginTop: 6 }}>Stamina</div>
        <div className="status-bar">
          <div 
            className="status-fill stamina" 
            style={{ width: `${getStaminaPercent()}%` }}
          />
        </div>
        <div style={{ marginTop: 6 }}>Pantry:</div>
        <div style={{ fontSize: 12, lineHeight: 1.1 }}>
          {Object.keys(nest.pantry).length === 0 && <div style={{opacity:0.8}}>empty</div>}
          {Object.entries(nest.pantry).map(([k,v]) => (
            <div key={k}>{k}: {v}</div>
          ))}
        </div>
        
        {/* Active Power-ups */}
        {getActivePowerups().length > 0 && (
          <>
            <div style={{ marginTop: 12, fontSize: 12, fontWeight: 'bold' }}>Active Power-ups:</div>
            <div style={{ fontSize: 10, lineHeight: 1.2 }}>
              {getActivePowerups().map((powerup, index) => (
                <div key={powerup.id || index} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>{powerup.icon}</span>
                  <span>{powerup.title}</span>
                  {powerup.remainingTime && (
                    <span style={{ color: '#FFD700' }}>
                      ({Math.ceil(powerup.remainingTime)}s)
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom left - Inventory */}
      <div className="inventory">
        {Array.from({ length: 10 }, (_, i) => {
          const slot = player.inventory[i];
          return (
            <div 
              key={i} 
              className={`inventory-slot ${slot ? 'filled' : ''}`}
              style={{ position: 'relative' }}
            >
              {slot ? (
                <>
                  <ItemIcon item={slot.item} />
                  <span style={{ 
                    position: 'absolute', 
                    top: 2, 
                    right: 2, 
                    padding: '1px 4px', 
                    borderRadius: 6,
                    fontSize: 10, 
                    fontWeight: 700,
                    color: '#fff',
                    background: 'rgba(0,0,0,0.65)'
                  }}>
                    {slot.quantity}
                  </span>
                </>
              ) : ''}
            </div>
          );
        })}
      </div>

      {/* Bottom right - Quick actions */}
      <div className="hud-overlay hud-bottom-right">
        <div>E - Interact</div>
        <div>X/F - Attack</div>
        <div>Q - Quests</div>
        <div>A - Achievements</div>
        <div>ESC - Pause</div>
        <div>WASD - Move</div>
        <div>Space - Jump</div>
      </div>

      {/* Notifications */}
      {ui.notifications.map(notification => (
        <div key={notification.id} className="notification">
          {notification.message}
        </div>
      ))}
    </div>
  );
}

function ItemIcon({ item }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = images.collectibles;
    if (!img || !img.width) return;
    // Map item to index in collectibles spritesheet
    let index = 0;
    switch (item) {
      case 'acorn': index = 0; break;
      case 'berry': index = 1; break;
      case 'pine': index = 2; break;
      case 'leaf': index = 3; break;
      default: index = 0;
    }
    const gridCols = 2;
    const cw = Math.floor(img.width / gridCols);
    const ch = Math.floor(img.height / 2);
    const sx = (index % gridCols) * cw;
    const sy = Math.floor(index / gridCols) * ch;

    const scale = 0.22; // small icon scale
    const dw = Math.floor(cw * scale);
    const dh = Math.floor(ch * scale);
    const tx = Math.floor((canvas.width - dw) / 2);
    const ty = Math.floor((canvas.height - dh) / 2);

    // Draw cropped sprite
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, cw, ch, tx, ty, dw, dh);
  }, [item]);

  return <canvas ref={canvasRef} width={28} height={28} />;
}
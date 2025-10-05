import React from 'react';
import { useStore } from '../state/useStore';

export default function HUD() {
  const { 
    season, 
    day, 
    weather, 
    timeOfDay,
    player,
    nest,
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

  return (
    <div className="hud">
      {/* Top left - Game info */}
      <div className="hud-overlay hud-top-left">
        <div>Season: {season}</div>
        <div>Day: {day}</div>
        <div>Time: {getTimeString()}</div>
        <div>Weather: {weather}</div>
      </div>

      {/* Top right - Status bars */}
      <div className="hud-overlay hud-top-right">
        <div>Stamina</div>
        <div className="status-bar">
          <div 
            className="status-fill stamina" 
            style={{ width: `${getStaminaPercent()}%` }}
          />
        </div>
        <div>Pantry: {getPantryTotal()}</div>
      </div>

      {/* Bottom left - Inventory */}
      <div className="inventory">
        {Array.from({ length: 10 }, (_, i) => {
          const slot = player.inventory[i];
          return (
            <div 
              key={i} 
              className={`inventory-slot ${slot ? 'filled' : ''}`}
            >
              {slot ? slot.quantity : ''}
            </div>
          );
        })}
      </div>

      {/* Bottom right - Quick actions */}
      <div className="hud-overlay hud-bottom-right">
        <div>E - Interact</div>
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
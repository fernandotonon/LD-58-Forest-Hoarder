import React from 'react';
import { useStore } from '../state/useStore';
import audioManager from '../audio/AudioManager';

export default function MainMenu() {
  const { setGameState, resetGame } = useStore();

  const handleNewGame = () => {
    audioManager.onButtonClick();
    resetGame();
    setGameState('playing');
  };

  const handleContinue = () => {
    audioManager.onButtonClick();
    setGameState('playing');
  };

  const handleInstructions = () => {
    alert(`Forest Hoarder - Instructions

🎮 CONTROLS:
• WASD or Arrow Keys - Move
• Space or W - Jump
• Shift - Dash (uses stamina)
• E - Interact/Pick up items
• ESC - Pause

🎯 OBJECTIVE:
Help a squirrel prepare for winter by collecting food and materials!

🍂 SEASONS:
• Spring: Collect acorns and berries
• Summer: Gather more resources
• Fall: Prepare for winter
• Winter: Survive on stored food

🏠 NEST UPGRADES:
• Basket: Carry more items
• Insulation: Reduce winter warmth drain
• Drying Rack: Preserve food for winter
• Dream Pillow: Save your progress
• Map Branch: Reveal the world map

Good luck, little squirrel! 🐿️`);
  };

  return (
    <div className="menu">
      <h1>🌰 Forest Hoarder</h1>
      <p>
        A cozy 2D platformer about a squirrel preparing for winter.
        Collect food, upgrade your nest, and survive the harsh winter months!
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }}>
        <button className="button" onClick={handleNewGame}>
          🌱 New Game
        </button>
        
        <button className="button secondary" onClick={handleContinue}>
          🏠 Continue
        </button>
        
        <button className="button secondary" onClick={handleInstructions}>
          📖 Instructions
        </button>
      </div>
      
      <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
        Made with ❤️ for Ludum Dare 58
      </div>
    </div>
  );
}
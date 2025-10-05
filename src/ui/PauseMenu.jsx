import React from 'react';
import { useStore } from '../state/useStore';

export default function PauseMenu() {
  const { setGameState, togglePause } = useStore();

  const handleResume = () => {
    togglePause();
  };

  const handleMainMenu = () => {
    setGameState('menu');
  };

  const handleRestart = () => {
    if (confirm('Are you sure you want to restart? This will lose your current progress.')) {
      useStore.getState().resetGame();
      setGameState('playing');
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>⏸️ Game Paused</h2>
        <p>Take a break, little squirrel! What would you like to do?</p>
        
        <div className="modal-buttons">
          <button className="button" onClick={handleResume}>
            ▶️ Resume
          </button>
          
          <button className="button secondary" onClick={handleRestart}>
            🔄 Restart
          </button>
          
          <button className="button danger" onClick={handleMainMenu}>
            🏠 Main Menu
          </button>
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
          Press ESC to resume
        </div>
      </div>
    </div>
  );
}
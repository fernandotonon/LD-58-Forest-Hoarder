import React from 'react';
import { useStore } from '../state/useStore';

export default function WinLoseModal() {
  const { ui, hideWinLose, setGameState, resetGame } = useStore();
  const { winLoseType, loseReason } = ui;

  const handlePlayAgain = () => {
    hideWinLose();
    resetGame();
    setGameState('playing');
  };

  const handleMainMenu = () => {
    hideWinLose();
    setGameState('menu');
  };

  if (winLoseType === 'win') {
    return (
      <div className="modal">
        <div className="modal-content">
          <h2>🎉 Congratulations!</h2>
          <p>
            You've successfully survived the winter! Your cozy nest and careful preparation 
            paid off. The squirrel is safe and well-fed, ready for another year of adventures.
          </p>
          <p style={{ fontWeight: 'bold', color: '#228B22' }}>
            Well done, little squirrel! 🐿️
          </p>
          
          <div className="modal-buttons">
            <button className="button" onClick={handlePlayAgain}>
              🌱 Play Again
            </button>
            
            <button className="button secondary" onClick={handleMainMenu}>
              🏠 Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (winLoseType === 'lose') {
    const isAttackDeath = loseReason === 'attack';
    
    return (
      <div className="modal">
        <div className="modal-content">
          <h2>💔 Game Over</h2>
          {isAttackDeath ? (
            <>
              <p>
                The squirrel was overwhelmed by dangerous predators! The forest can be 
                a treacherous place with wolves, bears, and hawks lurking about.
              </p>
              <p style={{ fontWeight: 'bold', color: '#DC143C' }}>
                Stay alert! Try to avoid enemies or fight back when you're strong enough.
              </p>
            </>
          ) : (
            <>
              <p>
                The winter was too harsh and your pantry ran empty. The squirrel couldn't 
                survive without enough food stored away.
              </p>
              <p style={{ fontWeight: 'bold', color: '#DC143C' }}>
                Better luck next time! Try collecting more food and upgrading your nest.
              </p>
            </>
          )}
          
          <div className="modal-buttons">
            <button className="button" onClick={handlePlayAgain}>
              🔄 Try Again
            </button>
            
            <button className="button secondary" onClick={handleMainMenu}>
              🏠 Main Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
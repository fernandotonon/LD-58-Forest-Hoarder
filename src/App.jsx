import React from 'react';
import { useStore } from './state/useStore';
import MainMenu from './ui/MainMenu';
import GameScene from './render/Scene';
import PauseMenu from './ui/PauseMenu';
import WinLoseModal from './ui/WinLoseModal';
import NestUI from './ui/NestUI';
import './index.css';

function App() {
  const { gameState, ui } = useStore();

  return (
    <div className="app">
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'playing' && <GameScene />}
      {gameState === 'paused' && <PauseMenu />}
      {ui.showNest && <NestUI />}
      {ui.showWinLose && <WinLoseModal />}
    </div>
  );
}

export default App;
import React, { useEffect, useRef } from 'react';
import { useStore } from '../state/useStore';
import { GameLoop } from '../core/GameLoop';
import { Input } from '../core/Input';
import { Camera } from '../core/Camera';
import { Physics } from '../core/Physics';
import { Time } from '../core/Time';
import { RNG } from '../core/RNG';
import { draw } from './draw';
import { updateGame } from '../game/systems';
import HUD from './HUD';
import audioManager from '../audio/AudioManager';

export default function GameScene() {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const inputRef = useRef(null);
  const cameraRef = useRef(null);
  const physicsRef = useRef(null);
  const timeRef = useRef(null);
  const rngRef = useRef(null);
  const { audio } = useStore();
  
  const { gameState, setGameState, togglePause } = useStore();
  
  // Sync audio settings when they change
  useEffect(() => {
    audioManager.setMasterVolume(audio.masterVolume);
    audioManager.setMusicVolume(audio.musicVolume);
    audioManager.setSfxVolume(audio.sfxVolume);
  }, [audio.masterVolume, audio.musicVolume, audio.sfxVolume]);
  
  // Sync mute state
  useEffect(() => {
    if (audio.isMuted !== audioManager.isMuted) {
      audioManager.toggleMute();
    }
  }, [audio.isMuted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Initialize game systems
    const input = new Input();
    const camera = new Camera(canvas);
    const physics = new Physics();
    const time = new Time();
    const rng = new RNG();
    
    inputRef.current = input;
    cameraRef.current = camera;
    physicsRef.current = physics;
    timeRef.current = time;
    rngRef.current = rng;
    
    // Initialize audio
    audioManager.setMasterVolume(audio.masterVolume);
    audioManager.setMusicVolume(audio.musicVolume);
    audioManager.setSfxVolume(audio.sfxVolume);
    if (audio.isMuted) {
      audioManager.toggleMute();
    }
    
    // Start background music
    audioManager.playMusic('mainTheme');

    // Set up time event listeners
    time.on('onDayChange', (data) => {
      console.log(`Day ${data.day} of ${data.season}`);
    });
    
    time.on('onSeasonChange', (data) => {
      console.log(`Season changed to ${data.season}`);
    });

    // Game update function
    const update = (deltaTime) => {
      if (gameState === 'playing') {
        updateGame(deltaTime, {
          input,
          camera,
          physics,
          time,
          rng,
          canvas
        });
      }
    };

    // Game render function
    const render = (alpha) => {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (gameState === 'playing') {
        draw(ctx, canvas, {
          camera,
          time,
          alpha
        });
      }
    };

    // Start game loop
    const gameLoop = new GameLoop();
    gameLoopRef.current = gameLoop;
    gameLoop.start(update, render);

    // Handle input
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        togglePause();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      gameLoop.stop();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameState, togglePause]);

  // Handle window blur/focus
  useEffect(() => {
    const handleBlur = () => {
      if (gameState === 'playing') {
        togglePause();
      }
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [gameState, togglePause]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ display: 'block' }}
        tabIndex={0}
        onMouseDown={() => canvasRef.current?.focus()}
      />
      <HUD />
    </div>
  );
}
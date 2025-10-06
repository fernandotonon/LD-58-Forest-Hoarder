import React from 'react';
import { useStore } from '../state/useStore';
import audioManager from '../audio/AudioManager';

export default function AudioSettingsUI() {
  const { 
    audio, 
    toggleAudioSettings, 
    setMasterVolume, 
    setMusicVolume, 
    setSfxVolume, 
    toggleMute 
  } = useStore();

  const handleMasterVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setMasterVolume(volume);
    audioManager.setMasterVolume(volume);
  };

  const handleMusicVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setMusicVolume(volume);
    audioManager.setMusicVolume(volume);
  };

  const handleSfxVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setSfxVolume(volume);
    audioManager.setSfxVolume(volume);
  };

  const handleMuteToggle = () => {
    const isMuted = toggleMute();
    audioManager.toggleMute();
  };

  const handleTestSound = () => {
    audioManager.playSound('mouseClick');
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🔊 Audio Settings</h2>
          <button 
            className="close-button" 
            onClick={toggleAudioSettings}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        <div className="audio-settings">
          <div className="audio-control">
            <div className="control-header">
              <label htmlFor="mute-toggle">
                <span className="control-icon">🔇</span>
                Mute All Audio
              </label>
              <button 
                id="mute-toggle"
                className={`toggle-button ${audio.isMuted ? 'active' : ''}`}
                onClick={handleMuteToggle}
              >
                {audio.isMuted ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="audio-control">
            <div className="control-header">
              <span className="control-icon">🔊</span>
              <label htmlFor="master-volume">Master Volume</label>
              <span className="volume-value">{Math.round(audio.masterVolume * 100)}%</span>
            </div>
            <input
              id="master-volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audio.masterVolume}
              onChange={handleMasterVolumeChange}
              className="volume-slider"
            />
          </div>

          <div className="audio-control">
            <div className="control-header">
              <span className="control-icon">🎵</span>
              <label htmlFor="music-volume">Music Volume</label>
              <span className="volume-value">{Math.round(audio.musicVolume * 100)}%</span>
            </div>
            <input
              id="music-volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audio.musicVolume}
              onChange={handleMusicVolumeChange}
              className="volume-slider"
            />
          </div>

          <div className="audio-control">
            <div className="control-header">
              <span className="control-icon">🎯</span>
              <label htmlFor="sfx-volume">Sound Effects Volume</label>
              <span className="volume-value">{Math.round(audio.sfxVolume * 100)}%</span>
            </div>
            <input
              id="sfx-volume"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audio.sfxVolume}
              onChange={handleSfxVolumeChange}
              className="volume-slider"
            />
          </div>

          <div className="audio-control">
            <button 
              className="test-sound-button"
              onClick={handleTestSound}
            >
              🔊 Test Sound
            </button>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="button" onClick={toggleAudioSettings}>
            ✅ Done
          </button>
        </div>
      </div>
    </div>
  );
}
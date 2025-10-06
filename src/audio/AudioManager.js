class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = {};
    this.isMuted = false;
    this.masterVolume = 1.0;
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.battleMode = false;
    this.battleTimer = 0;
    this.battleDuration = 1000; // 1 second after last attack
    
    this.loadSounds();
    this.loadMusic();
  }

  loadSounds() {
    const basePath = import.meta.env.BASE_URL || '/';
    const soundFiles = {
      jump: `${basePath}audio/jump.wav`,
      pickItem: `${basePath}audio/pick_item.wav`,
      depositItems: `${basePath}audio/deposit_items.wav`,
      hit: `${basePath}audio/hit.wav`,
      mouseClick: `${basePath}audio/mouse_click.wav`
    };

    Object.entries(soundFiles).forEach(([name, src]) => {
      this.sounds[name] = new Audio(src);
      this.sounds[name].volume = this.sfxVolume * this.masterVolume;
    });
  }

  loadMusic() {
    const basePath = import.meta.env.BASE_URL || '/';
    this.music.mainTheme = new Audio(`${basePath}audio/mainTheme.mp3`);
    this.music.battleSong = new Audio(`${basePath}audio/battleSong.mp3`);
    
    // Set music properties
    Object.values(this.music).forEach(track => {
      track.loop = true;
      track.volume = this.musicVolume * this.masterVolume;
    });
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolumes();
  }

  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateSfxVolumes();
  }

  updateAllVolumes() {
    this.updateMusicVolumes();
    this.updateSfxVolumes();
  }

  updateMusicVolumes() {
    Object.values(this.music).forEach(track => {
      track.volume = this.musicVolume * this.masterVolume;
    });
  }

  updateSfxVolumes() {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.sfxVolume * this.masterVolume;
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.pauseAllMusic();
    } else {
      this.resumeMusic();
    }
    return this.isMuted;
  }

  playSound(soundName) {
    if (this.isMuted || !this.sounds[soundName]) return;
    
    try {
      // Reset and play sound
      this.sounds[soundName].currentTime = 0;
      this.sounds[soundName].play().catch(e => {
        console.log('Audio play failed:', e);
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  startBattle() {
    this.battleMode = true;
    this.battleTimer = this.battleDuration;
    
    if (this.isMuted) return;
    
    // Fade out main theme and start battle music
    this.fadeOutMusic(this.music.mainTheme, () => {
      this.playMusic('battleSong');
    });
  }

  extendBattle() {
    this.battleTimer = this.battleDuration;
  }

  updateBattle(deltaTime) {
    if (this.battleMode) {
      this.battleTimer -= deltaTime;
      if (this.battleTimer <= 0) {
        this.endBattle();
      }
    }
  }

  endBattle() {
    this.battleMode = false;
    this.battleTimer = 0;
    
    if (this.isMuted) return;
    
    // Fade out battle music and resume main theme
    this.fadeOutMusic(this.music.battleSong, () => {
      this.playMusic('mainTheme');
    });
  }

  playMusic(trackName) {
    if (this.isMuted || !this.music[trackName]) return;
    
    // Stop all other music
    Object.values(this.music).forEach(track => {
      track.pause();
      track.currentTime = 0;
    });
    
    // Play the requested track
    this.music[trackName].play().catch(e => {
      console.log('Music play failed:', e);
    });
  }

  pauseAllMusic() {
    Object.values(this.music).forEach(track => {
      track.pause();
    });
  }

  resumeMusic() {
    if (this.battleMode) {
      this.playMusic('battleSong');
    } else {
      this.playMusic('mainTheme');
    }
  }

  fadeOutMusic(track, callback) {
    if (!track) {
      callback();
      return;
    }
    
    const fadeInterval = setInterval(() => {
      track.volume = Math.max(0, track.volume - 0.1);
      if (track.volume <= 0) {
        track.pause();
        track.currentTime = 0;
        track.volume = this.musicVolume * this.masterVolume; // Reset volume
        clearInterval(fadeInterval);
        callback();
      }
    }, 50);
  }

  // Game event handlers
  onPlayerJump() {
    this.playSound('jump');
  }

  onItemPickup() {
    this.playSound('pickItem');
  }

  onItemDeposit() {
    this.playSound('depositItems');
  }

  onPlayerHit() {
    this.playSound('hit');
    this.startBattle();
  }

  onPlayerAttacked() {
    this.extendBattle();
  }

  onButtonClick() {
    this.playSound('mouseClick');
  }
}

// Create singleton instance
const audioManager = new AudioManager();
export default audioManager;
/**
 * Save and load system using localStorage
 * Handles game state persistence
 */

import { useStore } from '../state/useStore';

const SAVE_KEY = 'forest-hoarder-save';

export function saveGame() {
  try {
    const state = useStore.getState();
    const saveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      season: state.season,
      day: state.day,
      weather: state.weather,
      timeOfDay: state.timeOfDay,
      player: state.player,
      nest: state.nest,
      world: state.world
    };
    
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    console.log('Game saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

export function loadGame() {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) {
      console.log('No save data found');
      return false;
    }
    
    const data = JSON.parse(saveData);
    
    // Validate save data
    if (!data.version || !data.player || !data.nest) {
      console.error('Invalid save data');
      return false;
    }
    
    // Load data into store
    const { setSeason, setDay, setWeather, setTimeOfDay, updatePlayer, setNest } = useStore.getState();
    
    setSeason(data.season);
    setDay(data.day);
    setWeather(data.weather);
    setTimeOfDay(data.timeOfDay);
    updatePlayer(data.player);
    setNest(data.nest);
    
    console.log('Game loaded successfully');
    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}

export function hasSaveData() {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    return saveData !== null;
  } catch (error) {
    return false;
  }
}

export function deleteSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
    console.log('Save data deleted');
    return true;
  } catch (error) {
    console.error('Failed to delete save data:', error);
    return false;
  }
}

export function getSaveInfo() {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return null;
    
    const data = JSON.parse(saveData);
    return {
      season: data.season,
      day: data.day,
      timestamp: data.timestamp,
      version: data.version
    };
  } catch (error) {
    console.error('Failed to get save info:', error);
    return null;
  }
}
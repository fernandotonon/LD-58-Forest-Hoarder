/**
 * Game time system managing days, seasons, and weather
 * Handles the seasonal progression and day/night cycle
 */

import { DAYS_PER_SEASON, SECONDS_PER_DAY } from '../game/constants.js';

export class Time {
  constructor() {
    this.day = 1;
    this.season = 'Spring';
    this.secondsInDay = 0;
    this.totalDays = 0;
    
    this.seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    this.seasonIndex = 0;
    
    this.weather = 'sunny';
    this.weatherTimer = 0;
    this.weatherDuration = 0;
    
    this.listeners = {
      onDayChange: [],
      onSeasonChange: [],
      onWeatherChange: []
    };
  }

  update(deltaTime) {
    this.secondsInDay += deltaTime;
    
    // Check for day change
    if (this.secondsInDay >= SECONDS_PER_DAY) {
      this.nextDay();
    }
    
    // Update weather
    this.updateWeather(deltaTime);
  }

  nextDay() {
    this.day++;
    this.totalDays++;
    this.secondsInDay = 0;
    
    // Check for season change
    if (this.day > DAYS_PER_SEASON) {
      this.nextSeason();
      this.day = 1;
    }
    
    this.emit('onDayChange', { day: this.day, season: this.season });
  }

  nextSeason() {
    this.seasonIndex = (this.seasonIndex + 1) % this.seasons.length;
    this.season = this.seasons[this.seasonIndex];
    this.emit('onSeasonChange', { season: this.season, day: this.day });
  }

  updateWeather(deltaTime) {
    this.weatherTimer += deltaTime;
    
    if (this.weatherTimer >= this.weatherDuration) {
      this.changeWeather();
    }
  }

  changeWeather() {
    const weatherOptions = this.getWeatherOptions();
    const newWeather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
    
    if (newWeather !== this.weather) {
      this.weather = newWeather;
      this.weatherDuration = this.getWeatherDuration();
      this.weatherTimer = 0;
      this.emit('onWeatherChange', { weather: this.weather });
    }
  }

  getWeatherOptions() {
    const baseWeather = ['sunny', 'cloudy'];
    
    switch (this.season) {
      case 'Spring':
        return [...baseWeather, 'rainy'];
      case 'Summer':
        return [...baseWeather, 'hot'];
      case 'Fall':
        return [...baseWeather, 'windy', 'rainy'];
      case 'Winter':
        return [...baseWeather, 'snowy', 'stormy'];
      default:
        return baseWeather;
    }
  }

  getWeatherDuration() {
    const durations = {
      sunny: 300,    // 5 minutes
      cloudy: 240,    // 4 minutes
      rainy: 180,     // 3 minutes
      hot: 360,       // 6 minutes
      windy: 120,     // 2 minutes
      snowy: 300,     // 5 minutes
      stormy: 150     // 2.5 minutes
    };
    
    return durations[this.weather] || 300;
  }

  // Get time of day (0-1, where 0 is dawn, 0.5 is noon, 1 is dusk)
  getTimeOfDay() {
    return this.secondsInDay / SECONDS_PER_DAY;
  }

  // Get day progress (0-1)
  getDayProgress() {
    return this.secondsInDay / SECONDS_PER_DAY;
  }

  // Get season progress (0-1)
  getSeasonProgress() {
    return (this.day - 1) / DAYS_PER_SEASON;
  }

  // Get total game progress (0-1)
  getTotalProgress() {
    const totalDaysInGame = this.seasons.length * DAYS_PER_SEASON;
    return Math.min(this.totalDays / totalDaysInGame, 1);
  }

  // Check if it's winter
  isWinter() {
    return this.season === 'Winter';
  }

  // Check if it's the last day of winter
  isLastDay() {
    return this.season === 'Winter' && this.day === DAYS_PER_SEASON;
  }

  // Get formatted time string
  getTimeString() {
    const hours = Math.floor((this.secondsInDay / SECONDS_PER_DAY) * 24);
    const minutes = Math.floor(((this.secondsInDay / SECONDS_PER_DAY) * 24 * 60) % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Event system
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(callback);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Reset time
  reset() {
    this.day = 1;
    this.season = 'Spring';
    this.seasonIndex = 0;
    this.secondsInDay = 0;
    this.totalDays = 0;
    this.weather = 'sunny';
    this.weatherTimer = 0;
    this.weatherDuration = this.getWeatherDuration();
  }
}
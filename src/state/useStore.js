/**
 * Global game state management using Zustand
 * Handles all game state including player, nest, time, and UI
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DAILY_QUESTS, ACHIEVEMENTS } from '../game/constants';

const useStore = create(
  persist(
    (set, get) => ({
      // Game state
      gameState: 'menu', // 'menu', 'playing', 'paused', 'nest', 'gameOver'
      season: 'Spring',
      day: 1,
      weather: 'sunny',
      timeOfDay: 0,
      
      // Player state
      player: {
        x: 100,
        y: 484, // 500 - 16 (half player height)
        vx: 0,
        vy: 0,
        facing: 'right',
        onGround: true,
        stamina: 100,
        health: 5,
        maxHealth: 5,
        invincibilityTime: 0,
        inventory: [],
        carryWeight: 0,
        maxCarryWeight: 20,
        attackCooldown: 0
      },
      
      // Nest state
      nest: {
        pantry: {},
        materials: { leaf: 0, pine: 0 },
        upgrades: {
          basket: 0,
          insulation: 0,
          rack: 0,
          pillow: 0,
          map: 0
        },
        coziness: 0,
        decorations: []
      },
      
      // Game world
      world: {
        entities: [],
        pickups: [],
        pushables: [],
        triggers: [],
        enemies: []
      },
      
      // Quest system
      quests: {
        daily: [],
        seasonal: [],
        completed: [],
        progress: {}
      },
      
      // Achievement system
      achievements: {
        unlocked: [],
        progress: {},
        stats: {
          itemsCollected: 0,
          enemiesKilled: 0,
          daysSurvived: 0,
          seasonsCompleted: 0,
          upgradesBuilt: 0,
          questsCompleted: 0
        }
      },
      
      // Power-up system
      powerups: {
        active: [], // Currently active power-ups
        inventory: [] // Power-ups in inventory
      },
      
      // UI state
      ui: {
        showInventory: false,
        showNest: false,
        showPause: false,
        showWinLose: false,
        showQuests: false,
        showAchievements: false,
        showAudioSettings: false,
        winLoseType: null, // 'win' or 'lose'
        loseReason: null, // 'attack' or 'starvation'
        notifications: []
      },
      
      // Audio state
      audio: {
        isMuted: false,
        masterVolume: 1.0,
        musicVolume: 0.7,
        sfxVolume: 0.8
      },
      
      // Actions
      setGameState: (state) => set({ gameState: state }),
      
      setSeason: (season) => set({ season }),
      
      setDay: (day) => set({ day }),
      
      setWeather: (weather) => set({ weather }),
      
      setTimeOfDay: (time) => set({ timeOfDay: time }),
      
      // Player actions
      updatePlayer: (updates) => set((state) => ({
        player: { ...state.player, ...updates }
      })),
      
      damagePlayer: (damage) => set((state) => {
        if (state.player.invincibilityTime > 0) return state;
        const newHealth = Math.max(0, state.player.health - damage);
        return {
          player: {
            ...state.player,
            health: newHealth,
            invincibilityTime: 1.0
          }
        };
      }),
      
      healPlayer: (amount) => set((state) => ({
        player: {
          ...state.player,
          health: Math.min(state.player.maxHealth, state.player.health + amount)
        }
      })),
      
      movePlayer: (dx, dy) => set((state) => ({
        player: {
          ...state.player,
          x: state.player.x + dx,
          y: state.player.y + dy
        }
      })),
      
      setPlayerVelocity: (vx, vy) => set((state) => ({
        player: { ...state.player, vx, vy }
      })),
      
      // Inventory actions
      addToInventory: (item, quantity = 1) => set((state) => {
        const newInventory = [...state.player.inventory];
        const existingIndex = newInventory.findIndex(slot => slot.item === item);
        
        if (existingIndex >= 0) {
          newInventory[existingIndex].quantity += quantity;
        } else {
          newInventory.push({ item, quantity });
        }
        
        const carryWeight = newInventory.reduce((total, slot) => {
          return total + (slot.quantity * (get().getItemWeight(slot.item) || 0));
        }, 0);
        
        return {
          player: {
            ...state.player,
            inventory: newInventory,
            carryWeight
          }
        };
      }),
      
      removeFromInventory: (item, quantity = 1) => set((state) => {
        const newInventory = [...state.player.inventory];
        const existingIndex = newInventory.findIndex(slot => slot.item === item);
        
        if (existingIndex >= 0) {
          newInventory[existingIndex].quantity -= quantity;
          if (newInventory[existingIndex].quantity <= 0) {
            newInventory.splice(existingIndex, 1);
          }
        }
        
        const carryWeight = newInventory.reduce((total, slot) => {
          return total + (slot.quantity * (get().getItemWeight(slot.item) || 0));
        }, 0);
        
        return {
          player: {
            ...state.player,
            inventory: newInventory,
            carryWeight
          }
        };
      }),
      
      // Nest actions
      addToPantry: (item, quantity = 1) => set((state) => ({
        nest: {
          ...state.nest,
          pantry: {
            ...state.nest.pantry,
            [item]: (state.nest.pantry[item] || 0) + quantity
          }
        }
      })),
      
      removeFromPantry: (item, quantity = 1) => set((state) => ({
        nest: {
          ...state.nest,
          pantry: {
            ...state.nest.pantry,
            [item]: Math.max(0, (state.nest.pantry[item] || 0) - quantity)
          }
        }
      })),
      
      addMaterials: (type, quantity) => set((state) => ({
        nest: {
          ...state.nest,
          materials: {
            ...state.nest.materials,
            [type]: (state.nest.materials[type] || 0) + quantity
          }
        }
      })),
      
      removeMaterials: (type, quantity) => set((state) => ({
        nest: {
          ...state.nest,
          materials: {
            ...state.nest.materials,
            [type]: Math.max(0, (state.nest.materials[type] || 0) - quantity)
          }
        }
      })),
      
      upgradeNest: (upgrade) => set((state) => ({
        nest: {
          ...state.nest,
          upgrades: {
            ...state.nest.upgrades,
            [upgrade]: state.nest.upgrades[upgrade] + 1
          }
        }
      })),
      
      // Utility functions
      getItemWeight: (item) => {
        const weights = {
          acorn: 1,
          hazelnut: 1,
          berry: 0.5,
          mushroom: 0.5,
          leaf: 0.2,
          twig: 0.3,
          preserved: 1
        };
        return weights[item] || 0;
      },
      
      getItemCalories: (item) => {
        const calories = {
          acorn: 2,
          hazelnut: 2,
          berry: 1,
          mushroom: 1,
          preserved: 3
        };
        return calories[item] || 0;
      },
      
      // Enemy actions
      addEnemy: (enemy) => set((state) => ({
        world: {
          ...state.world,
          enemies: [...state.world.enemies, enemy]
        }
      })),
      
      removeEnemy: (enemyId) => set((state) => ({
        world: {
          ...state.world,
          enemies: state.world.enemies.filter(e => e.id !== enemyId)
        }
      })),
      
      updateEnemy: (enemyId, updates) => set((state) => ({
        world: {
          ...state.world,
          enemies: state.world.enemies.map(e => 
            e.id === enemyId ? { ...e, ...updates } : e
          )
        }
      })),
      
      // Quest actions
      addQuest: (quest) => set((state) => ({
        quests: {
          ...state.quests,
          daily: [...state.quests.daily, quest]
        }
      })),
      
      completeQuest: (questId) => set((state) => {
        const quest = state.quests.daily.find(q => q.id === questId) || 
                     state.quests.seasonal.find(q => q.id === questId);
        if (!quest) return state;
        
        return {
          quests: {
            ...state.quests,
            daily: state.quests.daily.filter(q => q.id !== questId),
            seasonal: state.quests.seasonal.filter(q => q.id !== questId),
            completed: [...state.quests.completed, quest]
          }
        };
      }),
      
      updateQuestProgress: (questId, progress) => set((state) => ({
        quests: {
          ...state.quests,
          progress: {
            ...state.quests.progress,
            [questId]: progress
          }
        }
      })),
      
      generateDailyQuests: () => set((state) => {
        const randomQuests = DAILY_QUESTS
          .sort(() => Math.random() - 0.5)
          .slice(0, 2); // 2 daily quests
        
        return {
          quests: {
            ...state.quests,
            daily: randomQuests.map(quest => ({
              ...quest,
              progress: 0,
              completed: false
            }))
          }
        };
      }),
      
      // Achievement actions
      unlockAchievement: (achievementId) => set((state) => {
        if (state.achievements.unlocked.includes(achievementId)) return state;
        
        return {
          achievements: {
            ...state.achievements,
            unlocked: [...state.achievements.unlocked, achievementId]
          }
        };
      }),
      
      updateAchievementStats: (stat, value) => set((state) => ({
        achievements: {
          ...state.achievements,
          stats: {
            ...state.achievements.stats,
            [stat]: (state.achievements.stats[stat] || 0) + value
          }
        }
      })),
      
      checkAchievements: () => set((state) => {
        const { stats, unlocked } = state.achievements;
        const newUnlocks = [];
        
        ACHIEVEMENTS.forEach(achievement => {
          if (unlocked.includes(achievement.id)) return;
          
          let isUnlocked = false;
          const { condition } = achievement;
          
          switch (condition.type) {
            case 'collect':
              isUnlocked = stats.itemsCollected >= condition.total;
              break;
            case 'kill':
              if (condition.enemy) {
                // Specific enemy type - would need separate tracking
                isUnlocked = stats.enemiesKilled >= condition.total;
              } else {
                isUnlocked = stats.enemiesKilled >= condition.total;
              }
              break;
            case 'survive':
              isUnlocked = stats.daysSurvived >= condition.days;
              break;
            case 'season':
              isUnlocked = stats.seasonsCompleted >= condition.total;
              break;
            case 'upgrade':
              isUnlocked = stats.upgradesBuilt >= condition.total;
              break;
            case 'quest':
              isUnlocked = stats.questsCompleted >= condition.total;
              break;
          }
          
          if (isUnlocked) {
            newUnlocks.push(achievement);
          }
        });
        
        if (newUnlocks.length > 0) {
          return {
            achievements: {
              ...state.achievements,
              unlocked: [...unlocked, ...newUnlocks.map(a => a.id)]
            }
          };
        }
        
        return state;
      }),
      
      // Power-up actions
      addPowerup: (powerup) => set((state) => ({
        powerups: {
          ...state.powerups,
          inventory: [...state.powerups.inventory, powerup]
        }
      })),
      
      activatePowerup: (powerupId) => set((state) => {
        const powerup = state.powerups.inventory.find(p => p.id === powerupId);
        if (!powerup) return state;
        
        return {
          powerups: {
            ...state.powerups,
            inventory: state.powerups.inventory.filter(p => p.id !== powerupId),
            active: [...state.powerups.active, { ...powerup, startTime: Date.now() }]
          }
        };
      }),
      
      removePowerup: (powerupId) => set((state) => ({
        powerups: {
          ...state.powerups,
          active: state.powerups.active.filter(p => p.id !== powerupId)
        }
      })),
      
      updatePowerupDuration: (powerupId, remainingTime) => set((state) => ({
        powerups: {
          ...state.powerups,
          active: state.powerups.active.map(p => 
            p.id === powerupId ? { ...p, remainingTime } : p
          )
        }
      })),
      
      // UI actions
      toggleInventory: () => set((state) => ({
        ui: { ...state.ui, showInventory: !state.ui.showInventory }
      })),
      
      toggleNest: () => set((state) => ({
        ui: { ...state.ui, showNest: !state.ui.showNest }
      })),
      
      toggleQuests: () => set((state) => ({
        ui: { ...state.ui, showQuests: !state.ui.showQuests }
      })),
      
      toggleAchievements: () => set((state) => ({
        ui: { ...state.ui, showAchievements: !state.ui.showAchievements }
      })),
      
      toggleAudioSettings: () => set((state) => ({
        ui: { ...state.ui, showAudioSettings: !state.ui.showAudioSettings }
      })),
      
      setMasterVolume: (volume) => set((state) => ({
        audio: { ...state.audio, masterVolume: volume }
      })),
      
      setMusicVolume: (volume) => set((state) => ({
        audio: { ...state.audio, musicVolume: volume }
      })),
      
      setSfxVolume: (volume) => set((state) => ({
        audio: { ...state.audio, sfxVolume: volume }
      })),
      
      toggleMute: () => set((state) => ({
        audio: { ...state.audio, isMuted: !state.audio.isMuted }
      })),
      
      togglePause: () => set((state) => ({
        ui: { ...state.ui, showPause: !state.ui.showPause }
      })),
      
      showWinLose: (type, reason = null) => set((state) => ({
        ui: { ...state.ui, showWinLose: true, winLoseType: type, loseReason: reason }
      })),
      
      hideWinLose: () => set((state) => ({
        ui: { ...state.ui, showWinLose: false, winLoseType: null, loseReason: null }
      })),
      
      addNotification: (message, type = 'info', durationMs = 1500) => {
        const id = Date.now() + Math.floor(Math.random() * 1000000);
        set((state) => ({
          ui: {
            ...state.ui,
            notifications: [...state.ui.notifications, { message, type, id }]
          }
        }));
        // Auto-dismiss after duration
        setTimeout(() => {
          const { removeNotification } = get();
          removeNotification(id);
        }, durationMs);
        return id;
      },
      
      removeNotification: (id) => set((state) => ({
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== id)
        }
      })),
      
      // Reset game
      resetGame: () => set({
        gameState: 'menu',
        season: 'Spring',
        day: 1,
        weather: 'sunny',
        timeOfDay: 0,
        player: {
          x: 100,
          y: 484, // 500 - 16 (half player height)
          vx: 0,
          vy: 0,
          facing: 'right',
          onGround: true,
          stamina: 100,
          health: 5,
          maxHealth: 5,
          invincibilityTime: 0,
          inventory: [],
          carryWeight: 0,
          maxCarryWeight: 20,
          attackCooldown: 0
        },
        nest: {
          pantry: {},
          materials: { leaf: 0, pine: 0 },
          upgrades: {
            basket: 0,
            insulation: 0,
            rack: 0,
            pillow: 0,
            map: 0
          },
          coziness: 0,
          decorations: []
        },
        world: {
          entities: [],
          pickups: [],
          pushables: [],
          triggers: [],
          enemies: []
        },
        quests: {
          daily: [],
          seasonal: [],
          completed: [],
          progress: {}
        },
        achievements: {
          unlocked: [],
          progress: {},
          stats: {
            itemsCollected: 0,
            enemiesKilled: 0,
            daysSurvived: 0,
            seasonsCompleted: 0,
            upgradesBuilt: 0,
            questsCompleted: 0
          }
        },
        powerups: {
          active: [],
          inventory: []
        },
        ui: {
          showInventory: false,
          showNest: false,
          showPause: false,
          showWinLose: false,
          showQuests: false,
          showAchievements: false,
          showAudioSettings: false,
          winLoseType: null,
          loseReason: null,
          notifications: []
        },
        audio: {
          isMuted: false,
          masterVolume: 1.0,
          musicVolume: 0.7,
          sfxVolume: 0.8
        }
      })
    }),
    {
      name: 'forest-hoarder-save',
      partialize: (state) => ({
        season: state.season,
        day: state.day,
        weather: state.weather,
        player: state.player,
        nest: state.nest,
        world: state.world,
        audio: state.audio
      })
    }
  )
);

export { useStore };
/**
 * Global game state management using Zustand
 * Handles all game state including player, nest, time, and UI
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
        y: 450,
        vx: 0,
        vy: 0,
        facing: 'right',
        onGround: false,
        stamina: 100,
        inventory: [],
        carryWeight: 0,
        maxCarryWeight: 20
      },
      
      // Nest state
      nest: {
        pantry: {},
        materials: { leaf: 0, twig: 0 },
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
        triggers: []
      },
      
      // UI state
      ui: {
        showInventory: false,
        showNest: false,
        showPause: false,
        showWinLose: false,
        winLoseType: null, // 'win' or 'lose'
        notifications: []
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
      
      // UI actions
      toggleInventory: () => set((state) => ({
        ui: { ...state.ui, showInventory: !state.ui.showInventory }
      })),
      
      toggleNest: () => set((state) => ({
        ui: { ...state.ui, showNest: !state.ui.showNest }
      })),
      
      togglePause: () => set((state) => ({
        ui: { ...state.ui, showPause: !state.ui.showPause }
      })),
      
      showWinLose: (type) => set((state) => ({
        ui: { ...state.ui, showWinLose: true, winLoseType: type }
      })),
      
      hideWinLose: () => set((state) => ({
        ui: { ...state.ui, showWinLose: false, winLoseType: null }
      })),
      
      addNotification: (message, type = 'info') => set((state) => ({
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, { message, type, id: Date.now() }]
        }
      })),
      
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
          y: 450,
          vx: 0,
          vy: 0,
          facing: 'right',
          onGround: false,
          stamina: 100,
          inventory: [],
          carryWeight: 0,
          maxCarryWeight: 20
        },
        nest: {
          pantry: {},
          materials: { leaf: 0, twig: 0 },
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
          triggers: []
        },
        ui: {
          showInventory: false,
          showNest: false,
          showPause: false,
          showWinLose: false,
          winLoseType: null,
          notifications: []
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
        world: state.world
      })
    }
  )
);

export { useStore };
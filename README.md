# 🌰 Forest Hoarder

A cozy 2D platformer about a squirrel preparing for winter! Collect food, upgrade your nest, and survive the harsh winter months in this hand-drawn adventure.

## 🎮 Game Overview

**Forest Hoarder** is a frontend-only 2D platformer built with React and Canvas. You play as a squirrel who must collect food and materials throughout the seasons to survive winter. The game features:

- **Hand-drawn aesthetic** using roughjs for sketchy, cozy visuals
- **Seasonal progression** through Spring, Summer, Fall, and Winter
- **Nest upgrades** to improve your survival chances
- **Inventory management** with weight and capacity limits
- **Time-based gameplay** with day/night cycles

## 🎯 How to Play

### Controls
- **WASD** or **Arrow Keys** - Move
- **Space** or **W** - Jump (with coyote time and jump buffering)
- **Shift** - Dash (uses stamina)
- **E** - Interact/Pick up items
- **ESC** - Pause game

### Objective
1. **Collect Resources**: Gather acorns, berries, mushrooms, and other items
2. **Upgrade Your Nest**: Use materials to build improvements
3. **Survive Winter**: Stockpile enough food to last through the harsh winter
4. **Win**: Make it through the final day of winter!

### Seasons
- **Spring**: Fresh start, collect basic resources
- **Summer**: More items available, prepare for fall
- **Fall**: Final preparation before winter
- **Winter**: Survive on stored food, no new resources spawn

## 🏠 Nest Upgrades

- **🧺 Basket**: Increase carry capacity
- **🍂 Insulation**: Reduce winter warmth drain
- **🔥 Drying Rack**: Preserve food for better nutrition
- **🌙 Dream Pillow**: Save your progress manually
- **🌲 Map Branch**: Reveal the world map (stretch goal)

## 🛠️ Technical Details

### Built With
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Canvas 2D** - Game rendering
- **roughjs** - Hand-drawn graphics
- **Zustand** - State management
- **localStorage** - Save system

### Features
- **60 FPS** game loop with fixed timestep
- **Responsive controls** with coyote time and jump buffering
- **Parallax backgrounds** for depth
- **Seasonal visual effects** and palettes
- **Save/load system** with localStorage
- **Accessibility options** and assist mode

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/LD-58-Forest-Hoarder.git
cd LD-58-Forest-Hoarder

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎨 Art Style

The game uses a **hand-drawn, sketchy aesthetic** created with roughjs:
- Irregular, organic shapes
- Sketchy line work
- Cozy, warm color palettes
- Seasonal visual changes
- Paper grain textures

## 🎵 Audio

- **Howler.js** for sound effects
- **Ambient forest sounds** for immersion
- **Seasonal audio themes**
- **UI feedback sounds**

## 📱 Browser Support

- **Chrome/Edge** 90+
- **Firefox** 88+
- **Safari** 14+
- **Mobile browsers** (touch controls)

## 🐛 Known Issues

- Collision detection may need refinement
- Some visual glitches on older browsers
- Touch controls not fully implemented

## 🤝 Contributing

This is a Ludum Dare 48-hour game jam entry. Feel free to:
- Report bugs
- Suggest improvements
- Fork and experiment
- Share your own forest adventures!

## 📄 License

MIT License - feel free to use this code for your own projects!

## 🏆 Ludum Dare 58

**Theme**: "Only You"  
**Category**: Game Jam  
**Time**: 48 hours  
**Platform**: Web (HTML5 Canvas)

---

Made with ❤️ and lots of coffee during Ludum Dare 58!

*"In the forest, only you can prepare for winter. Only you can gather the acorns. Only you can build the nest. Only you can survive."*
# GORSTAN GAME - AI REBUILD SPECIFICATION v2.0
# Created: 2025-08-10 | Status: PRODUCTION_READY | Branch: fix/final-polish-playable

## CORE ARCHITECTURE PATTERNS

### Game Engine Foundation
- **React 18.3** + **TypeScript 5.5** + **Vite 5.4** + **Tailwind CSS 3.4**
- **State Management**: Context + useReducer (NO Redux/Zustand)
- **Performance**: React.memo, useCallback, useMemo throughout
- **Build Target**: ES2020, terser minification, manual chunks
- **Deployment**: Vercel (SPA routing, security headers, asset caching)

### State Architecture
```typescript
interface GameState {
  stage: 'splash' | 'main' | 'ending'
  player: { name: string, inventory: string[], score: number }
  currentRoomId: string
  roomMap: Record<string, Room>
  flags: Record<string, any>
  npcsInRoom: NPC[]
  history: Message[]
  metadata: { playTime: number, version: string }
}
```

### Room System Pattern
- **Registry**: `src/roomRegistry.ts` - dynamic imports, caching, fallbacks
- **Structure**: Each room = { id, title, description[], image, exits, items, npcs, flags, events }
- **Naming**: `zoneType_locationName.ts` (camelCase)
- **Zones**: introZone, londonZone, newyorkZone, gorstanZone, elfhameZone, glitchZone, latticeZone, mazeZone, stantonZone, offgorstanZone, offmultiverseZone
- **Emergency Fallback**: `roomLoaderFallback.ts` (6 core rooms for production failures)

## CRITICAL SYSTEMS

### 1. NPC ENGINE
- **Controller**: `useNPCController.ts` - Single 18s timer, collision detection, room capacity
- **Wandering**: `wanderingNPCController.ts` - Zone bias, movement validation
- **Dialogue**: Enhanced Ayla system + basic pattern matching for others
- **Core NPCs**: Al (introZone bias), Morthos (glitchZone bias), Polly (static), Dominic (fishbowl), Mr. Wendell (memory keeper)

### 2. BOOK DISCUSSION SYSTEM
- **BookLore**: `src/data/bookLore.ts` - 10 books with metadata, themes, responses
- **BookStore**: CTA system for literary recommendations (ethical, low-frequency)
- **Ayla Enhancement**: Semantic book discussions, author recognition, literary analysis

### 3. TRAP SYSTEM
- **Detection**: `trapDetection.ts` - trait/item based detection, severity warnings
- **Commands**: 'search for traps', 'disarm trap' with success rates
- **Balance**: Reduced damage (Data Void: 25, Arbiter Core: 35), all high-damage traps disarmable

### 4. PERFORMANCE MONITORING
- **Monitor**: `performanceMonitor.ts` - FPS, memory, render times, warnings
- **Optimizer**: `gameStateOptimizer.ts` - history compression, flag cleanup
- **Dashboard**: Performance UI with metrics, export, system info

## COMPONENT HIERARCHY

### Core Shell: `AppCore.tsx`
- Stage management (splash → main → ending)
- Room loading with teleport animations
- Modal system (inventory, NPCs, save/load, use items)
- Back button history tracking
- Performance monitoring integration

### UI Components Pattern
```
components/
├── ui/ (reusable UI primitives)
├── modals/ (game-specific modals)
├── game/ (game logic components)
└── performance/ (monitoring components)
```

### Modal System
- **Inventory**: Grid view, search, item descriptions
- **NPCs**: Selection → Conversation (typing indicators, portraits)
- **Save/Load**: Slot management, metadata display
- **Use Items**: Target selection (standalone, with item, with environment)

## ASSET ORGANIZATION

### Images (`public/images/`)
- **Characters**: PascalCase (Al.png, Ayla.png, Dominic.png)
- **Rooms**: `zoneType_location.png` (newyorkZone_manhattanhub.png)
- **Special**: favicon.ico, gorstanicon.png, fallback.png

### Audio (`public/audio/`)
- **Zones**: `zoneName.mp3` (gorstanZone.mp3, elfhameZone.mp3)
- **Effects**: click.wav, success.wav, fail.wav, portal.mp3
- **Ambient**: ambient.mp3, intro.mp3

## DEPLOYMENT CONFIGURATION

### Vercel Setup (`vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### Build Config (`vite.config.ts`)
```typescript
{
  build: {
    target: 'es2020',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'game-engine': ['./src/engine', './src/logic', './src/state'],
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion']
        }
      }
    }
  }
}
```

## KEY MECHANICS

### Command Parser
- **Navigation**: n/north, s/south, e/east, w/west, back
- **Actions**: look, examine [item], take [item], use [item], talk to [npc]
- **Advanced**: search for traps, disarm trap, save game, load game
- **Aliases**: Full word support (north = n, examine = look at)

### Flag System
- **Progress**: Room visits, story progression, character states
- **Special**: dominicIsDead, pollyTakeoverActive, debugMode, trap_expert
- **Persistence**: Optimized storage, automatic cleanup

### Save System
- **Slots**: Multiple saves with metadata (timestamp, playtime, score, location)
- **Compression**: State optimization before save
- **Recovery**: Error handling, corruption detection

## DEVELOPMENT PATTERNS

### Error Boundaries
- Graceful degradation for missing rooms/assets
- Fallback content for failed loads
- User-friendly error messages

### Performance Optimizations
- Lazy loading for rooms and assets
- React performance patterns throughout
- State compression and cleanup
- Memory usage monitoring

### Code Organization
```
src/
├── components/ (UI components)
├── engine/ (core game logic)
├── hooks/ (React hooks)
├── logic/ (game mechanics)
├── rooms/ (room definitions)
├── state/ (state management)
├── types/ (TypeScript definitions)
├── utils/ (helper functions)
└── data/ (game content)
```

## CRITICAL DEPENDENCIES

### Production
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "framer-motion": "^11.5.4",
  "lucide-react": "^0.439.0"
}
```

### Development
```json
{
  "@types/react": "^18.3.3",
  "@vitejs/plugin-react": "^4.3.1",
  "typescript": "^5.5.3",
  "vite": "^5.4.1",
  "tailwindcss": "^3.4.10"
}
```

## PRODUCTION CHECKLIST

### Pre-Deploy
- [ ] `npm run build` succeeds without warnings
- [ ] All image references exist in public/images/
- [ ] Audio files properly referenced
- [ ] No .md files in build (except aibuild.md)
- [ ] Performance metrics within thresholds

### Post-Deploy Verification
- [ ] Room loading works (fallback system active)
- [ ] NPC movement functions
- [ ] Save/load system operational
- [ ] Book discussions respond correctly
- [ ] Trap detection warnings appear

## REBUILD INSTRUCTIONS

1. **Initialize Project**
   ```bash
   npm create vite@latest gorstan -- --template react-ts
   cd gorstan && npm install
   ```

2. **Install Dependencies**
   ```bash
   npm install framer-motion lucide-react
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. **Copy Core Files** (Priority Order)
   - `src/state/GameContext.tsx` (state management)
   - `src/engine/roomLoader.ts` + `roomLoaderFallback.ts`
   - `src/hooks/useNPCController.ts` (NPC system)
   - `src/data/bookLore.ts` (book content)
   - `src/rooms/` (all room definitions)
   - `public/images/` + `public/audio/` (assets)

4. **Configuration Files**
   - `vite.config.ts`, `vercel.json`, `tailwind.config.mjs`
   - `tsconfig.json`, `package.json` (dependencies)

5. **Component Architecture**
   - `AppCore.tsx` (main shell)
   - Modal components (inventory, NPCs, save/load)
   - UI primitives and game components

## GAME CONTENT SUMMARY

### Story Flow
- Start: Control Nexus (tutorial space)
- Progression: Portal system between zones
- Exploration: 100+ interconnected rooms
- Characters: 5 main NPCs with unique personalities
- Ending: Multiple paths based on player choices

### Unique Features
- **Literary AI**: Deep book discussions with Ayla
- **Multiverse Navigation**: Portal system between realities
- **Ethical NPCs**: Wandering characters with emergent behavior
- **Fair Traps**: Detection and disarmament systems
- **Performance Monitoring**: Real-time optimization

### Technical Achievements
- **Zero-dependency** game engine (except React)
- **Production-grade** performance optimization
- **Accessible** command-based interface
- **Mobile-responsive** design
- **PWA-ready** architecture

---
## FINAL STATE: PRODUCTION READY
Last optimization: 2025-08-10 | Build size: 288.78 kB | Performance: Optimal
Repository: Nova-40/gorstan-game | Branch: fix/final-polish-playable

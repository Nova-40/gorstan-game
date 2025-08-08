# Gorstan Game Architecture Overview

## Project Structure

### Entry Points
- **main.tsx** - Application entry point, renders App component
- **App.tsx** - Root component, provides GameStateProvider context
- **AppCore.tsx** - Main game controller and UI orchestrator (1,259 lines)

### State Management
- **gameState.tsx** - Central game state with React Context + useReducer pattern
- **LocalGameState interface** - Comprehensive type definition for all game state
- **Reducer pattern** - Handles all game actions (MOVE_TO_ROOM, SET_FLAG, etc.)

### Room System
- **roomRegistry.ts** - Auto-generated registry mapping room IDs to modules
- **rooms/** directory - Individual room definitions with exits, descriptions, interactions
- **Room interface** - Typed room structure with exits, items, NPCs, etc.
- **Zone-based organization** - Rooms grouped by zones (introZone, gorstanZone, glitchZone, etc.)

### Core Game Systems

#### Navigation & Movement
- **QuickActionsPanel.tsx** - Direction buttons and quick actions
- **Movement logic** - handleRoomChange() with zone-aware teleport animations
- **Room transitions** - RoomTransition component with animation support
- **History tracking** - Backout functionality with room history

#### NPC System
- **NPCConsole.tsx** - Dialogue interface with conversation history
- **NPCSelectionModal.tsx** - Multi-NPC interaction selector
- **npcEngine.ts** - Response generation and interaction handling
- **wanderingNPCController.ts** - AI-driven NPC movement between rooms
- **Individual controllers** - Specialized logic for key NPCs (Librarian, Mr. Wendell)

#### Inventory & Items
- **InventoryPanel.tsx** - Item display and management
- **InventoryModal.tsx** - Full inventory interface
- **UseItemModal.tsx** - Item usage interface
- **itemDescriptions.ts** - Item metadata and descriptions

#### Command System
- **commandParser.ts** - Text command processing with aliases
- **CommandInput.tsx** - Player input interface
- **TerminalConsole.tsx** - Game output display

#### Animation System
- **TeleportManager.tsx** - Manages teleport overlays
- **FractalTeleportOverlay.tsx** - Glitch realm teleport effect
- **TrekTeleportOverlay.tsx** - Standard teleport effect
- **RoomTransition.tsx** - Inter-room animation system
- **Various transition components** - Jump, Sip, Wait, Dramatic Wait

### UI Components

#### Core Panels
- **PlayerStatsPanel.tsx** - Player information display
- **PresentNPCsPanel.tsx** - NPCs in current room
- **QuickActionsPanel.tsx** - Action buttons and movement controls
- **DebugPanel.tsx** - Development tools and diagnostics

#### Game Flow
- **SplashScreen.tsx** - Initial loading screen
- **WelcomeScreen.tsx** - Main menu
- **PlayerNameCapture.tsx** - Name input screen
- **TeletypeIntro.tsx** - Animated introduction sequence

#### Modals & Overlays
- **ModalOverlay.tsx** - Base modal container
- **SaveGameModal.tsx** - Save/load interface
- **BlueButtonWarningModal.tsx** - Critical action confirmation

### Game Logic

#### Engines
- **achievementEngine.ts** - Achievement tracking and unlocking
- **miniquestInitializer.ts** - Sub-quest management
- **scoreEffects.ts** - Score calculation and effects
- **codexTracker.ts** - Discovery and lore tracking

#### Controllers
- **librarianController.ts** - Library-specific interactions
- **mrWendellController.ts** - Mr. Wendell encounter logic
- **wanderingNPCController.ts** - NPC movement AI

### Hooks & Utilities

#### Custom Hooks
- **useFlags.ts** - Game flag management
- **useGameState.ts** - State context accessor
- **useLibrarianLogic.ts** - Librarian interaction hook
- **useModuleLoader.ts** - Dynamic module loading
- **useOptimizedEffects.ts** - Performance-optimized effects
- **useRoomTransition.ts** - Room change animation logic
- **useWendellLogic.ts** - Mr. Wendell interaction hook

#### Utilities
- **roomLoader.ts** - Room data loading and caching
- **Various utility functions** - Helper functions throughout

### Asset Management
- **public/images/** - Room backgrounds, NPC portraits, UI elements
- **public/audio/** - Sound effects and ambient audio
- **Fallback system** - Graceful degradation for missing assets

### Build System
- **Vite** - Modern build tool with TypeScript support
- **TypeScript** - Full type safety with strict mode
- **ESLint** - Code quality and consistency (needs v9 config)
- **Tailwind CSS** - Utility-first styling
- **PostCSS** - CSS processing pipeline

## Data Flow

### State Updates
1. User action (button click, command input)
2. Event handler in component
3. Dispatch action to reducer
4. State update triggers re-renders
5. Components react to new state

### Room Navigation
1. User triggers movement (direction button, command)
2. handleRoomChange() validates exit
3. Zone change detection for teleport effects
4. Room state update via MOVE_TO_ROOM action
5. UI updates with new room data

### NPC Interactions
1. User opens NPC modal or sends message
2. NPCConsole handles dialogue display
3. npcEngine processes responses
4. Conversation history maintained locally
5. Game state updated for significant interactions

## Performance Considerations

### Optimization Strategies
- **Memoization** - useMemo/useCallback for expensive computations
- **Lazy loading** - Dynamic imports for room modules
- **Asset caching** - Efficient resource management
- **Chunk splitting** - Separate bundles for different systems

### Memory Management
- **State cleanup** - Proper cleanup of timers and subscriptions
- **Asset unloading** - Remove unused room assets
- **History limiting** - Bounded message history

## Architecture Strengths

### Type Safety
- Comprehensive TypeScript coverage
- Strong typing for game state and actions
- Interface definitions for all major data structures

### Modularity
- Clear separation of concerns
- Room system allows easy content addition
- Plugin-style NPC and interaction system

### Extensibility
- Command system supports easy command addition
- Flag system allows complex game state tracking
- Achievement and miniquest systems are expandable

### Performance
- Optimized React patterns
- Efficient state management
- Asset optimization and caching

## Current Issues Identified

### Critical Fixes Needed
1. **ESLint Configuration** - Missing v9 config file (FIXED)
2. **NPC Modal Input Clearing** - Double-echo in console (FIXED)
3. **TypeScript Errors** - Missing NPC location property (FIXED)

### System Verification Needed
1. **Wandering NPCs** - Verify movement timer activation
2. **Teleport Animations** - Test zone-change detection
3. **Movement Actions** - QuickActionsPanel direction execution
4. **Death System** - Lives tracking and respawn logic
5. **Polly Takeover Timer** - 4m20s sequence verification

### Performance Optimizations
1. **Asset Loading** - Implement progressive loading
2. **Memory Usage** - Profile and optimize heavy components
3. **Bundle Size** - Further chunk optimization

### Accessibility
1. **Keyboard Navigation** - Full keyboard support
2. **Screen Reader** - ARIA labels and live regions
3. **High Contrast** - Terminal display options
4. **Reduced Motion** - Respect user preferences

## Testing Infrastructure

### Current Setup
- **Playwright** - Browser automation for smoke tests
- **Smoke test script** - Basic functionality verification
- **TypeScript verification** - Compile-time type checking

### Needed Testing
- **Unit tests** - Component and utility testing
- **Integration tests** - System interaction testing
- **Regression tests** - Critical path verification
- **Performance tests** - Memory and speed benchmarks

## Development Workflow

### Code Quality
- **TypeScript strict mode** - Enhanced type safety
- **ESLint rules** - Consistent code style
- **Prettier formatting** - Automated code formatting
- **Pre-commit hooks** - Quality gates

### Build Pipeline
- **Development server** - Hot reloading with Vite
- **Production build** - Optimized bundling
- **Asset processing** - Image and audio optimization
- **Deploy pipeline** - Vercel integration

This architecture provides a solid foundation for a complex interactive fiction game with modern web technologies, comprehensive type safety, and extensible systems for content and feature additions.

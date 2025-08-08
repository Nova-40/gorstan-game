# Wandering NPC System Audit & Map

## Current Architecture Overview

### Primary Code Paths
1. **Main Controller**: `src/engine/wanderingNPCController.ts` - Core wandering logic
2. **Spawner System**: `src/engine/npcSpawner.ts` - Dynamic spawning and despawning
3. **Room Event Handler**: `src/engine/roomEventHandler.ts` - Movement timer initialization
4. **NPC Hook**: `src/hooks/useNPCController.ts` - React integration and interval management

### Scheduler/Tick Loop Analysis

**Current Tick System:**
- **Location**: `useNPCController.ts` lines 32-48
- **Interval**: 20 seconds (20000ms)
- **Method**: `setInterval()` calling `wanderNPC()` for hardcoded NPC list
- **Trigger**: Sets `evaluateWanderingNPCs` flag + direct module loading

**Alternative Timer (Secondary):**
- **Location**: `roomEventHandler.ts` lines 187-199
- **Interval**: 15 seconds (15000ms) 
- **Method**: Dispatch flag-setting action only
- **Storage**: Interval ID stored on `window.npcMovementInterval`

### Movement Rules & Logic

**NPC Registry**: `src/npcs/npcMemory.ts` + individual NPC definitions
- **Al**: `currentRoom: 'controlroom'`, `biasZones: ['introZone', 'londonZone', 'latticeZone']`
- **Morthos**: `currentRoom: 'controlroom'`, `biasZones: ['glitchZone', 'stantonZone', 'offgorstanZone']` 
- **Wendell**: `currentRoom: 'stantonhub'`
- **Polly**: `currentRoom: 'glitchgate'`
- **Dominic**: Various room assignments

**Movement Policy (`wanderNPC` function):**
- **Cooldown**: 15 seconds minimum between moves (`npc.lastMoved`)
- **Valid Rooms**: Excludes trap/cutscene/puzzle/boss/private rooms
- **Zone Bias**: 70% chance to prefer NPC's `biasZones` if available
- **Room Filter**: Must be different from current room

### Room Adjacency & Constraints

**Adjacency**: Based on `state.roomMap` - all rooms in map are considered valid destinations
**No Adjacency Enforcement**: NPCs can teleport between any valid rooms (not realistic)
**Constraint Types**:
- Room type filtering (avoids traps, puzzles, etc.)
- Zone preferences via `biasZones` array
- Cooldown-based temporal constraints

### Collision/Occupancy Rules

**Current Status**: ❌ **NO COLLISION DETECTION**
- Multiple NPCs can occupy same room
- No capacity limits implemented
- No conflict resolution between NPCs

### Activation Conditions

**Wandering Enabled When:**
- `npc.canWander === true`
- `npc.questOnly !== true` (prevents quest-specific NPCs from wandering)
- No active cutscenes or overlays (not implemented)
- No checks for story progress/zone gates

**Current Issues:**
- No pause during teleports, death sequences, or modal focus
- No activation flags for story progression
- Hardcoded NPC list in movement system

### NPC Configuration (Per-NPC)

**Available Properties:**
- `canWander: boolean` - Enable/disable wandering
- `shouldWander: boolean` - Additional toggle
- `lastMoved: number` - Timestamp for cooldown
- `biasZones: string[]` - Preferred zones for movement
- `currentRoom: string` - Current location

**Missing Properties:**
- ❌ `roamRadius` - Distance limit from home
- ❌ `speed` - Movement frequency modifier  
- ❌ `tabooRooms` - Forbidden locations
- ❌ `homeRoom` - Base/return location

## Current Bugs & Risk Items

### 🚨 Critical Issues

1. **Multiple Timer Systems**: Two different interval systems (15s + 20s) may cause race conditions
2. **No Adjacency Logic**: NPCs teleport unrealistically between distant rooms
3. **Stale Closures**: Dynamic imports in intervals may retain old state references
4. **Memory Leaks**: `window.npcMovementInterval` not properly cleaned up

### ⚠️ High Risk

5. **Unawaited Async Operations**: `loadModule()` calls not awaited, potential timing issues
6. **Hardcoded NPC Lists**: Movement system breaks if NPC IDs change
7. **No Pause Mechanism**: Continues during cutscenes, modals, teleport sequences
8. **Missing Validation**: No checks if `roomMap` or NPC registry are available

### 📋 Medium Risk

9. **Race Conditions**: Flag-based + direct call system may cause double moves
10. **Unrealistic Movement**: No pathfinding or adjacency constraints
11. **No Capacity Management**: Unlimited NPCs per room
12. **Missing Story Integration**: No activation based on game progression

### 🔧 Technical Debt

13. **Legacy Code**: Multiple wandering controllers (`enhancedWanderingNPCController.ts` empty)
14. **Inconsistent Patterns**: Mix of flag-based and direct function calls
15. **Poor Error Handling**: No graceful degradation if movement fails
16. **Debug Visibility**: Limited logging for movement decisions

## System Integration Points

**Game State Dependencies:**
- `state.roomMap` - Room definitions and zone information
- `state.currentRoomId` - Player location for proximity checks
- `state.flags` - Game progression and activation flags
- `npcRegistry` - NPC definitions and current locations

**React Component Integration:**
- `useNPCController.ts` - Main interval management
- `AppCore.tsx` - Game state management
- Room components - NPC visibility and interaction

**Action Dispatch System:**
- `SET_FLAG` - Flag manipulation for movement triggers
- `ADD_NPC`/`REMOVE_NPC` - Dynamic NPC management
- `RECORD_MESSAGE` - Movement notifications

## Recommendations for Repair

### Immediate Fixes (High Priority)
1. **Consolidate Timer Systems** - Single, pausable scheduler
2. **Add Adjacency Logic** - Realistic room-to-room movement
3. **Implement Pause Conditions** - Stop during overlays, cutscenes
4. **Fix Memory Leaks** - Proper cleanup of intervals

### System Improvements (Medium Priority)
5. **Deterministic Movement** - Seeded RNG for consistent behavior
6. **Per-NPC Policies** - Configurable movement patterns (patrol, seek, avoid)
7. **Collision Detection** - Room capacity and NPC conflict rules
8. **Debug Interface** - Movement decision logging and visualization

### Feature Additions (Lower Priority)
9. **Story Integration** - Activation conditions based on game progress
10. **Pathfinding System** - Multi-hop movement planning
11. **NPC Interaction** - NPCs react to each other's presence
12. **Performance Optimization** - Efficient movement scheduling

This audit reveals a partially functional but unreliable wandering system that needs substantial repairs before implementing the Control Room encounter system.

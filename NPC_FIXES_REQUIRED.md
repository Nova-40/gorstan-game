# Critical NPC System Fixes Required

## 🚨 CRITICAL ISSUES

### 1. **Multiple Timer Systems Conflict**
- **Problem**: Two different interval systems (15s + 20s) cause race conditions
- **Location**: `useNPCController.ts` (20s) + `roomEventHandler.ts` (15s)
- **Fix Required**: Consolidate to single timer system

### 2. **No Adjacency Logic**
- **Problem**: NPCs teleport unrealistically between distant rooms
- **Impact**: Breaks immersion, NPCs appear/disappear randomly
- **Fix Required**: Implement proper pathfinding/adjacency constraints

### 3. **Memory Leaks**
- **Problem**: `window.npcMovementInterval` not properly cleaned up
- **Impact**: Multiple timers accumulate, performance degradation
- **Fix Required**: Proper cleanup in useEffect

### 4. **No Pause Mechanism**
- **Problem**: NPCs continue moving during cutscenes, modals, teleport sequences
- **Impact**: NPCs appear in wrong contexts, breaks immersion
- **Fix Required**: Pause wandering during system overlays

## ⚠️ HIGH RISK

### 5. **Stale Closures**
- **Problem**: Dynamic imports in intervals may retain old state references
- **Impact**: NPCs use outdated game state
- **Fix Required**: Proper dependency management

### 6. **Hardcoded NPC Lists**
- **Problem**: Movement system breaks if NPC IDs change
- **Location**: `['morthos', 'al_escape_artist', 'polly', 'dominic_wandering', 'mr_wendell']`
- **Fix Required**: Dynamic NPC registry lookup

### 7. **Missing Validation**
- **Problem**: No checks if `roomMap` or NPC registry are available
- **Impact**: Runtime errors when systems not ready
- **Fix Required**: Guard clauses and error handling

## 📋 MEDIUM RISK

### 8. **No Collision Detection**
- **Problem**: Multiple NPCs can occupy same room
- **Impact**: Unrealistic NPC placement
- **Fix Required**: Room occupancy management

### 9. **Race Conditions**
- **Problem**: Flag-based + direct call system may cause double moves
- **Impact**: NPCs move too frequently
- **Fix Required**: Single movement coordination system

### 10. **No Story Integration**
- **Problem**: No activation based on game progression
- **Impact**: NPCs appear in wrong story contexts
- **Fix Required**: Story-aware spawning conditions

## IMMEDIATE FIX RECOMMENDATIONS

### Priority 1: Stop Multiple Timers
```typescript
// In useNPCController.ts - remove one of the timer systems
// Keep only the 20s interval, remove the 15s one
```

### Priority 2: Add Pause Logic
```typescript
// Before wandering, check for active overlays:
if (state.isSystemOverlayActive || state.isPollyTakeoverActive) {
  return; // Skip wandering during overlays
}
```

### Priority 3: Cleanup Memory Leaks
```typescript
// Ensure proper cleanup
useEffect(() => {
  const interval = setInterval(/* ... */);
  return () => {
    clearInterval(interval);
    if (window.npcMovementInterval) {
      clearInterval(window.npcMovementInterval);
      delete window.npcMovementInterval;
    }
  };
}, []);
```

### Priority 4: Add Adjacency Logic
```typescript
// Filter valid rooms by adjacency
const adjacentRooms = getAdjacentRooms(npc.currentRoom, state.roomMap);
const validRooms = allRooms.filter(room => 
  adjacentRooms.includes(room.id) && 
  !room.id.includes('trap') // existing filters
);
```

## STATUS
- **Morthos & Al Encounter**: ✅ Works when they meet in Control Room
- **NPC Spawning**: ⚠️ Partially functional, needs reliability fixes
- **Wandering Movement**: ❌ Multiple critical issues
- **Alliance Memory**: ✅ Functional when triggered
- **Response System**: ✅ Works (Ayla enhanced, others functional)

## RECOMMENDATION
Fix the timer conflicts and pause logic immediately before proceeding with other polish work. The current system may cause performance issues and unrealistic NPC behavior.

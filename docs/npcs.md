# NPC System Documentation

## Overview
The Gorstan game features a sophisticated NPC (Non-Player Character) system with multiple components for interaction, wandering behavior, and dialogue management.

## Core Components

### 1. NPC Console System
- **NPCConsole.tsx** - Main NPC dialogue interface
- **NPCSelectionModal.tsx** - Modal for choosing between multiple NPCs
- **npcEngine.ts** - Core NPC response logic and interaction handling

### 2. Wandering NPCs
- **wanderingNPCController.ts** - Manages NPC movement between rooms
- **Timer-based system** - NPCs move based on schedules and conditions
- **Location tracking** - NPCs maintain current room locations

### 3. Individual NPC Controllers
- **librarianController.ts** - Handles Librarian-specific logic
- **mrWendellController.ts** - Handles Mr. Wendell interactions
- **Custom response systems** - Each major NPC has specialized behavior

## NPC Data Structure

```typescript
interface NPC {
  id: string;
  name: string;
  location: string;           // Current room ID
  personality?: string;       // Personality traits
  knowledge?: string[];       // Topics NPC knows about
  customResponses?: Record<string, string>;
  description?: string;
  mood?: NPCMood;            // Current emotional state
  memory?: {                 // Interaction history
    interactions: number;
    lastInteraction: number;
    playerActions: any[];
    relationship: number;
    knownFacts: any[];
  };
}
```

## Dialogue Flow

1. **NPC Selection**
   - Single NPC in room → Direct dialogue
   - Multiple NPCs → Selection modal
   - No NPCs → Default to Ayla (universal helper)

2. **Message Processing**
   - Player input → npcEngine.npcReact()
   - Response generation based on NPC personality/knowledge
   - Console output with NPC response
   - Input field clearing (TODO: Fix double-echo issue)

3. **Ayla Helper System**
   - Universal guide available in all rooms
   - Provides game help and navigation assistance
   - Special "Ask Ayla" quick action (? button)
   - Polly Takeover timer assistance

## Wandering Behavior

### Movement Rules
- NPCs follow predetermined schedules
- Weighted random movement between accessible rooms
- Respect zone boundaries and special locations
- Movement triggered by game timer system

### Current Status
⚠️ **TODO**: Verify wandering NPCs are actually moving
- Check timer activation
- Validate movement conditions  
- Test NPC location updates

## Special NPCs

### Ayla (Helper)
- Available universally as fallback
- Provides context-sensitive help
- Offers reset room teleport during Polly Takeover

### Morthos & Al
- Warn player during Polly Takeover sequence
- Time-sensitive dialogue options

### Mr. Wendell
- Complex interaction patterns
- Special death mechanics if harmed

### Librarian
- Library-specific functionality
- Item and puzzle interactions

## Known Issues & TODOs

1. **Input Clear Issue** - NPC modal input needs immediate clearing after message send
2. **Wandering Verification** - Confirm NPCs actually move when scheduled
3. **Memory Persistence** - Ensure NPC memories survive game sessions
4. **Response Variety** - Add more dynamic response generation

## Integration Points

- **Game State**: NPCs stored in `state.npcsInRoom`
- **Room System**: NPCs track locations via room IDs
- **Flag System**: NPC interactions can set/check game flags
- **Achievement Engine**: NPC interactions trigger achievements
- **Timer System**: Wandering behavior tied to game time

## Testing Notes

- Test NPC modal open/close functionality
- Verify input clearing after message send
- Check NPC movement between rooms over time
- Validate memory persistence across sessions
- Test multi-NPC selection modal

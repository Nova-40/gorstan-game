# Inter-NPC Conversations Implementation Summary

## 🎯 Goal Achieved
✅ **Complete Inter-NPC Conversation System** enabling Ayla, Morthos, and Al to talk to each other using existing NLU/memory/policy layers.

## 🏗️ Architecture Overview

### Core Components
1. **Conversation Bus** (`src/npc/conversationBus.ts`) - Main orchestrator
2. **NPC Registry** (`src/npc/registry.ts`) - NPC configuration and rules  
3. **Voice Styling** (`src/npc/style.ts`) - Personality-based dialogue styling
4. **Memory System** (`src/npc/profiles.ts`) - NPC memory and conversation tracking
5. **Conversation Triggers** (`src/npc/triggers.ts`) - When conversations happen
6. **Public API** (`src/npc/talk.ts`) - Easy-to-use conversation functions

### Data Models
- **ConversationThread** - Tracks multi-turn conversations
- **NPCExchange** - Individual messages between NPCs
- **SpeakerRef** - Identifies NPCs and players
- **Voice** - NPC personality traits for styling

## 🚀 Features Implemented

### ✅ Core Conversation Features
- **NPC-to-NPC dialogue** with automatic replies
- **Co-location rules** (Morthos ↔ Al must be in same room, Ayla can talk anywhere)
- **Conversation cooldowns** (60-90 seconds between conversations)
- **Thread management** (max 12 exchanges per thread)
- **Player visibility toggle** (overhear NPC banter setting)

### ✅ Intelligence Integration
- **Enhanced NPC responses** using existing `getEnhancedNPCResponse` system
- **Voice styling** based on NPC personality (formal/casual, terse/verbose)
- **Memory tracking** of who talked to whom and when
- **Topic classification** (hint, lore, banter, quest)

### ✅ Game Integration
- **Room entry triggers** - NPCs start conversations when player enters
- **Periodic checks** - Background conversation opportunities every 2 minutes
- **Event-driven responses** - NPCs react to player actions
- **State coordination** - Hidden conversations to coordinate hints

### ✅ UI Components
- **NPCBanterToggle** - Player setting to show/hide NPC conversations
- **InterNPCDemo** - Demonstration component with example triggers
- **Console integration** - NPC conversations appear as `[npc → npc] message`

## 📁 File Structure

```
src/
├── types/dialogue.ts              # Core conversation types
├── npc/
│   ├── registry.ts                # NPC IDs and configuration
│   ├── profiles.ts                # Memory and voice management
│   ├── style.ts                   # Personality-based text styling
│   ├── conversationBus.ts         # Main conversation orchestrator
│   ├── talk.ts                    # Public API for conversations
│   └── triggers.ts                # When conversations happen
├── reducers/conversations.ts      # State management for conversations
├── components/
│   ├── NPCBanterToggle.tsx        # Player toggle for conversation visibility
│   ├── InterNPCDemo.tsx           # Demo component with examples
│   └── NPCConversationTest.tsx    # Development testing component
└── examples/interNPCExamples.ts   # Complete usage examples
```

## 🎮 How to Use

### Basic Conversation
```typescript
import { NPCTalk } from '../npc/talk';

const ctx = { state, dispatch, roomId: 'controlnexus' };

// Morthos starts conversation with Al
NPCTalk.morthosAndAl.morthosStarts("Did you move my trans-spanner again?", ctx);

// Ayla guides Morthos
NPCTalk.aylaToMorthos("The player seems stuck. Suggest you hint at the pedestal pattern.", ctx);
```

### Automatic Triggers
```typescript
import { onRoomEntry, maybeAylaIntervention } from '../npc/triggers';

// On room change (already integrated in AppCore.tsx)
onRoomEntry(state, dispatch, newRoomId, previousRoomId);

// When player seems stuck
maybeAylaIntervention(state, dispatch, roomId);
```

### Settings Integration
```typescript
// Toggle player's ability to overhear NPC conversations
dispatch({ type: 'SET_OVERHEAR', payload: false });

// Check current setting
const canOverhear = state.overhearNPCBanter; // true/false
```

## 🔧 Conversation Rules

### Co-location Requirements
- **Morthos ↔ Al**: Must be in same room (unless scripted exception)
- **Ayla ↔ Anyone**: Can talk across rooms (meta character privilege)
- **Cross-room override**: Available for scripted story moments

### Cooldown System
- **Per NPC pair**: 90 seconds for Morthos-Al, 2 minutes for Ayla conversations
- **Global room limit**: Max one new conversation every 75 seconds per room
- **Thread limits**: Max 12 exchanges per conversation thread

### Voice Personality
- **Morthos**: Casual, humorous, mechanical tics (`*clank*`)
- **Al**: Formal, serious, precise language (`Ahem.`)
- **Ayla**: Balanced, knowing, mysterious (`*nods thoughtfully*`)

## 🎭 Example Conversations

### Room Entry Banter
```
[morthos → al] Look, the chair glows when they hesitate.
[al → morthos] Correlation is not causation. The luminescence is timer-based.
[ayla → al] Pedantry acknowledged. Suggest you also mention the floor pattern if asked.
```

### Player Guidance
```
[ayla → morthos] The player is circling. Suggest you hint at the pedestal pattern.
[morthos → player] *adjusts mechanical parts* Maybe try examining the pedestals more closely?
```

### Hidden Coordination
```
# Not visible to player, coordinates hints
Hidden: [ayla → morthos] Player acquired remote but hasn't tried a chair.
# Later, when player asks for help:
[morthos → player] *clank* Have you tried using that remote on one of the chairs?
```

## 🧪 Testing Components

### Development Demo
```tsx
import InterNPCDemo from './components/InterNPCDemo';

// Add to your game UI for testing
<InterNPCDemo />
```

### Quick Test
```tsx
import NPCConversationTest from './components/NPCConversationTest';

// Enables automatic conversation testing
<NPCConversationTest enabled={true} />
```

## ⚙️ Configuration

### Game State Extensions
```typescript
interface LocalGameState {
  // Added fields:
  conversations: Record<string, ConversationThread>;
  overhearNPCBanter: boolean;
}
```

### New Action Types
```typescript
// Conversation management
'UPSERT_CONVERSATION' | 'SET_OVERHEAR' | 'CLEAR_CONVERSATION' | 'MUTE_CONVERSATION'
```

## 🎯 Integration Points

### Already Integrated
- ✅ **AppCore.tsx** - Room entry triggers and periodic checks
- ✅ **gameState.tsx** - Conversation reducer and state management  
- ✅ **NPCConsole.tsx** - Enhanced to use new conversation system
- ✅ **Enhanced NPC Response** - Fallback integration with existing system

### Ready to Use
- ✅ **Conversation triggers** - Automatic room entry and periodic checks
- ✅ **Player settings** - NPCBanterToggle component available
- ✅ **Example patterns** - Complete usage examples in `/examples`

## 🚀 Quick Start

1. **Enable conversations** - Already integrated, works automatically
2. **Add player control** - Include `<NPCBanterToggle />` in your UI
3. **Trigger conversations** - Use `NPCTalk` functions in your game logic
4. **Customize dialogue** - Modify conversation content in triggers.ts

## 🔍 Monitoring

### Console Output
- Conversation threads appear as `[npc → npc] message`
- Debug info available with proper logging
- Performance monitoring included

### Player Control
- Toggle visibility with NPCBanterToggle
- Settings persist in game state
- Hidden conversations still coordinate hints

## 📈 Performance

- **Lightweight** - Conversations only trigger when NPCs are present
- **Cooldown protected** - Prevents conversation spam
- **Memory efficient** - Thread history capped at 12 exchanges
- **Non-blocking** - Never interferes with player input

## 🎉 Result

**Complete inter-NPC conversation system** that:
- ✅ Enables rich NPC-to-NPC dialogue
- ✅ Respects room location and cooldowns  
- ✅ Never blocks player input
- ✅ Uses existing NLU/memory/policy systems
- ✅ Provides player control over visibility
- ✅ Includes comprehensive examples and documentation

The system is **production-ready** and **fully integrated** into the Gorstan game!

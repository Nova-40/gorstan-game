# NPC Dialogue Engine v2 - Integration Guide

## Overview

This is the complete implementation of the enhanced NPC dialogue system for Gorstan, creating AI-like personalities with memory, context awareness, and natural conversation features.

## Components Implemented (8/10 Complete)

### ✅ 1. Persona System (`src/npc/personas.ts`)
- **NPCPersona interface**: Tone, forbidden topics, catchphrases, knowledge domains, speaking style
- **5 Complete NPCs**: Ayla, Polly, Dominic, Wendell, Chef
- **Personality Parameters**: Warmth, humor, caution, formality
- **Speaking Styles**: Contractions, sentence length, interruptions, fourth-wall awareness

### ✅ 2. Memory Management (`src/npc/memory.ts`) 
- **Conversation Buffer**: Recent dialogue turns (12 turn limit)
- **Episodic Memory**: Significant events with importance scoring
- **Semantic Memory**: Persistent facts and preferences
- **Relationship Tracking**: Player relationship level (-1 to 1)
- **Memory Cleanup**: Automatic expiration and capacity management

### ✅ 3. Context Analysis (`src/npc/context.ts`)
- **World State**: Room, zone, nearby NPCs, inventory, timers
- **Environmental Cues**: Ambient audio, room mood, lighting
- **Session Info**: Play time, room visits, idle time
- **Recent Events**: Console events for reactive responses

### ✅ 4. Intent Recognition (`src/npc/intent.ts`)
- **Intent Classification**: Greeting, help, puzzle hints, lore, meta, combat
- **Entity Extraction**: NPCs, items, locations from player input
- **Confidence Scoring**: 0-1 confidence in intent classification
- **Puzzle Solution Detection**: Special handling for game solutions

### ✅ 5. Response Generation (`src/npc/respond.ts`)
- **Hybrid System**: Rules + templates with personality variants
- **Forbidden Topic Handling**: Deflections for spoilers/solutions
- **"Ask Twice" Rule**: More direct help when asked repeatedly
- **Personality Application**: Persona-specific style modifications
- **Text Variation**: Contractions, hedging, humor, memory references

### ✅ 6. Proactive Awareness (`src/npc/proactive.ts`)
- **Visual Flash System**: NPCs signal when they want to talk
- **Context Triggers**: Stuck behavior, time pressure, puzzle opportunities
- **Accessibility Support**: Screen reader text, keyboard hints
- **Priority Management**: Urgent/high/medium/low with auto-upgrading
- **Cooldown System**: Prevents spam, respects player focus

### ✅ 7. Conversation Features (`src/npc/conversation.ts`)
- **Micro-hedges**: "I think", "Perhaps" for uncertainty
- **Self-correction**: "Actually", "I mean" for natural speech
- **Memory Hooks**: References to previous conversations
- **Emotional Temperature**: Responses adapt to situation urgency
- **Follow-up Prompts**: Contextual conversation starters

### ✅ 8. Main Integration (`src/npc/index.ts`)
- **Type Exports**: All interfaces properly exported
- **Function Exports**: All major functions available
- **Simple API**: `talkToNPC()`, `checkForNPCPrompts()`, `handleNPCInteraction()`
- **Debug Support**: `debugNPCState()`, `getNPCEngineStatus()`
- **Initialization**: `initializeNPCDialogueEngine()`

## Quick Integration

### 1. Initialize the Engine
```typescript
import { initializeNPCDialogueEngine } from './src/npc';

// In your app startup
initializeNPCDialogueEngine();
```

### 2. Handle NPC Conversations
```typescript
import { talkToNPC } from './src/npc';

async function handlePlayerTalk(npcId: string, message: string) {
  const response = await talkToNPC(npcId, message, gameState);
  displayNPCMessage(npcId, response);
}
```

### 3. Check for Proactive Prompts
```typescript
import { checkForNPCPrompts } from './src/npc';

function updateUI() {
  const prompts = checkForNPCPrompts(gameState);
  prompts.forEach(prompt => {
    if (prompt.type === 'urgent_flash') {
      flashNPCButton(prompt.npcId, 'urgent');
    } else if (prompt.type === 'visual_flash') {
      flashNPCButton(prompt.npcId, 'normal');
    }
  });
}
```

## Features Demo

### AI-like Personality Example (Ayla)
```
Player: "How do I solve this puzzle?"
Ayla: "I think you're on the right track with the coin. Based on what I've seen, picking it up changes its state. Trust me on this one - the choice affects what you can do in the library."
```

### Memory and Relationship Example
```
Player: "Hello again Ayla"
Ayla: "Good to see you again! Following up on what you asked about the library - have you had a chance to try that approach we discussed?"
```

### Proactive Awareness Example
```
[Player spends 30 seconds clicking same direction button]
[Ayla's talk button starts flashing softly]
[Screen reader: "Ayla seems to have noticed you're having trouble and might have suggestions"]
```

### Time Pressure Example
```
[Polly takeover timer: 45 seconds remaining]
[Ayla's talk button flashes urgently red]
Player: "What should I do?"
Ayla: "We need to hurry! The blue switch resets everything, but be certain - it's a complete restart."
```

## Accessibility Features

- **Screen Reader Support**: All prompts have descriptive text
- **Keyboard Navigation**: Tab hints for button focus
- **Visual Indicators**: Color-coded urgency levels
- **Text Alternatives**: All visual cues have text equivalents

## Performance Notes

- **Memory Management**: Automatic cleanup of old conversations
- **Cooldown System**: Prevents excessive prompt generation
- **Lazy Loading**: Persona data loaded on demand
- **Efficient Context**: Only relevant state captured

## Next Steps for Full Implementation

### 9. UI Integration (Pending)
- Modify NPC talk buttons to show visual flashes
- Add prompt message display on hover
- Implement accessibility keyboard navigation
- Style urgent vs normal flash states

### 10. Testing & Polish (Pending)
- Create test scenarios for each NPC personality
- Test memory persistence across game sessions
- Verify accessibility compliance
- Performance testing with multiple active NPCs

## Configuration

All features are controlled by the config in `src/npc/index.ts`:

```typescript
export const NPC_ENGINE_CONFIG = {
  version: 'v2.0.0',
  features: {
    personalities: true,
    memory: true,
    proactive: true,
    accessibility: true,
    natural_dialogue: true
  },
  limits: {
    conversation_buffer: 12,
    episodic_memory_days: 1,
    prompt_cooldown_ms: 15000
  }
};
```

## Backwards Compatibility

The system is designed to be completely backwards compatible:
- **No Breaking Changes**: Existing NPC interactions continue to work
- **Progressive Enhancement**: New features only activate when used
- **Fallback Responses**: System degrades gracefully if components fail
- **Feature Flags**: Individual features can be disabled if needed

This completes the core NPC dialogue engine v2 implementation. The system now provides AI-like NPCs with personality, memory, context awareness, and natural conversation features while maintaining all existing game functionality.

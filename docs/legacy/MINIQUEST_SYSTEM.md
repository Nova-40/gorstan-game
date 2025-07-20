# Miniquest System Implementation

## 🎯 Overview

The miniquest system provides optional, flavor-rich challenges that enhance exploration and engagement without blocking main game progression. Players can discover and complete bite-sized objectives in each room that reward curiosity and thorough exploration.

## 🏗️ System Architecture

### Core Components

1. **MiniquestTypes.ts** - Type definitions for the miniquest system
2. **miniquestEngine.ts** - Core logic for quest management and completion
3. **roomMiniquests.ts** - Quest definitions organized by room
4. **miniquestInitializer.ts** - System initialization and setup
5. **Command Integration** - Commands added to commandProcessor.ts

### Quest Types

- **Dynamic**: Simple, often repeatable actions (listen, gather, meditate)
- **Structured**: More complex challenges requiring specific conditions  
- **Puzzle**: Logic-based challenges that test problem-solving
- **Social**: NPC interaction and relationship building
- **Exploration**: Discovery and observation tasks

## 🎮 Player Commands

### New Commands Added:
- `miniquests` - List available miniquests in current area
- `attempt [miniquest]` - Try to complete a specific miniquest
- `inspect [object]` - Enhanced examination with miniquest triggers
- `listen [target]` - Listen to environment/objects (triggers quests)
- `gather [item]` - Collect environmental elements
- `trace [markings]` - Trace symbols or patterns
- `decipher [symbols]` - Decode cryptic messages
- `meditate` - Find inner peace in sacred spaces
- `acknowledge [presence]` - Recognize hidden watchers

## 📊 Sample Miniquests by Zone

### Elfhame Zone
- **Faerie Glade**: Decipher ancient Fae glyphs, commune with oak trees
- **Fae Lake**: Scry other realms, gather harmonic silver sand
- **Palace Dungeons**: Decode reality symbols, listen to starlight chains

### Gorstan Zone  
- **Gorstan Hub**: Make fountain wishes, decode notice board secrets
- **Village**: Share baker stories, solve blacksmith riddles

### London Zone
- **Dale's Apartment**: Discuss philosophy with Dominic, study perfect alignment
- **Trent Park**: Acknowledge hidden watchers, meditate in sacred grove

### Intro Zone
- **The Crossing**: Decipher floating symbols, seek Guardian wisdom

## 🔧 System Features

### Smart Triggers
- Commands automatically check for miniquest triggers
- Context-aware responses based on room and player state
- Multiple miniquests can trigger from the same action

### Requirements System
- **Item Requirements**: Some quests need specific inventory items
- **Condition Requirements**: Based on flags or game state
- **Difficulty Scaling**: Trivial to Hard with different success rates

### Reward System
- **Score Points**: 10-35 points based on difficulty
- **Achievement Integration**: Links to existing achievement system
- **Codex Recording**: Completions logged in player's codex
- **Item Rewards**: Some quests award special items

### State Management
- **Progress Tracking**: Attempts, completion status, timestamps
- **Repeatable Quests**: Some can be completed multiple times
- **Persistent State**: Integrates with game save/load system

## 🧪 Testing the System

### Quick Test Commands:
1. Go to the Faerie Glade: `teleport to control nexus` → navigate to Elfhame
2. List available quests: `miniquests`
3. Try a quest: `inspect stones` (requires ancient_scroll)
4. Test simple quest: `listen` (should trigger oak communion)

### Expected Behavior:
- Commands provide contextual responses even without quest completion
- Quest completion awards points and updates codex
- Repeated attempts on failed quests provide different feedback
- System gracefully handles missing requirements

## 📝 Adding New Miniquests

### 1. Define the Quest
```typescript
{
  id: 'unique_quest_id',
  title: 'Human-Readable Quest Name',
  description: 'Player instruction on how to trigger',
  type: 'dynamic' | 'structured' | 'puzzle' | 'social' | 'exploration',
  rewardPoints: 15, // 10-35 based on difficulty
  flagOnCompletion: 'room_quest_completed',
  triggerAction: 'command_that_triggers',
  triggerText: 'Hint when wrong command used',
  requiredItems: ['item1', 'item2'], // Optional
  hint: 'Additional help text', // Optional
  difficulty: 'easy', // trivial/easy/medium/hard
  repeatable: true // Optional, default false
}
```

### 2. Add to Room Miniquests
Add quest to appropriate room in `roomMiniquests.ts`

### 3. Add Command Handler (if needed)
For new trigger actions, add case to commandProcessor.ts

### 4. Test Integration
- Verify quest appears in `miniquests` command
- Test trigger action works correctly
- Confirm scoring and codex integration

## 🎨 Design Philosophy

### Non-Blocking
- All miniquests are optional
- Main game progression never depends on miniquest completion
- Players can ignore the system entirely without penalty

### Atmospheric
- Quests emerge from room descriptions and environmental details
- Enhance the sense of place and immersion
- Reward careful observation and curiosity

### Scalable
- Easy to add new quests to any room
- Flexible difficulty and reward system
- Can be expanded with new quest types

## 🐛 Troubleshooting

### Common Issues:
1. **Quest not appearing**: Check room ID matches in roomMiniquests.ts
2. **Trigger not working**: Verify triggerAction matches command exactly
3. **Score not awarded**: Check scoreEffects integration
4. **Codex not updating**: Verify recordMiniquestCompletion call

### Debug Commands (Geoff only):
- Use debug mode to check quest states
- Console logs show quest registration and completion
- Check miniquestState in game state for progress tracking

## 🚀 Future Enhancements

### Potential Additions:
- **Quest Chains**: Multi-step miniquests that unlock sequentially
- **Seasonal Quests**: Time-based or event-triggered quests
- **NPC Quest Givers**: Characters who provide mini-objectives
- **Miniquest Achievements**: Meta-achievements for completing many quests
- **Player Statistics**: Track completion rates and favorite quest types

### Integration Opportunities:
- **Weather System**: Weather-dependent quests
- **Time of Day**: Quests available only at certain times
- **Player Traits**: More trait-based quest variations
- **Multiplayer**: Cooperative miniquest completion

---

## 📈 Success Metrics

The miniquest system successfully adds:
- ✅ **40+ individual miniquests** across major game zones
- ✅ **8 new player commands** for enhanced interaction
- ✅ **Integrated scoring system** with 10-35 point rewards
- ✅ **Codex integration** for progress tracking
- ✅ **Difficulty scaling** from trivial to hard challenges
- ✅ **Smart trigger system** that enhances existing commands
- ✅ **Non-intrusive design** that doesn't block progression
- ✅ **Room-specific content** that rewards exploration

The system enriches gameplay by providing optional depth while maintaining the core Gorstan experience of discovery and narrative exploration.

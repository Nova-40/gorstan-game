# 🧮 Dynamic Scoring System Documentation

## Overview
Gorstan now features a comprehensive dynamic scoring system that tracks player actions and provides feedback throughout the game. The system awards points for positive actions and deducts points for mistakes or poor choices.

## Core Components

### 1. Score Manager (`scoreManager.ts`)
- **Purpose**: Central management of score updates with dispatch integration
- **Key Functions**:
  - `updateScore(delta)` - Add/subtract points
  - `setScore(value)` - Set absolute score
  - `resetScore()` - Reset to 0
  - `applyScoreBonus(reason, amount)` - Award bonus with message
  - `applyScorePenalty(reason, amount)` - Apply penalty with message

### 2. Score Effects (`scoreEffects.ts`)
- **Purpose**: Event-to-score mapping and special scoring logic
- **Features**:
  - Complete event score map with 50+ scoring events
  - Score threshold system for achievements and reactions
  - Dominic's special score commentary
  - Contextual score messages based on performance

### 3. Game State Integration
- **New Action Types**: `UPDATE_SCORE`, `SET_SCORE`, `RESET_SCORE`
- **Player Score**: Tracked in `player.score` field
- **UI Display**: Score shown in PlayerStatsPanel with star icon

## Scoring Events

### 🎯 Base Intro Choices
- **Jump**: +10 points
- **Sip Coffee**: +50 points  
- **Wait**: -25 points

### 🧩 Puzzle & Discovery
- **Simple Puzzle**: +25 points
- **Hard Puzzle**: +75 points
- **Expert Puzzle**: +150 points
- **Hidden Item Found**: +30 points
- **Secret Room**: +60 points
- **Easter Egg**: +15 points

### 👥 NPC Interactions
- **Talk to NPCs**: +10 points
- **Dominic Survives**: +40 points
- **Dominic Dies**: -50 points
- **Polite to Mr. Wendell**: +25 points
- **Rude to Mr. Wendell**: -75 points
- **Helpful Librarian**: +35 points

### 🎮 Game Mechanics
- **Item Collection**: +10 points per item
- **Coffee Use**: +20 points
- **Blue Button Press**: -20 points
- **Reset Button**: -10 points
- **Cheat Mode Use**: -100 points
- **Save Game**: +5 points

### 🏆 Achievements & Special Events
- **Achievement Unlock**: +50 points
- **Zone Completion**: +100 points
- **Perfect Playthrough**: +500 points
- **Death**: -200 points
- **Resurrection**: +100 points

### ⚔️ Combat & Hazards
- **Trap Triggered**: -30 points
- **Trap Disarmed**: +15 points
- **Near Death Escape**: +75 points
- **Damage Taken**: -(damage/2) points

## Score Thresholds & Reactions

### 🎖️ Achievement Thresholds
- **Rookie**: 100 points
- **Explorer**: 300 points
- **Master**: 600 points
- **Legend**: 1000+ points

### 💬 NPC Score Reactions
- **Dominic Impressed**: 200+ points
- **Mr. Wendell Approves**: 400+ points
- **Librarian Respects**: 350+ points

### 🎯 Special Unlocks
- **Secret Ending**: 800+ points
- **Perfect Rating**: 1200+ points
- **Cheat Forgiveness**: -50+ points (redemption)

## Commands

### `score`
- Displays current score
- Shows contextual performance message
- Includes Dominic's commentary (if you have him)

### `status`
- Shows player stats including score
- Health, score, and location summary

## Dominic's Score Commentary

Dominic the goldfish provides special commentary based on your score:

- **500+ points**: "You know, for someone with such a high score, you sure know how to make questionable choices with goldfish."
- **200+ points**: "Your score's not bad, though I question your methods involving aquatic creatures."
- **≤0 points**: "Maybe try earning points through less fish-related activities?"
- **≤-50 points**: "You know, some people earn that score by not stealing fish."

## Integration Examples

### Intro Choice Scoring
```typescript
// Automatically applied during intro transitions
if (stage === 'transition_jump') {
  applyScoreForEvent('intro.choice.jump'); // +10 points
}
```

### Achievement Integration
```typescript
// Achievements automatically award +50 points
unlockAchievement('puzzle_solver'); // +50 points + achievement
```

### Item Collection
```typescript
// Built into get/take command
const itemScore = 10;
const newScore = (gameState.player.score || 0) + itemScore;
```

### Death Penalty
```typescript
// Applied when taking lethal damage
const scorePenalty = Math.floor(damage / 2);
const newScore = Math.max(0, currentScore - scorePenalty);
```

## Performance Messages

The system provides contextual feedback:

- **1000+ points**: "You are a legendary adventurer!"
- **600+ points**: "Your skills are truly masterful."
- **300+ points**: "You're becoming quite the explorer."
- **100+ points**: "You're getting the hang of this!"
- **≤0 points**: "Every expert was once a beginner."
- **≤-100 points**: "Perhaps a more careful approach would serve you better..."

## Technical Implementation

### Score Manager Initialization
```typescript
// In AppCore.tsx
import('../state/scoreManager').then(({ initializeScoreManager }) => {
  initializeScoreManager(dispatch);
});
```

### Event-Based Scoring
```typescript
// Use throughout codebase
import { applyScoreForEvent } from '../state/scoreEffects';
applyScoreForEvent('solve.puzzle.hard'); // +75 points
```

### Direct Score Updates
```typescript
// For custom scoring
dispatch({ type: 'UPDATE_SCORE', payload: 25 });
```

## Future Enhancements

### Potential Additions
- **Multiplier System**: Bonus multipliers for streaks
- **Negative Score Recovery**: Redemption mechanics
- **Score History**: Track scoring events over time
- **Leaderboards**: Compare scores across playthroughs
- **Score-Based Endings**: Different endings based on final score

### Dynamic Events
The scoring system is designed to be easily extended. New events can be added to `scoreEffects.ts` and automatically integrate with the existing infrastructure.

## Balancing Notes

- **Positive Actions**: Generally award 10-75 points
- **Major Achievements**: 50-150 points
- **Negative Actions**: -10 to -100 points
- **Death Penalty**: Significant but recoverable (-200 points)
- **Total Range**: Designed for scores of -500 to +1500 in typical gameplay

The scoring system enhances player engagement by providing immediate feedback for actions and creating additional goals beyond the main storyline.

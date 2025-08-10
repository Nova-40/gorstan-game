// examples/interNPCExamples.ts
// Complete examples of Inter-NPC Conversation usage
// Copy these patterns into your game logic
// Gorstan Game Beta 1

import { LocalGameState } from '../src/state/gameState';
import { NPCTalk, ConversationContext } from '../src/npc/talk';
import { 
  maybeStartBanter, 
  maybeAylaIntervention, 
  onGameEvent,
  scriptedConversations 
} from '../src/npc/triggers';

/**
 * Example 1: Room Entry Banter
 * When player enters Control Nexus with both Morthos and Al present
 */
export function exampleRoomEntryBanter(
  state: LocalGameState, 
  dispatch: any, 
  roomId: string
): void {
  const ctx: ConversationContext = { state, dispatch, roomId };

  if (roomId === 'controlnexus') {
    // Check if both NPCs are present
    const morthosPresent = state.npcsInRoom?.some(n => n.id === 'morthos');
    const alPresent = state.npcsInRoom?.some(n => n.id === 'al');

    if (morthosPresent && alPresent) {
      // Trigger room-specific banter with a delay
      setTimeout(() => {
        maybeStartBanter(state, dispatch, roomId);
      }, 2000);
    }
  }
}

/**
 * Example 2: Player Stuck Detection
 * Ayla intervenes when player seems confused
 */
export function examplePlayerStuckIntervention(
  state: LocalGameState,
  dispatch: any,
  roomId: string
): void {
  // Check if player has been in room too long or visited too many times
  const roomVisits = state.roomVisitCount[roomId] || 0;
  const timeInRoom = Date.now() - (state.gameTime.currentTime || Date.now());

  if (roomVisits > 8 || timeInRoom > 180000) { // 3 minutes
    maybeAylaIntervention(state, dispatch, roomId);
  }
}

/**
 * Example 3: Quest-Specific Conversations
 * NPCs discuss player progress and coordinate hints
 */
export function exampleQuestCoordination(
  state: LocalGameState,
  dispatch: any,
  roomId: string
): void {
  const ctx: ConversationContext = { state, dispatch, roomId };

  // Player has remote but hasn't tried the chair
  if (state.flags.hasRemote && !state.flags.triedChair && roomId === 'controlnexus') {
    // Hidden coordination between Ayla and Morthos
    NPCTalk.hiddenHint(
      'ayla', 
      'morthos', 
      'Player acquired remote but hasn\'t tried a chair.', 
      ctx
    );

    // Morthos might then offer a visible hint
    setTimeout(() => {
      NPCTalk.aylaToMorthos(
        'Your engineering perspective might help here.', 
        ctx
      );
    }, 5000);
  }

  // Player solved a puzzle - NPCs congratulate
  if (state.flags.solvedControlPuzzle) {
    NPCTalk.morthosAndAl.alStarts(
      'Systematic approach yielded the correct result.', 
      ctx
    );
  }
}

/**
 * Example 4: Dynamic Conversation Based on Game State
 * Different conversations for different story phases
 */
export function exampleDynamicConversations(
  state: LocalGameState,
  dispatch: any,
  roomId: string
): void {
  const ctx: ConversationContext = { state, dispatch, roomId };

  // Early game - NPCs introduce concepts
  if (!state.flags.understoodBasics) {
    NPCTalk.aylaToAl(
      'Systematic explanation of the interface would help.', 
      ctx
    );
  }

  // Mid game - NPCs discuss player's progress
  else if (state.flags.hasSeenGlitch && !state.flags.understoodGlitch) {
    NPCTalk.morthosAndAl.morthosStarts(
      'Did you see that reality flicker?', 
      ctx
    );
  }

  // Late game - NPCs prepare for finale
  else if (state.flags.nearingEnd) {
    NPCTalk.aylaToMorthos(
      'The final phase approaches. Guide them carefully.', 
      ctx
    );
  }
}

/**
 * Example 5: Scripted Multi-Turn Conversation
 * A complete conversation sequence
 */
export function exampleScriptedSequence(
  state: LocalGameState,
  dispatch: any,
  roomId: string
): void {
  const ctx: ConversationContext = { state, dispatch, roomId };

  if (roomId === 'resetroom' && !state.flags.seenResetConversation) {
    // Mark as seen to prevent repetition
    dispatch({
      type: 'SET_FLAG',
      payload: { key: 'seenResetConversation', value: true }
    });

    // Timed sequence of conversations
    setTimeout(() => {
      NPCTalk.morthosAndAl.morthosStarts(
        'Look, the chair glows when they hesitate.', 
        ctx
      );
    }, 1000);

    setTimeout(() => {
      NPCTalk.morthosAndAl.alStarts(
        'Correlation is not causation. The luminescence is timer-based.', 
        ctx
      );
    }, 4000);

    setTimeout(() => {
      NPCTalk.aylaToAl(
        'Pedantry acknowledged. Suggest you also mention the floor pattern if asked.', 
        ctx
      );
    }, 7000);
  }
}

/**
 * Example 6: Event-Driven Conversations
 * NPCs react to specific game events
 */
export function exampleEventDrivenConversations(
  eventType: string,
  state: LocalGameState,
  dispatch: any,
  roomId: string
): void {
  onGameEvent(eventType, state, dispatch, roomId);
}

/**
 * Example 7: Manual Conversation Triggers
 * Direct conversation triggers for specific situations
 */
export function exampleManualTriggers(
  state: LocalGameState,
  dispatch: any,
  roomId: string
): void {
  const ctx: ConversationContext = { state, dispatch, roomId };

  // Engineering discussion
  NPCTalk.morthosAndAl.morthosStarts(
    'The portal stabilizers need recalibration.', 
    ctx
  );

  // Meta guidance from Ayla
  NPCTalk.aylaToMorthos(
    'They need to understand the mechanical connections.', 
    ctx
  );

  // Cross-room communication (Ayla can talk anywhere)
  NPCTalk.aylaToAl(
    'Logical analysis might clarify their confusion.', 
    { ...ctx, roomId: 'any-room' }
  );
}

/**
 * Example 8: Settings Integration
 * Show/hide conversations based on player preference
 */
export function exampleSettingsIntegration(
  state: LocalGameState,
  dispatch: any
): void {
  // Toggle overhear setting
  dispatch({
    type: 'SET_OVERHEAR',
    payload: !state.overhearNPCBanter
  });

  // Update game settings to include NPC banter preference
  dispatch({
    type: 'UPDATE_SETTINGS',
    payload: {
      npcBanterEnabled: state.overhearNPCBanter
    }
  });
}

/**
 * Example 9: Complete Integration Pattern
 * How to integrate all features in a single function
 */
export function exampleCompleteIntegration(
  state: LocalGameState,
  dispatch: any,
  roomId: string,
  eventType?: string
): void {
  // 1. Handle room entry
  exampleRoomEntryBanter(state, dispatch, roomId);

  // 2. Check for stuck player
  examplePlayerStuckIntervention(state, dispatch, roomId);

  // 3. Quest-specific coordination
  exampleQuestCoordination(state, dispatch, roomId);

  // 4. Dynamic conversations
  exampleDynamicConversations(state, dispatch, roomId);

  // 5. Scripted sequences
  exampleScriptedSequence(state, dispatch, roomId);

  // 6. Event-driven responses
  if (eventType) {
    exampleEventDrivenConversations(eventType, state, dispatch, roomId);
  }
}

/**
 * Example 10: Cooldown and Rate Limiting
 * How the system prevents conversation spam
 */
export function exampleCooldownHandling(
  state: LocalGameState,
  dispatch: any,
  roomId: string
): void {
  const ctx: ConversationContext = { state, dispatch, roomId };

  // This conversation will only trigger if cooldown has passed
  NPCTalk.morthosAndAl.morthosStarts(
    'Systems check complete.', 
    ctx
  );
  
  // If called again immediately, this will be silently skipped
  // due to the cooldown system in conversationBus.ts
}

// Usage Instructions:
// 
// 1. Copy the pattern that fits your need
// 2. Integrate into your game logic where appropriate:
//    - Room entry: Add to room transition effects
//    - Player stuck: Add to idle detection
//    - Quest events: Add to quest state changes
//    - Manual triggers: Add to specific story beats
// 
// 3. Customize the dialogue text for your NPCs and story
// 
// 4. Test with the NPCBanterToggle component to verify visibility
//
// 5. Use NPCConversationTest component during development

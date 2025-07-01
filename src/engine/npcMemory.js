// src/engine/npcMemory.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// npcMemory utility for Gorstan game.
// Tracks in-memory and optionally persistent state for key NPCs (Ayla, Morthos, Al).
// Provides functions to record interactions, retrieve NPC state, and access all NPCs' states.

/**
 * npcStates
 * In-memory state for each NPC, including mood, memory, query count, and trust level.
 * Not persisted across reloads unless explicitly saved.
 */
const npcStates = {
  ayla: {
    mood: 'neutral',
    memory: [],
    queryCount: 0,
    trustLevel: 0
  },
  morthos: {
    mood: 'cynical',
    memory: [],
    queryCount: 0,
    trustLevel: 0
  },
  al: {
    mood: 'hopeful',
    memory: [],
    queryCount: 0,
    trustLevel: 0
  }
};

/**
 * recordInteraction
 * Records an interaction with a specific NPC, updating their memory, mood, and trust level.
 *
 * @param {string} npc - NPC identifier ('ayla', 'morthos', 'al')
 * @param {string} topic - Player's query or subject
 * @param {object} playerState - Current player state (should include currentRoomId)
 * @returns {void}
 */
export function recordInteraction(npc, topic, playerState) {
  if (!npcStates[npc]) return;

  const npcData = npcStates[npc];
  npcData.queryCount++;
  npcData.memory.push({ topic, time: Date.now(), location: playerState.currentRoomId });

  // Basic trust and mood adaptation logic
  if (npc === 'ayla' && npcData.queryCount > 5) {
    npcData.mood = 'weary';
  } else if (npc === 'morthos' && npcData.queryCount > 4) {
    npcData.mood = 'grudging';
  } else if (npc === 'al') {
    if (topic.includes('earth') || topic.includes('music')) {
      npcData.trustLevel++;
      npcData.mood = 'glowing';
    }
  }
  // TODO: Expand with more nuanced trust/mood logic as narrative deepens.
}

/**
 * getNPCState
 * Retrieves the current state for a specific NPC.
 *
 * @param {string} npc - NPC identifier ('ayla', 'morthos', 'al')
 * @returns {object|null} - Current state object or null if invalid NPC
 */
export function getNPCState(npc) {
  return npcStates[npc] || null;
}

/**
 * getAllNPCStates
 * Retrieves all NPC states, optionally from localStorage if present.
 * Used for debugging, display, or endgame logic.
 *
 * @returns {object} - All NPC states as a keyed object.
 */
export function getAllNPCStates() {
  const raw = localStorage.getItem('npcStates');
  // If localStorage is empty, return in-memory state
  return raw ? JSON.parse(raw) : npcStates;
}

// All functions are exported as named exports for use in dialogue, endgame, and debugging logic.
// TODO: Add persistence hooks to save/restore npcStates to/from
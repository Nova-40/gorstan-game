// src/engine/npcMemory.js

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
 * Records an interaction with a specific NPC.
 * @param {string} npc - NPC identifier ('ayla', 'morthos', 'al')
 * @param {string} topic - Player's query or subject
 * @param {object} playerState - Current player state
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
}

/**
 * Retrieves the current state for an NPC.
 * @param {string} npc - NPC identifier
 * @returns {object|null} - Current state or null if invalid
 */
export function getNPCState(npc) {
  return npcStates[npc] || null;
}
export function getAllNPCStates() {
  const raw = localStorage.getItem('npcStates');
  return raw ? JSON.parse(raw) : {};
}
/**Returns all NPC states for debugging or display purposes.*/
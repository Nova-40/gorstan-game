// src/engine/deathEngine.js

/**
 * Handles fatal trap resolution and soft resets.
 */
export function handlePlayerDeath(playerState, cause = 'unknown') {
  const deathMessage = getDeathMessage(cause);
  return {
    nextRoomId: 'introsplat',
    messages: [
      deathMessage,
      'You awaken again, somehow... The multiverse is not done with you.'
    ],
    flags: {
      ...playerState.flags,
      player_splatted: true,
      lastDeathCause: cause
    }
  };
}

function getDeathMessage(cause) {
  switch (cause) {
    case 'trap': return 'Your foot slips — and the room fills with gas.';
    case 'glitch': return 'Reality folds in on itself. You vanish with a scream.';
    case 'npc': return 'They warned you. You didn't listen. That was your last mistake.';
    default: return 'You feel a sudden chill... then nothing.';
  }
}

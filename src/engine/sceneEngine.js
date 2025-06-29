// src/engine/sceneEngine.js
// Reusable interactive scene system

/**
 * Executes interactive narrative scenes.
 * @param {string} sceneId
 * @param {Object} context
 * @param {function} appendMessage
 * @param {function} setGameState
 */
export function runScene(sceneId, context, appendMessage, setGameState) {
  if (sceneId === 'goldfishEscape') {
    appendMessage('💦 The orb tank is heavy. Water sloshes out, soaking your feet.');
    appendMessage('🐟 The fish stares at you. Do you really want to take Dominic out of water?');
    appendMessage('⚠️ Taking him might upset Polly — it’s the only thing she really cares about.');
    setGameState((prev) => ({
      ...prev,
      flags: { ...prev.flags, tookDominic: true }
    }));
  }
}

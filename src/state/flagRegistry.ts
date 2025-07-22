

// src/state/flagRegistry.ts
// Gorstan Game (c) Geoff Webster 2025
// Code MIT Licence
// Central registry of all known game flags for type-safe access

export const FlagMap = {
  npc: {
    forceLibrarianSpawn: "forceLibrarianSpawn",
    forceWendellSpawn: "forceWendellSpawn",
    pendingLibrarianCommand: "pendingLibrarianCommand",
    pendingWendellCommand: "pendingWendellCommand",
    wasRudeRecently: "wasRudeRecently",
    wasRudeToNPC: "wasRudeToNPC",
    wendellSpared: "wendellSpared",
    checkWendellStatus: "checkWendellStatus",
  },
  debug: {
    debugSpawnNPC: "debugSpawnNPC",
    debugListNPCs: "debugListNPCs",
    debugSystemStatus: "debugSystemStatus",
    debugShowInventory: "debugShowInventory",
    debugPerformance: "debugPerformance",
  },
  transition: {
    systemsReady: "systemsReady",
    roomMapReady: "roomMapReady",
  },
  audio: {
    playAmbientSound: "playAmbientSound",
    stopAllAudio: "stopAllAudio",
    muteAudio: "muteAudio",
  },
  game: {
    resetGameState: "resetGameState",
    saveGame: "saveGame",
    loadGame: "loadGame",
  },
};

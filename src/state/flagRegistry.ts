// src/state/flagRegistry.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

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
    evaluateWanderingNPCs: "evaluateWanderingNPCs",
  },
  debug: {
    debugSpawnNPC: "debugSpawnNPC",
    debugListNPCs: "debugListNPCs",
    debugSystemStatus: "debugSystemStatus",
    debugShowInventory: "debugShowInventory",
    debugPerformance: "debugPerformance",
    debugSpawnRoom: "debugSpawnRoom",
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
    playerLives: "playerLives",
    sidedWith: "sidedWith",
    metAl: "metAl",
    metMorthos: "metMorthos",
    hasMetMorthosAl: "hasMetMorthosAl",
    victoryAchieved: "victoryAchieved",
  },
  items: {
    remoteControl: "remoteControl",
  },
  story: {
    extrapolatorUsed: "extrapolatorUsed",
  },
  location: {
    currentRoom: "currentRoom",
  },
  system: {
    initialized: "systemInitialized",
    ready: "systemReady",
  },
};

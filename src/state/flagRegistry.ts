/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

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

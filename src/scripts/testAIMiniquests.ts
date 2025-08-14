// AI Miniquest System Test
// This file can be used to test the AI miniquest integration

import { aiMiniquestService } from "../services/aiMiniquestService";
// Lazy import to mirror app behavior
import type { LocalGameState } from "../state/gameState";

// Mock game state for testing
const testGameState: LocalGameState = {
  stage: "playing",
  transition: null,
  currentRoomId: "gorstanhub",
  player: {
    id: "test-player-123",
    name: "TestPlayer",
    health: 100,
    score: 150,
    inventory: ["map", "key"],
    flags: {
      talked_to_dominic: true,
      examined_statue: true,
      miniquest_001_completed: true,
    },
  },
  history: [],
  roomMap: {},
  flags: {
    talked_to_dominic: true,
    examined_statue: true,
    miniquest_001_completed: true,
  },
  npcsInRoom: [],
  roomVisitCount: { gorstanhub: 5, gorstanvillage: 2 },
  gameTime: {
    day: 1,
    hour: 14,
    minute: 30,
    startTime: Date.now() - 600000,
    currentTime: Date.now(),
    timeScale: 1,
  },
  settings: {
    soundEnabled: true,
    fullscreen: false,
    cheatMode: false,
    difficulty: "normal",
    autoSave: true,
    autoSaveInterval: 300,
    musicEnabled: true,
    animationsEnabled: true,
    textSpeed: 1,
    fontSize: "medium",
    theme: "default",
    debugMode: false,
  },
  metadata: {
    resetCount: 0,
    version: "1.0.0",
    lastSaved: null,
    playTime: 600,
    achievements: [],
    codexEntries: {},
  },
  messages: [],
  inventory: ["map", "key"],
  conversations: {},
  overhearNPCBanter: false,
  visitedRooms: ["gorstanhub", "gorstanvillage"],
};

// Test functions
export async function testAIMiniquestSystem() {
  console.log("🧪 Testing AI Miniquest System...");

  try {
    // Test AI recommendations (will use fallback if AI is disabled/failing)
    console.log("🎯 Testing AI recommendations...");
    const recommendations = await aiMiniquestService.getRecommendedQuests(
      "gorstanhub",
      testGameState,
      3,
    );
    console.log("AI Recommendations:", recommendations);

    // Test player state analysis
    console.log("🔍 Testing player analysis...");
    const analysis = await aiMiniquestService.analyzePlayerState(testGameState);
    console.log("Player Analysis:", analysis);

    // Test controller integration
    console.log("🎮 Testing controller integration...");
    const MiniquestController = (await import("../engine/miniquestController"))
      .default;
    const controller = MiniquestController.getInstance();
    controller.setAIEnabled(true);
    const aiStatus = controller.getAIStatus();
    console.log("AI Status:", aiStatus);

    console.log("✅ AI Miniquest System test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ AI Miniquest System test failed:", error);
    return false;
  }
}

// Manual test trigger (can be called from browser console)
(window as any).testAIMiniquests = testAIMiniquestSystem;

export default {
  testAIMiniquestSystem,
  testGameState,
};

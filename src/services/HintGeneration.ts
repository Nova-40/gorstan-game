import { groqAI } from "./groqAI";
import type { AylaHintContext } from "./aylaHintSystem";

export async function generateAIHint(
  context: AylaHintContext,
  stuckState: {
    isStuck: boolean;
    confidence: number;
    reasons: string[];
    category: string;
  },
): Promise<string | null> {
  const { currentRoom, recentCommands } = context;

  const prompt = `You are Ayla, a cosmic AI. The player is stuck in ${currentRoom.title}.
Recent commands: ${recentCommands.slice(-5).join(", ")}
Stuck reasons: ${stuckState.reasons.join(", ")}
Generate a helpful hint.`;

  try {
    const response = await groqAI.generateNPCResponse("ayla", prompt, {
      stage: "initial",
      transition: "none",
      player: {
        id: "defaultPlayer",
        name: "Default",
        health: 100,
        inventory: [],
      },
      history: [],
      inventory: [],
      flags: {},
      currentRoomId: "villagegreen",
      roomMap: {
        villagegreen: {
          id: "villagegreen",
          title: "Village Green",
          description: "A serene green area.",
          zone: "stantonZone",
        },
      },
      npcsInRoom: [],
      roomVisitCount: {},
      gameTime: {
        day: 1,
        hour: 0,
        minute: 0,
        startTime: Date.now(),
        currentTime: Date.now(),
        timeScale: 1,
      },
      settings: {
        soundEnabled: true,
        fullscreen: false,
        cheatMode: false,
        difficulty: "normal",
        autoSave: true,
        autoSaveInterval: 10,
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
        playTime: 0,
        achievements: [],
        codexEntries: {},
      },
      messages: [],
      conversations: {},
      overhearNPCBanter: false,
    });
    return response || null;
  } catch (error) {
    console.warn("[HintGeneration] AI failed:", error);
    return null;
  }
}

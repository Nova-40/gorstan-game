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
// Core game engine module.

import { GameAction } from "../types/GameTypes";
import { LocalGameState } from "../state/gameState";
import { NPC } from "../types/NPCTypes";
import { PlayerState } from "../types/npcMemory";
import { Room } from "../types/Room";
import { unlockAchievement } from "../logic/achievementEngine";

interface WendellState {
  lastSpawnTransition: number;
  transitionsSinceSpawn: number;
  rudenessTriggerCount: number;
  cursedItemTriggerActive: boolean;
  isCurrentlyActive: boolean;
  currentRoomId?: string;
  sparedByPlayer: boolean;
}

let wendellState: WendellState = {
  lastSpawnTransition: 0,
  transitionsSinceSpawn: 0,
  rudenessTriggerCount: 0,
  cursedItemTriggerActive: false,
  isCurrentlyActive: false,
  sparedByPlayer: false,
};

// --- Function: evaluateWendellSpawn ---
export function evaluateWendellSpawn(
  room: Room,
  gameState: LocalGameState,
  transitionCount: number,
): { shouldSpawn: boolean; probability: number; reason: string } {
  // Variable declaration
  const safeRooms = [
    "welcome",
    "hidden_library",
    "cafe",
    "prewelcome",
    "controlnexus",
    "lattice_library",
    "library",
  ];

  // Variable declaration
  const isSafeRoom = safeRooms.some((safe) =>
    room.id.toLowerCase().includes(safe.toLowerCase()),
  );

  if (isSafeRoom) {
    return { shouldSpawn: false, probability: 0, reason: "Safe room" };
  }

  if (wendellState.isCurrentlyActive) {
    return { shouldSpawn: false, probability: 0, reason: "Already active" };
    if (!gameState.flags?.hasWendellProtection) {
      console.warn("[Wendell] Player lacked protection. Triggering death.");
      import("./deathEngine").then((mod) => mod.triggerDeath("npc"));
    }
  }

  // Variable declaration
  const transitionsSinceLast =
    transitionCount - wendellState.lastSpawnTransition;
  if (transitionsSinceLast < 5 && !hasActiveTriggers(gameState)) {
    return { shouldSpawn: false, probability: 0, reason: "Cooldown active" };
  }

  // Variable declaration
  const hasRudeness =
    gameState.flags?.wasRudeToNPC || gameState.flags?.wasRudeRecently;
  // Variable declaration
  const hasCursedItems = checkForCursedItems(gameState);

  let probability = 0.05;
  let reason = "Normal wandering";

  if (hasRudeness && wendellState.rudenessTriggerCount < 3) {
    probability = 0.5;
    reason = "Player was rude to NPC";
    wendellState.rudenessTriggerCount++;
  }

  if (hasCursedItems) {
    probability = Math.max(probability, 0.75);
    reason = "Player carrying cursed items";
    wendellState.cursedItemTriggerActive = true;
  }

  if (hasRudeness && hasCursedItems) {
    probability = 1.0;
    reason = "Multiple triggers active - guaranteed spawn";
  }

  if (!hasRudeness) {
    wendellState.rudenessTriggerCount = 0;
  }

  // Variable declaration
  const shouldSpawn = Math.random() < probability;

  if (shouldSpawn) {
    wendellState.lastSpawnTransition = transitionCount;
    wendellState.isCurrentlyActive = true;
    wendellState.currentRoomId = room.id;
  }

  return { shouldSpawn, probability, reason };
}

// --- Function: checkForCursedItems ---
function checkForCursedItems(gameState: LocalGameState): boolean {
  // Variable declaration
  const cursedItems = [
    "cursedcoin",
    "doomedscroll",
    "cursed_artifact",
    "doomed_scroll",
  ];
  return gameState.player.inventory.some((item: any) =>
    cursedItems.includes(item.toLowerCase()),
  );
}

// --- Function: hasActiveTriggers ---
function hasActiveTriggers(gameState: LocalGameState): boolean {
  // Variable declaration
  const hasRudeness =
    gameState.flags?.wasRudeToNPC || gameState.flags?.wasRudeRecently;
  // Variable declaration
  const hasCursedItems = checkForCursedItems(gameState);

  return hasRudeness || hasCursedItems || wendellState.rudenessTriggerCount > 0;
}

// --- Function: handleWendellInteraction ---
export function handleWendellInteraction(
  command: string,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>,
): { handled: boolean; result?: "spared" | "killed" | "neutral" } {
  if (!wendellState.isCurrentlyActive) {
    return { handled: false };
  }

  // Variable declaration
  const lowerCommand = command.toLowerCase().trim();

  if (
    lowerCommand.includes("talk to wendell") ||
    lowerCommand.includes("speak to wendell") ||
    lowerCommand.includes("greet wendell")
  ) {
    if (Math.random() < 0.1) {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: Date.now().toString(),
          text: 'Mr. Wendell: "Manners matter. So few show them. I\'ll let you pass... this once."',
          type: "narrative",
          timestamp: Date.now(),
        },
      });

      dispatch({
        type: "SET_FLAG",
        payload: { key: "wendellSpared", value: true },
      });
      wendellState.isCurrentlyActive = false;
      wendellState.sparedByPlayer = true;

      unlockAchievement("wendell_encounter");

      return { handled: true, result: "spared" };
    } else {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: Date.now().toString(),
          text: 'Mr. Wendell: "Curiosity. A fine trait. Often fatal."',
          type: "narrative",
          timestamp: Date.now(),
        },
      });

      return { handled: true, result: "neutral" };
    }
  }

  // Variable declaration
  const rudeCommands = [
    "call wendell bonehead",
    "say rude thing",
    "insult wendell",
    "ignore wendell",
    "dismiss wendell",
    "tell wendell to go away",
  ];

  if (
    rudeCommands.some((rude) => lowerCommand.includes(rude)) ||
    (lowerCommand.includes("wendell") &&
      (lowerCommand.includes("stupid") ||
        lowerCommand.includes("idiot") ||
        lowerCommand.includes("go away") ||
        lowerCommand.includes("leave")))
  ) {
    triggerWendellDeath(dispatch);
    return { handled: true, result: "killed" };
  }

  return { handled: false };
}

// --- Function: triggerWendellDeath ---
function triggerWendellDeath(dispatch: React.Dispatch<GameAction>): void {
  dispatch({
    type: "ADD_MESSAGE",
    payload: {
      id: Date.now().toString(),
      text: "Mr. Wendell: \"That's just rude... I'm going to eat you now.\"",
      type: "narrative",
      timestamp: Date.now(),
    },
  });

  setTimeout(() => {
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: Date.now().toString(),
        text: "You feel the air chill. Mr. Wendell smiles. Polite to the end.",
        type: "system",
        timestamp: Date.now(),
      },
    });

    setTimeout(() => {
      dispatch({ type: "DAMAGE_PLAYER", payload: 1000 });
      dispatch({
        type: "SET_FLAG",
        payload: { key: "deathCause", value: "Mr. Wendell" },
      });

      // Variable declaration
      const currentDeaths = 0;
      dispatch({
        type: "SET_FLAG",
        payload: { key: "deathsFromWendell", value: currentDeaths + 1 },
      });

      wendellState.isCurrentlyActive = false;

      unlockAchievement("wendell_encounter");
    }, 1000);
  }, 1500);
}

// --- Function: removeWendellFromRoom ---
export function removeWendellFromRoom(
  dispatch: React.Dispatch<GameAction>,
): void {
  if (wendellState.isCurrentlyActive) {
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: Date.now().toString(),
        text: "Mr. Wendell fades back into the darkness with an almost imperceptible nod.",
        type: "narrative",
        timestamp: Date.now(),
      },
    });

    wendellState.isCurrentlyActive = false;
    wendellState.currentRoomId = undefined;
  }
}

// --- Function: isWendellActive ---
export function isWendellActive(): boolean {
  return wendellState.isCurrentlyActive;
}

// --- Function: getWendellRoom ---
export function getWendellRoom(): string | undefined {
  return wendellState.currentRoomId;
}

// --- Function: resetWendellState ---
export function resetWendellState(): void {
  wendellState = {
    lastSpawnTransition: 0,
    transitionsSinceSpawn: 0,
    rudenessTriggerCount: 0,
    cursedItemTriggerActive: false,
    isCurrentlyActive: false,
    sparedByPlayer: false,
  };
}

// --- Function: onRoomTransition ---
export function onRoomTransition(
  newRoom: Room,
  gameState: LocalGameState,
): void {
  wendellState.transitionsSinceSpawn++;

  if (
    wendellState.cursedItemTriggerActive &&
    wendellState.transitionsSinceSpawn >= 2
  ) {
    if (!checkForCursedItems(gameState)) {
      wendellState.cursedItemTriggerActive = false;
    }
  }

  if (
    wendellState.rudenessTriggerCount > 0 &&
    wendellState.transitionsSinceSpawn >= 3
  ) {
    if (!gameState.flags?.wasRudeToNPC && !gameState.flags?.wasRudeRecently) {
      wendellState.rudenessTriggerCount = 0;
    }
  }
}

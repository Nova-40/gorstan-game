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
// Handles Crossing room interactions and prevents infinite loops

import { LocalGameState } from "../state/gameState";

interface CrossingState {
  chairUsed: boolean;
  controlPanelActivated: boolean;
  navigationConsoleUsed: boolean;
  doorsExamined: boolean;
  lastInteractionTime: number;
}

let crossingState: CrossingState = {
  chairUsed: false,
  controlPanelActivated: false,
  navigationConsoleUsed: false,
  doorsExamined: false,
  lastInteractionTime: 0,
};

const INTERACTION_COOLDOWN = 3000; // 3 seconds cooldown between interactions

/**
 * Reset crossing state when entering the room
 */
export function resetCrossingState(): void {
  crossingState = {
    chairUsed: false,
    controlPanelActivated: false,
    navigationConsoleUsed: false,
    doorsExamined: false,
    lastInteractionTime: 0,
  };
}

/**
 * Handle interactions with objects in the Crossing room
 */
export function handleCrossingInteraction(
  command: string,
  gameState: LocalGameState,
): {
  handled: boolean;
  messages?: Array<{
    text: string;
    type: "system" | "narrative" | "description" | "hint" | "success" | "error";
  }>;
  updates?: Partial<LocalGameState>;
} {
  // Only handle interactions if we're in the crossing room
  if (gameState.currentRoomId !== "crossing") {
    return { handled: false };
  }

  const lowerCommand = command.toLowerCase().trim();
  const currentTime = Date.now();

  // Check for cooldown to prevent spam
  if (currentTime - crossingState.lastInteractionTime < INTERACTION_COOLDOWN) {
    return {
      handled: true,
      messages: [
        {
          text: "The infinite space seems to absorb your actions. Wait a moment before trying again.",
          type: "system",
        },
      ],
    };
  }

  // Handle chair interactions
  if (
    lowerCommand.includes("chair") &&
    (lowerCommand.includes("sit") ||
      lowerCommand.includes("examine") ||
      lowerCommand.includes("touch"))
  ) {
    crossingState.lastInteractionTime = currentTime;

    if (crossingState.chairUsed) {
      return {
        handled: true,
        messages: [
          {
            text: "The chair has already served its purpose. It no longer responds to your presence.",
            type: "system",
          },
        ],
      };
    }

    if (lowerCommand.includes("sit")) {
      crossingState.chairUsed = true;

      return {
        handled: true,
        messages: [
          {
            text: "As you sit in the white chair, reality begins to shift around you. The infinite space fades as a new destination materializes...",
            type: "narrative",
          },
        ],
        updates: {
          flags: {
            ...gameState.flags,
            destinationChosen: true,
            chairAvailable: false,
          },
          // Schedule room change after delay - this would need to be handled externally
          currentRoomId:
            gameState.roomMap["crossing"]?.exits?.chair || "londonhub",
        },
      };
    } else {
      return {
        handled: true,
        messages: [
          {
            text: "The white chair radiates an otherworldly presence. It seems designed for transportation between realities.",
            type: "description",
          },
        ],
      };
    }
  }

  // Handle control panel interactions
  if (lowerCommand.includes("control") && lowerCommand.includes("panel")) {
    crossingState.lastInteractionTime = currentTime;

    if (crossingState.controlPanelActivated) {
      return {
        handled: true,
        messages: [
          {
            text: "The control panel's symbols have dimmed. It has already processed your request.",
            type: "system",
          },
        ],
      };
    }

    crossingState.controlPanelActivated = true;

    return {
      handled: true,
      messages: [
        {
          text: "The crystalline control panel flickers to life, displaying a grid of teleportation destinations. The symbols pulse gently, awaiting your choice.",
          type: "description",
        },
        {
          text: "You could sit in the chair to activate the transportation system, or explore the rotating doors for other possibilities.",
          type: "hint",
        },
      ],
    };
  }

  // Handle navigation console interactions
  if (lowerCommand.includes("navigation") && lowerCommand.includes("console")) {
    crossingState.lastInteractionTime = currentTime;

    const hasRemoteControl =
      gameState.player.inventory?.includes("remote_control") || false;
    const hasNavigationCrystal =
      gameState.player.inventory?.includes("navigation_crystal") || false;

    if (!hasRemoteControl && !hasNavigationCrystal) {
      return {
        handled: true,
        messages: [
          {
            text: "The ethereal console flickers but remains unresponsive. You need a navigation device to interface with it.",
            type: "system",
          },
        ],
      };
    }

    if (crossingState.navigationConsoleUsed) {
      return {
        handled: true,
        messages: [
          {
            text: "The navigation console has already synchronized with your device. Its patterns have stabilized.",
            type: "system",
          },
        ],
      };
    }

    crossingState.navigationConsoleUsed = true;

    return {
      handled: true,
      messages: [
        {
          text: "Your navigation device synchronizes with the ethereal console. Advanced dimensional coordinates become available.",
          type: "success",
        },
      ],
      updates: {
        flags: {
          ...gameState.flags,
          advancedNavigation: true,
        },
      },
    };
  }

  // Handle rotating doors interactions
  if (lowerCommand.includes("doors") || lowerCommand.includes("door")) {
    crossingState.lastInteractionTime = currentTime;

    if (crossingState.doorsExamined) {
      return {
        handled: true,
        messages: [
          {
            text: "The doors continue their eternal dance, but you've already gleaned what insights you can from their patterns.",
            type: "system",
          },
        ],
      };
    }

    crossingState.doorsExamined = true;

    return {
      handled: true,
      messages: [
        {
          text: "You focus on the rotating doors, watching their hypnotic dance. Each door leads to a different reality, but they move too quickly to enter directly.",
          type: "description",
        },
        {
          text: "Some doors appear more stable than others. Perhaps the chair or control systems could help you access them safely.",
          type: "hint",
        },
      ],
    };
  }

  return { handled: false };
}

/**
 * Check if crossing interactions should be reset (when re-entering room)
 */
export function shouldResetCrossing(gameState: LocalGameState): boolean {
  return (
    gameState.currentRoomId === "crossing" &&
    (!gameState.flags?.destinationChosen ||
      gameState.flags?.destinationChosen === false)
  );
}

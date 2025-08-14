// src/hooks/useGroupConversation.ts
// Enhanced hook for managing group NPC conversations
// Detects when multiple NPCs are present and manages conversation dynamics

import { useMemo } from "react";
import { useGameState } from "../state/gameState";
import type { NPC } from "../types/NPCTypes";

interface GroupConversationState {
  hasGroupConversation: boolean;
  groupNpcs: NPC[];
  isCompetitiveGroup: boolean;
  primaryNpcId?: string;
  conversationType: "single" | "group" | "competitive";
}

// NPCs that create competitive dynamics when together
const COMPETITIVE_PAIRS = [
  ["al", "morthos"], // The main bureaucrat vs shadow rivalry
  // Add more competitive pairs as needed
];

// NPCs that are mediators in group conversations
const MEDIATOR_NPCS = ["ayla", "wendell"];

// NPCs that should trigger group conversations when present
const GROUP_CONVERSATION_NPCS = ["al", "morthos", "ayla", "polly", "wendell"];

export function useGroupConversation(): GroupConversationState {
  const { state } = useGameState();

  return useMemo(() => {
    const npcsInRoom = state.npcsInRoom || [];
    const relevantNpcs = npcsInRoom.filter((npc) =>
      GROUP_CONVERSATION_NPCS.includes(npc.id),
    );

    // Single NPC conversation
    if (relevantNpcs.length <= 1) {
      return {
        hasGroupConversation: false,
        groupNpcs: relevantNpcs,
        isCompetitiveGroup: false,
        primaryNpcId: relevantNpcs[0]?.id,
        conversationType: "single",
      };
    }

    // Multiple NPCs - check for competitive dynamics
    const npcIds = relevantNpcs.map((npc) => npc.id);
    const isCompetitive = COMPETITIVE_PAIRS.some((pair) =>
      pair.every((npcId) => npcIds.includes(npcId)),
    );

    // Determine primary NPC for group conversations
    let primaryNpcId: string | undefined;

    if (isCompetitive) {
      // In competitive groups, prioritize based on context
      if (npcIds.includes("al") && npcIds.includes("morthos")) {
        // Al/Morthos competition - could start with either
        primaryNpcId = "al"; // Default to Al for bureaucratic greeting
      }
    } else {
      // Non-competitive groups - prioritize mediators
      const mediator = relevantNpcs.find((npc) =>
        MEDIATOR_NPCS.includes(npc.id),
      );
      primaryNpcId = mediator?.id || relevantNpcs[0]?.id;
    }

    return {
      hasGroupConversation: true,
      groupNpcs: relevantNpcs,
      isCompetitiveGroup: isCompetitive,
      primaryNpcId,
      conversationType: isCompetitive ? "competitive" : "group",
    };
  }, [state.npcsInRoom]);
}

// Hook to determine conversation context for specific NPC pairs
export function useConversationContext(npcIds: string[]): {
  context: "competitive" | "cooperative" | "neutral";
  dynamics: string[];
} {
  return useMemo(() => {
    // Al vs Morthos - competitive recruitment
    if (npcIds.includes("al") && npcIds.includes("morthos")) {
      return {
        context: "competitive",
        dynamics: [
          "recruitment_rivalry",
          "bureaucracy_vs_mysticism",
          "structure_vs_chaos",
          "safety_vs_power",
        ],
      };
    }

    // Ayla mediating conflicts
    if (
      npcIds.includes("ayla") &&
      (npcIds.includes("al") || npcIds.includes("morthos"))
    ) {
      return {
        context: "cooperative",
        dynamics: ["mediation", "balanced_perspective", "guide_role"],
      };
    }

    // Default neutral group
    return {
      context: "neutral",
      dynamics: ["friendly_exchange", "collaborative"],
    };
  }, [npcIds]);
}

// Hook to get conversation triggers based on room state
export function useConversationTriggers(): {
  shouldTriggerGroupGreeting: boolean;
  shouldShowCompetitiveDialogue: boolean;
  triggerReason?: string;
} {
  const { state } = useGameState();
  const groupState = useGroupConversation();

  return useMemo(() => {
    // Trigger group greeting when player enters room with multiple NPCs
    const shouldTriggerGroupGreeting =
      groupState.hasGroupConversation && groupState.groupNpcs.length > 1;

    // Show competitive dialogue when Al and Morthos are together
    const shouldShowCompetitiveDialogue =
      groupState.isCompetitiveGroup &&
      groupState.groupNpcs.some((npc) => npc.id === "al") &&
      groupState.groupNpcs.some((npc) => npc.id === "morthos");

    let triggerReason: string | undefined;
    if (shouldShowCompetitiveDialogue) {
      triggerReason = "al_morthos_rivalry";
    } else if (shouldTriggerGroupGreeting) {
      triggerReason = "multiple_npcs_present";
    }

    return {
      shouldTriggerGroupGreeting,
      shouldShowCompetitiveDialogue,
      triggerReason,
    };
  }, [groupState, state.currentRoomId]);
}

// Utility to get appropriate console component props
export function getConsoleProps(npc: NPC | null): {
  useEnhancedConsole: boolean;
  isGroupConversation: boolean;
  npcs: NPC[];
  activeNpcId?: string;
} {
  const groupState = useGroupConversation();

  if (!npc) {
    return {
      useEnhancedConsole: false,
      isGroupConversation: false,
      npcs: [],
    };
  }

  // Use enhanced console for group conversations or competitive scenarios
  const useEnhancedConsole =
    groupState.hasGroupConversation || GROUP_CONVERSATION_NPCS.includes(npc.id);

  return {
    useEnhancedConsole,
    isGroupConversation: groupState.hasGroupConversation,
    npcs: groupState.hasGroupConversation ? groupState.groupNpcs : [npc],
    activeNpcId: groupState.primaryNpcId || npc.id,
  };
}

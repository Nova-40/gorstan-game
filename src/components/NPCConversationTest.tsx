// src/components/NPCConversationTest.tsx
// Quick test component for Inter-NPC Conversations
// Can be temporarily added to test the system
// Gorstan Game Beta 1

import React, { useEffect } from 'react';
import { useGameState } from '../state/gameState';
import { scriptedConversations } from '../npc/triggers';

interface NPCConversationTestProps {
  enabled?: boolean;
}

const NPCConversationTest: React.FC<NPCConversationTestProps> = ({ enabled = false }) => {
  const { state, dispatch } = useGameState();
  const currentRoomId = state.currentRoomId || 'controlnexus';

  useEffect(() => {
    if (!enabled) return;

    // Test scripted conversations when component mounts
    const timer = setTimeout(() => {
      scriptedConversations(state, dispatch, currentRoomId);
    }, 3000); // Wait 3 seconds after room load

    return () => clearTimeout(timer);
  }, [enabled, state, dispatch, currentRoomId]);

  if (!enabled) return null;

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 rounded p-2 text-sm z-50">
      <div className="text-yellow-800">
        🧪 NPC Conversation Test Active
      </div>
      <div className="text-xs text-yellow-600 mt-1">
        Room: {currentRoomId} | NPCs: {state.npcsInRoom?.length || 0}
      </div>
    </div>
  );
};

export default NPCConversationTest;

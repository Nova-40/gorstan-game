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

// src/components/InterNPCDemo.tsx
// Demonstration component for Inter-NPC Conversations
// Shows examples of how to use the conversation system
// Gorstan Game Beta 1

import React from 'react';
import { useGameState } from '../state/gameState';
import NPCBanterToggle from './NPCBanterToggle';
import { NPCTalk } from '../npc/talk';

const InterNPCDemo: React.FC = () => {
  const { state, dispatch } = useGameState();
  const currentRoomId = state.currentRoomId || 'controlnexus';
  
  const triggerExample = (type: string) => {
    const ctx = { state, dispatch, roomId: currentRoomId };
    
    switch (type) {
      case 'morthos-al-banter':
        NPCTalk.morthosAndAl.morthosStarts("Did you move my trans-spanner again?", ctx);
        break;
        
      case 'al-morthos-banter':
        NPCTalk.morthosAndAl.alStarts("Correlation does not imply causation, Morthos.", ctx);
        break;
        
      case 'ayla-guidance':
        NPCTalk.aylaToMorthos("The player seems stuck. Suggest you hint at the pedestal pattern.", ctx);
        break;
        
      case 'hidden-coordination':
        NPCTalk.hiddenHint('ayla', 'morthos', 'Player acquired remote but hasn\'t tried a chair.', ctx);
        break;
        
      case 'generic-conversation':
        NPCTalk.any('morthos', 'al', 'The control matrix seems unstable today.', ctx);
        break;
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-600 max-w-2xl">
      <h3 className="text-lg font-semibold text-white mb-4">
        🤖 Inter-NPC Conversation Demo
      </h3>
      
      <div className="mb-4">
        <NPCBanterToggle />
      </div>
      
      <div className="space-y-2 mb-4">
        <p className="text-gray-300 text-sm mb-3">
          Click buttons below to trigger example NPC conversations:
        </p>
        
        <button
          onClick={() => triggerExample('morthos-al-banter')}
          className="block w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
        >
          🔧 Morthos → Al: Tool Banter
        </button>
        
        <button
          onClick={() => triggerExample('al-morthos-banter')}
          className="block w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
        >
          📊 Al → Morthos: Logic Response
        </button>
        
        <button
          onClick={() => triggerExample('ayla-guidance')}
          className="block w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
        >
          🎭 Ayla → Morthos: Player Guidance
        </button>
        
        <button
          onClick={() => triggerExample('hidden-coordination')}
          className="block w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
        >
          🤫 Hidden: Ayla → Morthos Coordination
        </button>
        
        <button
          onClick={() => triggerExample('generic-conversation')}
          className="block w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
        >
          ⚡ Generic: Morthos → Al Technical
        </button>
      </div>
      
      <div className="text-xs text-gray-400 space-y-1">
        <p>💡 <strong>How it works:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>NPCs use enhanced dialogue system with memory</li>
          <li>Conversations respect co-location rules (except Ayla)</li>
          <li>Cooldowns prevent spam (60-90 seconds)</li>
          <li>Hidden conversations coordinate hints without player seeing</li>
          <li>Toggle "NPC Chatter" to show/hide conversations</li>
        </ul>
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>Current Room: <span className="text-cyan-400">{currentRoomId}</span></p>
        <p>NPCs Present: {state.npcsInRoom?.length || 0}</p>
        <p>Overhear Setting: {state.overhearNPCBanter ? '✅ On' : '❌ Off'}</p>
      </div>
    </div>
  );
};

export default InterNPCDemo;

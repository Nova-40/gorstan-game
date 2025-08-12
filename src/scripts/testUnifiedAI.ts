// Unified AI Integration Test
// Quick validation of the AI systems working together

import { unifiedAI } from '../services/unifiedAI';
import { aiMiniquestService } from '../services/aiMiniquestService';
import { aylaHints } from '../services/aylaHintSystem';
import MiniquestController from '../engine/miniquestController';
import type { LocalGameState } from '../state/gameState';

// Mock game state for testing unified AI
const mockGameState: LocalGameState = {
  stage: 'playing',
  transition: null,
  currentRoomId: 'gorstanhub',
  player: {
    id: 'test-player',
    name: 'TestPlayer',
    health: 100,
    score: 200,
    inventory: ['map', 'key'],
    flags: {
      'talked_to_dominic': true,
      'examined_statue': true,
      'miniquest_001_completed': true
    }
  },
  history: [],
  roomMap: {},
  flags: {
    'talked_to_dominic': true,
    'examined_statue': true
  },
  npcsInRoom: [],
  roomVisitCount: { 'gorstanhub': 8 },
  gameTime: {
    day: 1,
    hour: 15,
    minute: 30,
    startTime: Date.now() - 900000,
    currentTime: Date.now(),
    timeScale: 1
  },
  settings: {
    soundEnabled: true,
    fullscreen: false,
    cheatMode: false,
    difficulty: 'normal',
    autoSave: true,
    autoSaveInterval: 300,
    musicEnabled: true,
    animationsEnabled: true,
    textSpeed: 1,
    fontSize: 'medium',
    theme: 'default',
    debugMode: false
  },
  metadata: {
    resetCount: 0,
    version: '1.0.0',
    lastSaved: null,
    playTime: 900,
    achievements: [],
    codexEntries: {}
  },
  messages: [],
  inventory: ['map', 'key'],
  conversations: {},
  overhearNPCBanter: false,
  visitedRooms: ['gorstanhub', 'gorstanvillage']
};

const mockRoom = {
  id: 'gorstanhub',
  title: 'Gorstan Hub',
  description: 'The central hub of Gorstan, a bustling area with many opportunities.',
  exits: { north: 'gorstanvillage', south: 'market' },
  items: [],
  npcs: ['dominic'],
  zone: 'gorstan'
};

export async function testUnifiedAI() {
  console.log('🧪 Testing Unified AI Integration...');
  
  try {
    // Test 1: AI System Status
    console.log('📊 1. Checking AI System Status...');
    const aiStats = unifiedAI.getAIStats();
    console.log('Unified AI Stats:', aiStats);
    
    // Test 2: Miniquest AI Integration
    console.log('🎯 2. Testing Miniquest AI Integration...');
    const miniquestController = MiniquestController.getInstance();
    miniquestController.setAIEnabled(true);
    
    const miniquestStatus = miniquestController.getAIStatus();
    console.log('Miniquest AI Status:', miniquestStatus);
    
    // Test 3: Cross-system guidance
    console.log('🤝 3. Testing Cross-system Guidance...');
    const unifiedContext = {
      gameState: mockGameState,
      currentRoom: mockRoom,
      recentCommands: ['look around', 'examine statue', 'talk dominic', 'help'],
      timeInRoom: 120000, // 2 minutes
      failedAttempts: ['go west', 'use key']
    };
    
    const guidance = await unifiedAI.getUnifiedGuidance(unifiedContext);
    if (guidance) {
      console.log('✅ Unified Guidance Generated:', {
        type: guidance.type,
        priority: guidance.priority,
        source: guidance.source,
        content: guidance.content.substring(0, 100) + '...'
      });
    } else {
      console.log('ℹ️ No guidance generated (expected for cooldown periods)');
    }
    
    // Test 4: AI Configuration
    console.log('⚙️ 4. Testing AI Configuration...');
    unifiedAI.setGuidanceSensitivity('high');
    unifiedAI.setAIEnabled(true);
    
    // Test 5: Dynamic Content
    console.log('✨ 5. Testing Dynamic Content...');
    unifiedAI.addDynamicContent('gorstanhub', {
      type: 'ambient_event',
      content: 'A gentle breeze stirs the leaves overhead.',
      triggers: ['look', 'examine'],
      conditions: (gameState) => gameState.currentRoomId === 'gorstanhub',
      cooldown: 60000
    });
    
    console.log('✅ Unified AI Integration Test Complete!');
    
    return {
      success: true,
      aiStats,
      miniquestStatus,
      guidanceGenerated: !!guidance
    };
    
  } catch (error) {
    console.error('❌ Unified AI Integration Test Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Browser console integration
if (typeof window !== 'undefined') {
  (window as any).testUnifiedAI = testUnifiedAI;
}

export default testUnifiedAI;

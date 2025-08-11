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
// Renders room descriptions and image logic.

import { NPC } from '../types/NPCTypes';

import { Room } from '../types/Room';









const glitchinguniverse: Room = {
  id: 'glitchinguniverse',
  zone: 'glitchZone',
  title: 'Glitching Universe',
  description: [
    'You are adrift in a chaotic maelstrom of data and fractured light. The universe here is tearing itself apart—fragments of other realities flicker in and out of existence, sometimes overlapping, sometimes colliding.',
    'Gravity is inconsistent, and the very concept of "up" or "down" seems to change with every step. Glitches ripple through the air, distorting your vision and making it difficult to trust your senses.',
    'Occasionally, you glimpse echoes of familiar places—rooms, faces, memories—before they dissolve into static. The only constant is the overwhelming sense that reality is on the verge of collapse.',
    'A swirling vortex pulses at the center of this realm, drawing in debris and stray code from broken worlds. It might be your only way out, but it radiates instability and danger.',
  ],
  image: 'glitchZone_glitchinguniverse.png',
  ambientAudio: 'glitch_maelstrom.mp3',

  consoleIntro: [
    '>> WARNING: GLITCH ZONE CORE BREACH',
    '>> Reality integrity: 2% and falling',
    '>> Quantum anchors: UNSTABLE',
    '>> Error: MULTIPLE REALITIES OVERLAPPING',
    '>> Navigation: EXTREMELY HAZARDOUS',
    '>> Recommendation: Seek stable exit immediately',
  ],

  exits: {
    south: 'glitchrealmhub',
    north: 'datavoid',
    east: 'issuesdetected',
    west: 'failure',
    // Hidden exit - only accessible via special interaction
    secret: 'ravenchamber'
  },

  items: [
    'fragmented_memory',
    'glitch_crystal',
    'unstable_code_shard',
    'echo_of_home',
  ],

  interactables: {
    'vortex': {
      description: 'A swirling vortex of corrupted data and broken reality. It pulses with dangerous energy, but might be a way out.',
      actions: ['examine', 'approach', 'enter', 'throw_item'],
      requires: [],
    },
    'glitch_field': {
      description: 'A shimmering patch of air where reality seems especially thin. Objects and sounds distort unpredictably here.',
      actions: ['examine', 'touch', 'analyze'],
      requires: [],
    },
    'echoes': {
      description: 'Flickering images of people and places from other realities. They seem almost real, but vanish if you get too close.',
      actions: ['observe', 'listen', 'interact'],
      requires: [],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['triggerGlitchEffects', 'showCoreWarning'],
    onExit: ['recordEscapeAttempt'],
    onInteract: {
      vortex: ['attemptEscape', 'riskCorruption'],
      glitch_field: ['experienceDistortion'],
      echoes: ['revealMemory', 'riskDisorientation'],
    },
  },

  flags: {
    vortexEntered: false,
    glitchSpecterSeen: false,
    memoryFragmentCollected: false,
    realityDistorted: false,
  },

  quests: {
    main: 'Escape the Glitching Universe',
    optional: [
      'Collect a Fragmented Memory',
      'Speak with the Glitch Specter',
      'Analyze the Glitch Field',
      'Resist the Echoes',
    ],
  },

  environmental: {
    lighting: 'erratic_strobing',
    temperature: 'fluctuating',
    airQuality: 'charged_with_static',
    soundscape: [
      'digital_static',
      'fragmented_voices',
      'glitch_pulses',
      'echoing_alarms',
    ],
    hazards: ['reality_instability', 'memory_loss', 'code_corruption'],
  },

  security: {
    level: 'none',
    accessRequirements: [],
    alarmTriggers: ['attempt_vortex_entry'],
    surveillanceActive: false,
  },

  metadata: {
    created: '2025-07-10',
    lastModified: '2025-07-10',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'extreme',
    estimatedPlayTime: '10-20 minutes',
    keyFeatures: [
      'Reality instability',
      'Glitch-based hazards',
      'NPC trapped between worlds',
      'Multiple exits and dangers',
    ],
  },

  secrets: {
    hidden_exit: {
      description: 'A hidden, stable exit that only appears if you resist the echoes and analyze the glitch field.',
      requirements: ['analyze glitch_field', 'resist echoes'],
      rewards: ['safe_exit', 'bonus_lore'],
    },
    specter_origin: {
      description: 'The true identity of the Glitch Specter, revealed through fragmented memories.',
      requirements: ['collect fragmented_memory', 'speak with glitch_specter'],
      rewards: ['specter_backstory', 'unique_item'],
    },
  },

  customActions: {
    'stabilize_reality': {
      description: 'Attempt to stabilize a small area of the glitching universe.',
      requirements: ['glitch_crystal', 'unstable_code_shard'],
      effects: ['temporary_safety', 'reduce_hazards'],
    },
    'merge_echoes': {
      description: 'Try to merge two echoes to reveal a hidden truth.',
      requirements: ['observe echoes', 'interact echoes'],
      effects: ['reveal_hidden_memory', 'risk_backlash'],
    },
  },

  // Special access to R.A.V.E.N. Chamber
  customCommands: {
    'declassify': {
      description: 'Attempt to access classified systems',
      handler: (gameState: any) => {
        return {
          messages: [{
            id: `declassify-access-${Date.now()}`,
            text: '🔓 A hidden passage shimmers into existence. You sense classified data beyond...',
            type: 'system',
            timestamp: Date.now()
          }],
          updates: { 
            flags: { ravenChamberAccessible: true } 
          }
        };
      }
    },
    'walk backwards': {
      description: 'Walk backwards into a glitch wall',
      handler: (gameState: any) => {
        const messages = [{
          id: `walk-backwards-${Date.now()}`,
          text: '🌀 You step backwards into what appears to be solid static. The world distorts around you...',
          type: 'narrative',
          timestamp: Date.now()
        }];

        // 50% chance of accessing the chamber
        if (Math.random() > 0.5) {
          messages.push({
            id: `secret-passage-${Date.now()}`,
            text: '🚪 The static parts like a curtain, revealing a narrow passage to a hidden chamber.',
            type: 'system',
            timestamp: Date.now()
          });
          return {
            messages,
            updates: { 
              currentRoomId: 'ravenchamber',
              flags: { foundSecretPassage: true }
            }
          };
        } else {
          messages.push({
            id: `glitch-bounce-${Date.now()}`,
            text: '⚡ The glitch wall repels you with a shower of sparks. Try again?',
            type: 'error',
            timestamp: Date.now()
          });
          return { messages };
        }
      }
    },
    'interact glitch wall': {
      description: 'Interact with the glitching walls',
      handler: (gameState: any) => {
        const interactionCount = (gameState.flags?.glitchWallInteractions || 0) + 1;
        
        if (interactionCount >= 3) {
          return {
            messages: [{
              id: `wall-access-${Date.now()}`,
              text: '🔥 The wall flickers and reveals a passage! You see a chamber beyond filled with ancient consoles.',
              type: 'system',
              timestamp: Date.now()
            }],
            updates: { 
              currentRoomId: 'ravenchamber',
              flags: { 
                glitchWallInteractions: 0,
                persistentGlitchAccess: true 
              }
            }
          };
        } else {
          return {
            messages: [{
              id: `wall-interaction-${Date.now()}`,
              text: `📡 The wall flickers briefly... (${interactionCount}/3 interactions)`,
              type: 'system',
              timestamp: Date.now()
            }],
            updates: { 
              flags: { glitchWallInteractions: interactionCount }
            }
          };
        }
      }
    },
    'seek classified data': {
      description: 'Search for hidden classified information',
      handler: (gameState: any) => {
        return {
          messages: [{
            id: `secret-access-${Date.now()}`,
            text: '🔍 You sense a hidden pathway opening in the digital static...',
            type: 'system',
            timestamp: Date.now()
          }],
          updates: { 
            flags: { secretPathRevealed: true },
            rooms: { 
              current: 'glitchZone_ravenchamber',
              previous: 'glitchZone_glitchinguniverse'
            }
          }
        };
      }
    },
    'follow data trail': {
      description: 'Follow traces of classified data',
      handler: (gameState: any) => {
        return {
          messages: [{
            id: `data-trail-${Date.now()}`,
            text: '📡 Data fragments lead you through a concealed passage...',
            type: 'system',
            timestamp: Date.now()
          }],
          updates: { 
            flags: { secretPathRevealed: true },
            rooms: { 
              current: 'glitchZone_ravenchamber',
              previous: 'glitchZone_glitchinguniverse'
            }
          }
        };
      }
    },
    'access restricted archives': {
      description: 'Attempt to access restricted system archives',
      handler: (gameState: any) => {
        return {
          messages: [{
            id: `archive-access-${Date.now()}`,
            text: '🔐 Security protocols lead to an encrypted chamber...',
            type: 'system',
            timestamp: Date.now()
          }],
          updates: { 
            flags: { secretPathRevealed: true },
            rooms: { 
              current: 'glitchZone_ravenchamber',
              previous: 'glitchZone_glitchinguniverse'
            }
          }
        };
      }
    }
  }
};

export default glitchinguniverse;



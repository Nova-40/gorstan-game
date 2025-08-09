// src/rooms/glitchZone_datavoid.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { NPC } from '../types/NPCTypes';

import { Room } from '../types/Room';









const datavoid: Room = {
  id: 'datavoid',
  zone: 'glitchZone',
  title: 'The Data Void',
  description: [
    'You find yourself in a void of pure data, where streams of binary code flow like rivers and fragments of corrupted files drift aimlessly.',
    'The air hums with the sound of processing power, and the ground beneath your feet is a shifting mosaic of broken algorithms.',
    'Occasionally, you catch glimpses of familiar objects or faces, distorted and fragmented as if pulled from the depths of a failing hard drive.',
    'This place feels unstable, as if it could collapse into nothingness at any moment, taking you with it.',
  ],
  image: 'glitchZone_datavoid.png',
  ambientAudio: 'data_void_hum.mp3',

  consoleIntro: [
    '>> DATA VOID - CORRUPTED DIMENSION - STABILITY CRITICAL',
    '>> Location: GLITCH ZONE - UNSTABLE REGION',
    '>> Data streams: ACTIVE - Binary flow detected',
    '>> Corruption level: EXTREME - Proceed with caution',
    '>> Exit protocols: UNRELIABLE - Emergency extraction recommended',
    '>> WARNING: Interaction with corrupted entities may result in data loss',
  ],

  exits: {
    north: 'glitchinguniverse',
    south: 'issuesdetected',
    east: 'moreissues',
    west: 'failure',
  },

  items: [
    'fragmented_code',
    'corrupted_file',
    'binary_shard',
    'data_crystal',
  ],

  traps: [
    {
      id: 'void_collapse',
      type: 'damage',
      severity: 'major', // Reduced from 'fatal'
      description: 'Reality fragments around you as the data void destabilizes! Digital chaos tears at your existence!',
      trigger: 'enter',
      effect: {
        damage: 25, // Reduced from 80 to 25 - still significant but not instant death
        flagsSet: ['void_survivor']
      },
      triggered: false,
      disarmable: true, // Changed to true - players should have some agency
      hidden: false, // Changed to false - give players a fair warning
    }
  ],

  interactables: {
    'binary_river': {
      description: 'A flowing stream of binary code, shimmering with unstable energy.',
      actions: ['examine', 'touch', 'decode'],
      requires: [],
    },
    'corrupted_fragments': {
      description: 'Fragments of corrupted files drifting aimlessly in the void.',
      actions: ['examine', 'collect', 'analyze'],
      requires: [],
    },
    'unstable_ground': {
      description: 'A shifting mosaic of broken algorithms beneath your feet.',
      actions: ['examine', 'stabilize', 'avoid'],
      requires: [],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['triggerDataCorruption', 'showVoidWarning'],
    onExit: ['recordDataLoss'],
    onInteract: {
      binary_river: ['decodeStream', 'riskCorruption'],
      corrupted_fragments: ['analyzeFragment', 'collectData'],
      unstable_ground: ['attemptStabilize', 'riskCollapse'],
    },
  },

  flags: {
    dataCorruptionTriggered: false,
    dataWraithSeen: false,
    codeFragmentCollected: false,
    groundStabilized: false,
  },

  quests: {
    main: 'Escape the Data Void',
    optional: [
      'Collect a Fragmented Code',
      'Help the Data Wraith',
      'Decode the Binary River',
      'Stabilize the Ground',
    ],
  },

  environmental: {
    lighting: 'flickering_code_light',
    temperature: 'cold_and_artificial',
    airQuality: 'static_and_dry',
    soundscape: [
      'data_streams',
      'corrupted_beeps',
      'digital_whispers',
      'glitchy_hum',
    ],
    hazards: ['data_corruption', 'unstable_ground', 'memory_loss'],
  },

  security: {
    level: 'none',
    accessRequirements: [],
    alarmTriggers: ['attempt_decode_binary_river'],
    surveillanceActive: false,
  },

  metadata: {
    created: '2025-07-10',
    lastModified: '2025-07-10',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'hard',
    estimatedPlayTime: '10-15 minutes',
    keyFeatures: [
      'Data corruption hazards',
      'NPC with memory quest',
      'Interactable binary river',
      'Unstable ground mechanics',
    ],
  },

  secrets: {
    hidden_backup: {
      description: 'A hidden backup sector containing lost data.',
      requirements: ['analyze corrupted_fragments', 'decode binary_river'],
      rewards: ['restore_memory', 'unlock_safe_exit'],
    },
    wraith_origin: {
      description: 'The true identity of the Data Wraith, revealed through collected code fragments.',
      requirements: ['collect fragmented_code', 'help data_wraith'],
      rewards: ['wraith_backstory', 'unique_item'],
    },
  },

  customActions: {
    'restore_data': {
      description: 'Attempt to restore a corrupted file using collected data.',
      requirements: ['corrupted_file', 'data_crystal'],
      effects: ['recover_information', 'reduce_corruption'],
    },
    'stabilize_void': {
      description: 'Try to stabilize the void using binary shards.',
      requirements: ['binary_shard'],
      effects: ['temporary_stability', 'reduce_hazards'],
    },
  },
};

export default datavoid;



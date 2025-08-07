// src/rooms/londonZone_trentpark.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { Room } from '../types/Room';









const trentpark: Room = {
  id: 'trentpark',
  zone: 'londonZone',
  title: 'Trent Park',
  description: [
    'You find yourself in a quiet section of Trent Park, where ancient trees create natural archways overhead and dappled sunlight filters through the canopy. The peaceful atmosphere of this London green space feels almost sacred.',
    'Most of the park appears normal - joggers pass by in the distance, dog walkers follow familiar paths, and the sounds of suburban life drift softly through the air. But here, in this particular clearing, something feels different.',
    'In the center of a small grove stands a single wooden chair, weathered but sturdy, placed with deliberate intention. Around its base, carved into the earth itself, are symbols and runes that seem to pulse with an otherworldly energy.',
    'The sensation of being watched is almost overwhelming here. Eyes seem to track your every movement from the shadows between the trees, though you can never quite spot the watchers themselves.',
  ],
  image: 'londonZone_trentpark.png',
  ambientAudio: 'park_ambience_with_mystery.mp3',

  consoleIntro: [
    '>> TRENT PARK - NORTH LONDON GREEN SPACE',
    '>> Location status: PUBLIC PARKLAND - Unrestricted access',
    '>> Anomaly detected: RUNIC CHAIR - Unknown origin and purpose',
    '>> Surveillance level: HIGH - Multiple unknown entities observing',
    '>> Safety rating: CAUTION - Dimensional instabilities present',
    '>> Park services: NORMAL - Standard municipal maintenance',
    '>> WARNING: Chair interaction may cause reality displacement',
    '>> Observer entities: NON-HOSTILE - Passive monitoring detected',
    '>> Recommend: Exercise caution around carved symbols',
    '>> Emergency services: Available via standard channels',
  ],

  exits: {
    east: 'stkatherinesdock',
    west: 'dalesapartment',
    south: 'findlaterscornercoffeeshop',
    sit: 'introreset',  
    
    'chair_portal': 'introreset',
  },

  items: [
    'park_map',
    'fallen_leaves',
    'ancient_acorn',
    'runic_rubbing_paper',
    'observer_feather',
    'dimensional_compass',
  ],

  interactables: {
    'runic_chair': {
      description: 'A simple wooden chair that radiates an aura of significance. Carved runes circle its base, their meaning lost to time but their power undeniable.',
      actions: ['examine', 'sit', 'touch_runes', 'study_symbols', 'press'],
      requires: [],
    },
    'carved_runes': {
      description: 'Ancient symbols carved deep into the earth around the chair. They seem to shift and change when you\'re not looking directly at them.',
      actions: ['examine', 'trace_with_finger', 'decipher', 'photograph'],
      requires: [],
    },
    'watching_trees': {
      description: 'The trees around this clearing seem different from the rest of the park. Their shadows move independently and you sense hidden observers.',
      actions: ['examine', 'look_between', 'call_out', 'listen_carefully'],
      requires: [],
    },
    'sacred_grove': {
      description: 'This small clearing feels like a natural temple. The arrangement of trees and the placement of the chair suggest this is no accident.',
      actions: ['examine', 'walk_around', 'sense_energy', 'meditate'],
      requires: [],
    },
    'shadow_movements': {
      description: 'Dark shapes that flit between the trees when you\'re not looking directly. The watchers make their presence known without revealing themselves.',
      actions: ['track_movement', 'try_to_spot', 'acknowledge_presence'],
      requires: [],
    },
    'normal_parkland': {
      description: 'Beyond this mysterious grove, the rest of Trent Park continues its normal daily rhythm of joggers, families, and dog walkers.',
      actions: ['observe', 'return_to_normal', 'appreciate_contrast'],
      requires: [],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['activateWatchers', 'revealeRunicChair', 'heightenAwareness'],
    onExit: ['fadeWatchers', 'recordChoice'],
    onInteract: {
      runic_chair: ['activatePortalSequence', 'showResetWarning', 'prepareTransport'],
      carved_runes: ['revealAncientPower', 'showSymbolMeanings'],
      watching_trees: ['acknowledgeObservers', 'receiveGuidance'],
      shadow_movements: ['establishContact', 'understandPurpose'],
    },
  },

  flags: {
    watchersActive: true,
    chairExamined: false,
    runesStudied: false,
    observersAcknowledged: false,
    portalReady: false,
    resetWarningShown: false,
  },

  quests: {
    main: 'Investigate the Mysterious Chair',
    optional: [
      'Decipher the Ancient Runes',
      'Acknowledge the Hidden Watchers',
      'Understand the Grove\'s Purpose',
      'Decide Whether to Use the Chair',
    ],
  },

  environmental: {
    lighting: 'dappled_sunlight_through_trees',
    temperature: 'mild_london_weather',
    airQuality: 'fresh_park_air',
    soundscape: [
      'distant_park_activities',
      'wind_through_leaves',
      'mysterious_rustling',
      'bird_calls',
      'watchful_silence'
    ],
    hazards: ['dimensional_displacement_risk', 'reality_reset_possibility'],
  },

  security: {
    level: 'low',
    accessRequirements: [],
    alarmTriggers: ['chair_activation', 'runic_disturbance'],
    surveillanceActive: true,
    surveillanceType: 'mystical_observation',
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'moderate',
    estimatedPlayTime: '8-12 minutes',
    keyFeatures: [
      'Mysterious runic chair',
      'Portal to reset room',
      'Hidden observer entities',
      'Ancient carved symbols',
      'Sacred grove atmosphere',
    ],
  },

  secrets: {
    rune_meanings: {
      description: 'The true meaning and power of the ancient symbols around the chair',
      requirements: ['study carved_runes extensively', 'use dimensional_compass'],
      rewards: ['runic_knowledge', 'symbol_interpretation_ability'],
    },
    watcher_purpose: {
      description: 'Why the hidden entities observe this place and what they\'re protecting',
      requirements: ['acknowledge shadow_movements', 'establish contact with watchers'],
      rewards: ['observer_blessing', 'guardian_understanding'],
    },
    chair_origin: {
      description: 'The history and true purpose of the portal chair',
      requirements: ['examine chair thoroughly', 'trace all runes', 'meditate in grove'],
      rewards: ['portal_mastery', 'reset_understanding'],
    },
  },

  customActions: {
    'sit_in_chair': {
      description: 'Sit in the runic chair and activate whatever power it contains',
      requirements: ['examine runic_chair'],
      effects: ['transport_to_reset_room', 'trigger_reality_displacement', 'begin_reset_sequence'],
    },
    'commune_with_watchers': {
      description: 'Attempt to communicate with the hidden observers',
      requirements: ['acknowledge shadow_movements', 'show_respect_to_grove'],
      effects: ['gain_watcher_guidance', 'receive_warnings', 'understand_purpose'],
    },
    'study_complete_rune_circle': {
      description: 'Examine all the runes around the chair to understand their combined meaning',
      requirements: ['trace all carved_runes', 'walk complete circle'],
      effects: ['unlock_runic_knowledge', 'understand_portal_mechanics', 'gain_reset_insight'],
    },
  },
};

export default trentpark;



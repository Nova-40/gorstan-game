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

import { Room } from '../types/Room';









const crossing: Room = {
  id: 'crossing',
  zone: 'introZone',
  title: 'The Infinite Crossing',
  description: [
    'You find yourself in a pristine white chamber that seems to stretch impossibly in all directions. The walls, floor, and ceiling are a seamless, brilliant white that somehow doesn\'t hurt your eyes.',
    'In the center of this endless space sits a single white chair, its simple design both inviting and somehow ominous. The chair appears to be the only fixed point in this reality.',
    'Near the chair, a crystalline control panel shimmers into existence, its surface covered with glowing teleportation symbols. For those carrying navigation devices, an additional ethereal console phases in and out of reality, waiting to interface with dimensional travel tools.',
    'All around you, countless doors rotate and shift in a mesmerizing dance. They appear and disappear, change position and orientation, creating an endless kaleidoscope of possibilities. Each door is unique - some ornate, some simple, some that seem to be made of light itself.',
    'The silence here is absolute, broken only by the whisper of shifting realities as the doors continue their eternal rotation. This place feels like the crossroads of all existence.',
    'Strangely, if you survived a particularly dramatic arrival here, you might find a cup of impossibly intact quantum coffee steaming nearby, and perhaps even notice a familiar apartment door among the rotating possibilities.',
  ],
  image: 'introZone_crossing.png',
  ambientAudio: 'infinite_whispers.mp3',

  consoleIntro: [
    '>> REALITY CROSSING - DIMENSIONAL NEXUS POINT',
    '>> Location status: OUTSIDE NORMAL SPACE-TIME',
    '>> Dimensional coordinates: INFINITE/VARIABLE',
    '>> Portal matrix: ACTIVE - Unlimited destinations available',
    '>> Chair interface: NAVIGATION SYSTEM - Ready for input',
    '>> WARNING: Extended exposure may cause temporal displacement',
    '>> Reality anchor: STABLE - Safe zone established',
    '>> Navigation protocols: ACTIVE - Choose destination carefully',
    '>> Exit options: UNLIMITED - All realities accessible',
    '>> Recommend selecting destination from available stable portals',
  ],

  exits: {
    
    'chair': 'londonhub',  
    'door1': 'controlnexus',
    'door2': 'introreset',
    'door3': 'hiddenlab',
    
    'apartment_door': 'dalesapartment',  
    
  },

  items: [
    'navigation_crystal',
    'reality_compass',
    'dimensional_map_fragment',
    'portal_stabilizer',
    
    'quantum_coffee',
    'dales_apartment_key',
  ],

  interactables: {
    'chair': {
      description: 'A simple white chair that radiates a sense of purpose. Sitting in it would transport you away from this infinite space.',
      actions: ['examine', 'sit', 'touch'],
      requires: [],
    },
    'control_panel': {
      description: 'A sleek crystalline control panel materializes near the chair when you approach. Its surface glows with teleportation symbols and destination codes.',
      actions: ['examine', 'press', 'activate', 'touch'],
      requires: [],
    },
    'navigation_console': {
      description: 'An ethereal console that appears to phase in and out of reality. It responds to devices that can navigate dimensional space.',
      actions: ['examine', 'press', 'use', 'interface'],
      requires: ['remote_control', 'navigation_crystal'],
    },
    'rotating_doors': {
      description: 'Countless doors in constant motion, each one a gateway to a different reality. They shift and change too quickly to focus on any single one.',
      actions: ['examine', 'focus', 'reach_for'],
      requires: [],
    },
    'stable_portal': {
      description: 'A door that remains fixed while others rotate around it. This one seems safe to approach.',
      actions: ['examine', 'enter', 'activate'],
      requires: ['portal_stabilizer'],
    },
    'white_walls': {
      description: 'Seamless white surfaces that seem to extend infinitely in all directions. They feel both solid and ethereal.',
      actions: ['examine', 'touch', 'listen'],
      requires: [],
    },
    'floating_symbols': {
      description: 'Occasionally, glowing symbols appear in the air near certain doors, providing clues about their destinations.',
      actions: ['examine', 'decipher', 'memorize'],
      requires: ['reality_compass'],
    },
    'quantum_coffee': {
      description: 'A steaming cup of quantum coffee that somehow survived the lorry impact. It defies several laws of physics just by existing.',
      actions: ['examine', 'drink', 'smell', 'hold'],
      requires: [],
    },
    'apartment_door': {
      description: 'A familiar-looking door with a brass nameplate reading "Dale & Polly". This door only appears if you possess the apartment key.',
      actions: ['examine', 'enter', 'unlock'],
      requires: ['dales_apartment_key'],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['activateInfiniteSpace', 'startDoorRotation', 'showNavigationOptions'],
    onExit: ['recordDestination', 'stabilizeReality'],
    onInteract: {
      chair: ['activateTransport', 'showDestinationWarning', 'initiateTeleport'],
      rotating_doors: ['showDoorVisions', 'triggerDisorientation', 'revealSymbols'],
      stable_portal: ['checkStability', 'verifyDestination', 'allowEntry'],
    },
  },

  flags: {
    infiniteSpace: true,
    doorsRotating: true,
    chairAvailable: true,
    guideEncountered: false,
    destinationChosen: false,
    realityStable: true,
  },

  quests: {
    main: 'Choose Your Destination',
    optional: [
      'Decipher the Door Symbols',
      'Understand the Chair\'s Purpose',
      'Communicate with the Guardian',
      'Map the Stable Portals',
    ],
  },

  environmental: {
    lighting: 'brilliant_white_without_glare',
    temperature: 'perfectly_neutral',
    airQuality: 'pure_and_breathable',
    soundscape: ['infinite_silence', 'whisper_of_shifting_realities', 'dimensional_harmonics'],
    hazards: ['temporal_displacement_risk', 'reality_disorientation'],
  },

  security: {
    level: 'transcendent',
    accessRequirements: ['dimensional_clearance'],
    alarmTriggers: ['reality_manipulation_attempts'],
    surveillanceActive: false,
    surveillanceType: 'exists_outside_normal_monitoring',
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'moderate',
    estimatedPlayTime: '5-15 minutes',
    keyFeatures: [
      'Infinite white space',
      'Single navigation chair',
      'Rotating door matrix',
      'Multiple destination choices',
      'Reality crossroads theme',
    ],
  },

  secrets: {
    hidden_destination: {
      description: 'A special door that only appears when certain conditions are met',
      requirements: ['decipher all door symbols', 'communicate with guardian'],
      rewards: ['secret_realm_access', 'advanced_navigation_knowledge'],
    },
    chair_origins: {
      description: 'The true purpose and origin of the white chair',
      requirements: ['examine chair thoroughly', 'touch white walls'],
      rewards: ['chair_backstory', 'navigation_mastery'],
    },
    door_pattern: {
      description: 'The underlying pattern governing the door rotations',
      requirements: ['observe doors for extended period', 'use reality_compass'],
      rewards: ['door_prediction_ability', 'stable_portal_creation'],
    },
  },

  customActions: {
    'sit_in_chair': {
      description: 'Sit in the white chair to begin transportation',
      requirements: [],
      effects: ['transport_to_trent_park', 'end_crossing_sequence'],
    },
    'stabilize_door': {
      description: 'Use equipment to stabilize a specific rotating door',
      requirements: ['portal_stabilizer', 'navigation_crystal'],
      effects: ['create_stable_exit', 'access_chosen_destination'],
    },
    'meditate': {
      description: 'Sit quietly and contemplate the infinite possibilities',
      requirements: ['infinite_patience'],
      effects: ['gain_cosmic_insight', 'reveal_hidden_doors'],
    },
  },
};

export default crossing;



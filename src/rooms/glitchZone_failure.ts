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









const failure: Room = {
  id: 'failure',
  zone: 'glitchZone',
  title: 'Failure Node',
  description: [
    'You have entered a zone where the very concept of success has been erased. The environment is bleak and fragmented, with broken code and shattered logic floating in the air.',
    'Every step feels heavy, as if the world itself is weighed down by countless failed attempts and abandoned processes.',
    'Error messages flicker on invisible screens, and the ground is littered with the remnants of corrupted data and lost hopes.',
    'A sense of overwhelming defeat permeates the area, but perhaps, within the ruins, a new path can be forged.',
  ],
  image: 'glitchZone_failure.png',
  ambientAudio: 'failure_static.mp3',

  consoleIntro: [
    '>> FAILURE NODE - SYSTEM CRITICAL',
    '>> All recovery protocols have failed.',
    '>> Error density: MAXIMUM',
    '>> Hope index: NULL',
    '>> Recommendation: Seek alternate routes or attempt system reboot.',
  ],

  exits: {
    north: 'glitchinguniverse',
    south: 'datavoid',
    east: 'issuesdetected',
    west: 'moreissues',
  },

  items: [
    'broken_code_fragment',
    'error_log',
    'null_pointer',
    'lost_packet',
  ],

  interactables: {
    'error_screen': {
      description: 'A floating screen displaying endless streams of error messages.',
      actions: ['examine', 'debug', 'clear'],
      requires: [],
    },
    'corrupted_ground': {
      description: 'The ground is unstable, made up of failed code and broken logic.',
      actions: ['examine', 'stabilize', 'search'],
      requires: [],
    },
    'abandoned_process': {
      description: 'A ghostly remnant of a process that never completed.',
      actions: ['examine', 'restart', 'terminate'],
      requires: [],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['triggerFailureEffects', 'showFailureWarning'],
    onExit: ['recordFailureEscape'],
    onInteract: {
      error_screen: ['analyzeErrors', 'attemptDebug'],
      corrupted_ground: ['searchForHope', 'riskCollapse'],
      abandoned_process: ['attemptRestart', 'riskLoop'],
    },
  },

  flags: {
    errorsAnalyzed: false,
    processRestarted: false,
    hopeFound: false,
    groundStabilized: false,
  },

  quests: {
    main: 'Escape the Failure Node',
    optional: [
      'Analyze the Error Screen',
      'Stabilize the Corrupted Ground',
      'Help the Echo of Failure',
      'Find a Lost Packet',
    ],
  },

  environmental: {
    lighting: 'dim_with_flickering_errors',
    temperature: 'cold_and_unnerving',
    airQuality: 'static_and_heavy',
    soundscape: [
      'error_buzz',
      'fragmented_whispers',
      'glitch_static',
      'distant_crashes',
    ],
    hazards: ['unstable_ground', 'logic_loops', 'hope_drain'],
  },

  security: {
    level: 'none',
    accessRequirements: [],
    alarmTriggers: ['attempt_restart_process'],
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
      'Failure-themed hazards',
      'NPC echo of failure',
      'Debugging and recovery mechanics',
      'Multiple exits',
    ],
  },

  secrets: {
    hidden_reboot: {
      description: 'A hidden system reboot protocol buried in the error logs.',
      requirements: ['analyze error_screen', 'find lost_packet'],
      rewards: ['system_reboot', 'alternate_exit'],
    },
    echo_origin: {
      description: 'The true story of the Echo of Failure, revealed through lost packets.',
      requirements: ['find lost_packet', 'talk to failure_echo'],
      rewards: ['echo_backstory', 'unique_item'],
    },
  },

  customActions: {
    'attempt_reboot': {
      description: 'Try to reboot the system from within the node.',
      requirements: ['error_log', 'broken_code_fragment'],
      effects: ['temporary_stability', 'unlock_exit'],
    },
    'accept_failure': {
      description: 'Embrace the lessons of failure to find a new path.',
      requirements: [],
      effects: ['gain_insight', 'reduce_hazards'],
    },
  },
};

export default failure;



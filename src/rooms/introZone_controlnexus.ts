import { RoomDefinition } from '../types/RoomTypes';



// introZone_controlnexus.ts — rooms/introZone_controlnexus.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: introZone_controlnexus


const controlnexus: RoomDefinition = {
  id: 'controlnexus',
  zone: 'introZone',
  title: 'The Control Nexus',
  description: [
    'You stand in a circular chamber that pulses with dormant energy. The curved walls are lined with darkened screens, their surfaces occasionally flickering with cryptic data streams and static bursts.',
    'Thick cables snake across the polished floor like technological vines, converging at a central console. A single command chair faces this nexus of control, its ergonomic form suggesting long periods of monitoring.',
    'The air carries a faint ozone scent, and you can hear the subtle hum of sleeping systems waiting to be awakened. This place feels like the nerve center of something vast and important.',
  ],
  image: 'introZone_controlnexus.png',
  ambientAudio: 'lowhum.mp3',

  // Enhanced console intro with more narrative depth
  consoleIntro: [
    '>> NEXUS CONTROL SYSTEM - EMERGENCY PROTOCOLS ACTIVE',
    '>> Biometric scan complete... User identity: UNREGISTERED',
    '>> Previous operator status: MISSING - 47 days, 12 hours',
    '>> System status: AUTONOMOUS MODE - Limited functionality',
    '>> WARNING: Multiverse stability index at 23% and declining',
    '>> Dimensional anchor points showing signs of drift',
    '>> PRIORITY ALERT: Immediate operator intervention required',
    '>> Scanning for available command protocols...',
    '>> Basic access granted. Welcome to the Control Nexus.',
    '>> Type HELP for available commands, or STATUS for current readings.',
  ],

  exits: {
    west: 'controlroom',
    sit: 'hiddenlab',  // Sitting in the neural chair transports you to the hidden lab
  },

items: [],
  // Enhanced interactive elements
  interactables: {
    'console': {
      description: 'The main control console glows with a soft blue light, its interface displaying streams of dimensional data.',
      actions: ['activate', 'examine', 'use'],
      requires: [],
    },
    'chair': {
      description: 'A sophisticated command chair with neural interface ports and biometric sensors.',
      actions: ['sit', 'examine'],
      requires: [],
    },
    'screens': {
      description: 'Wall-mounted displays showing various dimensional readings and system diagnostics.',
      actions: ['examine', 'activate'],
      requires: ['strangekey'],
    },
    'cables': {
      description: 'Thick fiber-optic cables pulse with faint light, carrying vast amounts of data.',
      actions: ['examine', 'trace'],
      requires: [],
    },
  },

  // Enhanced NPCs for potential encounters
  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ['showConsoleIntro', 'checkFirstVisit'],
    onExit: ['saveProgress'],
    onInteract: {
      console: ['activateConsole', 'showSystemStatus'],
      chair: ['sitInChair', 'checkNeuralInterface'],
      screens: ['displayDimensionalData'],
    },
  },

  // Enhanced flags for game state tracking
  flags: {
    controlSystemOnline: true,
    firstVisit: true,
    consoleActivated: false,
    chairOccupied: false,
    systemsAnalyzed: false,
    emergencyProtocolsRead: false,
  },

  // Enhanced quest integration
  quests: {
    main: 'Begin Multiverse Investigation',
    optional: [
      'Analyze Control Systems',
      'Read Emergency Protocols',
      'Contact Remaining Operators',
    ],
  },

  // Environmental details for immersion
  environmental: {
    lighting: 'dim_blue_glow',
    temperature: 'cool',
    airQuality: 'sterile_with_ozone',
    soundscape: ['low_electrical_hum', 'occasional_data_chirps', 'distant_machinery'],
    hazards: [],
  },

  // Security and access control
  security: {
    level: 'restricted',
    accessRequirements: [],
    alarmTriggers: ['unauthorized_console_access'],
    surveillanceActive: true,
  },

  // Enhanced metadata with more details
  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-17',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'moderate',
    estimatedPlayTime: '10-15 minutes',
    keyFeatures: [
      'Central control hub',
      'Multiverse monitoring',
      'Interactive console system',
      'Narrative revelation point',
    ],
  },

  // Hidden secrets for exploration
  secrets: {
    hiddenPanel: {
      description: 'A concealed maintenance panel behind the main console',
      requirements: ['examine console thoroughly', 'use strangekey'],
      rewards: ['backup_data_crystal', 'emergency_codes'],
    },
    operatorLogs: {
      description: 'Personal logs from the previous operator',
      requirements: ['activate console', 'sit in chair'],
      rewards: ['backstory_revelation', 'dimensional_map_fragment'],
    },
  },

  // Custom actions specific to this room
  customActions: {
    'scan': {
      description: 'Perform a dimensional scan of the area',
      requirements: ['console_activated'],
      effects: ['reveal_hidden_exits', 'update_dimensional_map'],
    },
    'calibrate': {
      description: 'Calibrate the dimensional stabilizers',
      requirements: ['operator_manual_read', 'chair_occupied'],
      effects: ['improve_stability_index', 'unlock_advanced_controls'],
    },
  },
};

export default controlnexus;

// src/rooms/latticeZone_latticehub.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { Room } from '../types/Room';









const latticehub: Room = {
  id: 'latticehub',
  zone: 'latticeZone',
  title: 'The Lattice Core - Heart of the Multiverse',
  description: [
    'You step into a chamber that defies comprehension - the very core of reality itself. Crystalline structures of impossible geometry stretch in all directions, their surfaces pulsing with the fundamental forces that bind nine universes together.',
    'The architecture is ancient beyond measure, crafted by hands that shaped the cosmos itself. Quantum energy flows through crystalline conduits like liquid light, maintaining the delicate balance that allows multiple realities to coexist.',
    'As you enter, the chamber\'s defenses activate - but something extraordinary happens. The lethal energy barriers flicker and fade, the guardian constructs power down, and the quantum locks disengage with soft chimes of recognition.',
    'A melodic voice echoes through the chamber: "Welcome home, Architect. The Lattice recognizes your essence. The long plan nears completion." The room treats you not as an intruder, but as its rightful inheritor.',
  ],
  image: 'latticehub.png',
  ambientAudio: 'quantum_lattice_core.mp3',

  consoleIntro: [
    '>> LATTICE CORE - MULTIVERSAL NEXUS POINT',
    '>> Status: ARCHITECT DETECTED - All security protocols deactivated',
    '>> Recognition level: HIGHEST - Genetic markers match Original Builders',
    '>> Quantum stability: PERFECT - Nine universes maintained in harmony',
    '>> Magic source: ACTIVE - Quantum manipulation field at maximum',
    '>> Ancient systems: RESPONDING - Millennia of dormancy ending',
    '>> WARNING: Temporal paradox detected - Past and future converging',
    '>> Analysis: Subject appears to be descendant of Architect race',
    '>> Conclusion: The Great Plan was successful - Species continuity achieved',
    '>> All systems now at your command, Architect',
  ],

  exits: {
    north: 'manhattanhub',
    south: 'lattice_maze_entrance',
    east: 'quantum_archives',
    west: 'reality_forge',
  },

  items: [
    'architect_recognition_crystal',
    'quantum_manipulation_primer',
    'lattice_control_interface',
    'multiversal_map',
    'architect_genetic_scanner',
    'reality_anchor_core',
  ],

  interactables: {
    'lattice_core': {
      description: 'The crystalline heart of the multiverse, pulsing with the energy that maintains reality itself. It recognizes you as its creator\'s heir.',
      actions: ['examine', 'commune', 'access_systems', 'understand_purpose'],
      requires: [],
    },
    'quantum_conduits': {
      description: 'Streams of pure quantum energy flowing through crystalline channels, carrying the forces that enable magic across all nine universes.',
      actions: ['examine', 'trace_flow', 'feel_energy', 'understand_magic'],
      requires: [],
    },
    'architect_console': {
      description: 'An ancient control interface that awakens at your approach. Symbols in a long-dead language shift to match your understanding.',
      actions: ['examine', 'interface', 'access_records', 'learn_history'],
      requires: [],
    },
    'security_systems': {
      description: 'Deactivated defensive measures that would have been lethal to anyone else. They recognize your genetic signature as that of their builders.',
      actions: ['examine', 'understand_recognition', 'access_logs', 'review_security'],
      requires: [],
    },
    'temporal_resonance_chamber': {
      description: 'A space where time flows differently, allowing glimpses of the past and future. Here, the Great Plan\'s scope becomes clear.',
      actions: ['examine', 'enter', 'view_timeline', 'understand_plan'],
      requires: [],
    },
    'genetic_archive': {
      description: 'Ancient storage containing the genetic templates of the Architect race. Your DNA matches patterns stored here millennia ago.',
      actions: ['examine', 'scan_self', 'access_heritage', 'confirm_identity'],
      requires: [],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['recognizeArchitect', 'deactivateDefenses', 'awakenlatticeAI', 'revealTruth'],
    onExit: ['recordArchitectVisit', 'maintainRecognition'],
    onInteract: {
      lattice_core: ['establishConnection', 'revealPurpose', 'grantAccess'],
      architect_console: ['activateInterface', 'translateLanguage', 'showHistory'],
      genetic_archive: ['confirmHeritage', 'revealLineage', 'validateIdentity'],
      temporal_resonance_chamber: ['showGreatPlan', 'revealScope', 'explainPurpose'],
    },
  },

  flags: {
    architectRecognized: true,
    defensesDeactivated: true,
    latticeAIActive: true,
    heritagConfirmed: false,
    greatPlanRevealed: false,
    quantumMagicUnlocked: false,
    systemsControlGranted: false,
  },

  quests: {
    main: 'Understand Your True Heritage',
    optional: [
      'Commune with the Lattice Core',
      'Access the Architect Console',
      'Confirm Your Genetic Identity',
      'Learn the Scope of the Great Plan',
      'Master Quantum Magic Manipulation',
    ],
  },

  environmental: {
    lighting: 'quantum_crystal_radiance',
    temperature: 'perfectly_regulated',
    airQuality: 'artificially_enhanced',
    soundscape: [
      'quantum_energy_harmonics',
      'crystal_resonance_tones',
      'multiversal_background_hum',
      'ancient_machinery_awakening',
      'temporal_echoes'
    ],
    hazards: [], 
  },

  security: {
    level: 'high',
    accessRequirements: ['architect_genetics', 'quantum_signature_match'],
    alarmTriggers: [], 
    surveillanceActive: true,
    surveillanceType: 'protective_monitoring',
  },

  metadata: {
    created: '2025-07-10',
    lastModified: '2025-07-10',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'hard',
    estimatedPlayTime: '15-25 minutes',
    keyFeatures: [
      'Architect recognition system',
      'Multiverse core mechanics',
      'Ancient AI awakening',
      'Heritage revelation',
      'Quantum magic source',
    ],
  },

  secrets: {
    architect_origin: {
      description: 'The true history of the Architect race and their role in creating the multiverse',
      requirements: ['access genetic_archive', 'commune with lattice_core'],
      rewards: ['complete_heritage_knowledge', 'architect_abilities_unlocked'],
    },
    great_plan_scope: {
      description: 'The full scope of the millennia-long plan to recreate the Architect race',
      requirements: ['enter temporal_resonance_chamber', 'interface with architect_console'],
      rewards: ['cosmic_purpose_understanding', 'multiversal_responsibility_acceptance'],
    },
    quantum_magic_mastery: {
      description: 'Understanding how to manipulate quantum forces as the Architects did',
      requirements: ['commune with lattice_core', 'access quantum_conduits'],
      rewards: ['quantum_magic_abilities', 'reality_manipulation_powers'],
    },
  },

  customActions: {
    'commune_with_lattice': {
      description: 'Establish a direct connection with the multiversal core',
      requirements: ['architect_recognition_complete'],
      effects: ['unlock_quantum_magic', 'gain_multiversal_awareness', 'understand_true_purpose'],
    },
    'access_architect_heritage': {
      description: 'Fully embrace your identity as an Architect descendant',
      requirements: ['genetic_archive_accessed', 'heritage_confirmed'],
      effects: ['gain_architect_abilities', 'unlock_ancient_knowledge', 'accept_cosmic_responsibility'],
    },
    'understand_great_plan': {
      description: 'Comprehend the millennia-long strategy to recreate your race',
      requirements: ['temporal_resonance_chamber_entered', 'great_plan_revealed'],
      effects: ['cosmic_understanding', 'purpose_clarity', 'future_path_illuminated'],
    },
  },
};

export default latticehub;



// src/rooms/introZone_introstart.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { Room } from '../types/Room';


const introstart: Room = {
  id: 'introstart',
  zone: 'introZone',
  title: 'The Aftermath',
  description: [
    'You find yourself standing in what appears to be an ordinary street corner, but something feels fundamentally wrong. The air carries an eerie stillness, as if the world itself is holding its breath.',
    'A coffee cup lies on the ground nearby, steam still rising from its contents despite the unnatural quiet. The liquid inside seems to shimmer with an otherworldly quality.',
    'The shadows here are deeper than they should be, and you can\'t shake the feeling that you\'re being watched. Shapes seem to move at the edge of your vision, but when you turn to look, there\'s nothing there.',
    'This place feels like the echo of something significant - a moment frozen in time where reality itself might have shifted. The very air hums with residual energy from some cosmic event.',
  ],
  image: 'introZone_introreset.png',
  ambientAudio: 'eerie_silence.mp3',

  consoleIntro: [
    '>> REALITY ANCHOR POINT - POST-RESET LOCATION',
    '>> Temporal signature detected: RECENT MULTIVERSE DISRUPTION',
    '>> Location status: STABILIZED - Reality matrix reconstructed',
    '>> Anomalous readings: SHADOW ENTITIES - Non-hostile observation mode',
    '>> Personal effects detected: DIMENSIONAL COFFEE - Safe for consumption',
    '>> WARNING: Recent trauma may cause memory fragmentation',
    '>> Reality coherence: 97% - Within acceptable parameters',
    '>> Recommend: Gather personal effects and choose next destination',
    '>> Exit vectors: Multiple stable pathways available',
    '>> Note: You are no longer in your original timeline',
  ],

  exits: {
    west: 'crossing',
    north: 'trentpark',
    east: 'dalesapartment',
  },

  items: [
    'dimensional_coffee',
    'memory_fragment',
    'reality_shard',
    'temporal_residue',
  ],

  interactables: {
    'coffee_cup': {
      description: 'A steaming cup of coffee lying on the ground. Despite everything, it\'s still warm and seems to pulse with strange energy.',
      actions: ['examine', 'pick_up', 'drink', 'smell'],
      requires: [],
    },
    'shadows': {
      description: 'The shadows here are unnaturally deep and seem to move independently of any light source. You sense ancient eyes watching from within.',
      actions: ['examine', 'approach', 'call_out'],
      requires: [],
    },
    'street_corner': {
      description: 'An ordinary street corner that feels like the center of something extraordinary. Reality feels thin here.',
      actions: ['examine', 'listen', 'feel'],
      requires: [],
    },
    'shimmer_spots': {
      description: 'Certain areas of the ground seem to shimmer slightly, as if reality hasn\'t quite settled back into place.',
      actions: ['examine', 'touch', 'step_on'],
      requires: [],
    },
    'air_distortion': {
      description: 'Subtle distortions in the air hint at the massive forces that recently passed through this space.',
      actions: ['examine', 'wave_hand_through', 'analyze'],
      requires: ['reality_shard'],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['checkResetStatus', 'activateShadowWatchers', 'stabilizeReality'],
    onExit: ['recordPathChoice', 'fadeWatchers'],
    onInteract: {
      coffee_cup: ['analyzeDimensionalProperties', 'triggerMemoryFlash'],
      shadows: ['revealWatchers', 'receiveWhispers'],
      shimmer_spots: ['showRealityFluctuations', 'detectTemporalScars'],
    },
  },

  flags: {
    postReset: true,
    watchersActive: true,
    coffeeAvailable: true,
    memoriesFragmented: true,
    realityStabilized: false,
    shadowContactMade: false,
  },

  quests: {
    main: 'Understand What Happened',
    optional: [
      'Communicate with the Shadow Watchers',
      'Recover the Dimensional Coffee',
      'Explore the Reality Distortions',
      'Choose Your Next Path',
    ],
  },

  environmental: {
    lighting: 'unnaturally_still_daylight',
    temperature: 'neutral_but_unsettling',
    airQuality: 'clear_with_cosmic_undertones',
    soundscape: ['oppressive_silence', 'distant_reality_echoes', 'shadow_whispers'],
    hazards: ['memory_disorientation', 'reality_fluctuations'],
  },

  security: {
    level: 'moderate',
    accessRequirements: [],
    alarmTriggers: ['reality_tampering'],
    surveillanceActive: true,
    surveillanceType: 'interdimensional_observation',
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'moderate',
    estimatedPlayTime: '5-10 minutes',
    keyFeatures: [
      'Post-reset starting point',
      'Dimensional coffee pickup',
      'Shadow watcher encounters',
      'Multiple exit choices',
      'Reality aftermath theme',
    ],
  },

  secrets: {
    lorry_memory: {
      description: 'Fragmented memories of the lorry incident that triggered the reset',
      requirements: ['drink dimensional_coffee', 'examine shimmer_spots'],
      rewards: ['accident_flashback', 'understanding_of_reset'],
    },
    watcher_origins: {
      description: 'The true nature and purpose of the shadow watchers',
      requirements: ['communicate with shadow_watchers', 'examine shadows thoroughly'],
      rewards: ['cosmic_knowledge', 'watcher_blessing'],
    },
    temporal_scar: {
      description: 'Evidence of the exact moment reality was torn and reformed',
      requirements: ['analyze air_distortion', 'touch all shimmer_spots'],
      rewards: ['temporal_insight', 'reset_understanding'],
    },
  },

  customActions: {
    'pick_up_coffee': {
      description: 'Carefully pick up the dimensional coffee from the ground',
      requirements: [],
      effects: ['gain_dimensional_coffee', 'trigger_memory_restoration'],
    },
    'commune_with_shadows': {
      description: 'Attempt to communicate with the watching entities',
      requirements: ['examine shadows', 'call_out to shadows'],
      effects: ['reveal_shadow_watchers', 'gain_cosmic_insight'],
    },
    'piece_together_memories': {
      description: 'Try to understand what happened using the evidence around you',
      requirements: ['examine all shimmer_spots', 'analyze air_distortion'],
      effects: ['restore_partial_memories', 'understand_reset_event'],
    },
  },
};

export default introstart;



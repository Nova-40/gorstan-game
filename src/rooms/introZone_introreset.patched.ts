import { RoomDefinition } from '../types/RoomTypes';

const introreset: RoomDefinition = {
  id: 'introreset',
  zone: 'introZone',
  title: 'The Reset Chamber',
  description: [
    'You stand in a peculiar chamber where the very fabric of reality seems unstable. The walls shimmer with an otherworldly quality, and the dimensions feel subtly wrong - distances appear to shift when you\'re not looking directly at them.',
    'At the center of the room sits an ornate chair that seems to pulse with dimensional energy. Strange symbols carved into its armrests glow faintly with an inner light.',
    'Mounted on the far wall is a large, bright blue button enclosed in a protective transparent case. Whatever you do, do not press it. The psychic paper next to it flickers with warnings that seem oddly personal. It feels as though the button is aware of you. Above it, a sign made of what appears to be psychic paper shifts and changes, always displaying text in whatever language you can read.',
    'Near the chair, an emergency runbag sits half-zipped, apparently left by a previous visitor. It looks like it could increase your carrying capacity.',
    'In one corner, a small dimensional bubble floats impossibly in mid-air, containing what appears to be a fish swimming in its own pocket of water. The fish looks at you with surprising intelligence.',
    'The air itself feels thick with potential, as if this place exists at the intersection of multiple realities. You can sense that choices made here will have far-reaching consequences.',
  ],
  image: 'introZone_resetroom.png',
  ambientAudio: 'dimensional_distortion.mp3',

  consoleIntro: [
    '>> DIMENSIONAL RESET CHAMBER - REALITY ANCHOR POINT',
    '>> WARNING: Unstable dimensional matrix detected',
    '>> Spatial coordinates: FLUCTUATING',
    '>> Reality index: 73% and variable',
    '>> CAUTION: This chamber exists outside normal space-time',
    '>> Emergency protocols active - Multiple exit vectors available',
    '>> Chair status: PORTAL CAPABLE - Destination: Trent Park Reality',
    '>> BLUE BUTTON STATUS: STABLE — DO NOT INTERACT',
    '>> Psychic paper translation matrix: ACTIVE',
    '>> EQUIPMENT DETECTED: Emergency runbag - Capacity enhancement available',
    '>> ANOMALY DETECTED: Dimensional bubble containing living entity',
    '>> Entity designation: Dominic - Fish - Status: Aware',
    '>> Proceed with extreme caution - Actions here affect all timelines',
  ],

  exits: {
    south: 'controlroom',
    north: 'controlnexus',
    up: 'hiddenlab',
    sit: 'trentpark',  // Sitting in the reset room chair returns you to Trent Park
  },

  items: [
    'dimensional_stabilizer',
    'reality_anchor',
    'psychic_paper_fragment',
    'temporal_compass',
    'runbag',
  ],

  interactables: {
    'chair': {
      description: 'An ornate chair carved from what appears to be crystallized time itself. Sitting in it would transport you to Trent Park.',
      actions: ['examine', 'sit', 'touch'],
      requires: [],
    },
    'blue_button': {
      description: 'A large, ominous blue button sealed behind protective glass. Every instinct screams not to touch it.',
      actions: ['examine', 'press', 'break_glass'],
      requires: ['dimensional_stabilizer'],
    },
    'psychic_paper': {
      description: 'A strange sign that adapts its text to be readable by any sentient being. Currently it reads: "Do NOT touch this button."',
      actions: ['examine', 'read', 'touch'],
      requires: [],
    },
    'protective_case': {
      description: 'A transparent protective case surrounding the blue button, sealed with dimensional locks.',
      actions: ['examine', 'break', 'unlock'],
      requires: ['reality_anchor'],
    },
    'dimensional_anomaly': {
      description: 'The air itself seems to ripple and bend here, creating visible distortions in space.',
      actions: ['examine', 'study', 'stabilize'],
      requires: ['temporal_compass'],
    },
    'carved_symbols': {
      description: 'Ancient symbols carved into the chair\'s armrests pulse with otherworldly energy.',
      actions: ['examine', 'trace', 'activate'],
      requires: [],
    },
    'emergency_runbag': {
      description: 'A half-zipped emergency bag containing survival essentials, left by a previous visitor.',
      actions: ['examine', 'take', 'open'],
      requires: [],
    },
    'dimensional_bubble': {
      description: 'A shimmering bubble of water floating impossibly in mid-air, containing a small fish.',
      actions: ['examine', 'take', 'touch'],
      requires: [],
    },
  },

  npcs: [
    {
      id: 'reality_guardian',
      name: 'Guardian of Thresholds',
      description: 'A being that exists between dimensions, watching over critical choice points',
      dialogue: {
        greeting: 'Traveler, you stand at a crossroads of reality itself.',
        help: 'The chair leads to beginning anew. The button... leads to endings.',
        farewell: 'Choose wisely. All timelines depend on your decision.',
      },
      spawnable: true,
      spawnCondition: 'critical_choice_moment',
    },
    {
      id: 'dominic',
      name: 'Dominic',
      description: 'A small fish floating in a dimensional bubble, somehow surviving in this reality-warped space',
      dialogue: {
        greeting: 'Dominic stares at you through the dimensional barrier. "I remember everything, you know."',
        help: '"You killed me once. But I\'m not bitter. Not very."',
        farewell: '"*blub* Another timeline, another chance for disappointment."',
      },
      spawnable: true,
      spawnCondition: 'dimensional_anomaly_active',
    },
  ],

  events: {
    onEnter: ['checkDimensionalStability', 'showResetWarning', 'activatePsychicPaper'],
    onExit: ['recordChoice', 'stabilizeReality'],
    onInteract: {
      chair: ['activatePortal', 'showDestinationWarning', 'prepareTransport'],
      blue_button: ['triggerResetWarning', 'activateFailsafes', 'recordAttempt'],
      psychic_paper: ['displayWarning', 'adaptLanguage', 'showConsequences'],
      protective_case: ['checkAuthorization', 'activateSecurity'],
      dimensional_anomaly: ['analyzeDistortion', 'recordAnomalies'],
      emergency_runbag: ['takeRunbag', 'increaseCapacity', 'showBagContents'],
      dimensional_bubble: ['takeDominic', 'handleFishLogic', 'dimensionalConsequences'],
    },
  },

  flags: {
    dimensionallyUnstable: true,
    chairActivated: false,
    buttonPressed: false,
    psychicPaperRead: false,
    caseOpened: false,
    portalDestinationSet: false,
    realityGuardianSummoned: false,
    runbagTaken: false,
    dominicTaken: false,
    hasRunbag: false,
    dominicAlive: true,
    dimensionalBubbleActive: true,
  },

  quests: {
    main: 'Choose Your Path',
    optional: [
      'Study the Dimensional Anomalies',
      'Decipher the Psychic Paper',
      'Understand the Chair\'s Purpose',
      'Investigate the Blue Button',
    ],
  },

  environmental: {
    lighting: 'shifting_and_unstable',
    temperature: 'varies_by_location',
    airQuality: 'thick_with_dimensional_energy',
    soundscape: [
      'reality_distortion_hum',
      'dimensional_whispers',
      'space_time_crackling'
    ],
    hazards: ['dimensional_instability', 'reality_fluctuations'],
  },

  security: {
    level: 'transcendent',
    accessRequirements: ['dimensional_clearance'],
    alarmTriggers: ['unauthorized_button_access', 'reality_tampering'],
    surveillanceActive: true,
    surveillanceType: 'multidimensional',
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'extreme',
    estimatedPlayTime: '5-30 minutes',
    keyFeatures: [
      'Portal transportation',
      'Reality manipulation',
      'Dimensional instability',
      'Critical choice point',
      'Psychic paper interaction',
    ],
  },

  secrets: {
    button_purpose: {
      description: 'The true purpose of the blue button - a reality reset mechanism',
      requirements: ['examine blue_button thoroughly', 'read psychic_paper', 'study dimensional_anomaly'],
      rewards: ['cosmic_knowledge', 'reality_understanding'],
    },
    chair_destination: {
      description: 'Detailed information about where the chair will transport you',
      requirements: ['sit in chair briefly', 'examine carved_symbols'],
      rewards: ['trent_park_coordinates', 'portal_map'],
    },
    guardian_wisdom: {
      description: 'Ancient knowledge from the Guardian of Thresholds',
      requirements: ['summon reality_guardian', 'ask about consequences'],
      rewards: ['multiverse_secrets', 'timeline_knowledge'],
    },
    runbag_origin: {
      description: 'The story behind the emergency runbag and its previous owner',
      requirements: ['examine emergency_runbag thoroughly', 'check bag contents'],
      rewards: ['survivor_story', 'capacity_mastery'],
    },
    dominic_memories: {
      description: 'Understanding Dominic\'s awareness and cross-timeline memories',
      requirements: ['talk to dominic', 'examine dimensional_bubble', 'show empathy'],
      rewards: ['timeline_wisdom', 'fish_philosophy'],
    },
  },

  customActions: {
    'sit_in_chair': {
      description: 'Sit in the dimensional chair to travel to Trent Park',
      requirements: [],
      effects: ['transport_to_trent_park', 'end_intro_sequence'],
    },
    'press_button': {
      description: 'Press the blue button (EXTREME CAUTION ADVISED)',
      requirements: ['break_protective_case', 'override_safety_locks'],
      effects: ['trigger_reality_reset', 'catastrophic_consequences'],
    },
    'stabilize_reality': {
      description: 'Attempt to stabilize the dimensional anomalies',
      requirements: ['dimensional_stabilizer', 'reality_anchor', 'temporal_compass'],
      effects: ['reduce_instability', 'reveal_hidden_paths'],
    },
    'take_runbag': {
      description: 'Take the emergency runbag to increase your carrying capacity',
      requirements: [],
      effects: ['add_runbag_to_inventory', 'increase_capacity', 'set_hasRunbag_flag'],
    },
    'take_dominic': {
      description: 'Take Dominic the fish from his dimensional bubble',
      requirements: [],
      effects: ['trigger_dominic_choice', 'moral_consequences', 'dimensional_ripple'],
    },
  },
};

export default introreset;

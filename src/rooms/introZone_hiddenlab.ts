import { RoomDefinition } from '../types/RoomTypes';

const hiddenlab: RoomDefinition = {
  id: 'hiddenlab',
  zone: 'introZone',
  title: 'The Hidden Laboratory',
  description: [
    'You descend into a laboratory that feels fundamentally wrong. The air is thick with an oppressive sense of dread, as if the very molecules remember some terrible experiment.',
    'Shattered equipment lies scattered across workbenches, their surfaces still bearing scorch marks from forces that shouldn\'t exist. Empty containment units line the walls, their glass fronts spider-webbed with cracks.',
    'In the center of the room stands a massive apparatus - some kind of reality manipulation device. Its crystalline core is dark now, but you can feel it humming with residual energy.',
    'Most disturbing of all is a large sign made of psychic paper mounted prominently on the wall. The text shifts and wavers, but the message is clear and chilling - it appears to be written in your own handwriting.',
  ],
  image: 'introZone_hiddenlab.png',
  ambientAudio: 'laboratory_dread.mp3',

  consoleIntro: [
    '>> HIDDEN LABORATORY - PROJECT RESET ARCHIVE',
    '>> Reality integrity: PERMANENTLY COMPROMISED',
    '>> Experiment log: FINAL ENTRY - CATASTROPHIC FAILURE',
    '>> Temporal paradox dampeners: OFFLINE - DAMAGE IRREVERSIBLE',
    '>> Multiverse reset attempts: MAXIMUM THRESHOLD EXCEEDED',
    '>> CRITICAL WARNING: Further reset attempts will cause cascade collapse',
    '>> Author signature: {{PLAYER_NAME}}',
  ],

  exits: {
    down: 'controlroom',
    up: 'introreset',
  },

  items: [
    'broken_reality_core',
    'experiment_notes',
    'temporal_paradox_detector',
    'reality_scar_analyzer',
    'failed_reset_log',
  ],

  traps: [
    {
      id: 'reality_feedback',
      type: 'damage',
      severity: 'minor',
      description: 'The broken reality core sparks with unstable energy! Temporal distortions lash out, causing minor reality burns!',
      trigger: 'enter',
      effect: {
        damage: 10,
        flagsSet: ['reality_scarred']
      },
      triggered: false,
      disarmable: true,
      disarmSkill: 'temporal_paradox_detector',
      hidden: false,
    }
  ],

  interactables: {
    'psychic_paper_sign': {
      description: 'A large sign made of psychic paper. The text reads: "RESET LIMIT REACHED - Don\'t, whatever you do, try and reset the multiverse again." The handwriting looks disturbingly familiar - like your own.',
      actions: ['examine', 'read', 'touch'],
      requires: [],
    },
    'reality_apparatus': {
      description: 'A massive, damaged device that once manipulated the fundamental forces of reality. Its crystalline core is cracked and dark.',
      actions: ['examine', 'analyze', 'activate'],
      requires: ['temporal_paradox_detector'],
    },
    'shattered_equipment': {
      description: 'Workbenches covered with the remains of sophisticated instruments, destroyed by forces beyond comprehension.',
      actions: ['examine', 'search', 'analyze'],
      requires: [],
    },
    'containment_units': {
      description: 'Empty glass containers that once held samples of reality itself. The cracks in the glass seem to bend light in impossible ways.',
      actions: ['examine', 'open', 'analyze'],
      requires: ['reality_scar_analyzer'],
    },
    'scorch_marks': {
      description: 'Dark burns on every surface, not from fire but from reality itself being torn and twisted.',
      actions: ['examine', 'analyze', 'measure'],
      requires: [],
    },
    'experimental_logs': {
      description: 'Scattered research notes and data tablets, many partially destroyed or corrupted.',
      actions: ['examine', 'read', 'compile'],
      requires: [],
    },
  },

  npcs: [
    {
      id: 'reality_echo',
      name: 'Echo of the Previous You',
      description: 'A faint, translucent figure that looks exactly like you, but older and more worn',
      dialogue: {
        greeting: 'You... you\'re here again. I tried to warn you with the sign.',
        help: 'The reset button upstairs... I pressed it. Multiple times. Each time made things worse.',
        farewell: 'Don\'t repeat my mistakes. Some things can\'t be undone.',
      },
      spawnable: true,
      spawnCondition: 'psychic_paper_sign_examined',
    },
  ],

  events: {
    onEnter: ['detectRealityDistortion', 'showDreadWarning', 'activateEchoSensors'],
    onExit: ['recordParadoxData', 'stabilizeLocalReality'],
    onInteract: {
      psychic_paper_sign: ['recognizeHandwriting', 'triggerMemoryFlash', 'summonEcho'],
      reality_apparatus: ['analyzeDamage', 'detectResidualEnergy', 'showWarningMessage'],
      containment_units: ['revealEmptyContents', 'detectRealityScars'],
      experimental_logs: ['revealResetHistory', 'showExperimentFailures'],
    },
  },

  flags: {
    realityCompromised: true,
    echoEncountered: false,
    psychicPaperRead: false,
    apparatusAnalyzed: false,
    resetHistoryRevealed: false,
    temporalParadoxDetected: false,
    handwritingRecognized: false,
  },

  quests: {
    main: 'Understand the Failed Experiments',
    optional: [
      'Examine the Reality Apparatus',
      'Read All Experimental Logs',
      'Communicate with the Echo',
      'Analyze the Psychic Paper Message',
    ],
  },

  environmental: {
    lighting: 'dim_with_reality_distortions',
    temperature: 'unnaturally_cold',
    airQuality: 'oppressive_and_heavy',
    soundscape: ['residual_energy_hum', 'reality_tears_crackling', 'echo_whispers', 'temporal_static'],
    hazards: ['reality_distortions', 'temporal_anomalies', 'psychological_dread'],
  },

  security: {
    level: 'quarantined',
    accessRequirements: ['temporal_clearance'],
    alarmTriggers: ['attempt_to_reactivate_apparatus', 'temporal_paradox_creation'],
    surveillanceActive: false,
    surveillanceType: 'destroyed_by_experiments',
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'disturbing',
    estimatedPlayTime: '10-15 minutes',
    keyFeatures: [
      'Temporal paradox revelation',
      'Self-written warning message',
      'Failed reality experiments',
      'Echo of previous timeline',
      'Psychological horror elements',
    ],
  },

  secrets: {
    reset_attempts_log: {
      description: 'A hidden log detailing multiple failed attempts to reset reality',
      requirements: ['examine experimental_logs thoroughly', 'analyze reality_apparatus'],
      rewards: ['reset_count_revelation', 'timeline_branching_data'],
    },
    personal_message: {
      description: 'A more detailed personal message hidden within the psychic paper',
      requirements: ['read psychic_paper_sign multiple times', 'encounter reality_echo'],
      rewards: ['full_warning_text', 'temporal_coordinates'],
    },
    apparatus_blueprints: {
      description: 'Technical specifications for the reality manipulation device',
      requirements: ['search shattered_equipment', 'analyze containment_units'],
      rewards: ['construction_knowledge', 'safety_protocols'],
    },
  },

  customActions: {
    'attempt_repair': {
      description: 'Try to repair the damaged reality apparatus (EXTREMELY DANGEROUS)',
      requirements: ['broken_reality_core', 'experiment_notes', 'ignore_all_warnings'],
      effects: ['catastrophic_failure', 'reality_cascade', 'timeline_destruction'],
    },
    'heed_warning': {
      description: 'Take the psychic paper warning seriously and avoid dangerous actions',
      requirements: ['psychic_paper_sign_read', 'echo_encountered'],
      effects: ['prevent_catastrophe', 'maintain_timeline_stability'],
    },
    'analyze_paradox': {
      description: 'Study the temporal paradox created by the failed experiments',
      requirements: ['temporal_paradox_detector', 'failed_reset_log', 'reality_scar_analyzer'],
      effects: ['understand_consequences', 'gain_temporal_knowledge'],
    },
  },
};

export default hiddenlab;

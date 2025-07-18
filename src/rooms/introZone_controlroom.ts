import { RoomDefinition } from '../types/RoomTypes';

const controlroom: RoomDefinition = {
  id: 'controlroom',
  zone: 'introZone',
  title: 'Primary Control Room',
  description: [
    'You enter a sophisticated control chamber that serves as the operational heart of the facility. Banks of monitoring equipment line the walls, their displays showing real-time data from across the dimensional network.',
    'Multiple workstations are arranged in a semicircle, each equipped with specialized interfaces for different aspects of multiverse monitoring. The room has a distinctly more active feel than the Nexus below.',
    'Emergency lighting casts a red tint over everything, and warning indicators flash intermittently. A large tactical display dominates the far wall, showing a complex web of dimensional pathways.',
    'The air is thick with tension and the acrid smell of overworked electronics. This is clearly where critical decisions are made.',
  ],
  image: 'introZone_controlroom.png',
  ambientAudio: 'control_room_ambience.mp3',

  // Console introduction for this room
  consoleIntro: [
    '>> PRIMARY CONTROL ROOM - TACTICAL OPERATIONS CENTER',
    '>> Security clearance verified... Access: EMERGENCY OVERRIDE',
    '>> Current operational status: CRITICAL ALERT CONDITION',
    '>> Dimensional network stability: DEGRADING',
    '>> Active monitoring stations: 3 of 12 operational',
    '>> WARNING: Cascade failure detected in sectors 7, 11, and 15',
    '>> Emergency protocols recommend immediate evacuation',
    '>> Override detected: Manual operator intervention authorized',
    '>> All tactical systems now available for operator control',
    '>> Recommend immediate status assessment of all connected systems',
  ],

  exits: {
    east: 'controlnexus',
    north: 'introreset',
    down: 'hiddenlab',
  },

  items: [
    'tacticaldisplay_datacard',
    'emergency_override_key',
    'dimensional_scanner',
    'operator_badge',
  ],

  // Room trap - voltage spike from damaged console
  traps: [
    {
      id: 'voltage_spike',
      type: 'damage',
      severity: 'minor',
      description: 'A hidden voltage spike arcs from the console!',
      trigger: 'enter',
      effect: {
        damage: 15,
        flagsSet: ['hasBeenZapped']
      },
      triggered: false,
      disarmable: false,
      hidden: false,
    }
  ],

  // Interactive elements in the control room
  interactables: {
    'tactical_display': {
      description: 'A massive wall-mounted display showing the dimensional network as interconnected nodes and pathways.',
      actions: ['examine', 'activate', 'analyze'],
      requires: [],
    },
    'monitoring_stations': {
      description: 'Advanced workstations with multiple screens and control interfaces for network oversight.',
      actions: ['activate', 'examine', 'operate'],
      requires: ['operator_badge'],
    },
    'emergency_panel': {
      description: 'A red-illuminated emergency control panel with critical system overrides.',
      actions: ['activate', 'examine', 'use'],
      requires: ['emergency_override_key'],
    },
    'communication_array': {
      description: 'A sophisticated communication system for contact with other dimensional stations.',
      actions: ['activate', 'examine', 'broadcast'],
      requires: [],
    },
    'central_console': {
      description: 'The primary control interface with master controls for the entire facility.',
      actions: ['activate', 'examine', 'operate'],
      requires: ['operator_badge'],
    },
    'hidden_hatch': {
      description: 'A concealed floor hatch that leads to the hidden laboratory below.',
      actions: ['examine', 'open', 'use'],
      requires: ['emergency_override_key'],
    },
  },

  // NPCs that might be encountered
  npcs: [
    {
      id: 'emergency_ai',
      name: 'Emergency Response AI',
      description: 'An artificial intelligence system managing crisis protocols',
      dialogue: {
        greeting: 'Operator detected. Current crisis level: MAXIMUM. Immediate action required.',
        help: 'Multiple system failures detected. Recommend priority focus on dimensional anchor stabilization.',
        farewell: 'Good luck, operator. The network\'s survival depends on your actions.',
      },
      spawnable: true,
      spawnCondition: 'emergency_panel_activated',
    },
  ],

  events: {
    onEnter: ['showControlRoomIntro', 'checkEmergencyStatus', 'updateTacticalDisplay'],
    onExit: ['saveOperationalData'],
    onInteract: {
      tactical_display: ['showNetworkStatus', 'analyzeDimensionalDrift'],
      monitoring_stations: ['activateMonitoring', 'displaySystemHealth'],
      emergency_panel: ['activateEmergencyProtocols', 'unlockCriticalSystems'],
      communication_array: ['attemptContact', 'broadcastEmergencySignal'],
      central_console: ['accessMasterControls', 'displayFacilityStatus'],
      hidden_hatch: ['revealHiddenLab', 'openSecretPassage'],
    },
  },

  // Room state flags
  flags: {
    emergencyActive: true,
    tacticalDisplayOnline: true,
    monitoringActive: false,
    communicationsEstablished: false,
    emergencyProtocolsActivated: false,
    hiddenLabRevealed: false,
    masterControlsAccessed: false,
  },

  // Quest integration
  quests: {
    main: 'Assess Facility Status',
    optional: [
      'Establish Communications',
      'Activate All Monitoring Stations',
      'Access Hidden Laboratory',
      'Implement Emergency Protocols',
    ],
  },

  // Environmental characteristics
  environmental: {
    lighting: 'emergency_red_and_blue',
    temperature: 'warm_from_electronics',
    airQuality: 'dry_with_ozone_and_electronics',
    soundscape: ['electronic_humming', 'warning_beeps', 'cooling_fans', 'data_processing_sounds'],
    hazards: ['electrical_hazards_near_damaged_equipment'],
  },

  // Security features
  security: {
    level: 'maximum',
    accessRequirements: ['emergency_override', 'operator_clearance'],
    alarmTriggers: ['unauthorized_access_to_master_controls', 'tampering_with_emergency_systems'],
    surveillanceActive: true,
  },

  // Room metadata
  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'challenging',
    estimatedPlayTime: '15-20 minutes',
    keyFeatures: [
      'Tactical operations center',
      'Multiple interactive stations',
      'Emergency protocol management',
      'Hidden laboratory access',
      'Network status monitoring',
    ],
  },

  // Hidden secrets and discoveries
  secrets: {
    operator_logs: {
      description: 'Personal logs from facility operators during the crisis',
      requirements: ['activate monitoring_stations', 'access central_console'],
      rewards: ['crisis_timeline', 'evacuation_procedures'],
    },
    backup_protocols: {
      description: 'Hidden backup protocols for network restoration',
      requirements: ['activate emergency_panel', 'examine tactical_display'],
      rewards: ['restoration_codes', 'backup_power_access'],
    },
    hidden_communications: {
      description: 'Secret communication channels to other facilities',
      requirements: ['activate communication_array', 'use dimensional_scanner'],
      rewards: ['contact_information', 'emergency_frequencies'],
    },
  },

  // Room-specific custom actions
  customActions: {
    'emergency_lockdown': {
      description: 'Initiate facility-wide emergency lockdown protocols',
      requirements: ['emergency_override_key', 'master_controls_accessed'],
      effects: ['secure_all_exits', 'activate_containment_procedures'],
    },
    'network_diagnostic': {
      description: 'Run comprehensive diagnostic on the dimensional network',
      requirements: ['monitoring_stations_active', 'tactical_display_analyzed'],
      effects: ['reveal_network_status', 'identify_failure_points'],
    },
    'coordinate_evacuation': {
      description: 'Coordinate evacuation procedures for connected facilities',
      requirements: ['communications_established', 'emergency_protocols_activated'],
      effects: ['initiate_evacuation_sequence', 'broadcast_emergency_instructions'],
    },
  },
};

export default controlroom;

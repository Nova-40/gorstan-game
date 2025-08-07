// src/rooms/londonZone_stkatherinesdock.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { Room } from '../types/Room';









const stkatherinesdock: Room = {
  id: 'stkatherinesdock',
  zone: 'londonZone',
  title: 'St Katherine\'s Dock',
  description: [
    'You stand on the historic waterfront of St Katherine\'s Dock, where elegant yachts and narrowboats bob gently in their moorings. The Tower of London looms majestically nearby, and the Thames flows past with its eternal rhythm.',
    'The dock retains its Victorian charm with cobblestone walkways and converted warehouse buildings now housing restaurants and shops. Tourists wander about taking photos, and the atmosphere is pleasantly maritime.',
    'But there, just above the dark water near the eastern edge of the dock, something extraordinary hovers - a shimmering portal that seems to bend reality itself. Through its translucent surface, you can clearly see the unmistakable skyline of New York City.',
    'The portal pulses gently with an otherworldly light, casting dancing reflections on the Thames water below. Despite its obviously supernatural nature, the few people nearby seem oblivious to its presence, walking past as if it simply isn\'t there.',
    'The portal hovers at just the right height - you could step through it carefully, or if you\'re feeling adventurous, take a running jump right through the dimensional gateway.',
  ],
  image: 'londonZone_stkatherinesdock.png',
  ambientAudio: 'dock_ambience_with_portal.mp3',

  consoleIntro: [
    '>> ST KATHERINE\'S DOCK - HISTORIC LONDON WATERFRONT',
    '>> Location status: PUBLIC MARINA - Tourist destination active',
    '>> Portal detected: TRANSPACIFIC GATEWAY - New York City visible',
    '>> Portal stability: EXCELLENT - Safe transit conditions',
    '>> Public awareness: FILTERED - Dimensional camouflage active',
    '>> Maritime traffic: NORMAL - Boats operating normally',
    '>> Security level: LOW - Tourist area protocols',
    '>> WARNING: Unauthorized transdimensional travel detected',
    '>> Portal access: UNRESTRICTED - No clearance required',
    '>> Recommend: Exercise caution when crossing realities',
  ],

  exits: {
    east: 'dalesapartment',
    west: 'trentpark',
    
    'portal': 'centralpark',
    
    'jump': 'centralpark',
  },

  items: [
    'dock_visitor_map',
    'boat_schedule',
    'portal_energy_detector',
    'tourist_camera',
    'thames_water_sample',
    'dimensional_anchor',
  ],

  traps: [
    {
      id: 'portal_feedback',
      type: 'damage',
      severity: 'major',
      description: 'The portal suddenly discharges unstable energy! Dimensional forces tear through the air, causing reality to buckle and bend around you!',
      trigger: 'enter',
      effect: {
        damage: 30,
        flagsSet: ['portal_wounded']
      },
      triggered: false,
      disarmable: true,
      disarmSkill: 'portal_energy_detector',
      hidden: false,
    }
  ],

  interactables: {
    'new_york_portal': {
      description: 'A shimmering gateway hovering just above the Thames water. Through it, you can see Manhattan\'s skyline, yellow cabs, and bustling New York streets.',
      actions: ['examine', 'step_through', 'touch_surface', 'observe_new_york'],
      requires: [],
    },
    'thames_water': {
      description: 'The dark water of the Thames laps against the dock walls. The portal\'s reflection creates mesmerizing patterns on the surface.',
      actions: ['examine', 'look_at_reflection', 'test_temperature'],
      requires: [],
    },
    'moored_boats': {
      description: 'Expensive yachts and charming narrowboats tied up in their slips. Their owners seem completely unaware of the portal.',
      actions: ['examine', 'admire', 'check_for_reactions'],
      requires: [],
    },
    'cobblestone_walkway': {
      description: 'Historic Victorian cobblestones that have witnessed centuries of maritime activity. Now they witness interdimensional travel.',
      actions: ['examine', 'walk_on', 'feel_history'],
      requires: [],
    },
    'oblivious_tourists': {
      description: 'Visitors to the dock who walk past the portal without seeming to notice it. Some kind of perception filter must be at work.',
      actions: ['observe', 'test_awareness', 'try_to_alert'],
      requires: [],
    },
    'tower_of_london_view': {
      description: 'The ancient Tower of London is visible across the water, a stark contrast to the futuristic portal technology.',
      actions: ['examine', 'appreciate_contrast', 'photograph'],
      requires: [],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['activatePortalVisibility', 'assessPublicAwareness', 'stabilizeGateway'],
    onExit: ['recordPortalUsage', 'maintainCamouflage'],
    onInteract: {
      new_york_portal: ['showDestinationPreview', 'prepareForTransit', 'checkStability'],
      oblivious_tourists: ['testPerceptionFilter', 'confirmCamouflage'],
      thames_water: ['analyzePortalReflection', 'detectEnergySignatures'],
    },
  },

  flags: {
    portalVisible: true,
    portalStable: true,
    touristsOblivious: true,
    newYorkViewable: true,
    camouflageActive: true,
    transitReady: false,
  },

  quests: {
    main: 'Investigate the New York Portal',
    optional: [
      'Test the Perception Filter on Tourists',
      'Examine the Portal\'s Stability',
      'Observe New York Through the Gateway',
      'Cross to the Other Side',
      'Try a Dramatic Portal Jump',
    ],
  },

  environmental: {
    lighting: 'london_daylight_with_portal_glow',
    temperature: 'cool_thames_breeze',
    airQuality: 'fresh_river_air_with_dimensional_traces',
    soundscape: [
      'thames_water_lapping',
      'boat_rigging_sounds',
      'distant_city_traffic',
      'portal_energy_humming',
      'tourist_conversations'
    ],
    hazards: ['portal_displacement_risk', 'dimensional_sickness_possibility'],
  },

  security: {
    level: 'low',
    accessRequirements: [],
    alarmTriggers: ['portal_disruption', 'camouflage_failure'],
    surveillanceActive: true,
    surveillanceType: 'interdimensional_monitoring',
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'easy',
    estimatedPlayTime: '6-10 minutes',
    keyFeatures: [
      'Portal to New York City',
      'Historic London dock setting',
      'Perception filter mechanics',
      'Thames waterfront atmosphere',
      'Tourist camouflage system',
    ],
  },

  secrets: {
    portal_mechanics: {
      description: 'How the interdimensional gateway operates and maintains its camouflage',
      requirements: ['examine portal thoroughly', 'test_awareness on tourists'],
      rewards: ['portal_operation_knowledge', 'camouflage_understanding'],
    },
    perception_filter: {
      description: 'The technology that keeps ordinary people from seeing the portal',
      requirements: ['observe oblivious_tourists', 'try_to_alert multiple people'],
      rewards: ['filter_comprehension', 'awareness_immunity'],
    },
    new_york_connection: {
      description: 'Why this particular location connects to New York City',
      requirements: ['step_through portal', 'examine both sides thoroughly'],
      rewards: ['transpacific_understanding', 'location_significance_knowledge'],
    },
  },

  customActions: {
    'step_through_portal': {
      description: 'Cross through the shimmering gateway to New York City',
      requirements: ['examine new_york_portal'],
      effects: ['transport_to_newyork', 'experience_transdimensional_travel', 'arrive_centralpark'],
    },
    'jump': {
      description: 'Leap boldly through the portal to Central Park, New York',
      requirements: [],
      effects: ['dramatic_portal_entry', 'transport_to_newyork', 'arrive_centralpark_with_style'],
    },
    'test_tourist_awareness': {
      description: 'Try to make tourists notice the obvious portal',
      requirements: ['observe oblivious_tourists'],
      effects: ['confirm_perception_filter', 'understand_camouflage', 'realize_selection'],
    },
    'analyze_portal_energy': {
      description: 'Study the energy patterns and stability of the gateway',
      requirements: ['portal_energy_detector', 'examine new_york_portal'],
      effects: ['understand_portal_science', 'detect_energy_signatures', 'assess_safety'],
    },
  },
};

export default stkatherinesdock;



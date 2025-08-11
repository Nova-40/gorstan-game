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









const londonhub: Room = {
  id: 'londonhub',
  zone: 'londonZone',
  title: 'Interdimensional London Hub',
  description: [
    'You stand in what looks almost exactly like Canary Wharf tube station, but something is fundamentally different. The familiar curved walls and industrial lighting are all there, but where the tracks should be, there\'s only smooth, polished floor extending into shadowed archways.',
    'Multiple doorways line the platform walls, each one sliding open with a soft hiss as you approach, revealing glimpses of impossibly varied destinations beyond. Some doors show glimpses of alien skies, others reveal familiar but subtly wrong versions of London streets.',
    'The electronic departure boards flicker constantly, displaying destinations that shouldn\'t exist: "Platform ∞ - All Realities", "Platform Ω - Temporal Nexus", "Platform ? - [DESTINATION UNKNOWN]".',
    'Most remarkably, a working escalator rises upward at the far end of the station. Looking up, you can see it gradually transforms from this interdimensional space into what appears to be the real Canary Wharf station above.',
  ],
  image: 'londonZone_londonhub.png',
  ambientAudio: 'interdimensional_station.mp3',

  consoleIntro: [
    '>> INTERDIMENSIONAL LONDON HUB - TRANSPORT NEXUS ACTIVE',
    '>> Location: CANARY WHARF DIMENSIONAL OVERLAY',
    '>> Transport matrix: OPERATIONAL - Infinite destinations available',
    '>> Platform status: NO RAIL SERVICE - Portal transit only',
    '>> Door sensors: ACTIVE - Proximity activation enabled',
    '>> Escalator link: ESTABLISHED - Connection to baseline reality',
    '>> WARNING: Unauthorized travel may result in temporal displacement',
    '>> Security clearance: VISITOR - Limited access permissions',
    '>> Departure information: CONSTANTLY UPDATING',
    '>> Please stand clear of opening doors to unknown dimensions',
  ],

  exits: {
    up: 'trentpark',  
    
    'platform_1': 'london_prime',
    'platform_2': 'london_mirror',
    'platform_omega': 'temporal_nexus',
    'platform_infinity': 'reality_core',
  },

  items: [
    'oyster_card_dimensional',
    'travel_pass_multiverse',
    'platform_map_fragment',
    'reality_anchor_token',
    'emergency_whistle',
  ],

  interactables: {
    'escalator': {
      description: 'A working escalator that rises toward the real Canary Wharf station above. The transition from interdimensional hub to normal reality is visible as you look up.',
      actions: ['examine', 'ride', 'look_up'],
      requires: [],
    },
    'departure_boards': {
      description: 'Electronic displays that constantly flicker and change, showing impossible destinations across the multiverse.',
      actions: ['examine', 'read', 'focus_on'],
      requires: [],
    },
    'dimensional_doors': {
      description: 'Multiple doorways that open automatically as you approach, each revealing a different reality beyond.',
      actions: ['examine', 'approach', 'peer_through', 'enter'],
      requires: ['travel_pass_multiverse'],
    },
    'platform_edge': {
      description: 'Where the railway tracks should be, there\'s only smooth floor leading to mysterious archways.',
      actions: ['examine', 'look_down', 'step_onto'],
      requires: [],
    },
    'warning_signs': {
      description: 'Familiar London Underground safety signs, but with additional warnings about dimensional travel.',
      actions: ['examine', 'read'],
      requires: [],
    },
    'station_announcements': {
      description: 'The familiar London Underground announcement system, but the messages are distinctly otherworldly.',
      actions: ['listen', 'focus_on'],
      requires: [],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['activateHubSystems', 'showDepartureBoards', 'startAnnouncements'],
    onExit: ['recordDestination', 'deactivateProximityDoors'],
    onInteract: {
      escalator: ['checkRealityTransition', 'activateRealWorldLink'],
      dimensional_doors: ['showDestinationPreviews', 'checkTravelClearance'],
      departure_boards: ['updateDestinations', 'showTravelOptions'],
    },
  },

  flags: {
    hubActive: true,
    escalatorOperational: true,
    doorsResponsive: true,
    announcementsPlaying: true,
    overseerPresent: false,
    realityLinkStable: true,
  },

  quests: {
    main: 'Navigate the Dimensional Hub',
    optional: [
      'Understand the Departure System',
      'Acquire Proper Travel Documentation',
      'Explore Available Destinations',
      'Locate the Reality Anchor',
    ],
  },

  environmental: {
    lighting: 'familiar_underground_fluorescent',
    temperature: 'cool_subterranean',
    airQuality: 'recycled_with_dimensional_traces',
    soundscape: [
      'distant_station_ambience',
      'door_opening_sounds',
      'escalator_humming',
      'dimensional_static',
      'muffled_announcements'
    ],
    hazards: ['dimensional_displacement_risk', 'unauthorized_travel_consequences'],
  },

  security: {
    level: 'moderate',
    accessRequirements: ['dimensional_clearance'],
    alarmTriggers: ['unauthorized_door_access', 'reality_breach_attempts'],
    surveillanceActive: true,
    surveillanceType: 'multidimensional_monitoring',
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'moderate',
    estimatedPlayTime: '8-15 minutes',
    keyFeatures: [
      'Interdimensional travel hub',
      'Canary Wharf station replica',
      'Multiple dimensional doors',
      'Working escalator to reality',
      'Dynamic destination system',
    ],
  },

  secrets: {
    hidden_platform: {
      description: 'A concealed platform accessed through a maintenance door',
      requirements: ['examine warning_signs thoroughly', 'use reality_anchor_token'],
      rewards: ['access_to_platform_zero', 'hub_master_key'],
    },
    escalator_secret: {
      description: 'The true mechanism behind the reality transition on the escalator',
      requirements: ['ride escalator multiple times', 'examine transition point'],
      rewards: ['reality_bridge_understanding', 'transition_control'],
    },
    overseer_knowledge: {
      description: 'Deep knowledge about the hub\'s operation and purpose',
      requirements: ['communicate extensively with hub_overseer'],
      rewards: ['hub_operational_manual', 'dimensional_clearance_upgrade'],
    },
  },

  customActions: {
    'ride_escalator': {
      description: 'Take the escalator up to the real Canary Wharf station',
      requirements: [],
      effects: ['transport_to_trentpark', 'transition_to_baseline_reality'],
    },
    'check_departures': {
      description: 'Study the departure boards for available destinations',
      requirements: [],
      effects: ['reveal_travel_options', 'update_destination_knowledge'],
    },
    'acquire_travel_pass': {
      description: 'Obtain proper documentation for interdimensional travel',
      requirements: ['communicate_with_overseer', 'prove_dimensional_awareness'],
      effects: ['gain_travel_clearance', 'unlock_restricted_destinations'],
    },
  },
};

export default londonhub;



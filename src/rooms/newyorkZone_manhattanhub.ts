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

import { Puzzle } from '../types/GameTypes';

import { Room } from '../types/Room';









const manhattanhub: Room = {
  id: 'manhattanhub',
  zone: 'newyorkZone',
  title: 'Manhattan Hub Station',
  description: [
    'You ascend into what appears to be a familiar New York subway station, but something feels distinctly off. The tile work is slightly different, the platform layout subtly altered, and the air hums with an energy that has nothing to do with trains.',
    'This is clearly the same physical location as a real Manhattan subway station, but shifted dimensionally into something far more significant. Advanced technology seamlessly blends with the familiar underground architecture.',
    'Multiple tunnel entrances lead off in different directions, each marked with destinations that definitely don\'t appear on any MTA map. Digital displays show arrival times for routes to places that shouldn\'t exist.',
    'A security checkpoint stands between you and the main platform area, staffed by the same professional guard you recognize from the warehouse. Albie nods in acknowledgment - but his eyes clearly check for the medallion that grants access to the restricted areas.',
  ],
  image: 'newyorkZone_manhattanhub.png',
  ambientAudio: 'dimensional_subway_ambience.mp3',

  consoleIntro: [
    '>> MANHATTAN HUB STATION - INTERDIMENSIONAL TRANSIT FACILITY',
    '>> Location status: DIMENSIONAL SHIFT - Real station, altered reality',
    '>> Security level: HIGH - Medallion verification required',
    '>> Guard on duty: ALBIE - Authorization checkpoint active',
    '>> Transit routes: MULTIPLE ZONES - Interdimensional destinations available',
    '>> Platform status: RESTRICTED ACCESS - Medallion holders only',
    '>> Technology level: ADVANCED - Quantum transportation systems',
    '>> WARNING: Unauthorized access will result in immediate expulsion',
    '>> Current clearance: MEDALLION REQUIRED - Warehouse puzzle completion needed',
    '>> Recommend: Present medallion to security for platform access',
  ],

  exits: {
    north: 'centralpark',
    
    'east_tunnel': 'liminalhub',
    'west_tunnel': 'crossing',
    'south_tunnel': 'latticehub',
  },

  items: [
    'dimensional_map',
    'station_schedule',
    'quantum_transit_guide',
    'emergency_beacon',
  ],

  interactables: {
    'security_checkpoint': {
      description: 'A sophisticated security station that controls access to the main platform. Advanced scanners and verification systems are built into the familiar subway aesthetic.',
      actions: ['approach', 'present_medallion', 'request_passage'],
      requires: [],
    },
    'albie_security_guard': {
      description: 'The same professional security guard from the warehouse, now manning this crucial dimensional transit hub.',
      actions: ['talk', 'show_medallion', 'request_platform_access'],
      requires: [],
    },
    'dimensional_displays': {
      description: 'Digital boards showing departure times and destinations that include places like "Quantum Library", "Crystal Gardens", and "Temporal Nexus".',
      actions: ['examine', 'read_destinations', 'study_schedules'],
      requires: ['medallion_verified'],
    },
    'platform_access_gate': {
      description: 'A high-tech security gate disguised as a standard subway turnstile. It only responds to proper authorization.',
      actions: ['examine', 'attempt_passage', 'scan_medallion'],
      requires: [],
    },
    'tunnel_entrances': {
      description: 'Multiple tunnel mouths leading to different dimensional zones. Each is clearly marked but access is strictly controlled.',
      actions: ['examine', 'read_signs', 'choose_destination'],
      requires: ['platform_access_granted'],
    },
    'familiar_subway_elements': {
      description: 'Standard NYC subway fixtures - tile work, benches, and signage - but with subtle differences that mark this as a dimensional variant.',
      actions: ['examine', 'compare_to_memory', 'notice_differences'],
      requires: [],
    },
  },

  npcs: [
    
  ],

  events: {
    onEnter: ['checkMedallionStatus', 'activateHubSecurity', 'assessClearanceLevel'],
    onExit: ['recordTransitChoice', 'updateDestinationTracking'],
    onInteract: {
      albie_security_guard: ['verifyMedallion', 'grantOrDenyAccess'],
      security_checkpoint: ['scanForAuthorization', 'processEntry'],
      dimensional_displays: ['showAvailableDestinations', 'highlightOptions'],
    },
  },

  flags: {
    medallionVerified: false,
    platformAccessGranted: false,
    destinationChosen: false,
    albieRecognized: true,
    securityPassed: false,
    hubPuzzleSolved: false,
  },

  quests: {
    main: 'Gain Access to the Dimensional Platforms',
    optional: [
      'Present Medallion to Albie',
      'Choose Your Next Destination',
      'Study the Interdimensional Map',
      'Solve the Hub Transit Puzzle',
    ],
  },

  environmental: {
    lighting: 'underground_station_with_quantum_glow',
    temperature: 'subway_station_coolness',
    airQuality: 'underground_with_dimensional_energy',
    soundscape: [
      'distant_train_sounds',
      'dimensional_energy_humming',
      'security_equipment_beeping',
      'platform_announcements',
      'quantum_transit_ambience'
    ],
    hazards: ['dimensional_displacement_risk', 'unauthorized_access_consequences'],
  },

  security: {
    level: 'high',
    accessRequirements: ['medallion_from_warehouse', 'puzzle_completion'],
    alarmTriggers: ['unauthorized_platform_access', 'medallion_forgery'],
    surveillanceActive: true,
    surveillanceType: 'professional_security_with_dimensional_scanners',
  },

  metadata: {
    created: '2025-07-10',
    lastModified: '2025-07-10',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'moderate',
    estimatedPlayTime: '10-15 minutes',
    keyFeatures: [
      'Dimensional subway station',
      'Albie security checkpoint',
      'Medallion verification system',
      'Multiple zone access points',
      'Transit puzzle challenge',
    ],
  },

  secrets: {
    hub_puzzle_solution: {
      description: 'The correct sequence to unlock access to the restricted dimensional zones',
      requirements: ['medallion_verified', 'study dimensional_displays thoroughly'],
      rewards: ['unrestricted_zone_access', 'quantum_navigation_knowledge'],
    },
    dimensional_map_secrets: {
      description: 'Hidden destinations and routes not shown on the standard displays',
      requirements: ['gain platform access', 'examine dimensional_map carefully'],
      rewards: ['secret_zone_knowledge', 'advanced_transit_options'],
    },
    albie_hub_role: {
      description: 'Understanding Albie\'s role in the broader interdimensional network',
      requirements: ['complete multiple interactions', 'demonstrate trustworthiness'],
      rewards: ['network_insight', 'security_system_understanding'],
    },
  },

  customActions: {
    'present_medallion_to_albie': {
      description: 'Show the medallion obtained from the warehouse briefcase to gain platform access',
      requirements: ['medallion_from_warehouse_puzzle'],
      effects: ['gain_platform_access', 'unlock_dimensional_destinations', 'activate_transit_options'],
    },
    'solve_hub_transit_puzzle': {
      description: 'Complete the dimensional routing puzzle to unlock access to the next zones',
      requirements: ['platform_access_granted', 'study_destination_options'],
      effects: ['unlock_next_zone_access', 'gain_transit_mastery', 'complete_hub_challenge'],
    },
    'attempt_unauthorized_access': {
      description: 'Try to bypass security without proper credentials',
      requirements: [],
      effects: ['trigger_albie_expulsion', 'return_to_central_park', 'receive_stern_warning'],
    },
  },
};

export default manhattanhub;



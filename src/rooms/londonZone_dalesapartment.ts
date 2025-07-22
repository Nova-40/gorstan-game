import { RoomDefinition } from '../types/RoomTypes';



// londonZone_dalesapartment.ts — rooms/londonZone_dalesapartment.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: londonZone_dalesapartment

// Filename: londonZone_dalesapartment.ts
// Location: rooms/
// Version: v1 Beta
// Gorstan elements (c) Geoff Webster
// Code licensed under the MIT License


const dalesapartment: RoomDefinition = {
  id: 'dalesapartment',
  zone: 'londonZone',
  title: 'Dale and Polly\'s Apartment',
  description: [
    'You step into a bright, immaculately clean apartment that feels almost unnaturally tidy. Every surface gleams, every book is perfectly aligned, and not a single item appears out of place.',
    'The living room is decorated in modern minimalist style with clean lines and neutral colors. A comfortable sofa faces a wall-mounted television, while floor-to-ceiling windows flood the space with natural light.',
    'In one corner of the lounge, a large fish tank bubbles quietly. Inside, a single goldfish named Dominic swims in lazy circles, seemingly the only living thing that doesn\'t conform to the apartment\'s rigid organization.',
    'The level of tidiness borders on obsessive - it\'s as if someone has been maintaining this place as a shrine, keeping everything exactly as it was meant to be, waiting for its occupants to return.',
  ],
  image: 'londonZone_dalesapartment.png',
  ambientAudio: 'apartment_ambience.mp3',

  consoleIntro: [
    '>> RESIDENTIAL APARTMENT - DALE & POLLY\'S HOME',
    '>> Security status: PRIVATE RESIDENCE - Unauthorized access detected',
    '>> Maintenance level: EXCEPTIONAL - All systems optimal',
    '>> Cleanliness index: 99.7% - Above standard parameters',
    '>> Occupancy status: TEMPORARILY VACANT - Recent activity detected',
    '>> Pet care system: ACTIVE - Automated feeding schedule operational',
    '>> Personal belongings: SECURED - Packed for travel',
    '>> Climate control: OPTIMAL - Perfect living conditions maintained',
    '>> WARNING: Emotional attachment indicators detected',
    '>> Note: Prepared for extended absence scenario',
  ],

  exits: {
    north: 'findlaterscornercoffeeshop',
    bedroom: 'dales_bedroom',
    kitchen: 'dales_kitchen',
  },

  items: [
    'apartment_keys',
    'photo_albums',
    'shared_calendar',
    'travel_brochures',
    'emergency_contact_list',
    'goldfish_food',
    'remote_control',
    'dominic', // Dominic the goldfish - can be taken with goldfish_food
    // Remote control is now available in the apartment
  ],

  interactables: {
    'fish_tank': {
      description: 'A large, well-maintained aquarium with crystal-clear water. Dominic the goldfish swims contentedly among plastic plants and a small castle.',
      actions: ['examine', 'feed_fish', 'watch', 'talk_to_dominic'],
      requires: [],
    },
    'dominic_goldfish': {
      description: 'A bright orange goldfish who seems remarkably alert and intelligent for his species. He watches you with curious eyes.',
      actions: ['examine', 'feed', 'talk_to', 'watch_swimming'],
      requires: [],
    },
    'living_room_sofa': {
      description: 'A comfortable modern sofa with plush cushions arranged in perfect symmetry. It looks barely used despite being lived-in.',
      actions: ['examine', 'sit', 'look_under_cushions', 'search_cushions'],
      requires: [],
    },
    'coffee_table': {
      description: 'A pristine glass coffee table with not a single fingerprint or water ring. Its surface is so clean it almost sparkles.',
      actions: ['examine', 'look_under', 'search'],
      requires: [],
    },
    'spotless_surfaces': {
      description: 'Every surface in the apartment gleams with an almost supernatural cleanliness. Not a speck of dust anywhere.',
      actions: ['examine', 'touch', 'run_finger_across'],
      requires: [],
    },
    'wall_photos': {
      description: 'Carefully arranged photographs showing Dale and Polly in various happy moments - holidays, celebrations, everyday life.',
      actions: ['examine', 'study_faces', 'read_captions'],
      requires: [],
    },
    'perfect_alignment': {
      description: 'Books, ornaments, and furniture are arranged with mathematical precision. Everything has its exact place.',
      actions: ['examine', 'measure_distances', 'appreciate_order'],
      requires: [],
    },
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ['assessTidiness', 'activatePetCare', 'checkEmotionalState'],
    onExit: ['secureApartment', 'updateFishCare'],
    onInteract: {
      fish_tank: ['attractDominicAttention', 'observeFishBehavior'],
      dominic_goldfish: ['establishConnection', 'interpretFishCommunication'],
      wall_photos: ['triggerMemories', 'feelNostalgia'],
      spotless_surfaces: ['appreciateCare', 'wonderAboutMaintenance'],
      living_room_sofa: ['checkForHiddenItems', 'searchCushions'],
      coffee_table: ['lookForRemote', 'searchForItems'],
    },
  },

  flags: {
    apartmentSecure: true,
    dominicFed: false,
    photosExamined: false,
    runbagFound: false,
    tidynessAppreciated: false,
    fishConnectionMade: false,
    remoteControlFound: false,
  },

  quests: {
    main: 'Explore the Shared Life Space',
    optional: [
      'Care for Dominic the Goldfish',
      'Examine the Relationship Photos',
      'Find the Travel Preparations',
      'Understand the Perfect Tidiness',
      'Locate Personal Belongings',
    ],
  },

  environmental: {
    lighting: 'bright_natural_sunlight',
    temperature: 'perfectly_comfortable',
    airQuality: 'fresh_and_clean',
    soundscape: [
      'fish_tank_bubbling',
      'distant_city_sounds',
      'gentle_air_conditioning',
      'occasional_goldfish_splashing',
      'perfect_silence'
    ],
    hazards: [],
  },

  security: {
    level: 'moderate',
    accessRequirements: ['resident_access'],
    alarmTriggers: ['unauthorized_entry', 'disturbance_of_order'],
    surveillanceActive: false,
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'easy',
    estimatedPlayTime: '10-15 minutes',
    keyFeatures: [
      'Obsessively tidy apartment',
      'Dominic the intelligent goldfish',
      'Evidence of shared life',
      'Travel preparations',
      'Perfect organization',
    ],
  },

  secrets: {
    hidden_runbag_location: {
      description: 'The travel bag packed and ready in the bedroom',
      requirements: ['explore bedroom area', 'examine travel preparations'],
      rewards: ['access_to_runbag', 'travel_essentials'],
    },
    dominic_intelligence: {
      description: 'Discover the true intelligence behind Dominic\'s eyes',
      requirements: ['spend time with dominic', 'feed fish multiple times', 'talk to goldfish'],
      rewards: ['fish_wisdom', 'unusual_pet_bond'],
    },
    relationship_story: {
      description: 'The full story of Dale and Polly\'s life together told through photos and belongings',
      requirements: ['examine all wall_photos', 'study shared_calendar', 'explore all rooms'],
      rewards: ['relationship_understanding', 'emotional_connection'],
    },
    hidden_remote_control: {
      description: 'A remote control hidden between the sofa cushions - essential for accessing certain systems',
      requirements: ['search sofa cushions', 'look_under_cushions on living_room_sofa'],
      rewards: ['hub_access_remote', 'system_control_capability'],
    },
  },

  customActions: {
    'feed_dominic': {
      description: 'Give Dominic his daily feeding and spend time with him',
      requirements: ['goldfish_food'],
      effects: ['happy_goldfish', 'establish_pet_bond', 'gain_fish_wisdom'],
    },
    'appreciate_tidiness': {
      description: 'Take time to truly appreciate the incredible organization of the apartment',
      requirements: ['examine multiple spotless_surfaces'],
      effects: ['understand_care_level', 'appreciate_dedication', 'feel_home_atmosphere'],
    },
    'piece_together_life': {
      description: 'Use photos and belongings to understand Dale and Polly\'s relationship',
      requirements: ['examine wall_photos', 'study shared_items'],
      effects: ['understand_relationship', 'feel_emotional_connection', 'appreciate_shared_life'],
    },
    'look_for_remote_control': {
      description: 'Search specifically for the missing remote control',
      requirements: ['examine coffee_table', 'search living_room_sofa'],
      effects: ['find_hub_remote', 'unlock_system_access', 'gain_remote_control_item'],
    },
    'find_runbag': {
      description: 'Search the bedroom area for travel preparations',
      requirements: ['explore bedroom area', 'examine travel preparations'],
      effects: ['discover_runbag', 'add_runbag_to_room', 'set_runbagFound_flag'],
    },
  },
};

export default dalesapartment;

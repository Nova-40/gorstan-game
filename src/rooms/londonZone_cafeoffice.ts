import { RoomDefinition } from '../types/RoomTypes';



// londonZone_cafeoffice.ts — rooms/londonZone_cafeoffice.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: londonZone_cafeoffice


const cafeoffice: RoomDefinition = {
  id: 'cafeoffice',
  zone: 'londonZone',
  title: 'Cafe Office',
  description: [
    'You step into a small, cluttered office behind the main cafe area. The space is cramped but functional, clearly serving as both storage and administrative center for the establishment.',
    'A modest desk sits against one wall, its surface covered with receipts, supplier invoices, and staff schedules. An old computer hums quietly, its screen displaying what appears to be point-of-sale software.',
    'Filing cabinets line another wall, their drawers slightly ajar revealing folders stuffed with paperwork. The air smells of coffee beans and old paper, with a hint of vanilla from the cafe beyond.',
    'Despite its mundane appearance, you sense there might be more to this simple office than meets the eye. Sometimes the most important things are hidden in the most ordinary places.',
  ],
  image: 'londonZone_cafeoffice.png',
  ambientAudio: 'office_ambience.mp3',

  consoleIntro: [
    '>> CAFE OFFICE - ADMINISTRATIVE CENTER',
    '>> Access level: STAFF ONLY - Unauthorized personnel detected',
    '>> Security status: BASIC - Standard commercial protection',
    '>> Inventory system: ACTIVE - Stock management online',
    '>> Financial records: ACCESSIBLE - Current fiscal data available',
    '>> WARNING: Confidential business information present',
    '>> Staff scheduling system: OPERATIONAL',
    '>> Supplier database: CONNECTED - Delivery tracking active',
    '>> Surveillance: MINIMAL - Basic security camera present',
    '>> Recommend: Complete business and exit promptly',
  ],

  exits: {
    south: 'cafe',  // Only exit back to the main cafe
  },

  items: [
    'important_documents',
    'staff_key_ring',
    'business_records',
    'supplier_contact_list',
    'safe_combination',
    'emergency_cash',
    'inventory_clipboard',
  ],

  interactables: {
    'desk': {
      description: 'A well-used wooden desk covered with the daily operations of running a small business. Papers are neatly organized despite the apparent clutter.',
      actions: ['examine', 'search', 'open_drawers'],
      requires: [],
    },
    'computer': {
      description: 'An older desktop computer running point-of-sale software. The screen shows today\'s sales figures and inventory levels.',
      actions: ['examine', 'use', 'access_files'],
      requires: ['staff_key_ring'],
    },
    'filing_cabinets': {
      description: 'Standard office filing cabinets containing years of business records, tax documents, and operational files.',
      actions: ['examine', 'search', 'open_drawers'],
      requires: [],
    },
    'small_safe': {
      description: 'A compact office safe built into the wall behind a motivational poster. It looks like it contains the day\'s cash deposits.',
      actions: ['examine', 'open', 'attempt_combination'],
      requires: ['safe_combination'],
    },
    'bulletin_board': {
      description: 'A cork board covered with staff schedules, health department certificates, and local business cards.',
      actions: ['examine', 'read', 'search'],
      requires: [],
    },
    'supply_shelves': {
      description: 'Metal shelving units holding extra cafe supplies - coffee cups, napkins, cleaning supplies, and various inventory.',
      actions: ['examine', 'search', 'move_items'],
      requires: [],
    },
  },

  npcs: [], // Empty office, staff are in the main cafe

  events: {
    onEnter: ['checkAuthorization', 'activateSecurityCamera'],
    onExit: ['logAccess', 'secureOffice'],
    onInteract: {
      desk: ['revealBusinessDocuments', 'findHiddenItems'],
      computer: ['showBusinessData', 'accessSecureFiles'],
      small_safe: ['checkCombination', 'revealContents'],
      filing_cabinets: ['findImportantRecords', 'discoverSecrets'],
    },
  },

  flags: {
    officeSecured: true,
    safeOpened: false,
    documentsFound: false,
    computerAccessed: false,
    businessSecretsRevealed: false,
  },

  quests: {
    main: 'Find the Important Documents',
    optional: [
      'Access the Computer System',
      'Open the Office Safe',
      'Discover Business Secrets',
      'Gather All Important Items',
    ],
  },

  environmental: {
    lighting: 'fluorescent_office_lighting',
    temperature: 'warm_from_cafe_proximity',
    airQuality: 'coffee_scented_with_paper_dust',
    soundscape: ['computer_humming', 'distant_cafe_sounds', 'paper_rustling', 'fluorescent_buzzing'],
    hazards: [],
  },

  security: {
    level: 'low',
    accessRequirements: ['staff_authorization'],
    alarmTriggers: ['forced_safe_opening', 'computer_system_breach'],
    surveillanceActive: true,
    surveillanceType: 'basic_security_camera',
  },

  metadata: {
    created: '2025-07-09',
    lastModified: '2025-07-09',
    author: 'Geoff',
    version: '2.0',
    playTested: false,
    difficulty: 'easy',
    estimatedPlayTime: '5-8 minutes',
    keyFeatures: [
      'Small business office',
      'Important document collection',
      'Safe with valuable contents',
      'Computer system access',
      'Hidden items discovery',
    ],
  },

  secrets: {
    hidden_compartment: {
      description: 'A secret compartment behind the filing cabinet containing sensitive documents',
      requirements: ['search filing_cabinets thoroughly', 'move supply items'],
      rewards: ['confidential_business_plans', 'hidden_financial_records'],
    },
    safe_contents: {
      description: 'The valuable contents of the office safe beyond just cash',
      requirements: ['open small_safe', 'examine contents carefully'],
      rewards: ['property_deeds', 'insurance_policies', 'emergency_contact_information'],
    },
    computer_files: {
      description: 'Important digital records and communications stored on the computer',
      requirements: ['access computer', 'navigate file system'],
      rewards: ['email_archives', 'customer_database', 'supplier_agreements'],
    },
  },

  customActions: {
    'gather_documents': {
      description: 'Collect all the important business documents from various locations',
      requirements: ['search desk', 'access filing_cabinets', 'open safe'],
      effects: ['obtain_complete_business_records', 'unlock_business_knowledge'],
    },
    'secure_evidence': {
      description: 'Carefully document and preserve important findings',
      requirements: ['important_documents', 'business_records'],
      effects: ['create_evidence_package', 'protect_sensitive_information'],
    },
    'backup_computer_data': {
      description: 'Create copies of important digital information',
      requirements: ['computer_accessed', 'staff_key_ring'],
      effects: ['obtain_digital_backup', 'preserve_electronic_records'],
    },
  },
};

export default cafeoffice;

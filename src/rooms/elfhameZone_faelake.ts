import { RoomDefinition } from '../types/RoomTypes';



// elfhameZone_faelake.ts — rooms/elfhameZone_faelake.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: elfhameZone_faelake


const faelake: RoomDefinition = {
  id: 'faelake',
  zone: 'elfhameZone',
  title: 'The Fae Lake',
  description: [
    'Before you stretches a lake of impossible beauty, its waters so clear and still they seem like liquid crystal. The surface reflects not just the eternal twilight sky above, but also glimpses of other realms - distant stars, alien moons, and places that exist only in dreams.',
    'The lake\'s shores are lined with silver sand that chimes softly underfoot. Ethereal lily pads float on the surface, their blooms glowing with soft, pulsing light that creates ripples of color across the water.',
    'Ancient willows drape their branches into the water, their leaves rustling with whispers of secrets from across the dimensions. The air here is cool and filled with the scent of night-blooming flowers and distant rain.',
    'This is a place of deep magic and profound peace. You sense that the lake serves as a window between worlds, and that its depths hold mysteries beyond mortal comprehension.',
  ],
  image: 'elfhameZone_faelake.png',
  ambientAudio: 'fae_lake_ambience.mp3',

  consoleIntro: [
    '>> FAE LAKE - DIMENSIONAL MIRROR - REFLECTION MATRIX ACTIVE',
    '>> Location: INTERDIMENSIONAL NEXUS - WATER SCRYING ENABLED',
    '>> Water clarity: PERFECT - Mirror-like surface maintained',
    '>> Dimensional echoes: MULTIPLE - Views into other realms visible',
    '>> Lily pad network: ACTIVE - Bioluminescent communications detected',
    '>> Shoreline stability: CRYSTALLINE - Silver sand composition confirmed',
    '>> Willow guardians: PRESENT - Ancient tree spirits detected',
    '>> WARNING: Do not disturb the water\'s surface without permission',
    '>> Scrying potential: UNLIMITED - All realms accessible for viewing',
    '>> Exit protocols: ESTABLISHED - Northern shore leads to palace approach',
  ],

  exits: {
    north: 'faelakenorthshore',
    south: 'faeglade',
    west: 'elfhame',
    east: 'elfhame',
  },

  items: [
    'crystal_water',
    'lily_pad_essence',
    'silver_sand',
    'reflection_shard',
  ],

  traps: [
    {
      id: 'drowning_current',
      type: 'damage',
      severity: 'minor',
      description: 'You step too close to the lake\'s edge and magical currents pull you in! You struggle to surface, gasping for air.',
      trigger: 'enter',
      effect: {
        damage: 12
      },
      triggered: false,
      disarmable: false,
      hidden: true,
    }
  ],

  interactables: {
    'crystal_lake': {
      description: 'A lake of impossible clarity that reflects not just this realm, but glimpses of countless others.',
      actions: ['examine', 'touch', 'scry'],
      requires: [],
    },
    'glowing_lilies': {
      description: 'Ethereal lily pads that glow with soft, pulsing light and create ripples of color across the water.',
      actions: ['examine', 'touch', 'gather'],
      requires: [],
    },
    'silver_shore': {
      description: 'A shoreline of silver sand that chimes softly underfoot and sparkles with inner light.',
      actions: ['examine', 'walk', 'gather'],
      requires: [],
    },
    'whispering_willows': {
      description: 'Ancient willows whose branches trail in the water and whisper secrets from across dimensions.',
      actions: ['examine', 'listen', 'touch'],
      requires: [],
    },
    'dimensional_reflections': {
      description: 'Glimpses of other realms visible in the lake\'s surface - distant stars, alien worlds, and dream-places.',
      actions: ['examine', 'focus', 'observe'],
      requires: [],
    },
  },
};

export default faelake;

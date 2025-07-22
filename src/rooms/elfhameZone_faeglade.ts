import { RoomDefinition } from '../types/RoomTypes';



// elfhameZone_faeglade.ts — rooms/elfhameZone_faeglade.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: elfhameZone_faeglade


const faeglade: RoomDefinition = {
  id: 'faeglade',
  zone: 'elfhameZone',
  title: 'The Faerie Glade',
  description: [
    'You find yourself in a circular clearing surrounded by ancient oaks whose branches form a natural cathedral overhead. Shafts of silver moonlight filter through the canopy, illuminating a space that feels sacred and timeless.',
    'In the center of the glade stands a ring of standing stones, each one carved with flowing Fae script that shifts and changes as you watch. The stones hum with barely contained power, and the air around them shimmers with magic.',
    'Flowers of impossible colors bloom in abundance here - deep purples that seem to contain starlight, blues that shift like deep ocean waters, and golds that pulse with inner fire. Their fragrance carries hints of distant places and forgotten dreams.',
    'This is clearly a place of great significance to the Fae, a nexus where their magic flows strongest. You can feel the weight of countless years and the presence of ancient powers.',
  ],
  image: 'elfhameZone_faeglade.png',
  ambientAudio: 'faerie_glade_ambience.mp3',

  consoleIntro: [
    '>> FAERIE GLADE - SACRED NEXUS - DIMENSIONAL READINGS EXTREME',
    '>> Location: FAE POWER FOCUS - APPROACH WITH CAUTION',
    '>> Magical resonance: CRITICAL LEVELS - Protective protocols active',
    '>> Stone circle: ACTIVE - Ancient enchantments detected',
    '>> Fae presence: OVERWHELMING - Multiple high-level entities nearby',
    '>> Sacred ground: CONFIRMED - Respect local customs',
    '>> Flower essence: POTENT - Avoid direct contact without permission',
    '>> WARNING: This is a place of ancient power - Unauthorized actions forbidden',
    '>> Time distortion: SIGNIFICANT - Minutes may become hours',
    '>> Exit protocols: MAINTAINED - Emergency extraction available',
  ],

  exits: {
    north: 'faelake',
    south: 'elfhame',
    east: 'faepalacemainhall',
    west: 'faelakenorthshore',
  },

  items: [
    'moonlight_orb',
    'fae_flower',
    'ancient_scroll',
    'silver_branch',
  ],

  interactables: {
    'standing_stones': {
      description: 'A ring of ancient stones carved with shifting Fae script.',
      actions: ['examine', 'touch', 'read'],
      requires: [],
    },
    'fae_flowers': {
      description: 'Flowers of impossible colors that bloom with inner light.',
      actions: ['examine', 'gather', 'smell'],
      requires: [],
    },
    'ancient_oaks': {
      description: 'Towering oaks whose branches form a natural cathedral.',
      actions: ['examine', 'climb', 'listen'],
      requires: [],
    },
  },
};

export default faeglade;

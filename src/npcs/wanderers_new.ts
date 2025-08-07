import { NPC } from '../types/NPCTypes';

export const al: NPC = {
  id: 'al',
  name: 'Al',
  portrait: '/images/npcs/al.png',
  mood: 'neutral',
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'controlroom'
} as any;

export const morthos: NPC = {
  id: 'morthos',
  name: 'Morthos',
  portrait: '/images/npcs/morthos.png',
  mood: 'neutral',
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'glitchgate'
} as any;

export const polly: NPC = {
  id: 'polly',
  name: 'Polly',
  portrait: '/images/npcs/polly.png',
  mood: 'neutral',
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'glitchgate'
} as any;

export const wendell: NPC = {
  id: 'mrwendell',
  name: 'Mr. Wendell',
  portrait: '/images/npcs/mrwendell.png',
  mood: 'neutral',
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'stantonhub'
} as any;

export const dominic: NPC = {
  id: 'dominic',
  name: 'Dominic',
  portrait: '/images/npcs/dominic.png',
  mood: 'neutral',
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: []
  },
  currentRoom: 'burgerjoint'
} as any;

export const wanderers = [al, morthos, polly, wendell, dominic];

export default dominic;

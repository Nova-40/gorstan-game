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

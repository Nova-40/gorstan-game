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

// (c) Geoff Webster 2025

import type { Room } from '../types/Room';

// Minimal room definitions for emergency fallback
const emergencyRooms: Record<string, Room> = {
  controlnexus: {
    id: 'controlnexus',
    title: 'Control Nexus',
    description: 'You are in the central control nexus. This is the heart of the multiverse navigation system. Strange lights pulse from crystalline structures embedded in the walls.',
    image: 'introZone_controlnexus.png',
    zone: 'introZone',
    flags: {} as any,
    exits: {
      north: 'controlroom',
      south: 'crossing',
      east: 'hiddenlab'
    },
    items: [],
    npcs: [],
    rooms: []
  },
  controlroom: {
    id: 'controlroom',
    title: 'Control Room',
    description: 'A high-tech control room with banks of monitors and control panels. The air hums with electronic activity.',
    image: 'introZone_controlroom.png',
    zone: 'introZone',
    flags: {} as any,
    exits: {
      south: 'controlnexus'
    },
    items: [],
    npcs: [],
    rooms: []
  },
  crossing: {
    id: 'crossing',
    title: 'The Crossing',
    description: 'A mystical crossroads where multiple pathways converge. Energy crackles in the air, and you can sense multiple destinations beckoning.',
    image: 'introZone_crossing.png',
    zone: 'introZone',
    flags: {} as any,
    exits: {
      north: 'controlnexus',
      west: 'gorstanhub',
      east: 'londonhub',
      southeast: 'newyorkhub'
    },
    items: [],
    npcs: [],
    rooms: []
  },
  gorstanhub: {
    id: 'gorstanhub',
    title: 'Gorstan Hub',
    description: 'The central hub of Gorstan, a mystical realm of ancient power. Mist swirls around stone archways leading to various parts of this magical land.',
    image: 'gorstanZone_gorstanhub.png',
    zone: 'gorstanZone',
    flags: {} as any,
    exits: {
      east: 'crossing',
      north: 'carronspire',
      south: 'gorstanvillage',
      west: 'torridon'
    },
    items: [],
    npcs: [],
    rooms: []
  },
  londonhub: {
    id: 'londonhub',
    title: 'London Hub',
    description: 'A bustling intersection in modern London. The familiar sounds of city life surround you - traffic, conversations, and the distant chime of Big Ben.',
    image: 'londonZone_londonhub.png',
    zone: 'londonZone',
    flags: {} as any,
    exits: {
      west: 'crossing',
      north: 'cafeoffice',
      south: 'stkatherinesdock',
      east: 'trentpark'
    },
    items: [],
    npcs: [],
    rooms: []
  },
  newyorkhub: {
    id: 'newyorkhub',
    title: 'New York Hub',
    description: 'The heart of Manhattan. Skyscrapers tower above you, yellow cabs honk in the distance, and the energy of the city that never sleeps pulses all around.',
    image: 'newyorkZone_manhattanhub.png',
    zone: 'newyorkZone',
    flags: {} as any,
    exits: {
      northwest: 'crossing',
      north: 'centralpark',
      south: 'aevirawarehouse',
      east: 'burgerjoint'
    },
    items: [],
    npcs: [],
    rooms: []
  }
};

export function getFallbackRooms(): Record<string, Room> {
  console.log('[roomLoaderFallback] Providing emergency room set');
  return emergencyRooms;
}

export function getFallbackRoom(id: string): Room | null {
  return emergencyRooms[id] || null;
}

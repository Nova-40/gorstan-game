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

import type { GameState } from '../state/gameState';
import { Definition } from './RoomTypes';

export interface NPCMemoryState {
  [topic: string]: string | number | boolean;
}

export interface NPC {
  id: string;
  name: string;
  portrait: string;
  memory: NPCMemoryState;
  react: (topic: string) => string;
  shouldBeVisible?: (state: GameState, room: Definition) => boolean;
  wanderRoute?: string[]; // list of room ids
  currentRoom?: string;   // current location if wandering
}

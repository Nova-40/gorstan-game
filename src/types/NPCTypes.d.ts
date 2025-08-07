import { NPC } from '../types/NPCTypes';

import { GameState } from '../state/GameStateTypes';
import { RoomDefinition } from './RoomTypes';

export interface NPCMemoryState {
  [topic: string]: string | number | boolean;
}

export interface NPC {
  id: string;
  name: string;
  portrait: string;
  memory: NPCMemoryState;
  react: (topic: string) => string;
  shouldBeVisible?: (state: GameState, room: RoomDefinition) => boolean;
  wanderRoute?: string[]; // list of room ids
  currentRoom?: string;   // current location if wandering
}

import { NPC } from './NPCTypes';

import { Room } from './RoomTypes';



// Room.d.ts
// Type definitions for Gorstan room modules
// (c) 2025 Geoffrey Alan Webster. MIT Licence

export interface Room {
  id: string;                       // Unique room ID (used for routing)
  title: string;                    // Room title (shown in UI)
  description: string;              // Text description
  image?: string;                   // Image filename (e.g. 'zone/roomname.png')
  exits?: Partial<RoomExits>;       // Possible exits from this room
  flags?: RoomFlags;                // Flags affecting behaviour or visibility
  items?: RoomItem[];               // Items present in the room
  npcs?: RoomNPC[];                 // NPCs present in the room
  trap?: RoomTrap;                  // Optional trap logic
  music?: string;                   // Optional background audio
  zone?: string;                    // Optional zone tag for grouping rooms
  consoleIntro?: string[];          // Optional console intro messages
  rooms: { [id: string]: Room };
}
export interface GameState {
  currentRoomId: string;
  stage: string;
  player?: {
    name: string;
    // ...other player fields
  };
  rooms: { [id: string]: Room }; // Add this line to define rooms
  // ...other state fields

  stage: string;
  player?: {
    name: string;
    // ...other player fields
  };
  rooms: { [id: string]: Room }; // Add this line to define rooms
  // ...other state fields
}

// Make sure Room type is defined somewhere:
export interface Room {
  id: string;
  // ...other room fields
}
export interface RoomExits {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  up?: string;
  down?: string;
  jump?: string;
  return?: string;
  [custom: string]: string | undefined; // Allows custom commands like 'mirror'
}

export interface RoomFlags {
  hidden?: boolean;           // Room doesn't appear in maps or previews
  locked?: boolean;           // Room cannot be entered without a key
  noSave?: boolean;           // Player cannot save here
  cursed?: boolean;           // Special logic flag
  [customFlag: string]: boolean | undefined;
}

export interface RoomItem {
  id: string;                 // Item ID
  name: string;               // Display name
  description?: string;       // Optional hover or lore description
  isKey?: boolean;            // Unlocks something
  cursed?: boolean;           // Causes effects when picked up
  oneTimeUse?: boolean;       // Disappears after use
}

export interface RoomNPC {
  id: string;                 // Must match NPC engine ID
  name: string;               // Name shown to player
  entryMessage?: string;      // Line they say on room entry
  memoryTags?: string[];      // Context markers for branching logic
  hostileOnInsult?: boolean;  // Trigger death/reset if insulted
  reactsToItem?: string;      // e.g. 'coffee' or 'fish'
}

export interface RoomTrap {
  type: 'instant' | 'puzzle' | 'timed';
  effect: string;             // e.g. 'reset', 'teleport', 'curse'
  condition?: string;         // e.g. 'inventory.includes("coin")'
  failureMessage?: string;    // Message if player triggers trap
}

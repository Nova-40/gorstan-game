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

// src/engine/NPCTypes.ts
// Gorstan Game Beta 1
// Type definitions for NPCs and their memory.

export interface NPCMemory {
  topic: string;
  time: number;
  location?: string;
  id?: string;
  contextTags?: string[];
}

export interface NPC {
  name: string;
  mood?: string;
  memory: NPCMemory[];
  queryCount?: number;
  trustLevel?: number;
  lastInteraction?: number;
  relationship?: string;
  personalityTraits?: string[];
  preferences?: Record<string, number>;
  memoryCapacity?: number;
  initialized?: boolean;
  // Add any additional fields as needed for your game logic
}

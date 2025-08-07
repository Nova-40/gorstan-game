// src/engine/miniquestInitializer.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Core game engine module.

import * as MiniquestTracker from '../state/miniquestTracker';

import MiniquestEngine from './miniquestEngine';

import roomMiniquests from '../data/roomMiniquests';

import { Miniquest } from '../types/GameTypes';













// --- Function: initializeMiniquests ---
export function initializeMiniquests(): void {
// Variable declaration
  const engine = MiniquestEngine.getInstance();

  
  roomMiniquests.forEach(({ roomId, miniquests }) => {
    engine.registerRoomQuests(roomId, miniquests);
    console.log(`🎯 Registered ${miniquests.length} miniquests for room: ${roomId}`);
  });

  console.log(`✅ Miniquest system initialized with ${roomMiniquests.length} rooms and ${
    roomMiniquests.reduce((total, room) => total + room.miniquests.length, 0)
  } total miniquests.`);
}

export { MiniquestEngine };

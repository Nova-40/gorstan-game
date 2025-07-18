// miniquestInitializer.ts/Location: src/engine/Version: 1.0/Gorstan elements (c) Geoff Webster/Code licensed under the MIT License

import MiniquestEngine from './miniquestEngine';
import roomMiniquests from '../data/roomMiniquests';

/**
 * Initialize the miniquest system with room data
 */
export function initializeMiniquests(): void {
  const engine = MiniquestEngine.getInstance();
  
  // Register all room miniquests
  roomMiniquests.forEach(({ roomId, miniquests }) => {
    engine.registerRoomQuests(roomId, miniquests);
    console.log(`🎯 Registered ${miniquests.length} miniquests for room: ${roomId}`);
  });
  
  console.log(`✅ Miniquest system initialized with ${roomMiniquests.length} rooms and ${
    roomMiniquests.reduce((total, room) => total + room.miniquests.length, 0)
  } total miniquests.`);
}

export { MiniquestEngine };

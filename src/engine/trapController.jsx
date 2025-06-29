// src/engine/trapEngine.js
// Gorstan v3.3.7 – Trap Seeding and Detection Logic

/**
 * In-memory trap state for simplicity. Could be persisted or stored in flags.
 */
const activeTraps = {};

/**
 * Seeds traps randomly across room keys.
 * @param {string[]} roomKeys 
 */
export function seedTraps(roomKeys) {
  roomKeys.forEach((room) => {
    if (Math.random() < 0.2) { // 20% chance
      activeTraps[room] = {
        description: 'A hidden pressure plate clicks beneath your foot!',
        autoDisarm: false,
        severity: 'moderate',
      };
    }
  });
  console.log('[TrapEngine] Traps seeded:', activeTraps);
}

/**
 * Returns trap data if a room is trapped.
 * @param {string} roomName 
 * @returns {object|null}
 */
export function getTrap(roomName) {
  return activeTraps[roomName] || null;
}

/**
 * Checks and returns trap message if present.
 * @param {string} roomName 
 * @returns {string|null}
 */
export function checkForTrap(roomName) {
  const trap = getTrap(roomName);
  return trap ? `⚠️ Trap triggered: ${trap.description}` : null;
}

/**
 * Removes trap from room.
 * @param {string} roomName 
 */
export function disarmTrap(roomName) {
  delete activeTraps[roomName];
  console.log(`[TrapEngine] Trap disarmed in ${roomName}`);
}

/**
 * Returns all active traps (mainly for debugging).
 */
export function listActiveTraps() {
  return activeTraps;
}



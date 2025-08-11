/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  Trap management system for room-based traps
*/

export interface Trap {
  id: string;
  roomId: string;
  name: string;
  description: string;
  triggered: boolean;
  disarmable: boolean;
  type: 'environmental' | 'magical' | 'mechanical';
  severity: 'light' | 'severe' | 'lethal';
}

// Global trap registry
const trapRegistry: Map<string, Trap> = new Map();

// Initialize common traps
const initializeTraps = () => {
  // Example traps for demonstration
  const commonTraps: Trap[] = [
    {
      id: 'spike_pit_maze',
      roomId: 'mazehub',
      name: 'Spike Pit',
      description: 'A concealed spike pit trap',
      triggered: false,
      disarmable: true,
      type: 'mechanical',
      severity: 'severe'
    },
    {
      id: 'pressure_plate_dungeon',
      roomId: 'faepalacedungeon',
      name: 'Ward Plate',
      description: 'A magical pressure plate that triggers ward spells',
      triggered: false,
      disarmable: true,
      type: 'magical',
      severity: 'light'
    },
    {
      id: 'unstable_floor_void',
      roomId: 'datavoid',
      name: 'Unstable Floor',
      description: 'Unstable digital floor that could collapse',
      triggered: false,
      disarmable: false,
      type: 'environmental',
      severity: 'lethal'
    }
  ];

  commonTraps.forEach(trap => {
    trapRegistry.set(trap.roomId, trap);
  });
};

// Initialize traps when module loads
initializeTraps();

/**
 * Get trap for a specific room
 */
export function getTrapByRoom(roomId: string): Trap | null {
  return trapRegistry.get(roomId) || null;
}

/**
 * Check if a room has a trap (alias for getTrapByRoom for backward compatibility)
 */
export function checkForTrap(roomId: string): Trap | null {
  return getTrapByRoom(roomId);
}

/**
 * Get all active (non-triggered) traps
 */
export function getActiveTraps(): Trap[] {
  return Array.from(trapRegistry.values()).filter(trap => !trap.triggered);
}

/**
 * Disarm a trap in a room
 */
export function disarmTrap(roomId: string, method?: string): boolean {
  const trap = trapRegistry.get(roomId);
  if (trap && trap.disarmable && !trap.triggered) {
    trap.triggered = true;
    const usedMethod = method || 'careful manipulation';
    console.log(`[Trap Controller] ✅ Disarmed trap in ${roomId} using ${usedMethod}: ${trap.description}`);
    return true;
  }
  
  if (trap && !trap.disarmable) {
    console.log(`[Trap Controller] ❌ Cannot disarm trap in ${roomId}: ${trap.description} (not disarmable)`);
    return false;
  }
  
  console.log(`[Trap Controller] ⚠️ No active trap found in ${roomId}`);
  return false;
}

/**
 * Trigger a trap (when player fails to avoid it)
 */
export function triggerTrap(roomId: string): Trap | null {
  const trap = trapRegistry.get(roomId);
  if (trap && !trap.triggered) {
    trap.triggered = true;
    console.log(`[Trap Controller] 💥 Triggered trap in ${roomId}: ${trap.description}`);
    return trap;
  }
  
  return null;
}

/**
 * Reset a trap (for testing or specific game mechanics)
 */
export function resetTrap(roomId: string): boolean {
  const trap = trapRegistry.get(roomId);
  if (trap) {
    trap.triggered = false;
    console.log(`[Trap Controller] 🔄 Reset trap in ${roomId}: ${trap.description}`);
    return true;
  }
  
  return false;
}

/**
 * Add a new trap to a room
 */
export function addTrap(trap: Trap): void {
  trapRegistry.set(trap.roomId, trap);
  console.log(`[Trap Controller] ➕ Added trap to ${trap.roomId}: ${trap.description}`);
}

/**
 * Remove a trap from a room
 */
export function removeTrap(roomId: string): boolean {
  const removed = trapRegistry.delete(roomId);
  if (removed) {
    console.log(`[Trap Controller] ➖ Removed trap from ${roomId}`);
  }
  return removed;
}

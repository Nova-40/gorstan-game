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

// src/npc/npcPresence.ts
// Real-time NPC presence tracking system
// Provides live updates of which NPCs are in which rooms

export interface NPCPresenceState {
  npcId: string;
  currentRoom: string;
  lastMoveTime: number;
  isMoving: boolean;
  moveStartTime?: number;
  targetRoom?: string;
}

export interface RoomOccupancy {
  roomId: string;
  npcIds: string[];
  capacity?: number;
  isFull: boolean;
}

export interface NPCPresenceUpdate {
  type: "npc_entered" | "npc_left" | "npc_moving" | "npc_stopped";
  npcId: string;
  roomId: string;
  previousRoom?: string;
  timestamp: number;
}

export type NPCPresenceListener = (update: NPCPresenceUpdate) => void;

/**
 * Real-time NPC presence tracking system
 * Tracks which NPCs are in which rooms and provides live updates
 */
export class NPCPresenceProvider {
  private npcStates = new Map<string, NPCPresenceState>();
  private roomOccupancy = new Map<string, Set<string>>();
  private roomCapacities = new Map<string, number>();
  private listeners = new Set<NPCPresenceListener>();
  private isActive = false;

  constructor() {
    console.log("[NPCPresence] Initialized presence provider");
  }

  /**
   * Start the presence tracking system
   */
  start(): void {
    if (this.isActive) {
      console.warn("[NPCPresence] Already active");
      return;
    }

    this.isActive = true;
    console.log("[NPCPresence] Started presence tracking");
  }

  /**
   * Stop the presence tracking system
   */
  stop(): void {
    if (!this.isActive) {
      return;
    }

    this.isActive = false;
    console.log("[NPCPresence] Stopped presence tracking");
  }

  /**
   * Register an NPC with initial position
   */
  registerNPC(npcId: string, initialRoom: string): void {
    if (!this.isActive) {
      console.warn("[NPCPresence] Cannot register NPC while inactive");
      return;
    }

    // If NPC already exists, remove from previous room
    const existingState = this.npcStates.get(npcId);
    if (existingState) {
      this.removeFromRoom(npcId, existingState.currentRoom);
    }

    const state: NPCPresenceState = {
      npcId,
      currentRoom: initialRoom,
      lastMoveTime: Date.now(),
      isMoving: false,
    };

    this.npcStates.set(npcId, state);
    this.addToRoom(npcId, initialRoom);

    console.log(`[NPCPresence] Registered NPC ${npcId} in room ${initialRoom}`);
  }

  /**
   * Unregister an NPC
   */
  unregisterNPC(npcId: string): void {
    const state = this.npcStates.get(npcId);
    if (state) {
      this.removeFromRoom(npcId, state.currentRoom);
      this.npcStates.delete(npcId);
      console.log(`[NPCPresence] Unregistered NPC ${npcId}`);
    }
  }

  /**
   * Start moving an NPC from one room to another
   */
  startMove(npcId: string, fromRoom: string, toRoom: string): boolean {
    if (!this.isActive) {
      return false;
    }

    const state = this.npcStates.get(npcId);
    if (!state) {
      console.warn(`[NPCPresence] Cannot move unknown NPC ${npcId}`);
      return false;
    }

    if (state.isMoving) {
      console.warn(`[NPCPresence] NPC ${npcId} is already moving`);
      return false;
    }

    // Check if target room has capacity
    if (this.isRoomFull(toRoom)) {
      console.log(`[NPCPresence] Room ${toRoom} is full, cannot move ${npcId}`);
      return false;
    }

    // Start the move
    state.isMoving = true;
    state.moveStartTime = Date.now();
    state.targetRoom = toRoom;

    this.emitUpdate({
      type: "npc_moving",
      npcId,
      roomId: toRoom,
      previousRoom: fromRoom,
      timestamp: Date.now(),
    });

    console.log(
      `[NPCPresence] Started move: ${npcId} from ${fromRoom} to ${toRoom}`,
    );
    return true;
  }

  /**
   * Complete an NPC move
   */
  completeMove(npcId: string): boolean {
    if (!this.isActive) {
      return false;
    }

    const state = this.npcStates.get(npcId);
    if (!state || !state.isMoving || !state.targetRoom) {
      return false;
    }

    const fromRoom = state.currentRoom;
    const toRoom = state.targetRoom;

    // Remove from old room
    this.removeFromRoom(npcId, fromRoom);

    // Add to new room
    this.addToRoom(npcId, toRoom);

    // Update state
    state.currentRoom = toRoom;
    state.lastMoveTime = Date.now();
    state.isMoving = false;
    state.moveStartTime = undefined;
    state.targetRoom = undefined;

    this.emitUpdate({
      type: "npc_entered",
      npcId,
      roomId: toRoom,
      previousRoom: fromRoom,
      timestamp: Date.now(),
    });

    this.emitUpdate({
      type: "npc_left",
      npcId,
      roomId: fromRoom,
      timestamp: Date.now(),
    });

    console.log(
      `[NPCPresence] Completed move: ${npcId} from ${fromRoom} to ${toRoom}`,
    );
    return true;
  }

  /**
   * Cancel an ongoing move
   */
  cancelMove(npcId: string): boolean {
    const state = this.npcStates.get(npcId);
    if (!state || !state.isMoving) {
      return false;
    }

    state.isMoving = false;
    state.moveStartTime = undefined;
    state.targetRoom = undefined;

    this.emitUpdate({
      type: "npc_stopped",
      npcId,
      roomId: state.currentRoom,
      timestamp: Date.now(),
    });

    console.log(`[NPCPresence] Cancelled move for ${npcId}`);
    return true;
  }

  /**
   * Set room capacity
   */
  setRoomCapacity(roomId: string, capacity: number): void {
    this.roomCapacities.set(roomId, capacity);
    console.log(`[NPCPresence] Set room ${roomId} capacity to ${capacity}`);
  }

  /**
   * Get current NPC state
   */
  getNPCState(npcId: string): NPCPresenceState | null {
    return this.npcStates.get(npcId) || null;
  }

  /**
   * Get room occupancy
   */
  getRoomOccupancy(roomId: string): RoomOccupancy {
    const npcSet = this.roomOccupancy.get(roomId) || new Set();
    const capacity = this.roomCapacities.get(roomId);

    return {
      roomId,
      npcIds: Array.from(npcSet),
      capacity,
      isFull: capacity ? npcSet.size >= capacity : false,
    };
  }

  /**
   * Get all NPCs in a room
   */
  getNPCsInRoom(roomId: string): string[] {
    const npcSet = this.roomOccupancy.get(roomId) || new Set();
    return Array.from(npcSet);
  }

  /**
   * Check if room is full
   */
  isRoomFull(roomId: string): boolean {
    const capacity = this.roomCapacities.get(roomId);
    if (!capacity) {return false;}

    const occupancy = this.roomOccupancy.get(roomId) || new Set();
    return occupancy.size >= capacity;
  }

  /**
   * Get all rooms with their occupancy
   */
  getAllRoomOccupancy(): Map<string, RoomOccupancy> {
    const result = new Map<string, RoomOccupancy>();

    // Include all rooms that have capacity set or NPCs present
    const allRooms = new Set([
      ...this.roomCapacities.keys(),
      ...this.roomOccupancy.keys(),
    ]);

    for (const roomId of allRooms) {
      result.set(roomId, this.getRoomOccupancy(roomId));
    }

    return result;
  }

  /**
   * Get all NPC states
   */
  getAllNPCStates(): Map<string, NPCPresenceState> {
    return new Map(this.npcStates);
  }

  /**
   * Add presence update listener
   */
  addListener(listener: NPCPresenceListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove presence update listener
   */
  removeListener(listener: NPCPresenceListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Clear all data (for testing/reset)
   */
  clear(): void {
    this.npcStates.clear();
    this.roomOccupancy.clear();
    this.roomCapacities.clear();
    console.log("[NPCPresence] Cleared all presence data");
  }

  /**
   * Get system statistics
   */
  getStats() {
    const movingNPCs = Array.from(this.npcStates.values()).filter(
      (s) => s.isMoving,
    ).length;

    return {
      isActive: this.isActive,
      totalNPCs: this.npcStates.size,
      movingNPCs,
      totalRooms: this.roomOccupancy.size,
      listeners: this.listeners.size,
    };
  }

  // Private helper methods

  private addToRoom(npcId: string, roomId: string): void {
    if (!this.roomOccupancy.has(roomId)) {
      this.roomOccupancy.set(roomId, new Set());
    }
    this.roomOccupancy.get(roomId)!.add(npcId);
  }

  private removeFromRoom(npcId: string, roomId: string): void {
    const npcSet = this.roomOccupancy.get(roomId);
    if (npcSet) {
      npcSet.delete(npcId);
      if (npcSet.size === 0) {
        this.roomOccupancy.delete(roomId);
      }
    }
  }

  private emitUpdate(update: NPCPresenceUpdate): void {
    for (const listener of this.listeners) {
      try {
        listener(update);
      } catch (error) {
        console.error("[NPCPresence] Listener error:", error);
      }
    }
  }
}

// Global instance management
let globalPresenceProvider: NPCPresenceProvider | null = null;

/**
 * Get the global NPC presence provider instance
 */
export function getNPCPresenceProvider(): NPCPresenceProvider {
  if (!globalPresenceProvider) {
    globalPresenceProvider = new NPCPresenceProvider();
  }
  return globalPresenceProvider;
}

/**
 * Reset the global presence provider (for testing)
 */
export function resetNPCPresenceProvider(): void {
  if (globalPresenceProvider) {
    globalPresenceProvider.stop();
    globalPresenceProvider.clear();
  }
  globalPresenceProvider = null;
}

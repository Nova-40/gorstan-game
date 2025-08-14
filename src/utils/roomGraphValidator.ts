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

// src/utils/roomGraphValidator.ts
// Room graph validation utilities for final polish
// Gorstan Game Beta 1

import { Room } from "../types/Room";

interface RoomGraphStats {
  totalRooms: number;
  orphanRooms: string[];
  deadEndRooms: string[];
  unreachableRooms: string[];
  invalidExits: Array<{ roomId: string; direction: string; target: string }>;
  possibleInfiniteLoops: Array<{ path: string[]; loop: string[] }>;
  hubRooms: string[];
  zoneCoverage: Record<string, number>;
}

interface RoomMap {
  [roomId: string]: Room;
}

/**
 * Comprehensive room graph validator
 */
export class RoomGraphValidator {
  private roomMap: RoomMap;

  constructor(roomMap: RoomMap) {
    this.roomMap = roomMap;
  }

  /**
   * Perform complete validation of room graph
   */
  validateGraph(): RoomGraphStats {
    const stats: RoomGraphStats = {
      totalRooms: Object.keys(this.roomMap).length,
      orphanRooms: [],
      deadEndRooms: [],
      unreachableRooms: [],
      invalidExits: [],
      possibleInfiniteLoops: [],
      hubRooms: [],
      zoneCoverage: {},
    };

    // Check for invalid exits
    stats.invalidExits = this.findInvalidExits();

    // Find orphan rooms (no incoming connections)
    stats.orphanRooms = this.findOrphanRooms();

    // Find dead end rooms (no outgoing connections)
    stats.deadEndRooms = this.findDeadEndRooms();

    // Find unreachable rooms from starting points
    stats.unreachableRooms = this.findUnreachableRooms();

    // Find possible infinite loops
    stats.possibleInfiniteLoops = this.findPossibleInfiniteLoops();

    // Identify hub rooms (many connections)
    stats.hubRooms = this.findHubRooms();

    // Zone coverage analysis
    stats.zoneCoverage = this.analyzeZoneCoverage();

    return stats;
  }

  /**
   * Find exits that point to non-existent rooms
   */
  private findInvalidExits(): Array<{
    roomId: string;
    direction: string;
    target: string;
  }> {
    const invalidExits: Array<{
      roomId: string;
      direction: string;
      target: string;
    }> = [];

    for (const [roomId, room] of Object.entries(this.roomMap)) {
      if (room.exits) {
        for (const [direction, target] of Object.entries(room.exits)) {
          if (target && !this.roomMap[target]) {
            invalidExits.push({ roomId, direction, target });
          }
        }
      }
    }

    return invalidExits;
  }

  /**
   * Find rooms with no incoming connections
   */
  private findOrphanRooms(): string[] {
    const hasIncoming = new Set<string>();
    const startingPoints = ["controlnexus", "crossing", "introstart", "splash"];

    // Mark starting points as reachable
    startingPoints.forEach((room) => {
      if (this.roomMap[room]) {
        hasIncoming.add(room);
      }
    });

    // Find all rooms that are targets of exits
    for (const room of Object.values(this.roomMap)) {
      if (room.exits) {
        for (const target of Object.values(room.exits)) {
          if (target && this.roomMap[target]) {
            hasIncoming.add(target);
          }
        }
      }
    }

    // Find rooms with no incoming connections
    const orphans = Object.keys(this.roomMap).filter(
      (roomId) => !hasIncoming.has(roomId),
    );

    return orphans;
  }

  /**
   * Find rooms with no outgoing connections
   */
  private findDeadEndRooms(): string[] {
    const deadEnds: string[] = [];

    for (const [roomId, room] of Object.entries(this.roomMap)) {
      const hasExits = room.exits && Object.keys(room.exits).length > 0;
      if (!hasExits) {
        deadEnds.push(roomId);
      }
    }

    return deadEnds;
  }

  /**
   * Find rooms unreachable from main starting points
   */
  private findUnreachableRooms(): string[] {
    const startingPoints = ["controlnexus", "crossing", "introstart"];
    const reachable = new Set<string>();

    // BFS from each starting point
    for (const start of startingPoints) {
      if (this.roomMap[start]) {
        this.bfsFromRoom(start, reachable);
      }
    }

    const unreachable = Object.keys(this.roomMap).filter(
      (roomId) => !reachable.has(roomId),
    );

    return unreachable;
  }

  /**
   * Breadth-first search to find all reachable rooms
   */
  private bfsFromRoom(startRoom: string, visited: Set<string>): void {
    const queue = [startRoom];
    visited.add(startRoom);

    while (queue.length > 0) {
      const currentRoom = queue.shift()!;
      const room = this.roomMap[currentRoom];

      if (room && room.exits) {
        for (const target of Object.values(room.exits)) {
          if (target && this.roomMap[target] && !visited.has(target)) {
            visited.add(target);
            queue.push(target);
          }
        }
      }
    }
  }

  /**
   * Find possible infinite loops (simple cycles)
   */
  private findPossibleInfiniteLoops(): Array<{
    path: string[];
    loop: string[];
  }> {
    const loops: Array<{ path: string[]; loop: string[] }> = [];
    const visited = new Set<string>();

    for (const startRoom of Object.keys(this.roomMap)) {
      if (!visited.has(startRoom)) {
        const currentPath: string[] = [];
        const currentVisited = new Set<string>();
        this.dfsForCycles(
          startRoom,
          currentPath,
          currentVisited,
          visited,
          loops,
        );
      }
    }

    return loops;
  }

  /**
   * Depth-first search to detect cycles
   */
  private dfsForCycles(
    room: string,
    path: string[],
    currentVisited: Set<string>,
    globalVisited: Set<string>,
    loops: Array<{ path: string[]; loop: string[] }>,
  ): void {
    if (currentVisited.has(room)) {
      // Found a cycle
      const cycleStart = path.indexOf(room);
      if (cycleStart !== -1) {
        const loop = path.slice(cycleStart);
        loops.push({ path: [...path], loop });
      }
      return;
    }

    currentVisited.add(room);
    globalVisited.add(room);
    path.push(room);

    const roomObj = this.roomMap[room];
    if (roomObj && roomObj.exits) {
      for (const target of Object.values(roomObj.exits)) {
        if (target && this.roomMap[target]) {
          this.dfsForCycles(
            target,
            path,
            new Set(currentVisited),
            globalVisited,
            loops,
          );
        }
      }
    }

    path.pop();
  }

  /**
   * Find rooms that act as hubs (many connections)
   */
  private findHubRooms(): string[] {
    const connectionCounts: Record<string, number> = {};

    // Count outgoing connections
    for (const [roomId, room] of Object.entries(this.roomMap)) {
      const exitCount = room.exits ? Object.keys(room.exits).length : 0;
      connectionCounts[roomId] = exitCount;
    }

    // Count incoming connections
    for (const room of Object.values(this.roomMap)) {
      if (room.exits) {
        for (const target of Object.values(room.exits)) {
          if (target && connectionCounts[target] !== undefined) {
            connectionCounts[target] += 1;
          }
        }
      }
    }

    // Find rooms with high connection counts (hub threshold: 4+ connections)
    const hubs = Object.entries(connectionCounts)
      .filter(([_, count]) => count >= 4)
      .map(([roomId, _]) => roomId);

    return hubs;
  }

  /**
   * Analyze zone coverage and distribution
   */
  private analyzeZoneCoverage(): Record<string, number> {
    const zoneCounts: Record<string, number> = {};

    for (const room of Object.values(this.roomMap)) {
      const zone = room.zone || "unknown";
      zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
    }

    return zoneCounts;
  }

  /**
   * Generate a text report of validation results
   */
  generateReport(stats: RoomGraphStats): string {
    let report = "# Room Graph Validation Report\n\n";

    report += `## Overview\n`;
    report += `- Total Rooms: ${stats.totalRooms}\n`;
    report += `- Zones: ${Object.keys(stats.zoneCoverage).length}\n\n`;

    if (stats.invalidExits.length > 0) {
      report += `## ❌ Invalid Exits (${stats.invalidExits.length})\n`;
      for (const exit of stats.invalidExits) {
        report += `- \`${exit.roomId}\` → ${exit.direction} → \`${exit.target}\` (MISSING)\n`;
      }
      report += "\n";
    }

    if (stats.orphanRooms.length > 0) {
      report += `## ⚠️ Orphan Rooms (${stats.orphanRooms.length})\n`;
      report += "Rooms with no incoming connections:\n";
      for (const room of stats.orphanRooms) {
        report += `- \`${room}\`\n`;
      }
      report += "\n";
    }

    if (stats.deadEndRooms.length > 0) {
      report += `## 🚫 Dead End Rooms (${stats.deadEndRooms.length})\n`;
      report += "Rooms with no exits:\n";
      for (const room of stats.deadEndRooms) {
        report += `- \`${room}\`\n`;
      }
      report += "\n";
    }

    if (stats.unreachableRooms.length > 0) {
      report += `## 🔒 Unreachable Rooms (${stats.unreachableRooms.length})\n`;
      report += "Rooms not reachable from starting points:\n";
      for (const room of stats.unreachableRooms) {
        report += `- \`${room}\`\n`;
      }
      report += "\n";
    }

    if (stats.possibleInfiniteLoops.length > 0) {
      report += `## 🔄 Possible Infinite Loops (${stats.possibleInfiniteLoops.length})\n`;
      for (const loop of stats.possibleInfiniteLoops.slice(0, 5)) {
        report += `- ${loop.loop.join(" → ")}\n`;
      }
      if (stats.possibleInfiniteLoops.length > 5) {
        report += `- ... and ${stats.possibleInfiniteLoops.length - 5} more\n`;
      }
      report += "\n";
    }

    if (stats.hubRooms.length > 0) {
      report += `## 🌐 Hub Rooms (${stats.hubRooms.length})\n`;
      report += "Rooms with many connections:\n";
      for (const room of stats.hubRooms) {
        report += `- \`${room}\`\n`;
      }
      report += "\n";
    }

    report += `## 📊 Zone Distribution\n`;
    for (const [zone, count] of Object.entries(stats.zoneCoverage)) {
      report += `- ${zone}: ${count} rooms\n`;
    }

    return report;
  }
}

/**
 * Quick validation function for use in tests
 */
export function validateRoomGraph(roomMap: RoomMap): RoomGraphStats {
  const validator = new RoomGraphValidator(roomMap);
  return validator.validateGraph();
}

/**
 * Check if specific room path exists
 */
export function validateRoomPath(roomMap: RoomMap, path: string[]): boolean {
  for (let i = 0; i < path.length - 1; i++) {
    const currentRoom = roomMap[path[i]];
    const nextRoom = path[i + 1];

    if (!currentRoom || !currentRoom.exits) {
      return false;
    }

    const hasConnection = Object.values(currentRoom.exits).includes(nextRoom);
    if (!hasConnection) {
      return false;
    }
  }

  return true;
}

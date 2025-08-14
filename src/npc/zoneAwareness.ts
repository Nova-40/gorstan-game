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

// src/npc/zoneAwareness.ts
// Zone awareness system for NPC movement constraints

export interface ZoneInfo {
  zoneId: string;
  zoneName: string;
  biome: string;
  difficulty: number; // 1-10 scale
  allowedNPCTypes: string[];
  restrictedNPCTypes: string[];
  environmentalFactors: {
    temperature?: "hot" | "cold" | "temperate";
    terrain?: "urban" | "wilderness" | "underground" | "magical";
    danger?: "safe" | "moderate" | "dangerous" | "lethal";
    accessibility?: "public" | "restricted" | "private" | "forbidden";
  };
}

export interface RoomZoneMapping {
  roomId: string;
  zoneId: string;
  isZoneBoundary: boolean; // Room connects to different zone
  connectedZones?: string[]; // Other zones accessible from this room
}

export interface ZoneTransitionRule {
  fromZone: string;
  toZone: string;
  allowedNPCTypes: string[];
  requirements?: {
    minimumLevel?: number;
    hasItem?: string[];
    questComplete?: string[];
    allianceStatus?: string;
  };
  transitionType: "open" | "guarded" | "hidden" | "quest-locked";
}

export interface NPCZonePreference {
  npcId: string;
  npcType: string;
  preferredZones: string[];
  avoidedZones: string[];
  cannotEnterZones: string[];
  homeZone: string;
  roamingBehavior:
    | "stay-home"
    | "explore-preferred"
    | "avoid-restricted"
    | "unrestricted";
}

export interface ZoneAwarenessConfig {
  enableZoneRestrictions: boolean;
  enableBiomeAffinity: boolean;
  enableDifficultyScaling: boolean;
  respectZoneBoundaries: boolean;
  allowCrossZoneMovement: boolean;
}

/**
 * Zone Awareness Provider - manages zone-based movement constraints
 */
export class ZoneAwarenessProvider {
  private zones: Map<string, ZoneInfo> = new Map();
  private roomZoneMappings: Map<string, RoomZoneMapping> = new Map();
  private transitionRules: Map<string, ZoneTransitionRule[]> = new Map();
  private npcPreferences: Map<string, NPCZonePreference> = new Map();
  private config: ZoneAwarenessConfig;
  private isInitialized: boolean = false;

  constructor(config: Partial<ZoneAwarenessConfig> = {}) {
    this.config = {
      enableZoneRestrictions: true,
      enableBiomeAffinity: true,
      enableDifficultyScaling: false,
      respectZoneBoundaries: true,
      allowCrossZoneMovement: true,
      ...config,
    };
    console.log("[ZoneAwareness] Initialized zone awareness provider");
  }

  /**
   * Initialize the zone awareness system
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn("[ZoneAwareness] Already initialized");
      return;
    }

    this.isInitialized = true;
    console.log("[ZoneAwareness] Zone awareness system initialized");
  }

  /**
   * Register a zone with its properties
   */
  registerZone(zone: ZoneInfo): void {
    this.zones.set(zone.zoneId, zone);
    console.log(
      `[ZoneAwareness] Registered zone ${zone.zoneId} (${zone.zoneName})`,
    );
  }

  /**
   * Map a room to a zone
   */
  mapRoomToZone(mapping: RoomZoneMapping): void {
    this.roomZoneMappings.set(mapping.roomId, mapping);
    console.log(
      `[ZoneAwareness] Mapped room ${mapping.roomId} to zone ${mapping.zoneId}`,
    );
  }

  /**
   * Add a zone transition rule
   */
  addTransitionRule(rule: ZoneTransitionRule): void {
    const key = `${rule.fromZone}->${rule.toZone}`;
    if (!this.transitionRules.has(rule.fromZone)) {
      this.transitionRules.set(rule.fromZone, []);
    }
    this.transitionRules.get(rule.fromZone)!.push(rule);
    console.log(`[ZoneAwareness] Added transition rule: ${key}`);
  }

  /**
   * Set NPC zone preferences
   */
  setNPCZonePreference(preference: NPCZonePreference): void {
    this.npcPreferences.set(preference.npcId, preference);
    console.log(
      `[ZoneAwareness] Set zone preferences for NPC ${preference.npcId}`,
    );
  }

  /**
   * Check if an NPC can move to a specific room
   */
  canNPCMoveToRoom(
    npcId: string,
    npcType: string,
    fromRoom: string,
    toRoom: string,
  ): {
    allowed: boolean;
    reason?: string;
    alternative?: string[];
  } {
    if (!this.config.enableZoneRestrictions) {
      return { allowed: true };
    }

    const fromZone = this.getRoomZone(fromRoom);
    const toZone = this.getRoomZone(toRoom);

    if (!fromZone || !toZone) {
      return { allowed: true, reason: "Zone mapping not found" };
    }

    // Same zone movement is generally allowed
    if (fromZone === toZone) {
      return this.checkIntraZoneMovement(
        npcId,
        npcType,
        fromRoom,
        toRoom,
        fromZone,
      );
    }

    // Cross-zone movement
    if (!this.config.allowCrossZoneMovement) {
      return {
        allowed: false,
        reason: "Cross-zone movement disabled",
        alternative: this.findAlternativeRoomsInZone(fromZone, toRoom),
      };
    }

    return this.checkCrossZoneMovement(
      npcId,
      npcType,
      fromRoom,
      toRoom,
      fromZone,
      toZone,
    );
  }

  /**
   * Get the zone ID for a room
   */
  getRoomZone(roomId: string): string | null {
    const mapping = this.roomZoneMappings.get(roomId);
    return mapping ? mapping.zoneId : null;
  }

  /**
   * Get zone information
   */
  getZoneInfo(zoneId: string): ZoneInfo | null {
    return this.zones.get(zoneId) || null;
  }

  /**
   * Check if NPC type is allowed in zone
   */
  isNPCTypeAllowedInZone(npcType: string, zoneId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) {return true;}

    // Check explicit restrictions first
    if (zone.restrictedNPCTypes.includes(npcType)) {
      return false;
    }

    // If there are explicit allowed types, check them
    if (zone.allowedNPCTypes.length > 0) {
      return zone.allowedNPCTypes.includes(npcType);
    }

    return true;
  }

  /**
   * Get preferred rooms for an NPC based on zone preferences
   */
  getPreferredRoomsForNPC(npcId: string, availableRooms: string[]): string[] {
    const preferences = this.npcPreferences.get(npcId);
    if (!preferences || !this.config.enableBiomeAffinity) {
      return availableRooms;
    }

    const preferredRooms: string[] = [];
    const neutralRooms: string[] = [];

    for (const room of availableRooms) {
      const zone = this.getRoomZone(room);
      if (!zone) {
        neutralRooms.push(room);
        continue;
      }

      if (preferences.cannotEnterZones.includes(zone)) {
        continue; // Skip forbidden zones
      }

      if (preferences.preferredZones.includes(zone)) {
        preferredRooms.push(room);
      } else if (!preferences.avoidedZones.includes(zone)) {
        neutralRooms.push(room);
      }
    }

    // Return preferred rooms first, then neutral rooms
    return [...preferredRooms, ...neutralRooms];
  }

  /**
   * Get zones connected to a specific zone
   */
  getConnectedZones(zoneId: string): string[] {
    const connectedZones = new Set<string>();

    // Find all rooms in this zone that are zone boundaries
    for (const [roomId, mapping] of this.roomZoneMappings.entries()) {
      if (
        mapping.zoneId === zoneId &&
        mapping.isZoneBoundary &&
        mapping.connectedZones
      ) {
        mapping.connectedZones.forEach((zone) => connectedZones.add(zone));
      }
    }

    return Array.from(connectedZones);
  }

  /**
   * Get statistics about zone coverage
   */
  getZoneStats(): {
    totalZones: number;
    mappedRooms: number;
    boundaryRooms: number;
    transitionRules: number;
    npcPreferences: number;
    zonesByBiome: Record<string, number>;
  } {
    const boundaryRooms = Array.from(this.roomZoneMappings.values()).filter(
      (mapping) => mapping.isZoneBoundary,
    ).length;

    const zonesByBiome: Record<string, number> = {};
    for (const zone of this.zones.values()) {
      zonesByBiome[zone.biome] = (zonesByBiome[zone.biome] || 0) + 1;
    }

    const totalTransitionRules = Array.from(
      this.transitionRules.values(),
    ).reduce((sum, rules) => sum + rules.length, 0);

    return {
      totalZones: this.zones.size,
      mappedRooms: this.roomZoneMappings.size,
      boundaryRooms,
      transitionRules: totalTransitionRules,
      npcPreferences: this.npcPreferences.size,
      zonesByBiome,
    };
  }

  /**
   * Clear all zone data
   */
  clear(): void {
    this.zones.clear();
    this.roomZoneMappings.clear();
    this.transitionRules.clear();
    this.npcPreferences.clear();
    this.isInitialized = false;
    console.log("[ZoneAwareness] Cleared all zone data");
  }

  // Private helper methods

  private checkIntraZoneMovement(
    npcId: string,
    npcType: string,
    fromRoom: string,
    toRoom: string,
    zoneId: string,
  ): { allowed: boolean; reason?: string; alternative?: string[] } {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      return { allowed: true };
    }

    // Check if NPC type is allowed in this zone
    if (!this.isNPCTypeAllowedInZone(npcType, zoneId)) {
      return {
        allowed: false,
        reason: `NPC type ${npcType} not allowed in zone ${zone.zoneName}`,
        alternative: this.findAlternativeZones(npcType, zoneId),
      };
    }

    // Check NPC preferences
    const preferences = this.npcPreferences.get(npcId);
    if (preferences && preferences.cannotEnterZones.includes(zoneId)) {
      return {
        allowed: false,
        reason: `NPC ${npcId} cannot enter zone ${zone.zoneName}`,
        alternative: this.findPreferredRoomsNearby(npcId, fromRoom),
      };
    }

    return { allowed: true };
  }

  private checkCrossZoneMovement(
    npcId: string,
    npcType: string,
    fromRoom: string,
    toRoom: string,
    fromZone: string,
    toZone: string,
  ): { allowed: boolean; reason?: string; alternative?: string[] } {
    // Check if transition rule exists
    const rules = this.transitionRules.get(fromZone) || [];
    const applicableRule = rules.find(
      (rule) =>
        rule.toZone === toZone && rule.allowedNPCTypes.includes(npcType),
    );

    if (rules.length > 0 && !applicableRule) {
      return {
        allowed: false,
        reason: `No transition rule allows ${npcType} from ${fromZone} to ${toZone}`,
        alternative: this.findAlternativeRoomsInZone(fromZone, toRoom),
      };
    }

    // Check destination zone restrictions
    if (!this.isNPCTypeAllowedInZone(npcType, toZone)) {
      return {
        allowed: false,
        reason: `NPC type ${npcType} not allowed in destination zone`,
        alternative: this.findAlternativeZones(npcType, toZone),
      };
    }

    // Check NPC preferences for destination zone
    const preferences = this.npcPreferences.get(npcId);
    if (preferences && preferences.cannotEnterZones.includes(toZone)) {
      return {
        allowed: false,
        reason: `NPC ${npcId} cannot enter destination zone`,
        alternative: this.findPreferredRoomsNearby(npcId, fromRoom),
      };
    }

    return { allowed: true };
  }

  private findAlternativeRoomsInZone(
    zoneId: string,
    excludeRoom: string,
  ): string[] {
    const roomsInZone: string[] = [];
    for (const [roomId, mapping] of this.roomZoneMappings.entries()) {
      if (mapping.zoneId === zoneId && roomId !== excludeRoom) {
        roomsInZone.push(roomId);
      }
    }
    return roomsInZone.slice(0, 3); // Return up to 3 alternatives
  }

  private findAlternativeZones(npcType: string, excludeZone: string): string[] {
    const allowedZones: string[] = [];
    for (const [zoneId, zone] of this.zones.entries()) {
      if (
        zoneId !== excludeZone &&
        this.isNPCTypeAllowedInZone(npcType, zoneId)
      ) {
        allowedZones.push(zoneId);
      }
    }
    return allowedZones.slice(0, 3); // Return up to 3 alternatives
  }

  private findPreferredRoomsNearby(npcId: string, fromRoom: string): string[] {
    const preferences = this.npcPreferences.get(npcId);
    if (!preferences) {return [];}

    const nearbyRooms: string[] = [];
    for (const [roomId, mapping] of this.roomZoneMappings.entries()) {
      if (
        roomId !== fromRoom &&
        preferences.preferredZones.includes(mapping.zoneId) &&
        !preferences.cannotEnterZones.includes(mapping.zoneId)
      ) {
        nearbyRooms.push(roomId);
      }
    }
    return nearbyRooms.slice(0, 3); // Return up to 3 alternatives
  }
}

// Global instance management
let globalZoneAwareness: ZoneAwarenessProvider | null = null;

export function getZoneAwarenessProvider(
  config?: Partial<ZoneAwarenessConfig>,
): ZoneAwarenessProvider {
  if (!globalZoneAwareness) {
    globalZoneAwareness = new ZoneAwarenessProvider(config);
  }
  return globalZoneAwareness;
}

export function resetZoneAwarenessProvider(): void {
  globalZoneAwareness = null;
}

// High-level setup functions
export interface ZoneSetupConfig {
  zones: ZoneInfo[];
  roomMappings: RoomZoneMapping[];
  transitionRules?: ZoneTransitionRule[];
  npcPreferences?: NPCZonePreference[];
  config?: Partial<ZoneAwarenessConfig>;
}

export function setupZoneAwareness(setupConfig: ZoneSetupConfig): void {
  const provider = getZoneAwarenessProvider(setupConfig.config);

  provider.initialize();

  // Register zones
  setupConfig.zones.forEach((zone) => provider.registerZone(zone));

  // Map rooms to zones
  setupConfig.roomMappings.forEach((mapping) =>
    provider.mapRoomToZone(mapping),
  );

  // Add transition rules
  if (setupConfig.transitionRules) {
    setupConfig.transitionRules.forEach((rule) =>
      provider.addTransitionRule(rule),
    );
  }

  // Set NPC preferences
  if (setupConfig.npcPreferences) {
    setupConfig.npcPreferences.forEach((pref) =>
      provider.setNPCZonePreference(pref),
    );
  }

  console.log(
    `[ZoneAwareness] Set up zone awareness with ${setupConfig.zones.length} zones and ${setupConfig.roomMappings.length} room mappings`,
  );
}

export function shutdownZoneAwareness(): void {
  const provider = getZoneAwarenessProvider();
  provider.clear();
  resetZoneAwarenessProvider();
  console.log("[ZoneAwareness] Shut down zone awareness system");
}

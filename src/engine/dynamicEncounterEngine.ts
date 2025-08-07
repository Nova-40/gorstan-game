// src/engine/dynamicEncounterEngine.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Dynamic encounter engine for NPC interactions

import React from 'react';
import type { GameAction } from '../types/GameTypes';
import type { LocalGameState } from '../state/gameState';
import type { NPC } from '../types/NPCTypes';
import type { Room } from '../types/Room';

/**
 * Gorstan Dynamic Encounter Engine
 * Core game engine module for dynamic NPC encounters and room events.
 * (c) Geoff Webster 2025
 *
 * This module evaluates, executes, and tracks dynamic encounters between NPCs in rooms.
 * All types are imported as type-only for optimal type safety and build performance.
 */

export const NPC_HIERARCHY = {
  AYLA: { power: 100, id: 'ayla', enforcer: 'albie' },
  MORTHOS: { power: 80, id: 'morthos' },
  AL: { power: 80, id: 'al_escape_artist' },
  POLLY: { power: 80, id: 'polly' },
  WENDELL: { power: 60, id: 'mr_wendell' },
  ALBIE: { power: 70, id: 'albie', role: 'enforcer' },
  DOMINIC: { power: 30, id: 'dominic_wandering', trait: 'unpredictable' }
} as const;

export type EncounterType =
  | 'standoff'
  | 'intervention'
  | 'argument'
  | 'threat'
  | 'ayla_control'
  | 'tension_building'
  | 'dominance_display';

export interface EncounterConfig {
  type: EncounterType;
  participants: string[];
  duration: number;
  effects: {
    healthChange?: number;
    flagChanges?: Record<string, boolean>;
    unlockAchievements?: string[];
    narrativeOutcome?: string;
  };
}

/**
 * Singleton class for managing dynamic encounters between NPCs in rooms.
 */
export class DynamicEncounterEngine {
  private static instance: DynamicEncounterEngine;
  private encounterHistory: Array<{
    roomId: string;
    type: EncounterType;
    participants: string[];
    timestamp: number;
    outcome: string;
  }> = [];
  private activeEncounters: Map<string, EncounterConfig> = new Map();

  private constructor() {}

  public static getInstance(): DynamicEncounterEngine {
    if (!DynamicEncounterEngine.instance) {
      DynamicEncounterEngine.instance = new DynamicEncounterEngine();
    }
    return DynamicEncounterEngine.instance;
  }

  /**
   * Determines the type of encounter based on present NPCs and game state.
   */
  public determineEncounterType(npcs: string[], gameState: LocalGameState): EncounterType | null {
    const flags = gameState.flags || {};
    const playerInventory = gameState.player?.inventory || [];

    if (npcs.includes('ayla')) {
      return 'ayla_control';
    }
    if (npcs.includes('albie') && npcs.some(npc => ['morthos', 'al_escape_artist', 'polly', 'mr_wendell'].includes(npc))) {
      return 'intervention';
    }
    if (npcs.includes('polly') && npcs.includes('dominic_wandering')) {
      if (flags.dominicTaken || flags.playerBetrayedDominic) {
        return 'standoff';
      }
      return 'tension_building';
    }
    if (npcs.includes('mr_wendell')) {
      const hasCursedItems = playerInventory.some(item =>
        ['cursedcoin', 'doomedscroll', 'cursed_artifact'].includes(item.toLowerCase())
      );
      if (hasCursedItems || flags.wasRudeToNPC) {
        return 'threat';
      }
    }
    const equals = ['morthos', 'al_escape_artist', 'polly'].filter(npc => npcs.includes(npc));
    if (equals.length >= 2) {
      return 'argument';
    }

    return npcs.length >= 2 ? 'tension_building' : null;
  }

  /**
   * Evaluates and triggers an encounter if conditions are met.
   */
  public evaluateEncounter(
    roomId: string,
    npcs: string[],
    gameState: LocalGameState,
    dispatch: React.Dispatch<GameAction>
  ): boolean {
    if (npcs.length < 2) return false;

    const encounterType = this.determineEncounterType(npcs, gameState);
    if (!encounterType) return false;

    const encounter = this.buildEncounterConfig(encounterType, npcs, gameState);
    this.executeEncounter(roomId, encounter, gameState, dispatch);
    return true;
  }

  /**
   * Builds a complete encounter configuration based on type and participants.
   */
  private buildEncounterConfig(
    type: EncounterType,
    participants: string[],
    gameState: LocalGameState
  ): EncounterConfig {
    const baseConfig: EncounterConfig = {
      type,
      participants,
      duration: this.getEncounterDuration(type),
      effects: {}
    };

    // Apply type-specific effects
    switch (type) {
      case 'ayla_control':
        baseConfig.effects = {
          flagChanges: { aylaPresent: true, roomTense: false },
          narrativeOutcome: 'Ayla\'s presence brings immediate order to the room.'
        };
        break;
      case 'intervention':
        baseConfig.effects = {
          flagChanges: { albieIntervened: true, conflictResolved: true },
          narrativeOutcome: 'Albie successfully defuses the situation.'
        };
        break;
      case 'standoff':
        baseConfig.effects = {
          healthChange: -5,
          flagChanges: { tensionEscalated: true },
          narrativeOutcome: 'The situation grows increasingly dangerous.'
        };
        break;
      case 'threat':
        baseConfig.effects = {
          healthChange: -10,
          flagChanges: { wendellThreatened: true },
          narrativeOutcome: 'Mr. Wendell\'s menacing presence is unmistakable.'
        };
        break;
      case 'argument':
        baseConfig.effects = {
          flagChanges: { argumentWitnessed: true },
          narrativeOutcome: 'Heated words are exchanged between the NPCs.'
        };
        break;
      case 'tension_building':
        baseConfig.effects = {
          flagChanges: { roomTense: true },
          narrativeOutcome: 'The atmosphere in the room grows noticeably tense.'
        };
        break;
      case 'dominance_display':
        baseConfig.effects = {
          flagChanges: { dominanceShown: true },
          narrativeOutcome: 'Clear hierarchies are established through subtle displays of power.'
        };
        break;
    }

    return baseConfig;
  }

  /**
   * Executes an encounter with full narrative and mechanical effects.
   */
  private executeEncounter(
    roomId: string,
    encounter: EncounterConfig,
    gameState: LocalGameState,
    dispatch: React.Dispatch<GameAction>
  ): void {
    // Record the encounter
    this.recordEncounter(roomId, encounter);

    // Display opening message
    const participantNames = this.getNPCDisplayNames(encounter.participants);
    dispatch({
      type: 'RECORD_MESSAGE',
      payload: {
        id: `encounter-${Date.now()}`,
        text: this.getEncounterOpeningMessage(encounter.type, participantNames),
        type: 'narrative',
        timestamp: Date.now()
      }
    });

    // Execute encounter sequence
    this.executeEncounterSequence(encounter, participantNames, dispatch);

    // Apply effects
    this.applyEncounterEffects(roomId, encounter, gameState, dispatch);

    // Display closing message
    setTimeout(() => {
      dispatch({
        type: 'RECORD_MESSAGE',
        payload: {
          id: `encounter-close-${Date.now()}`,
          text: this.getEncounterClosingMessage(encounter.type),
          type: 'narrative',
          timestamp: Date.now()
        }
      });
    }, encounter.duration * 1000);
  }

  /**
   * Records an encounter in the history log.
   */
  private recordEncounter(roomId: string, encounter: EncounterConfig): void {
    this.encounterHistory.push({
      roomId,
      type: encounter.type,
      participants: encounter.participants,
      timestamp: Date.now(),
      outcome: encounter.effects.narrativeOutcome || 'Unknown outcome'
    });

    // Maintain history size
    if (this.encounterHistory.length > 100) {
      this.encounterHistory = this.encounterHistory.slice(-50);
    }
  }

  /**
   * Executes the encounter sequence with timed messages.
   */
  private executeEncounterSequence(
    encounter: EncounterConfig,
    participants: string[],
    dispatch: React.Dispatch<GameAction>
  ): void {
    const sequences = this.getEncounterSequences(encounter.type, participants);
    
    sequences.forEach((message, index) => {
      setTimeout(() => {
        dispatch({
          type: 'RECORD_MESSAGE',
          payload: {
            id: `encounter-seq-${Date.now()}-${index}`,
            text: message,
            type: 'narrative',
            timestamp: Date.now()
          }
        });
      }, (index + 1) * 1500);
    });
  }

  /**
   * Gets the opening message for an encounter type.
   */
  private getEncounterOpeningMessage(type: EncounterType, participants: string[]): string {
    const participantList = participants.join(', ');
    switch (type) {
      case 'ayla_control':
        return `⚡ The room suddenly falls silent as Ayla enters. ${participantList.replace('Ayla, ', '')} immediately defer to her presence.`;
      case 'standoff':
        return `🌩️ Tension crackles in the air as ${participantList} face each other. This could escalate quickly...`;
      case 'intervention':
        return `🛡️ Albie steps forward with quiet authority. The situation is about to be handled.`;
      case 'threat':
        return `⚠️ Mr. Wendell's eyes narrow dangerously. The air grows thick with menace.`;
      case 'argument':
        return `🔥 Voices rise as ${participantList} engage in heated discussion. You can feel the conflict building.`;
      case 'tension_building':
        return `👁️ Multiple NPCs are present: ${participantList}. The dynamics in the room shift noticeably.`;
      case 'dominance_display':
        return `👑 Power dynamics become apparent as ${participantList} size each other up.`;
      default:
        return `👁️ Multiple NPCs are present: ${participantList}. The dynamics in the room shift noticeably.`;
    }
  }

  /**
   * Gets the sequence of messages for an encounter type.
   */
  private getEncounterSequences(type: EncounterType, participants: string[]): string[] {
    switch (type) {
      case 'ayla_control':
        return [
          "→ Ayla doesn't speak. She doesn't need to.",
          "→ The other NPCs quietly adjust their positions, acknowledging the hierarchy.",
          "→ Order is restored through sheer presence alone."
        ];
      case 'intervention':
        return [
          "→ Albie's calm voice cuts through the tension.",
          "→ 'Everyone needs to take a step back.'",
          "→ The situation de-escalates as cooler heads prevail."
        ];
      case 'standoff':
        return [
          "→ Neither side is willing to back down.",
          "→ The tension reaches a dangerous peak.",
          "→ One wrong word could spark something irreversible."
        ];
      case 'threat':
        return [
          "→ Mr. Wendell's voice drops to a whisper.",
          "→ 'Some mistakes cannot be undone.'",
          "→ The warning hangs heavy in the air."
        ];
      case 'argument':
        return [
          "→ Conflicting viewpoints clash openly.",
          "→ Old grievances surface as voices rise.",
          "→ The disagreement reaches its crescendo before slowly subsiding."
        ];
      case 'tension_building':
        return [
          "→ Subtle glances are exchanged between the NPCs.",
          "→ The atmosphere grows increasingly charged.",
          "→ Something is building, but what?"
        ];
      case 'dominance_display':
        return [
          "→ Unspoken challenges pass between the NPCs.",
          "→ Each tests the other's resolve through subtle gestures.",
          "→ The pecking order becomes clear without words."
        ];
      default:
        return [
          "→ The NPCs interact in complex ways.",
          "→ Relationships and alliances shift subtly.",
          "→ The social dynamics play out before you."
        ];
    }
  }

  /**
   * Applies the mechanical effects of an encounter.
   */
  private applyEncounterEffects(
    roomId: string,
    encounter: EncounterConfig,
    gameState: LocalGameState,
    dispatch: React.Dispatch<GameAction>
  ): void {
    const effects = encounter.effects;

    // Apply health changes
    if (effects.healthChange) {
      const newHealth = Math.max(0, (gameState.player.health || 100) + effects.healthChange);
      dispatch({
        type: 'SET_PLAYER_HEALTH',
        payload: newHealth
      });

      if (effects.healthChange < 0) {
        dispatch({
          type: 'RECORD_MESSAGE',
          payload: {
            id: `health-change-${Date.now()}`,
            text: `You feel affected by the encounter. Health: ${newHealth}`,
            type: 'system',
            timestamp: Date.now()
          }
        });
      }
    }

    // Apply flag changes
    if (effects.flagChanges) {
      Object.entries(effects.flagChanges).forEach(([flag, value]) => {
        dispatch({
          type: 'SET_FLAG',
          payload: { flag, value }
        });
      });
    }

    // Unlock achievements
    if (effects.unlockAchievements) {
      effects.unlockAchievements.forEach(achievement => {
        dispatch({
          type: 'UNLOCK_ACHIEVEMENT',
          payload: achievement
        });
      });
    }

    // Mark encounter as active
    this.activeEncounters.set(roomId, encounter);

    // Auto-clear encounter after duration
    setTimeout(() => {
      this.activeEncounters.delete(roomId);
    }, encounter.duration * 1000);
  }

  /**
   * Gets the closing message for an encounter type.
   */
  private getEncounterClosingMessage(type: EncounterType): string {
    switch (type) {
      case 'ayla_control':
        return "The room settles into a more ordered state.";
      case 'intervention':
        return "Albie's intervention proves effective. The situation is resolved.";
      case 'standoff':
        return "The standoff ends, but the underlying tensions remain.";
      case 'threat':
        return "Mr. Wendell's message has been clearly received.";
      case 'argument':
        return "The argument subsides, but positions have been established.";
      case 'tension_building':
        return "The tension peaks and then gradually subsides.";
      case 'dominance_display':
        return "The power dynamics are now clearly understood by all.";
      default:
        return "The encounter concludes with new understanding among those present.";
    }
  }

  /**
   * Gets display names for NPCs in an encounter.
   */
  private getNPCDisplayNames(npcIds: string[]): string[] {
    const nameMap: Record<string, string> = {
      'ayla': 'Ayla',
      'morthos': 'Morthos',
      'al_escape_artist': 'Al',
      'polly': 'Polly',
      'mr_wendell': 'Mr. Wendell',
      'albie': 'Albie',
      'dominic_wandering': 'Dominic'
    };

    return npcIds.map(id => nameMap[id] || id);
  }

  /**
   * Gets the duration for an encounter type in seconds.
   */
  private getEncounterDuration(type: EncounterType): number {
    switch (type) {
      case 'ayla_control': return 8;
      case 'intervention': return 10;
      case 'standoff': return 15;
      case 'threat': return 12;
      case 'argument': return 18;
      case 'tension_building': return 6;
      case 'dominance_display': return 10;
      default: return 8;
    }
  }

  /**
   * Returns the encounter history log.
   */
  public getEncounterHistory(): typeof this.encounterHistory {
    return this.encounterHistory;
  }

  /**
   * Checks if there is an active encounter in the given room.
   */
  public hasActiveEncounter(roomId: string): boolean {
    return this.activeEncounters.has(roomId);
  }

  /**
   * Gets the active encounter for a room if one exists.
   */
  public getActiveEncounter(roomId: string): EncounterConfig | null {
    return this.activeEncounters.get(roomId) || null;
  }

  /**
   * Clears all active encounters (useful for debugging or resets).
   */
  public clearAllEncounters(): void {
    this.activeEncounters.clear();
  }
}

// Export singleton instance
export const dynamicEncounterEngine = DynamicEncounterEngine.getInstance();

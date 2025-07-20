// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: dynamicEncounterEngine.ts
// Description: Advanced NPC encounter system with hierarchy and tension management

import { LocalGameState } from '../state/gameState';
import { GameAction } from '../types/GameTypes';
import { Room } from '../types/Room';

/**
 * NPC Hierarchy and Power Structure
 */
export const NPC_HIERARCHY = {
  AYLA: { power: 100, id: 'ayla', enforcer: 'albie' },
  EQUALS: {
    MORTHOS: { power: 80, id: 'morthos' },
    AL: { power: 80, id: 'al_escape_artist' },
    POLLY: { power: 80, id: 'polly' }
  },
  WENDELL: { power: 60, id: 'mr_wendell' },
  ALBIE: { power: 70, id: 'albie', role: 'enforcer' }, // Higher than Wendell when Ayla present
  DOMINIC: { power: 30, id: 'dominic_wandering', trait: 'unpredictable' }
} as const;

/**
 * NPC Encounter Types
 */
export type EncounterType = 
  | 'standoff' 
  | 'intervention' 
  | 'argument' 
  | 'threat' 
  | 'silence' 
  | 'dominance_display'
  | 'tension_building'
  | 'ayla_control';

/**
 * Dynamic Encounter Configuration
 */
interface EncounterConfig {
  type: EncounterType;
  participants: string[];
  duration: number;
  effects: {
    healthChange?: number;
    flagChanges?: Record<string, any>;
    unlockAchievements?: string[];
    narrativeOutcome?: string;
  };
}

/**
 * Enhanced Dynamic Encounter Engine
 */
export class DynamicEncounterEngine {
  private static instance: DynamicEncounterEngine;
  private activeEncounters: Map<string, EncounterConfig> = new Map();
  private encounterHistory: Array<{
    roomId: string;
    type: EncounterType;
    participants: string[];
    timestamp: number;
    outcome: string;
  }> = [];

  public static getInstance(): DynamicEncounterEngine {
    if (!DynamicEncounterEngine.instance) {
      DynamicEncounterEngine.instance = new DynamicEncounterEngine();
    }
    return DynamicEncounterEngine.instance;
  }

  /**
   * Evaluate and trigger multi-NPC encounters
   */
  public evaluateEncounter(
    roomId: string,
    presentNPCs: string[],
    gameState: LocalGameState,
    dispatch: React.Dispatch<GameAction>
  ): EncounterConfig | null {
    // Skip single NPC or empty encounters
    if (presentNPCs.length < 2) return null;

    // Skip if encounter already active in this room
    if (this.activeEncounters.has(roomId)) return null;

    // Determine encounter type based on NPC combination and game state
    const encounterType = this.determineEncounterType(presentNPCs, gameState);
    if (!encounterType) return null;

    const encounter = this.createEncounter(encounterType, presentNPCs, gameState);
    this.activeEncounters.set(roomId, encounter);

    // Execute the encounter
    this.executeEncounter(roomId, encounter, gameState, dispatch);

    return encounter;
  }

  /**
   * Determine the type of encounter based on NPCs present and game state
   */
  private determineEncounterType(npcs: string[], gameState: LocalGameState): EncounterType | null {
    const flags = gameState.flags || {};
    const playerInventory = gameState.player?.inventory || [];

    // Ayla present - she controls everything
    if (npcs.includes('ayla')) {
      return 'ayla_control';
    }

    // Albie as enforcer without Ayla
    if (npcs.includes('albie') && npcs.some(npc => ['morthos', 'al_escape_artist', 'polly', 'mr_wendell'].includes(npc))) {
      return 'intervention';
    }

    // Polly vs Dominic tension (especially if player took Dominic)
    if (npcs.includes('polly') && npcs.includes('dominic_wandering')) {
      if (flags.dominicTaken || flags.playerBetrayedDominic) {
        return 'standoff';
      }
      return 'tension_building';
    }

    // Mr. Wendell with others (tension based on player behavior)
    if (npcs.includes('mr_wendell')) {
      const hasCursedItems = playerInventory.some(item => 
        ['cursedcoin', 'doomedscroll', 'cursed_artifact'].includes(item.toLowerCase())
      );
      
      if (hasCursedItems || flags.wasRudeToNPC) {
        return 'threat';
      }
    }

    // Power equals together (Morthos, Al, Polly)
    const equals = ['morthos', 'al_escape_artist', 'polly'].filter(npc => npcs.includes(npc));
    if (equals.length >= 2) {
      // Check for past conflicts
      if (flags.npcConflictHistory) {
        return 'argument';
      }
      return 'dominance_display';
    }

    // Default tension for any multi-NPC scenario
    if (npcs.length >= 2) {
      return 'tension_building';
    }

    return null;
  }

  /**
   * Create encounter configuration
   */
  private createEncounter(
    type: EncounterType, 
    participants: string[], 
    gameState: LocalGameState
  ): EncounterConfig {
    const baseConfig: EncounterConfig = {
      type,
      participants,
      duration: 3000, // 3 seconds base
      effects: {}
    };

    switch (type) {
      case 'ayla_control':
        return {
          ...baseConfig,
          duration: 2000,
          effects: {
            flagChanges: { aylaPresent: true, npcTension: false },
            narrativeOutcome: 'ayla_dominance'
          }
        };

      case 'standoff':
        return {
          ...baseConfig,
          duration: 5000,
          effects: {
            healthChange: -5,
            flagChanges: { npcTension: true, standoffOccurred: true },
            narrativeOutcome: 'dangerous_tension'
          }
        };

      case 'intervention':
        return {
          ...baseConfig,
          duration: 4000,
          effects: {
            flagChanges: { albieIntervention: true, situationDefused: true },
            narrativeOutcome: 'albie_enforcer'
          }
        };

      case 'threat':
        return {
          ...baseConfig,
          duration: 4500,
          effects: {
            healthChange: -10,
            flagChanges: { wendellThreat: true },
            unlockAchievements: ['wendell_encounter'],
            narrativeOutcome: 'wendell_warning'
          }
        };

      case 'argument':
        return {
          ...baseConfig,
          duration: 6000,
          effects: {
            flagChanges: { npcArgument: true, witnessedConflict: true },
            narrativeOutcome: 'heated_exchange'
          }
        };

      default:
        return baseConfig;
    }
  }

  /**
   * Execute the encounter with visual and narrative elements
   */
  private executeEncounter(
    roomId: string,
    encounter: EncounterConfig,
    gameState: LocalGameState,
    dispatch: React.Dispatch<GameAction>
  ): void {
    const participantNames = this.getNPCDisplayNames(encounter.participants);

    // Initial encounter message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        text: this.getEncounterOpeningMessage(encounter.type, participantNames),
        type: 'encounter',
        timestamp: Date.now()
      }
    });

    // Animated sequence
    this.playEncounterSequence(encounter, participantNames, dispatch);

    // Apply effects after duration
    setTimeout(() => {
      this.applyEncounterEffects(roomId, encounter, gameState, dispatch);
    }, encounter.duration);
  }

  /**
   * Play animated encounter sequence
   */
  private playEncounterSequence(
    encounter: EncounterConfig,
    participants: string[],
    dispatch: React.Dispatch<GameAction>
  ): void {
    const sequences = this.getEncounterSequences(encounter.type, participants);
    
    sequences.forEach((message, index) => {
      setTimeout(() => {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            text: message,
            type: 'encounter_sequence',
            timestamp: Date.now()
          }
        });
      }, (index + 1) * 800); // Staggered messages
    });
  }

  /**
   * Get opening message for encounter
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
      
      default:
        return `👁️ Multiple NPCs are present: ${participantList}. The dynamics in the room shift noticeably.`;
    }
  }

  /**
   * Get encounter sequence messages
   */
  private getEncounterSequences(type: EncounterType, participants: string[]): string[] {
    switch (type) {
      case 'ayla_control':
        return [
          "→ Ayla doesn't speak. She doesn't need to.",
          "→ Everyone in the room understands the hierarchy perfectly.",
          "✨ Order is restored with just her presence."
        ];

      case 'standoff':
        return [
          "→ The air grows thick with unspoken threats.",
          "→ Hands hover near weapons. Words hang unfinished.",
          "⚡ One wrong move could shatter this fragile peace."
        ];

      case 'intervention':
        return [
          "→ Albie's calm voice cuts through the tension.",
          "→ 'That's enough.' The authority in those words is absolute.",
          "🛡️ The situation de-escalates under Albie's watchful gaze."
        ];

      case 'threat':
        return [
          "→ Mr. Wendell steps closer, his presence oppressive.",
          "→ 'You should be more careful,' he whispers.",
          "💀 The threat hangs in the air like a curse."
        ];

      default:
        return [
          "→ The NPCs acknowledge each other's presence.",
          "→ Unspoken communication passes between them.",
          "👁️ You sense you're witnessing something significant."
        ];
    }
  }

  /**
   * Apply encounter effects to game state
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
      dispatch({
        type: 'CHANGE_PLAYER_HEALTH',
        payload: effects.healthChange
      });

      const healthMessage = effects.healthChange > 0 
        ? `💚 You feel energized by the encounter (+${effects.healthChange} health)`
        : `💔 The tension takes its toll on you (${effects.healthChange} health)`;

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          text: healthMessage,
          type: 'system',
          timestamp: Date.now()
        }
      });
    }

    // Apply flag changes
    if (effects.flagChanges) {
      Object.entries(effects.flagChanges).forEach(([key, value]) => {
        dispatch({
          type: 'SET_FLAG',
          payload: { key, value }
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

    // Add to encounter history
    this.encounterHistory.push({
      roomId,
      type: encounter.type,
      participants: encounter.participants,
      timestamp: Date.now(),
      outcome: effects.narrativeOutcome || 'unknown'
    });

    // Clear active encounter
    this.activeEncounters.delete(roomId);

    // Final narrative message
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        text: this.getEncounterClosingMessage(encounter.type),
        type: 'encounter_end',
        timestamp: Date.now()
      }
    });
  }

  /**
   * Get closing message for encounter
   */
  private getEncounterClosingMessage(type: EncounterType): string {
    switch (type) {
      case 'ayla_control':
        return "✨ Ayla's presence lingers even as the moment passes. Order has been established.";
      
      case 'standoff':
        return "🌩️ The tension slowly dissipates, but the memory of this moment will linger.";
      
      case 'intervention':
        return "🛡️ Albie's intervention was swift and effective. The situation is under control.";
      
      case 'threat':
        return "💀 Mr. Wendell's warning echoes in your mind. Some lines should not be crossed.";
      
      default:
        return "👁️ The encounter concludes, leaving you with much to consider.";
    }
  }

  /**
   * Get display names for NPCs
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
   * Get encounter history for debugging
   */
  public getEncounterHistory(): typeof this.encounterHistory {
    return this.encounterHistory;
  }

  /**
   * Check if room has active encounter
   */
  public hasActiveEncounter(roomId: string): boolean {
    return this.activeEncounters.has(roomId);
  }
}

// Module: src/types/MiniquestTypes.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

/**
 * Types for the miniquest system that provides optional challenges and flavor content
 */

export type MiniquestType = 'dynamic' | 'structured' | 'puzzle' | 'social' | 'exploration';

export interface Miniquest {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: MiniquestType;
  readonly rewardPoints: number;
  readonly flagOnCompletion: string;
  readonly requiredItems?: string[];
  readonly requiredConditions?: string[];
  readonly triggerAction?: string;
  readonly triggerText?: string;
  readonly hint?: string;
  readonly repeatable?: boolean;
  readonly timeLimit?: number; // in seconds
  readonly difficulty?: 'trivial' | 'easy' | 'medium' | 'hard';
}

export interface MiniquestProgress {
  readonly questId: string;
  readonly completed: boolean;
  readonly attempts: number;
  readonly startTime?: number;
  readonly completionTime?: number;
  readonly lastAttempt?: number;
}

export interface MiniquestState {
  readonly [roomId: string]: {
    readonly availableQuests: string[];
    readonly completedQuests: string[];
    readonly activeQuests: string[];
    readonly questProgress: { readonly [questId: string]: MiniquestProgress };
  };
}

export interface MiniquestResult {
  readonly success: boolean;
  readonly message: string;
  readonly scoreAwarded?: number;
  readonly itemsAwarded?: string[];
  readonly flagsSet?: string[];
  readonly completed?: boolean;
}

export interface RoomMiniquests {
  readonly roomId: string;
  readonly miniquests: readonly Miniquest[];
}

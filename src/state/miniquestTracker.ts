// src/state/miniquestTracker.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

type QuestState = 'active' | 'completed' | 'failed';

interface MiniquestRecord {
  [questId: string]: QuestState;
}

let quests: MiniquestRecord = {};

export const startQuest = (id: string) => {
  quests[id] = 'active';
};

export const completeQuest = (id: string) => {
  if (quests[id]) quests[id] = 'completed';
};

export const failQuest = (id: string) => {
  if (quests[id]) quests[id] = 'failed';
};

export const getQuestStatus = (id: string): QuestState | undefined => quests[id];

export const resetQuests = () => {
  quests = {};
};

export const getAllQuests = (): MiniquestRecord => ({ ...quests });

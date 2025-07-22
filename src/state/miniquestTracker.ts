

// src/state/miniquestTracker.ts
// Gorstan Game (c) Geoff Webster 2025
// Code MIT Licence
// Manages state of all miniquests across rooms

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

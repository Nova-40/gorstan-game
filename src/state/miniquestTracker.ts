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

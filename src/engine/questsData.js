/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Static quest data and objectives.
 */

// questsData.js – Gorstan Quest Definitions
// (c) Geoff Webster – Modular Quest Data

const quests = {
  awakenArchitect: {
    id: 'awakenArchitect',
    title: 'Awaken the Architect',
    description: 'Find the Folded Note, speak with Ayla, solve the mirror puzzle, and enter the Control Room.',
    steps: [
      { id: 'foldedNote', description: 'Collect the Folded Note from Central Park', complete: false },
      { id: 'speakAyla', description: 'Speak to Ayla in Findlaters Café', complete: false },
      { id: 'mirrorSolved', description: 'Solve the mirror puzzle in Rhiannon’s Quarters', complete: false },
      { id: 'enterControl', description: 'Enter the Control Room with Premium Token', complete: false }
    ],
    reward: {
      item: 'Lattice Fragment',
      score: 20,
      codexUnlocks: ['Ayla', 'lattice']
    },
    completed: false // Track overall quest completion
  },
  mercyRises: {
    id: 'mercyRises',
    title: 'Mercy Rises',
    description: 'Help Mercy reclaim her place by guiding her through the Fae trials.',
    steps: [
      { id: 'faeHall', description: 'Access Fae Hall via Fae Palace', complete: false },
      { id: 'crownShard', description: 'Retrieve the Fae Crown Shard', complete: false },
      { id: 'teaChoice', description: 'Drink the tea and pass her test', complete: false }
    ],
    reward: {
      item: 'Veil Sigil',
      score: 25,
      codexUnlocks: ['Mercy']
    },
    completed: false // Track overall quest completion
  }
};

// Add default values for missing properties
Object.values(quests).forEach((quest) => {
  quest.reward = quest.reward || { item: null, score: 0, codexUnlocks: [] };
  quest.steps.forEach((step) => {
    step.complete = step.complete || false;
  });
});

// Utility to validate quests
function validateQuest(quest) {
  if (!quest.id || typeof quest.id !== 'string') {
    console.error(`Quest is missing a valid 'id':`, quest);
    return false;
  }
  if (!quest.title || typeof quest.title !== 'string') {
    console.error(`Quest '${quest.id}' is missing a valid 'title':`, quest);
    return false;
  }
  if (!quest.description || typeof quest.description !== 'string') {
    console.error(`Quest '${quest.id}' is missing a valid 'description':`, quest);
    return false;
  }
  if (!Array.isArray(quest.steps) || quest.steps.length === 0) {
    console.error(`Quest '${quest.id}' is missing valid 'steps':`, quest);
    return false;
  }
  for (const step of quest.steps) {
    if (!step.id || typeof step.id !== 'string') {
      console.error(`Step in quest '${quest.id}' is missing a valid 'id':`, step);
      return false;
    }
    if (!step.description || typeof step.description !== 'string') {
      console.error(`Step '${step.id}' in quest '${quest.id}' is missing a valid 'description':`, step);
      return false;
    }
    if (typeof step.complete !== 'boolean') {
      console.error(`Step '${step.id}' in quest '${quest.id}' has an invalid 'complete' value:`, step);
      return false;
    }
  }
  return true;
}

// Validate all quests on load
Object.values(quests).forEach((quest) => {
  if (!validateQuest(quest)) {
    console.warn(`Invalid quest detected:`, quest);
  }
});

// Utility to mark a step as complete
export function markStepComplete(questId, stepId) {
  const quest = quests[questId];
  if (!quest) {
    console.error(`Quest with ID '${questId}' not found.`);
    return false;
  }
  const step = quest.steps.find((s) => s.id === stepId);
  if (!step) {
    console.error(`Step with ID '${stepId}' not found in quest '${questId}'.`);
    return false;
  }
  step.complete = true;

  // Update quest completion status
  quest.completed = quest.steps.every((s) => s.complete);
  return true;
}

// Utility to check if a quest is complete
export function isQuestComplete(questId) {
  const quest = quests[questId];
  if (!quest) {
    console.error(`Quest with ID '${questId}' not found.`);
    return false;
  }
  return quest.completed;
}

export default quests;
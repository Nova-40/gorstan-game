/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Handles quest states and logic.
 */

// quests.js – Modular Quest Logic
// (c) Geoff Webster – Gorstan Chronicles Game Engine, 2025

export function evaluateQuestProgress({ quests, location, inventory, puzzleAnswer, room, codex, notify, setInventory, setScore }) {
  const updatedQuests = { ...quests };

  // Helper function to check if a step is complete
  const isStepComplete = (step) => {
    switch (step.id) {
      case 'foldedNote':
        return location === 'Central Park' && inventory.includes('Folded Note');
      case 'speakAyla':
        return location === 'Findlaters Cafe';
      case 'mirrorSolved':
        return puzzleAnswer !== null;
      case 'enterControl':
        return location === 'Control Room' && inventory.includes('Premium Token');
      case 'faeHall':
        return location === 'Fae Hall';
      case 'crownShard':
        return inventory.includes('Fae Crown Shard');
      case 'teaChoice':
        return room.event === 'mercyTea';
      default:
        return false;
    }
  };

  Object.values(updatedQuests).forEach((quest) => {
    let wasIncomplete = false;

    // Update quest steps
    quest.steps = quest.steps.map((step) => {
      if (!step.complete && isStepComplete(step)) {
        wasIncomplete = true;
        return { ...step, complete: true };
      }
      return step;
    });

    // If the quest was incomplete and is now complete, handle rewards
    if (wasIncomplete && quest.steps.every((s) => s.complete)) {
      // Unlock codex entries
      if (codex?.characters) {
        quest.reward.codexUnlocks.forEach((id) => {
          if (codex.characters[id] && !codex.characters[id].unlocked) {
            codex.characters[id].unlocked = true;
            notify(`Codex Unlocked: ${codex.characters[id].title}`);
          }
        });
      }
      if (codex?.lore) {
        quest.reward.codexUnlocks.forEach((id) => {
          if (codex.lore[id] && !codex.lore[id].unlocked) {
            codex.lore[id].unlocked = true;
            notify(`Lore Unlocked: ${codex.lore[id].title}`);
          }
        });
      }

      // Add reward item to inventory
      if (quest.reward.item && !inventory.includes(quest.reward.item)) {
        setInventory([...inventory, quest.reward.item]);
        notify(`Item Gained: ${quest.reward.item}`);
      }

      // Update score
      setScore((prev) => prev + quest.reward.score);

      // Notify quest completion
      notify(`${quest.title} completed!`);
    }
  });

  return updatedQuests;
}


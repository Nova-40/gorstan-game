// quests.js – Modular Quest Logic
// (c) Geoff Webster – Gorstan Chronicles Game Engine, 2025

export function evaluateQuestProgress({ quests, location, inventory, puzzleAnswer, room, codex, notify, setInventory, setScore }) {
  const updatedQuests = { ...quests };

  Object.values(updatedQuests).forEach((quest) => {
    let wasIncomplete = false;
    quest.steps.forEach((step) => {
      if (!step.complete) {
        if (
          (step.id === 'foldedNote' && location === 'Central Park' && inventory.includes('Folded Note')) ||
          (step.id === 'speakAyla' && location === 'Findlaters Cafe') ||
          (step.id === 'mirrorSolved' && puzzleAnswer !== null) ||
          (step.id === 'enterControl' && location === 'Control Room' && inventory.includes('Premium Token')) ||
          (step.id === 'faeHall' && location === 'Fae Hall') ||
          (step.id === 'crownShard' && inventory.includes('Fae Crown Shard')) ||
          (step.id === 'teaChoice' && room.event === 'mercyTea')
        ) {
          step.complete = true;
          wasIncomplete = true;
        }
      }
    });

    if (wasIncomplete && quest.steps.every(s => s.complete)) {
      quest.reward.codexUnlocks.forEach(id => {
        if (codex.characters[id] && !codex.characters[id].unlocked) {
          codex.characters[id].unlocked = true;
          notify(`Codex Unlocked: ${codex.characters[id].title}`);
        }
        if (codex.lore[id] && !codex.lore[id].unlocked) {
          codex.lore[id].unlocked = true;
          notify(`Lore Unlocked: ${codex.lore[id].title}`);
        }
      });
      if (!inventory.includes(quest.reward.item)) {
        setInventory([...inventory, quest.reward.item]);
        notify(`Item Gained: ${quest.reward.item}`);
      }
      setScore(prev => prev + quest.reward.score);
      notify(`${quest.title} completed!`);
    }
  });

  return updatedQuests;
}


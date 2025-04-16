/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Manages and validates game items and inventory.
 */

// items.js – Gorstan Game Items
// (c) Geoff Webster – Gorstan Chronicles Game Engine, 2025

/**
 * Item definitions for the Gorstan game.
 * Each item has:
 * - id: unique identifier
 * - name: display name
 * - description: lore or tooltip text
 * - effect: high-level description of use
 * - singleUse: whether it disappears after use/pickup
 */
const items = {
  premiumToken: {
    id: 'premiumToken',
    name: 'Premium Token',
    description: 'A shimmering crystal used to access premium realms.',
    effect: 'Unlocks premiumOnly rooms and interactions',
    singleUse: false
  },
  foldedNote: {
    id: 'foldedNote',
    name: 'Folded Note',
    description: 'A mysterious note with cryptic instructions.',
    effect: 'Triggers specific quest steps when collected',
    singleUse: true
  },
  faeCrownShard: {
    id: 'faeCrownShard',
    name: 'Fae Crown Shard',
    description: 'A fragment of the Fae Crown, glowing with ancient power.',
    effect: 'Required to complete the Fae trials',
    singleUse: false
  },
  coffee: {
    id: 'coffee',
    name: 'Cup of Coffee',
    description: 'A steaming cup of coffee. Smells amazing.',
    effect: 'Collect all to receive a bonus.',
    singleUse: true
  }
};

/**
 * Validates the structure of a single item.
 * Ensures all required properties are present and correct type.
 */
function validateItem(item) {
  if (!item.id || typeof item.id !== 'string') {
    console.error(`Item is missing a valid 'id':`, item);
    return false;
  }
  if (!item.name || typeof item.name !== 'string') {
    console.error(`Item '${item.id}' is missing a valid 'name':`, item);
    return false;
  }
  if (!item.description || typeof item.description !== 'string') {
    console.error(`Item '${item.id}' is missing a valid 'description':`, item);
    return false;
  }
  if (!item.effect || typeof item.effect !== 'string') {
    console.error(`Item '${item.id}' is missing a valid 'effect':`, item);
    return false;
  }
  if (typeof item.singleUse !== 'boolean') {
    console.error(`Item '${item.id}' has an invalid 'singleUse' value:`, item);
    return false;
  }
  return true;
}

// Validate all items at module load (console warns if any are misconfigured)
Object.values(items).forEach((item) => {
  if (!validateItem(item)) {
    console.warn(`Invalid item detected:`, item);
  }
});

/**
 * Utility to retrieve an item object by ID.
 * @param {string} id - The item's unique ID.
 * @returns {object|null} - The item definition, or null if not found.
 */
export function getItemById(id) {
  return items[id] || null;
}

/**
 * Handles item pickup logic:
 * - Adds to inventory
 * - Removes from room if single use
 * - Triggers any special effects (e.g. coffee collection bonus)
 *
 * @param {object} params - Parameter object for injection
 */
export function handleItemPickup({
  currentRoom,
  rooms,
  inventory,
  setInventory,
  notify,
  setScore,
  score,
  highScore,
  setHighScore
}) {
  const itemId = rooms[currentRoom]?.item;
  const item = getItemById(itemId);

  if (item && !inventory.includes(item.id)) {
    // Add to inventory
    const newInventory = [...inventory, item.id];
    setInventory(newInventory);
    notify(`You pick up the ${item.name}.`);

    // Remove item from room if it's single use
    if (item.singleUse) {
      rooms[currentRoom].item = null;
    }

    // Special handling for coffee bonus
    if (item.id === 'coffee') {
      const totalCoffee = Object.values(rooms).filter(r => r.item === 'coffee').length;
      const collectedCoffee = newInventory.filter(i => i === 'coffee').length;
      if (collectedCoffee === totalCoffee && totalCoffee <= 8) {
        notify("You've collected all the coffee cups in the multiverse. You feel deeply caffeinated.");
        const newScore = score + 20;
        setScore(newScore);
        if (newScore > highScore) setHighScore(newScore);
      }
    }

    // 🔮 Hook in additional item-specific logic here if needed
    // e.g., quest triggers, room unlocks, flags
  }
}

export default items;

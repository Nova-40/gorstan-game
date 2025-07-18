// Version: 6.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: inventoryRules.ts
// Path: src/utils/inventoryRules.ts

/**
 * attemptPickup
 * Attempts to add an item to the player's inventory, enforcing inventory limits and runbag logic.
 *
 * @param {string} item - The item to pick up.
 * @param {Object} state - The current game state (must include inventory array).
 * @param {Function} dispatch - Function to update game state.
 * @param {Function} dispatchMessage - Function to dispatch UI messages.
 */
export function attemptPickup(
  item: string,
  state: { inventory: string[] },
  dispatch: (action: { type: string; payload: any }) => void,
  dispatchMessage: (action: { type: string; payload: { text: string; type: string } }) => void
): void {
      
  if (state.inventory.includes(item)) {
    pushConsoleMessage(dispatchMessage, `You already have the ${item}.`, 'error');
    return;
  }

  if (state.inventory.length >= limit) {
    if (hasRunbag && state.inventory.length >= 12) {
      if (Math.random() < 0.05) {
        dispatch({ type: 'SET', payload: { inventory: [] } });
        pushConsoleMessage(dispatchMessage, `The runbag bursts spectacularly. Your belongings scatter into the void.`, 'error');
      } else {
        pushConsoleMessage(dispatchMessage, `There is no more room in your bag.`, 'error');
      }
    } else {
      dispatch({ type: 'SET', payload: { inventory: [] } });
      pushConsoleMessage(dispatchMessage, `Your pockets rip under the strain. Everything falls to the floor.`, 'error');
    }
    return;
  }

  dispatch({ type: 'SET', payload: { inventory: newInventory } });
  pushConsoleMessage(dispatchMessage, `You pick up the ${item}.`, 'success');
}

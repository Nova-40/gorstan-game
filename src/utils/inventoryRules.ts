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

// --- Function: attemptPickup ---
export function attemptPickup(
  item: string,
  state: { inventory: string[] },
  dispatch: (action: { type: string; payload: any }) => void,
  dispatchMessage: (action: { type: string; payload: { text: string; type: string } }) => void
): void {

  if (state.inventory.includes(item)) {
    dispatchMessage({ type: 'ADD_MESSAGE', payload: { text: `You already have the ${item}.`, type: 'error' } });
    return;
  }

  const hasRunbag = state.inventory.includes('runbag');
  const limit = hasRunbag ? 12 : 8;

  if (state.inventory.length >= limit) {
    if (hasRunbag && state.inventory.length >= 12) {
      if (Math.random() < 0.05) {
        dispatch({ type: 'SET_INVENTORY', payload: [] });
        dispatchMessage({ type: 'ADD_MESSAGE', payload: { text: `The runbag bursts spectacularly. Your belongings scatter into the void.`, type: 'error' } });
      } else {
        dispatchMessage({ type: 'ADD_MESSAGE', payload: { text: `There is no more room in your bag.`, type: 'error' } });
      }
    } else {
      dispatch({ type: 'SET_INVENTORY', payload: [] });
      dispatchMessage({ type: 'ADD_MESSAGE', payload: { text: `Your pockets rip under the strain. Everything falls to the floor.`, type: 'error' } });
    }
    return;
  }

  const newInventory = [...state.inventory, item];
  dispatch({ type: 'SET_INVENTORY', payload: newInventory });
  dispatchMessage({ type: 'ADD_MESSAGE', payload: { text: `You pick up the ${item}.`, type: 'success' } });
}

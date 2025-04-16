/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Parses and routes player commands.
 */

export default function parseCommand(input, { currentRoom, dispatch, notify, inventory }) {
  input = input.trim().toLowerCase();

  if (input === 'open briefcase') {
    if (!inventory.includes('briefcase')) {
      notify("You don’t seem to have a briefcase.");
      return;
    }
    dispatch({ type: 'SET_FLAG', payload: { key: 'briefcasePuzzleActive', value: true } });
    return;
  }

  if (input === 'throw coffee') {
    if (['controlroom', 'resetroom', 'observationdeck'].includes(currentRoom.toLowerCase())) {
      notify("You throw your coffee against the wall. It steams, sizzles… and a hidden door appears!");
      dispatch({ type: 'REVEAL_SECRET_TUNNEL' });
    } else {
      notify("You throw your coffee... it splashes unceremoniously. Nothing happens.");
    }
    return;
  }

  notify("Nothing happens. Try a different command.");
}

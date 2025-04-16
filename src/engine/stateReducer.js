/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Reducer function for managing game state with useReducer.
 */

// stateReducer.js – Central Game State Management (useReducer)
// (c) Geoff Webster – MIT Licensed

export const initialState = {
  currentRoom: 'crossing',
  inventory: [],
  score: 0,
  visitedRooms: {},
  flags: {
    latticePuzzleSolved: false,
    secretTunnel: false
  }
};

export function gameReducer(state, action) {
  switch (action.type) {
    case 'MOVE_ROOM':
      return {
        ...state,
        currentRoom: action.payload,
        visitedRooms: {
          ...state.visitedRooms,
          [action.payload]: (state.visitedRooms[action.payload] || 0) + 1
        }
      };
    case 'ADD_ITEM':
      if (state.inventory.includes(action.payload)) return state;
      return {
        ...state,
        inventory: [...state.inventory, action.payload]
      };
    case 'SET_FLAG':
      return {
        ...state,
        flags: {
          ...state.flags,
          [action.payload.key]: action.payload.value
        }
      };
    case 'REVEAL_SECRET_TUNNEL':
      return {
        ...state,
        flags: {
          ...state.flags,
          secretTunnel: true
        }
      };
    default:
      return state;
  }
}


// ...existing imports and setup
const initialState = {
  // existing state properties
  resetButtonPresses: 0,
  showLoadingBar: false,
  // ...
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_RESET_BUTTON_PRESSES':
      return { ...state, resetButtonPresses: action.payload };
    case 'SHOW_LOADING_BAR':
      return { ...state, showLoadingBar: action.payload };
    // existing cases...
    default:
      return state;
  }
}

export { initialState, reducer };

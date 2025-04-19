
// Add to RoomRenderer.jsx or appropriate room interaction file
function handleResetButtonPress(dispatch, state) {
  const presses = state.resetButtonPresses || 0;

  if (presses === 0) {
    dispatch({ type: 'SHOW_MESSAGE', payload: 'Do not push this again.' });
  } else if (presses === 1) {
    dispatch({ type: 'SHOW_MESSAGE', payload: 'Warning: Pushing this button again may reset the multiverse.' });
  } else if (presses === 2) {
    dispatch({ type: 'SHOW_MESSAGE', payload: 'Beginning multiversal reset countdown...' });
    dispatch({ type: 'TRIGGER_GLITCH_EFFECT' });

    setTimeout(() => {
      dispatch({ type: 'SHOW_MESSAGE', payload: 'Please hold on. Multiverse is now resetting.' });
      dispatch({ type: 'SHOW_LOADING_BAR', payload: true });

      setTimeout(() => {
        dispatch({ type: 'RESET_GAME' });
      }, 3000);
    }, 3000);
  }

  dispatch({ type: 'SET_RESET_BUTTON_PRESSES', payload: presses + 1 });
}

// Inside render:
{state.showLoadingBar && (
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
    <p className="text-xl font-bold">Please hold on. Multiverse is now resetting.</p>
    <div className="w-64 h-4 bg-gray-300 rounded-full mt-4">
      <div className="h-4 bg-blue-500 rounded-full animate-pulse w-full"></div>
    </div>
  </div>
)}

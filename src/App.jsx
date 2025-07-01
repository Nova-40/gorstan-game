import React from 'react';
import AppCore from './components/AppCore';
import { GlobalErrorProvider } from './context/GlobalErrorContext';

/**
 * App
 * Root component for the Gorstan application.
 * Wraps the main AppCore in a global error context provider to handle uncaught errors gracefully.
 *
 * @returns {JSX.Element}
 */
function App() {
  return (
    <GlobalErrorProvider>
      <AppCore />
    </GlobalErrorProvider>
  );
}

// Export the App component for use in index.js or main entry point
export default App;

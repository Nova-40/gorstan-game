import React from 'react';
import AppCore from './components/AppCore';
import { GlobalErrorProvider } from './context/GlobalErrorContext';

function App() {
  return (
    <GlobalErrorProvider>
      <AppCore />
    </GlobalErrorProvider>
  );
}

export default App;

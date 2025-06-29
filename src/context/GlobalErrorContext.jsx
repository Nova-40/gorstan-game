import React, { createContext, useState, useContext } from "react";

const GlobalErrorContext = createContext();

export function useGlobalError() {
  return useContext(GlobalErrorContext);
}

export function GlobalErrorProvider({ children }) {
  const [error, setError] = useState(null);
  return (
    <GlobalErrorContext.Provider value={{ error, setError }}>
      {error ? (
        <div className="global-error" style={{ padding: '2rem', color: 'red' }}>
          <h2>🚨 Oops, something broke</h2>
          <pre>{error}</pre>
          <p>Check the developer console for clues or try resetting the game.</p>
        </div>
      ) : (
        children
      )}
    </GlobalErrorContext.Provider>
  );
}

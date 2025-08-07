// src/main.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import './tailwind.css';

import App from './App';

import React from 'react';

import { createRoot } from 'react-dom/client';













console.log("🔥 Gorstan main.tsx executing...");

// Variable declaration
const rootElement = document.getElementById('root');
// Variable declaration
const errorMessage = "Root element not found. Is index.html missing a <div id='root'>?";

if (!rootElement) {
  console.error('[Gorstan]', errorMessage);

  document.body.innerHTML = `
    <div style="
      font-family: 'Courier New', monospace;
      background: #000;
      color: #00ff00;
      padding: 20px;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    ">
      <div>
        <h1>GORSTAN INITIALIZATION ERROR</h1>
        <p>${errorMessage}</p>
        <p>Please check your HTML template and try again.</p>
      </div>
    </div>
  `;
  throw new Error(errorMessage);
}


// Variable declaration
const root = createRoot(rootElement);
root.render(<App />);

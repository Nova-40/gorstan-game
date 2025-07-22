import './tailwind.css';

import App from './App';

import React from 'react';

import { createRoot } from 'react-dom/client';



// main.tsx — main.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: main

// Module: src/main.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence


console.log("🔥 Gorstan main.tsx executing...");

const rootElement = document.getElementById('root');
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

// ✅ This now runs normally if root element is found
const root = createRoot(rootElement);
root.render(<App />);


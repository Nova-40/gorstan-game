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

// src/config.ts
// Global configuration for Gorstan Game Beta 1

export const config = {
  // Game settings
  debug: import.meta.env.DEV,
  version: "1.0.0",

  // Feature flags
  enableSeasonal: true,
  forceSeason: null as null | "easter" | "christmas" | "may13",
  // Preview features
  // Globally gate the GPT-5 preview experience. Defaults to enabled for all clients
  // but can be disabled via VITE_GPT5_PREVIEW=false
  enableGpt5Preview: (import.meta.env.VITE_GPT5_PREVIEW ?? "true") === "true",
  // Optional: allow specifying a preview model name via env for future provider routing
  // Note: Current provider is Groq; unsupported models will be safely ignored at runtime
  gpt5PreviewModel:
    (import.meta.env.VITE_GPT5_MODEL as string | undefined) || "gpt-5-preview",

  // Audio settings
  sfxEnabled: true,
  musicEnabled: true,

  // Performance settings
  maxConcurrentAnimations: 20,

  // UI settings
  defaultTheme: "dark" as "dark" | "light",

  // Development overrides
  ...(import.meta.env.DEV && {
    // Add dev-specific overrides here
    forceSeason: import.meta.env.VITE_FORCE_SEASON as
      | null
      | "easter"
      | "christmas"
      | "may13",
  }),
};

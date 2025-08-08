// src/config.ts
// Global configuration for Gorstan Game Beta 1

export const config = {
  // Game settings
  debug: process.env.NODE_ENV === 'development',
  version: '1.0.0',
  
  // Feature flags
  enableSeasonal: true,
  forceSeason: null as null | "easter" | "christmas" | "may13",
  
  // Audio settings
  sfxEnabled: true,
  musicEnabled: true,
  
  // Performance settings
  maxConcurrentAnimations: 20,
  
  // UI settings
  defaultTheme: 'dark' as 'dark' | 'light',
  
  // Development overrides
  ...(process.env.NODE_ENV === 'development' && {
    // Add dev-specific overrides here
    forceSeason: process.env.VITE_FORCE_SEASON as null | "easter" | "christmas" | "may13"
  })
};

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

// Gorstan and characters (c) Geoff Webster 2025
// Player location utility functions

/**
 * Player location information interface
 */
export interface PlayerLocation {
  city: string;
  country: string;
  timezone: string;
  weather?: string;
  ip?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Get simulated player location for game purposes
 * Note: This is a placeholder implementation for privacy/security
 * In a real game, you might use geolocation APIs with user consent
 */
export function getPlayerLocation(): Promise<PlayerLocation> {
  return new Promise((resolve) => {
    // Simulate location detection with fake data for game narrative
    const mockLocations: PlayerLocation[] = [
      { city: 'London', country: 'UK', timezone: 'GMT', weather: 'rainy' },
      { city: 'New York', country: 'USA', timezone: 'EST', weather: 'cloudy' },
      { city: 'Tokyo', country: 'Japan', timezone: 'JST', weather: 'clear' },
      { city: 'Sydney', country: 'Australia', timezone: 'AEST', weather: 'sunny' },
      { city: 'Toronto', country: 'Canada', timezone: 'EST', weather: 'snowy' },
      { city: 'Berlin', country: 'Germany', timezone: 'CET', weather: 'foggy' },
    ];

    // Randomly select a location for narrative purposes
    const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    
    // Simulate async location detection
    setTimeout(() => {
      resolve(randomLocation);
    }, 100);
  });
}

/**
 * Get current weather for narrative purposes
 */
export function getCurrentWeather(): string {
  const weatherOptions = ['rainy', 'sunny', 'cloudy', 'snowy', 'foggy', 'clear', 'stormy'];
  return weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
}

/**
 * Check if location detection is available
 */
export function isLocationAvailable(): boolean {
  // Always return true for our mock implementation
  return true;
}

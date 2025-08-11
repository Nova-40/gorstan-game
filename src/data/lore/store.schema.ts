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

// src/data/lore/store.schema.ts
// Schema for bookstore and literary discussion CTAs - Gorstan Game Beta 1

export interface BookstoreCTA {
  id: string;
  type: 'bookstore' | 'literary-discussion' | 'reading-recommendation' | 'book-club';
  trigger: {
    minInteractions: number; // Minimum book discussions before this CTA can appear
    cooldownHours: number;   // Hours between this type of CTA
    probability: number;     // 0-1, base probability when conditions are met
  };
  content: {
    message: string;
    actionText: string;
    url?: string;           // External link (optional)
    dismissText: string;    // Text for dismiss/not now button
  };
  restrictions: {
    maxPerDay: number;      // Max times this CTA can appear per day
    maxPerWeek: number;     // Max times per week
    respectSnooze: boolean; // Whether to respect user snooze preferences
  };
  targeting?: {
    preferredGenres?: string[];  // Show more for these genres
    avoidGenres?: string[];      // Show less for these genres
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'any';
  };
}

export interface BookstoreData {
  version: string;
  lastUpdated: string;
  globalSettings: {
    maxCTAsPerDay: number;
    defaultCooldownHours: number;
    ctaEnabledByDefault: boolean;
  };
  ctas: BookstoreCTA[];
}

// Validation helpers
export function isValidBookstoreCTA(cta: any): cta is BookstoreCTA {
  return (
    typeof cta.id === 'string' &&
    ['bookstore', 'literary-discussion', 'reading-recommendation', 'book-club'].includes(cta.type) &&
    typeof cta.trigger === 'object' &&
    typeof cta.trigger.minInteractions === 'number' &&
    typeof cta.trigger.cooldownHours === 'number' &&
    typeof cta.trigger.probability === 'number' &&
    typeof cta.content === 'object' &&
    typeof cta.content.message === 'string' &&
    typeof cta.content.actionText === 'string' &&
    typeof cta.content.dismissText === 'string' &&
    typeof cta.restrictions === 'object' &&
    typeof cta.restrictions.maxPerDay === 'number' &&
    typeof cta.restrictions.maxPerWeek === 'number' &&
    typeof cta.restrictions.respectSnooze === 'boolean'
  );
}

export function validateBookstoreData(data: any): data is BookstoreData {
  return (
    typeof data.version === 'string' &&
    typeof data.lastUpdated === 'string' &&
    typeof data.globalSettings === 'object' &&
    Array.isArray(data.ctas) &&
    data.ctas.every(isValidBookstoreCTA)
  );
}

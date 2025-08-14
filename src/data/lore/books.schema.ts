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

// src/data/lore/books.schema.ts
// Schema for book lore data - Gorstan Game Beta 1

export interface BookLoreEntry {
  id: string;
  title: string;
  author?: string;
  genre: "fiction" | "non-fiction" | "poetry" | "drama" | "other";
  publicationYear?: number;
  themes: string[];
  description: string;
  ailaResponse: {
    mainResponse: string;
    cheekySideChance: number; // 0-1, typically ~0.25
    cheekySide?: string;
  };
  relatedBooks?: string[]; // IDs of related books
  tags: string[];
}

export interface BookLoreData {
  version: string;
  lastUpdated: string;
  books: BookLoreEntry[];
}

// Validation helpers
export function isValidBookEntry(entry: any): entry is BookLoreEntry {
  return (
    typeof entry.id === "string" &&
    typeof entry.title === "string" &&
    ["fiction", "non-fiction", "poetry", "drama", "other"].includes(
      entry.genre,
    ) &&
    Array.isArray(entry.themes) &&
    typeof entry.description === "string" &&
    typeof entry.ailaResponse === "object" &&
    typeof entry.ailaResponse.mainResponse === "string" &&
    typeof entry.ailaResponse.cheekySideChance === "number" &&
    Array.isArray(entry.tags)
  );
}

export function validateBookLoreData(data: any): data is BookLoreData {
  return (
    typeof data.version === "string" &&
    typeof data.lastUpdated === "string" &&
    Array.isArray(data.books) &&
    data.books.every(isValidBookEntry)
  );
}

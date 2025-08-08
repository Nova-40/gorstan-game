// src/data/lore/books.schema.ts
// Schema for book lore data - Gorstan Game Beta 1

export interface BookLoreEntry {
  id: string;
  title: string;
  author?: string;
  genre: 'fiction' | 'non-fiction' | 'poetry' | 'drama' | 'other';
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
    typeof entry.id === 'string' &&
    typeof entry.title === 'string' &&
    ['fiction', 'non-fiction', 'poetry', 'drama', 'other'].includes(entry.genre) &&
    Array.isArray(entry.themes) &&
    typeof entry.description === 'string' &&
    typeof entry.ailaResponse === 'object' &&
    typeof entry.ailaResponse.mainResponse === 'string' &&
    typeof entry.ailaResponse.cheekySideChance === 'number' &&
    Array.isArray(entry.tags)
  );
}

export function validateBookLoreData(data: any): data is BookLoreData {
  return (
    typeof data.version === 'string' &&
    typeof data.lastUpdated === 'string' &&
    Array.isArray(data.books) &&
    data.books.every(isValidBookEntry)
  );
}

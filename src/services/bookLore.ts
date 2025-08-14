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

// src/services/bookLore.ts
// Book lore service for Ayla's literary knowledge - Gorstan Game Beta 1

import {
  BookLoreData,
  BookLoreEntry,
  validateBookLoreData,
} from "../data/lore/books.schema";
import bookLoreData from "../data/lore/books.json";

class BookLoreService {
  private loreData: BookLoreData;
  private bookMap: Map<string, BookLoreEntry>;
  private initialized = false;

  constructor() {
    this.loreData = { version: "", lastUpdated: "", books: [] };
    this.bookMap = new Map();
    this.initialize();
  }

  private initialize(): void {
    try {
      if (!validateBookLoreData(bookLoreData)) {
        console.warn("[BookLore] Invalid book lore data structure");
        return;
      }

      this.loreData = bookLoreData as BookLoreData;
      this.bookMap.clear();

      // Build lookup map for fast access
      this.loreData.books.forEach((book) => {
        this.bookMap.set(book.id.toLowerCase(), book);
        this.bookMap.set(book.title.toLowerCase(), book);

        // Also index by author if available
        if (book.author) {
          const authorKey = `by:${book.author.toLowerCase()}`;
          this.bookMap.set(authorKey, book);
        }
      });

      this.initialized = true;
      console.log(
        `[BookLore] Initialized with ${this.loreData.books.length} books`,
      );
    } catch (error) {
      console.error("[BookLore] Failed to initialize:", error);
    }
  }

  /**
   * Find a book by title, author, or ID
   */
  findBook(query: string): BookLoreEntry | null {
    if (!this.initialized) {return null;}

    const normalizedQuery = query.toLowerCase().trim();

    // Direct lookup
    const book = this.bookMap.get(normalizedQuery);
    if (book) {return book;}

    // Try partial title matching
    for (const [key, bookEntry] of this.bookMap.entries()) {
      if (
        key.includes(normalizedQuery) &&
        key === bookEntry.title.toLowerCase()
      ) {
        return bookEntry;
      }
    }

    // Try fuzzy matching on titles
    const books = Array.from(this.bookMap.values());
    const uniqueBooks = books.filter(
      (book, index, arr) => arr.findIndex((b) => b.id === book.id) === index,
    );

    for (const book of uniqueBooks) {
      const titleWords = book.title.toLowerCase().split(/\s+/);
      const queryWords = normalizedQuery.split(/\s+/);

      // Check if most query words appear in title
      const matchingWords = queryWords.filter((qWord) =>
        titleWords.some(
          (tWord) => tWord.includes(qWord) || qWord.includes(tWord),
        ),
      );

      if (matchingWords.length >= Math.ceil(queryWords.length * 0.6)) {
        return book;
      }
    }

    return null;
  }

  /**
   * Get Ayla's response to a book mention
   */
  getAylaResponse(
    bookQuery: string,
  ): { response: string; book: BookLoreEntry | null } | null {
    const book = this.findBook(bookQuery);
    if (!book) {return null;}

    // Determine if we should include the cheeky aside
    const includeCheeky =
      book.ailaResponse.cheekySide &&
      Math.random() < book.ailaResponse.cheekySideChance;

    let response = book.ailaResponse.mainResponse;
    if (includeCheeky && book.ailaResponse.cheekySide) {
      response += " " + book.ailaResponse.cheekySide;
    }

    return { response, book };
  }

  /**
   * Get books by genre
   */
  getBooksByGenre(genre: string): BookLoreEntry[] {
    if (!this.initialized) {return [];}
    return this.loreData.books.filter(
      (book) => book.genre === genre.toLowerCase(),
    );
  }

  /**
   * Get books by theme
   */
  getBooksByTheme(theme: string): BookLoreEntry[] {
    if (!this.initialized) {return [];}
    const normalizedTheme = theme.toLowerCase();
    return this.loreData.books.filter((book) =>
      book.themes.some((t) => t.toLowerCase().includes(normalizedTheme)),
    );
  }

  /**
   * Get random book for conversation starter
   */
  getRandomBook(): BookLoreEntry | null {
    if (!this.initialized || this.loreData.books.length === 0) {return null;}
    const randomIndex = Math.floor(Math.random() * this.loreData.books.length);
    return this.loreData.books[randomIndex];
  }

  /**
   * Search books by tag
   */
  searchByTag(tag: string): BookLoreEntry[] {
    if (!this.initialized) {return [];}
    const normalizedTag = tag.toLowerCase();
    return this.loreData.books.filter((book) =>
      book.tags.some((t) => t.toLowerCase().includes(normalizedTag)),
    );
  }

  /**
   * Get related books
   */
  getRelatedBooks(bookId: string): BookLoreEntry[] {
    const book = this.bookMap.get(bookId.toLowerCase());
    if (!book || !book.relatedBooks) {return [];}

    return book.relatedBooks
      .map((id) => this.bookMap.get(id.toLowerCase()))
      .filter((book): book is BookLoreEntry => book !== undefined);
  }

  /**
   * Get all available books (for debugging/admin)
   */
  getAllBooks(): BookLoreEntry[] {
    return this.initialized ? [...this.loreData.books] : [];
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      totalBooks: this.loreData.books.length,
      version: this.loreData.version,
      lastUpdated: this.loreData.lastUpdated,
      genres: [...new Set(this.loreData.books.map((b) => b.genre))],
      totalThemes: [...new Set(this.loreData.books.flatMap((b) => b.themes))]
        .length,
    };
  }
}

// Export singleton instance
export const bookLoreService = new BookLoreService();
export default bookLoreService;

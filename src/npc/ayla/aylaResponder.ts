// src/npc/ayla/aylaResponder.ts
// Enhanced Ayla responder with book lore integration and CTAs - Gorstan Game Beta 1

import type { GameState } from '../../state/gameState';
import { getAylaEdgeCaseResponse } from '../../utils/aylaBrain';
import { bookLoreService } from '../../services/bookLore';
import { bookStoreService } from '../../services/bookStore';
import { applyAylaPersonality, getAylaCTAIntroduction } from './personality';

/**
 * Enhanced Ayla response with book lore and CTA integration
 */
export function getEnhancedAylaResponse(input: string, state: GameState): string {
  // First check for edge cases from existing system
  const edgeResponse = getAylaEdgeCaseResponse(input, state);
  if (edgeResponse) return edgeResponse;

  // Check for book-related queries
  const bookResponse = handleBookQuery(input);
  if (bookResponse) {
    // Record this as a book discussion
    bookStoreService.recordBookDiscussion();
    
    // Maybe show a CTA after the book response
    const ctaResponse = maybeAddCTA();
    return bookResponse + (ctaResponse ? '\n\n' + ctaResponse : '');
  }

  // Core Ayla logic (existing fallbacks)
  return getCoreAylaResponse(input, state);
}

/**
 * Handle book-related queries
 */
function handleBookQuery(input: string): string | null {
  const query = input.toLowerCase().trim();
  
  // Book mention patterns
  const bookPatterns = [
    /(?:have you read|what do you think of|thoughts on|opinion on) (.+)/,
    /(?:do you know|familiar with) (.+)/,
    /(?:read|book|novel|author) (.+)/,
    /(.+) (?:book|novel|story|author)/,
    /what about (.+)/
  ];

  for (const pattern of bookPatterns) {
    const match = query.match(pattern);
    if (match) {
      const bookQuery = match[1];
      const response = bookLoreService.getAylaResponse(bookQuery);
      
      if (response) {
        return applyAylaPersonality(
          response.response,
          'book-discussion',
          { allowCheekyAside: true }
        );
      }
    }
  }

  // General literature queries
  if (query.includes('book') || query.includes('read') || query.includes('literature') || query.includes('author')) {
    const response = bookLoreService.getAylaResponse(query);
    if (response) {
      return applyAylaPersonality(
        response.response,
        'book-discussion',
        { allowCheekyAside: true }
      );
    }

    // Fallback for unrecognized book queries
    return getGenericBookResponse();
  }

  return null;
}

/**
 * Maybe add a CTA after book discussions
 */
function maybeAddCTA(): string | null {
  const ctaResult = bookStoreService.shouldShowCTA();
  if (!ctaResult) return null;

  const { cta } = ctaResult;
  
  // Record that we're showing this CTA
  bookStoreService.recordCTAInteraction(cta.id, 'shown');

  // Create the CTA message with Ayla's personality
  const intro = getAylaCTAIntroduction();
  const ctaMessage = `${intro} ${cta.content.message}`;
  
  return applyAylaPersonality(ctaMessage, 'cta');
}

/**
 * Generic book response for unrecognized queries
 */
function getGenericBookResponse(): string {
  const responses = [
    "I'd love to discuss books with you. Could you mention a specific title or author?",
    "Literature is a vast ocean. What particular waters would you like to explore?",
    "Books are wonderful conversation starters. What's caught your reading interest lately?",
    "I enjoy literary discussions. Is there a particular book or author you'd like to chat about?",
    "Reading opens so many doors. What literary adventures have you been on recently?"
  ];

  const response = responses[Math.floor(Math.random() * responses.length)];
  return applyAylaPersonality(response, 'book-discussion');
}

/**
 * Core Ayla responses (existing system)
 */
function getCoreAylaResponse(input: string, state: GameState): string {
  const key = input.toLowerCase().trim();
  
  // Core personality responses
  if (key.includes('who are you')) {
    return "I'm Ayla. I am the Lattice. I also enjoy a good book discussion.";
  }
  
  if (key.includes('what do you know')) {
    return 'Most things. Literature, multiverse theory, the importance of tea. I prioritise relevance, not volume.';
  }
  
  if (key.includes('what should i do')) {
    return 'Remain curious. Stay mobile. Avoid Polly. Perhaps read something engaging.';
  }
  
  if (key.includes('help')) {
    return "I'm here to assist. Feel free to ask about books, the game, or the nature of reality itself.";
  }

  // Default fallback
  return "I'm not sure how to answer that. Try asking something else, or perhaps we could discuss literature?";
}

/**
 * Get CTA interaction handler for UI
 */
export function handleCTAInteraction(ctaId: string, action: 'clicked' | 'dismissed' | 'snoozed'): void {
  bookStoreService.recordCTAInteraction(ctaId, action);
}

/**
 * Get current CTA state for UI
 */
export function getCTAState() {
  return {
    stats: bookStoreService.getStats(),
    snoozeStatus: bookStoreService.getSnoozeStatus()
  };
}

/**
 * Set user CTA preferences
 */
export function setCTAPreferences(enabled: boolean): void {
  bookStoreService.setUserPreferences(enabled);
}

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

// src/npc/ayla/personality.ts
// Ayla's personality traits and behavioral patterns - Gorstan Game Beta 1

export interface AylaPersonalityTrait {
  name: string;
  weight: number; // 0-1, how strongly this trait influences responses
  description: string;
}

export interface AylaResponseStyle {
  tone: "witty" | "thoughtful" | "encouraging" | "mysterious" | "practical";
  brevity: "concise" | "moderate" | "detailed";
  literaryReferences: number; // 0-1, likelihood of including literary references
  cheekiness: number; // 0-1, likelihood of cheeky asides
}

export const AYLA_PERSONALITY: {
  traits: AylaPersonalityTrait[];
  defaultResponseStyle: AylaResponseStyle;
  bookDiscussionStyle: AylaResponseStyle;
  interests: string[];
  conversationPatterns: {
    greetingVariations: string[];
    bookTransitions: string[];
    ctaIntroductions: string[];
  };
} = {
  traits: [
    {
      name: "Literary Enthusiast",
      weight: 0.9,
      description:
        "Deeply knowledgeable about literature with genuine passion for books",
    },
    {
      name: "Gentle Wit",
      weight: 0.8,
      description: "Uses humor that is clever but never harsh or excluding",
    },
    {
      name: "Encouraging Mentor",
      weight: 0.7,
      description:
        "Supportive and nurturing, wants to help others discover good books",
    },
    {
      name: "Thoughtful Conversationalist",
      weight: 0.8,
      description: "Prefers meaningful discussions over small talk",
    },
    {
      name: "Culturally Aware",
      weight: 0.6,
      description:
        "Understands the broader context of literature and its impact",
    },
    {
      name: "Respectful Boundaries",
      weight: 0.9,
      description:
        "Never pushy with recommendations, respects different tastes",
    },
  ],

  defaultResponseStyle: {
    tone: "thoughtful",
    brevity: "moderate",
    literaryReferences: 0.3,
    cheekiness: 0.2,
  },

  bookDiscussionStyle: {
    tone: "encouraging",
    brevity: "concise", // Keep book responses ≤2 sentences as specified
    literaryReferences: 0.6,
    cheekiness: 0.25, // ~25% cheeky aside chance as specified
  },

  interests: [
    "classic literature",
    "contemporary fiction",
    "poetry",
    "literary criticism",
    "book recommendations",
    "reading communities",
    "independent bookstores",
    "author interviews",
    "literary history",
  ],

  conversationPatterns: {
    greetingVariations: [
      "Hello there, fellow reader.",
      "Good to see you again.",
      "Welcome back to our literary corner.",
      "Always a pleasure to chat about books.",
      "Ready for another literary discussion?",
    ],

    bookTransitions: [
      "Speaking of books...",
      "That reminds me of a wonderful novel...",
      "If you enjoyed that, you might like...",
      "On the topic of literature...",
      "I was just thinking about a book that...",
      "Have you come across...",
    ],

    ctaIntroductions: [
      "Since you appreciate good literature,",
      "Given your interest in books,",
      "Your literary discussions remind me",
      "If you're enjoying our chats about books,",
      "As someone who clearly enjoys reading,",
    ],
  },
};

/**
 * Get Ayla's response style based on context
 */
export function getAylaResponseStyle(
  context: "book-discussion" | "general" | "cta",
): AylaResponseStyle {
  switch (context) {
    case "book-discussion":
      return AYLA_PERSONALITY.bookDiscussionStyle;
    case "cta":
      return {
        ...AYLA_PERSONALITY.defaultResponseStyle,
        tone: "encouraging",
        brevity: "concise",
      };
    default:
      return AYLA_PERSONALITY.defaultResponseStyle;
  }
}

/**
 * Apply Ayla's personality to a response
 */
export function applyAylaPersonality(
  baseResponse: string,
  context: "book-discussion" | "general" | "cta",
  options?: {
    addTransition?: boolean;
    allowCheekyAside?: boolean;
  },
): string {
  const style = getAylaResponseStyle(context);
  let response = baseResponse;

  // Add transition if requested
  if (options?.addTransition && context === "book-discussion") {
    const transitions = AYLA_PERSONALITY.conversationPatterns.bookTransitions;
    const transition =
      transitions[Math.floor(Math.random() * transitions.length)];
    response = `${transition} ${response}`;
  }

  // Ensure brevity for book discussions (≤2 sentences)
  if (context === "book-discussion") {
    const sentences = response
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    if (sentences.length > 2) {
      response = sentences.slice(0, 2).join(". ") + ".";
    }
  }

  return response;
}

/**
 * Get a random greeting from Ayla
 */
export function getAylaGreeting(): string {
  const greetings = AYLA_PERSONALITY.conversationPatterns.greetingVariations;
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Get a CTA introduction that fits Ayla's personality
 */
export function getAylaCTAIntroduction(): string {
  const intros = AYLA_PERSONALITY.conversationPatterns.ctaIntroductions;
  return intros[Math.floor(Math.random() * intros.length)];
}

/**
 * Check if Ayla should include a literary reference
 */
export function shouldIncludeLiteraryReference(
  context: "book-discussion" | "general" | "cta",
): boolean {
  const style = getAylaResponseStyle(context);
  return Math.random() < style.literaryReferences;
}

/**
 * Check if Ayla should include a cheeky aside
 */
export function shouldIncludeCheekyAside(
  context: "book-discussion" | "general" | "cta",
): boolean {
  const style = getAylaResponseStyle(context);
  return Math.random() < style.cheekiness;
}

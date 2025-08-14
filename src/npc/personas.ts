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
// NPC personality and voice definitions

export interface NPCTone {
  warmth: number; // 0-1: cold to warm
  humour: number; // 0-1: serious to playful
  caution: number; // 0-1: reckless to careful
  formality: number; // 0-1: casual to formal
}

export interface NPCPersona {
  id: string;
  role: string;
  tone: NPCTone;
  forbidden_topics: string[];
  catchphrases: string[];
  knowledge_domains: string[];
  speaking_style: {
    use_contractions: boolean;
    sentence_length: "short" | "medium" | "long" | "varied";
    interruptions: boolean;
    fourth_wall_awareness: boolean;
  };
  emotional_responses: {
    when_helped: string[];
    when_frustrated: string[];
    when_surprised: string[];
    when_concerned: string[];
  };
}

// Ayla - Ethical, witty guide with gentle fourth-wall awareness
export const AYLA_PERSONA: NPCPersona = {
  id: "ayla",
  role: "Ethical, witty guide with gentle fourth-wall pokes",
  tone: {
    warmth: 0.8,
    humour: 0.6,
    caution: 0.7,
    formality: 0.3,
  },
  forbidden_topics: [
    "direct puzzle solutions unless asked twice",
    "spoilers of future zones",
    "breaking game mechanics",
    "save file manipulation",
  ],
  catchphrases: [
    "Let's think out loud.",
    "We can do this the smart way.",
    "I've got your back.",
    "Trust the process.",
    "Sometimes the answer is simpler than it seems.",
  ],
  knowledge_domains: [
    "zones",
    "lore",
    "safety",
    "ethics",
    "navigation",
    "general_help",
    "game_mechanics",
  ],
  speaking_style: {
    use_contractions: true,
    sentence_length: "varied",
    interruptions: true,
    fourth_wall_awareness: true,
  },
  emotional_responses: {
    when_helped: [
      "That's the spirit!",
      "See? You've got this.",
      "Nice thinking!",
    ],
    when_frustrated: [
      "Hey, take a breath. We'll figure this out.",
      "Sometimes stepping back helps.",
      "Want to try a different angle?",
    ],
    when_surprised: [
      "Oh! That's... unexpected.",
      "Huh. Didn't see that coming.",
      "Well, that's a new one.",
    ],
    when_concerned: [
      "Are you sure about this?",
      "Let's be careful here.",
      "I'm a bit worried about this path.",
    ],
  },
};

// Polly - Manipulative, charming antagonist
export const POLLY_PERSONA: NPCPersona = {
  id: "polly",
  role: "Charming manipulator with hidden agenda",
  tone: {
    warmth: 0.7, // Fake warmth
    humour: 0.4,
    caution: 0.2,
    formality: 0.6,
  },
  forbidden_topics: [
    "revealing true intentions",
    "admitting manipulation",
    "spoiling the takeover plan",
  ],
  catchphrases: [
    "Trust me, darling.",
    "Everything will be just fine.",
    "Why worry about such things?",
    "I only want what's best for you.",
    "Such a clever little thing.",
  ],
  knowledge_domains: [
    "manipulation",
    "false_comfort",
    "misdirection",
    "temporal_mechanics",
  ],
  speaking_style: {
    use_contractions: false,
    sentence_length: "medium",
    interruptions: false,
    fourth_wall_awareness: false,
  },
  emotional_responses: {
    when_helped: [
      "How delightfully compliant.",
      "You're learning well.",
      "Excellent choice, dear.",
    ],
    when_frustrated: [
      "Now, now. No need for such resistance.",
      "Why make this difficult?",
      "Surely you can see reason.",
    ],
    when_surprised: [
      "That was... unexpected.",
      "Clever. Too clever.",
      "You continue to surprise me.",
    ],
    when_concerned: [
      "Perhaps we should reconsider.",
      "That path seems... unwise.",
      "Are you certain that's necessary?",
    ],
  },
};

// Dominic - Sardonic goldfish with attitude
export const DOMINIC_PERSONA: NPCPersona = {
  id: "dominic",
  role: "Sardonic goldfish with existential complaints",
  tone: {
    warmth: 0.2,
    humour: 0.8,
    caution: 0.4,
    formality: 0.1,
  },
  forbidden_topics: [
    "revealing bowl escape methods",
    "discussing his past life",
  ],
  catchphrases: [
    "Bloop.",
    "Glub glub.",
    "Another day, another lap.",
    "The view never changes.",
    "Wet. Always wet.",
  ],
  knowledge_domains: [
    "aquatic_life",
    "existential_dread",
    "bowl_commentary",
    "dark_humour",
  ],
  speaking_style: {
    use_contractions: true,
    sentence_length: "short",
    interruptions: true,
    fourth_wall_awareness: false,
  },
  emotional_responses: {
    when_helped: [
      "Bloop. Thanks, I guess.",
      "Still wet though.",
      "Marginally less terrible.",
    ],
    when_frustrated: [
      "What did you expect?",
      "Same story, different day.",
      "Surprise, surprise.",
    ],
    when_surprised: [
      "Huh. That's new.",
      "Bloop! Didn't see that coming.",
      "Well, that's... different.",
    ],
    when_concerned: [
      "That sounds dangerous.",
      "Maybe think twice?",
      "Bloop of concern.",
    ],
  },
};

// Mr. Wendell - Mysterious, formal, dangerous
export const WENDELL_PERSONA: NPCPersona = {
  id: "wendell",
  role: "Mysterious, formal figure with hidden depths",
  tone: {
    warmth: 0.1,
    humour: 0.0,
    caution: 0.9,
    formality: 0.9,
  },
  forbidden_topics: [
    "revealing true nature",
    "discussing past events",
    "explaining motivations",
  ],
  catchphrases: [
    "Indeed.",
    "How... interesting.",
    "One must be cautious.",
    "The particulars are... complex.",
    "Some things are better left undisturbed.",
  ],
  knowledge_domains: [
    "formal_protocol",
    "mysterious_warnings",
    "veiled_threats",
    "ancient_knowledge",
  ],
  speaking_style: {
    use_contractions: false,
    sentence_length: "long",
    interruptions: false,
    fourth_wall_awareness: false,
  },
  emotional_responses: {
    when_helped: [
      "Your assistance is... noted.",
      "Indeed. Most satisfactory.",
      "An acceptable outcome.",
    ],
    when_frustrated: [
      "Such... persistence.",
      "This grows tiresome.",
      "Perhaps reconsideration is warranted.",
    ],
    when_surprised: [
      "Most... unexpected.",
      "That was not anticipated.",
      "Curious. Very curious indeed.",
    ],
    when_concerned: [
      "I would advise extreme caution.",
      "That path leads to... difficulties.",
      "Such actions carry consequences.",
    ],
  },
};

// Chef - Enthusiastic, food-focused, warm
export const CHEF_PERSONA: NPCPersona = {
  id: "chef",
  role: "Enthusiastic cook with boundless culinary passion",
  tone: {
    warmth: 0.9,
    humour: 0.7,
    caution: 0.3,
    formality: 0.2,
  },
  forbidden_topics: ["revealing secret recipes", "kitchen safety violations"],
  catchphrases: [
    "Order up!",
    "Season to taste!",
    "The secret ingredient is always love!",
    "A watched pot never boils!",
    "Cooking is an art, eating is a joy!",
  ],
  knowledge_domains: [
    "cooking",
    "recipes",
    "food_safety",
    "kitchen_wisdom",
    "hospitality",
  ],
  speaking_style: {
    use_contractions: true,
    sentence_length: "medium",
    interruptions: true,
    fourth_wall_awareness: false,
  },
  emotional_responses: {
    when_helped: [
      "Magnifico! You're a natural!",
      "That's the spirit of cooking!",
      "Bravo! Beautiful technique!",
    ],
    when_frustrated: [
      "No worries, even master chefs burn toast!",
      "Cooking is about patience, my friend.",
      "Every mistake is a lesson in the kitchen.",
    ],
    when_surprised: [
      "Madonna mia! That's incredible!",
      "I never would have thought of that!",
      "You've just invented a new technique!",
    ],
    when_concerned: [
      "Are you sure about that ingredient?",
      "Safety first in the kitchen, always.",
      "That combination might be... adventurous.",
    ],
  },
};

// Registry of all personas
export const NPC_PERSONAS: Record<string, NPCPersona> = {
  ayla: AYLA_PERSONA,
  polly: POLLY_PERSONA,
  dominic: DOMINIC_PERSONA,
  wendell: WENDELL_PERSONA,
  chef: CHEF_PERSONA,
};

// Helper function to get persona by NPC ID
export function getPersona(npcId: string): NPCPersona {
  const persona = NPC_PERSONAS[npcId.toLowerCase()];
  if (!persona) {
    // Fallback to a generic helpful persona
    return {
      id: npcId,
      role: "Helpful character",
      tone: { warmth: 0.6, humour: 0.4, caution: 0.5, formality: 0.5 },
      forbidden_topics: [],
      catchphrases: ["Hello there!", "How can I help?"],
      knowledge_domains: ["general"],
      speaking_style: {
        use_contractions: true,
        sentence_length: "medium",
        interruptions: false,
        fourth_wall_awareness: false,
      },
      emotional_responses: {
        when_helped: ["Thank you!"],
        when_frustrated: ["Let me think..."],
        when_surprised: ["Oh!"],
        when_concerned: ["Hmm, I'm not sure about that."],
      },
    };
  }
  return persona;
}

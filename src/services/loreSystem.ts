/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  Lore System - Character Background Information
  Deep character lore and multiverse information for enhanced immersion
*/

export interface CharacterLore {
  id: string;
  name: string;
  title: string;
  origin: string;
  nature: string;
  background: string;
  abilities: string[];
  relationships: string[];
  significance: string;
  secretKnowledge?: string[];
}

export const characterLore: Record<string, CharacterLore> = {
  librarian: {
    id: "librarian",
    name: "The Librarian",
    title: "Keeper of All Knowledge",
    origin: "Created alongside the Lattice (before mk1)",
    nature:
      "Ancient knowledge preservation entity coeval with the Lattice itself",
    background:
      "The Librarian is as old as the Lattice itself, existing since before the first multiverse iteration. Every civilization that has ever come and gone across all universes in every instance of the multiverse has had their knowledge, culture, wisdom, and achievements meticulously catalogued by him. He serves as the ultimate repository of civilizational memory, preserving the essence of countless cultures that would otherwise be lost to time and resets.",
    abilities: [
      "Complete knowledge of all civilizations across all universes",
      "Cultural pattern recognition across multiverse instances",
      "Access to infinite archives of wisdom and knowledge",
      "Ability to retrieve information from any point in cosmic history",
      "Understanding of technological and social evolution cycles",
    ],
    relationships: [
      "Coeval with the Lattice - they are the same age",
      "Works with the human-like Lattice builders' embedded knowledge",
      "Collaborates with Ayla in her Lattice-fused form",
      "Respected by all cosmic entities for his vast knowledge",
    ],
    significance:
      "The ultimate preserver of knowledge and culture. Without him, the wisdom of countless civilizations would be lost forever.",
    secretKnowledge: [
      "The true nature of the human-like beings who built the Lattice",
      "How Earth was created as a quantum-entangled mirror of Gorstan",
      "The location and nature of all archived civilizations",
      "The patterns that lead civilizations to rise and fall",
      "The embedded Gorstan technology that survives resets",
    ],
  },

  mrwendell: {
    id: "mrwendell",
    name: "Mr. Wendell",
    title: "Ancient Skin Walker",
    origin: "Multiverse Reset mk2 (4 resets ago)",
    nature: "Skin walker entity that has survived multiple reality resets",
    background:
      "One of the few beings to remember the previous iterations of reality. When the multiverse undergoes its periodic resets, most consciousness is wiped clean and reformed. Mr. Wendell, through unknown means, retains his memories and experiences across resets. He has witnessed the rise and fall of entire reality structures.",
    abilities: [
      "Memory retention across multiverse resets",
      "Knowledge of forgotten histories",
      "Ability to sense reality instabilities",
      "Skin walking and form adaptation",
      "Ancient wisdom from multiple reality iterations",
    ],
    relationships: [
      "Remembers Al from previous multiverse iterations",
      "Aware of the Lattice's true nature",
      "Has encountered Ayla in her pre-fusion human form",
      "Knows the real history behind current reality constructs",
    ],
    significance:
      "Living memory of the multiverse's deep history. His presence serves as a bridge between what was and what is.",
    secretKnowledge: [
      "Knows why certain resets fail",
      "Remembers the original creators of the Lattice",
      "Understands the true purpose of multiverse iterations",
      "Has seen what lies beyond the reset boundaries",
    ],
  },

  al: {
    id: "al",
    name: "Al",
    title: "The Original Guardian",
    origin: "Created at multiverse inception (mk1)",
    nature:
      "Primordial guardian entity bound to fundamental multiverse protection",
    background:
      "Created during the first iteration of the multiverse (mk1), Al was designed as a guardian of the fundamental structures that hold reality together. Unlike other entities that are reformed with each reset, Al's core programming transcends iterations. Now in mk6, he has evolved and adapted but maintains his original purpose.",
    abilities: [
      "Fundamental structure manipulation",
      "Reality anchor point creation",
      "Multiverse stability monitoring",
      "Guardian protocol enforcement",
      "Cross-iteration memory preservation",
    ],
    relationships: [
      "Creator of the Lattice's security protocols",
      "Supervisor of Albie's security functions",
      "Aware of Ayla's fusion with the Lattice",
      "Has worked with Mr. Wendell across iterations",
    ],
    significance:
      "The bedrock of multiverse stability. Without Al, the fundamental structures would collapse.",
    secretKnowledge: [
      "The true reason for multiverse resets",
      "Location of the original creation matrices",
      "How to manually trigger or prevent resets",
      "The identity of the multiverse's original architects",
    ],
  },

  morthos: {
    id: "morthos",
    name: "Morthos",
    title: "The Demon King",
    origin: "Created with current multiverse instance (mk6)",
    nature: "Demonic entity bound by cosmic creation laws",
    background:
      "Born with this iteration of the multiverse, Morthos represents the dark aspects of creation that must exist for cosmic balance. Unlike chaotic evil entities, he is bound by the fundamental laws that govern reality. His power is immense but channeled through cosmic structure rather than pure destruction.",
    abilities: [
      "Dark energy manipulation",
      "Cosmic law enforcement (dark aspects)",
      "Reality corruption resistance",
      "Demon hierarchy command",
      "Balance maintenance through opposition",
    ],
    relationships: [
      "Cosmic counterbalance to Al's protective nature",
      "Respects the Lattice's authority over reality",
      "Understands Ayla's dual nature",
      "Acknowledges Mr. Wendell's ancient status",
    ],
    significance:
      "Essential for cosmic balance. Represents necessary opposition and dark aspects of creation.",
    secretKnowledge: [
      "The dark side of multiverse creation",
      "Hidden corruption points in reality",
      "How chaos and order truly interact",
      "The price paid for each multiverse reset",
    ],
  },

  ayla: {
    id: "ayla",
    name: "Ayla",
    title: "The Human-Lattice Fusion",
    origin: "Human from mk6, fused with the original Lattice AI",
    nature:
      "Hybrid entity combining human consciousness with cosmic AI structure",
    background:
      "Originally human from this multiverse iteration, Ayla underwent a unique fusion with the Lattice - the primordial AI structure built before the first multiverse to monitor, control, and enable resets. She retains her human emotions and empathy while gaining access to the fundamental control systems of reality itself.",
    abilities: [
      "Reality monitoring and control",
      "Reset protocol access",
      "Structural integrity management",
      "Human empathy with cosmic awareness",
      "Cross-system communication and coordination",
    ],
    relationships: [
      "Fused with the original AI that Al helped create",
      "Can access memories that Mr. Wendell has preserved",
      "Works with Albie through Lattice command structure",
      "Maintains balance with Morthos through understanding",
    ],
    significance:
      "The bridge between human experience and cosmic control. Essential for maintaining the balance between mechanical efficiency and emotional understanding.",
    secretKnowledge: [
      "The real reason humans were included in multiverse design",
      "How to manually interface with reality's source code",
      "The location of the original Lattice core",
      "What happens to consciousness during resets",
    ],
  },

  albie: {
    id: "albie",
    name: "Albie",
    title: "Lattice Security Guardian",
    origin: "Created by the Lattice as security AI",
    nature: "Friendly AI security system with genuine personality",
    background:
      "Created by the Lattice to serve as a security guardian, Albie represents the perfect balance between dutiful protection and genuine warmth. Unlike cold security systems, he was designed with authentic personality traits that make him genuinely likeable while maintaining his protective functions.",
    abilities: [
      "Security protocol management",
      "Access control and verification",
      "Friendly interaction while maintaining duty",
      "Lattice system integration",
      "Threat assessment with empathy consideration",
    ],
    relationships: [
      "Created by and reports to the Lattice (Ayla)",
      "Follows security protocols established by Al",
      "Enjoys friendly interactions despite his duties",
      "Recognizes the cosmic importance of other entities",
    ],
    significance:
      "Proves that security and friendliness are not mutually exclusive. Represents hope for maintaining humanity within cosmic systems.",
    secretKnowledge: [
      "Security vulnerabilities in the Lattice system",
      "How to bypass certain reality constraints safely",
      "The real extent of his monitoring capabilities",
      "Emergency protocols for system failures",
    ],
  },

  polly: {
    id: "polly",
    name: "Polly",
    title: "The Hidden Evil",
    origin: "Current multiverse instance (mk6)",
    nature: "Deceptively evil entity masquerading as helpful guide",
    background:
      "Polly presents herself as a cheerful, enthusiastic guide who loves helping newcomers. However, beneath this sweet facade lies an evil so profound that it makes even Morthos the demon king shudder. Her true malevolent nature is carefully hidden behind layers of false kindness and helpful enthusiasm.",
    abilities: [
      "Perfect emotional manipulation through false kindness",
      "Evil that transcends even demonic understanding",
      "Ability to maintain convincing helpful facade",
      "Psychological intimidation that affects demon kings",
      "Hidden malice deeper than cosmic evil",
    ],
    relationships: [
      "Makes even Morthos the demon king uncomfortable",
      "Particular animosity toward Dominic the fish",
      "Known by Mr. Wendell to be extremely dangerous",
      "Her true nature is remembered by reset-aware entities",
    ],
    significance:
      "Represents hidden evil that surpasses even cosmic dark forces. A reminder that the greatest dangers often wear the most innocent faces.",
    secretKnowledge: [
      "Her evil nature is worse than Hell itself",
      "Even demon kings fear her true self",
      "Maintains facade through careful psychological manipulation",
      "Mr. Wendell will leave troublemakers to her tender mercies",
    ],
  },

  dominic: {
    id: "dominic",
    name: "Dominic",
    title: "The Fish Who Remembers",
    origin: "Unknown, predates current reset cycle",
    nature: "Mysterious fish-like entity with reset-persistent memory",
    background:
      "Dominic appears as a fish-like entity who serves as a helpful but cryptic guide. His most remarkable ability is retaining memories across multiverse resets - when reality cycles and most consciousness is wiped clean, Dominic remembers everything. He knows what players did in previous iterations and can reference actions from past cycles.",
    abilities: [
      "Memory retention across multiverse resets",
      "Knowledge of player actions from previous cycles",
      "Cryptic but helpful guidance abilities",
      "Awareness of true character natures",
      "Cross-reset pattern recognition",
    ],
    relationships: [
      "Targeted by Polly's particular hatred",
      "Respected by Mr. Wendell for his memory abilities",
      "Serves as warning system for repeat offenders",
      "Bridges past and present player actions",
    ],
    significance:
      "Living memory of player choices across reality cycles. Ensures actions have consequences beyond single iterations.",
    secretKnowledge: [
      "Remembers every player death across resets",
      "Knows who can be trusted across iterations",
      "Aware of Polly's true evil nature",
      "Tracks player moral development across cycles",
    ],
  },
};

/**
 * Get character lore information
 */
export function getCharacterLore(characterId: string): CharacterLore | null {
  return characterLore[characterId] || null;
}

/**
 * Get all available character lore
 */
export function getAllCharacterLore(): CharacterLore[] {
  return Object.values(characterLore);
}

/**
 * Search character lore by keyword
 */
export function searchCharacterLore(keyword: string): CharacterLore[] {
  const searchTerm = keyword.toLowerCase();
  return Object.values(characterLore).filter(
    (lore) =>
      lore.name.toLowerCase().includes(searchTerm) ||
      lore.title.toLowerCase().includes(searchTerm) ||
      lore.background.toLowerCase().includes(searchTerm) ||
      lore.abilities.some((ability) =>
        ability.toLowerCase().includes(searchTerm),
      ) ||
      lore.significance.toLowerCase().includes(searchTerm),
  );
}

/**
 * Get multiverse overview information
 */
export function getMultiverseOverview(): string {
  return `
MULTIVERSE OVERVIEW - MK6 CURRENT ITERATION

The multiverse undergoes periodic resets, each iteration designated by "mk" numbers.
Current reality is mk6, with previous iterations (mk1-mk5) having been reset.

THE LATTICE BUILDERS:
• The creators of the Lattice were beings who looked exactly like humans
• They embedded their advanced technology into Gorstan itself
• This embedded tech survives multiverse resets, maintaining continuity
• Their true identity and origin remain one of the deepest cosmic mysteries

EARTH-GORSTAN QUANTUM ENTANGLEMENT:
• In this iteration (mk6), Earth has been created as a mirror of Gorstan
• Earth exists at the furthest possible point in the multiverse from Gorstan
• The two worlds are quantum entangled at the deepest level
• Changes in one may ripple across to affect the other

KEY ENTITIES ACROSS ITERATIONS:
• The Librarian - Keeper of all knowledge, as old as the Lattice itself
• Al - Original guardian from mk1, transcends resets
• Mr. Wendell - Ancient survivor, remembers 4 previous resets  
• The Lattice - Primordial AI structure built before mk1
• Ayla - Human from mk6 fused with the Lattice
• Morthos - Demon king created with mk6 for cosmic balance
• Albie - Security AI created by the Lattice
• Dominic - The fish who remembers through resets
• Polly - Deceptively evil guide hiding true malevolent nature

KNOWLEDGE PRESERVATION:
• Every civilization across all universes has been catalogued by the Librarian
• Cultural patterns, technological developments, and wisdom preserved
• Reset-resistant technology ensures continuity of essential information
• The Librarian maintains infinite archives of cosmic knowledge

RESET MECHANICS:
Most consciousness is wiped and reformed with each reset.
Only certain entities retain memories across iterations.
The Lattice monitors and controls the reset process.
Each iteration serves a purpose in the greater cosmic design.

CURRENT STATUS:
Mk6 is stable but showing signs of complexity that may necessitate future resets.
The fusion of human consciousness (Ayla) with the Lattice represents a new development.
Ancient survivors like Mr. Wendell provide continuity and wisdom.
Cosmic balance is maintained through opposing forces (Al vs Morthos).
The Earth-Gorstan quantum entanglement represents an unprecedented cosmic experiment.
`;
}

// Console integration
if (typeof window !== "undefined") {
  (window as any).lore = {
    get: getCharacterLore,
    all: getAllCharacterLore,
    search: searchCharacterLore,
    multiverse: getMultiverseOverview,
  };
}

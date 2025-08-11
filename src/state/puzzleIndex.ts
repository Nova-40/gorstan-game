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
// Game module.

export interface PuzzleRecord {
  id: string;
  description: string;
  fromZone: string;
  toZone: string;
  isSolved: (flags: any, achievements: string[]) => boolean;
}

export const puzzleIndex: PuzzleRecord[] = [
  {
    id: "intro_jump",
    description: "Intro sequence puzzle (Jump vs Wait vs Sip)",
    fromZone: "introstart",
    toZone: "controlnexus",
    isSolved: (flags, _) => flags.startedFromIntro === true
  },
  {
    id: "maze_lattice",
    description: "Z-notation logic puzzle via Librarian",
    fromZone: "mazezone",
    toZone: "latticezone",
    isSolved: (flags, _) => flags.puzzle_maze_lattice_solved === true
  },
  {
    id: "glitch_lattice",
    description: "Echo-based paradox puzzle in GlitchRealm",
    fromZone: "glitchrealm",
    toZone: "latticezone",
    isSolved: (flags, _) => flags.puzzle_glitch_echo_resolved === true
  },
  {
    id: "nyc_multizone",
    description: "Coffee delivery puzzle (Chef/Barista gate)",
    fromZone: "newyork",
    toZone: "multizone",
    isSolved: (flags, _) => flags.deliveredCoffee === true
  },
  {
    id: "lattice_offverse",
    description: "Paradox path switcher (Only one path is safe)",
    fromZone: "latticezone",
    toZone: "offmultiverse",
    isSolved: (flags, _) => flags.latticeSwitchSuccess === true
  },
  {
    id: "offverse_gorstan",
    description: "Moral framework test (Constitution Gate)",
    fromZone: "offmultiverse",
    toZone: "gorstan",
    isSolved: (flags, achievements) => achievements.includes("moralPassed")
  },
  {
    id: "gorstan_libraries",
    description: "Memory and consequence puzzle",
    fromZone: "gorstan",
    toZone: "libraries",
    isSolved: (flags, _) => flags.rememberedDominic === true
  },
  {
    id: "libraries_stanton",
    description: "Endgame multi-choice final gate",
    fromZone: "libraries",
    toZone: "stantonharcourt",
    isSolved: (flags, achievements) => achievements.includes("finalDecisionMade")
  }
];

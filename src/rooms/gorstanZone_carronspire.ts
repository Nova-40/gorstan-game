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
// Renders room descriptions and image logic.

import { NPC } from "../types/NPCTypes";
import { Room } from "../types/Room";

const carronspire: Room = {
  id: "carronspire",
  zone: "gorstanZone",
  title: "Carron Spire",
  description: [
    "You stand at the base of Carron Spire, a towering monolith of ancient stone that pierces the sky. The spire is etched with runes that pulse faintly with a blue light, and the air is charged with a sense of history and power.",
    "Wind howls around the spire, carrying whispers of forgotten legends. The ground is littered with fragments of old banners and the remains of long-extinct flora.",
    "A narrow, spiraling staircase winds up the outside of the spire, vanishing into the mist above. At the base, a weathered plaque hints at secrets hidden within.",
  ],
  image: "gorstanZone_carronspire.png",
  ambientAudio: "windy_peak.mp3",

  consoleIntro: [
    ">> CARRON SPIRE - HISTORICAL SITE",
    ">> Runes detected: ACTIVE",
    ">> Atmospheric conditions: WINDY, LOW VISIBILITY",
    ">> Caution: Structural instability at higher elevations",
    ">> Local legend: 'Those who reach the summit may glimpse the past and future.'",
  ],

  exits: {
    north: "gorstanZone_highpass",
    south: "gorstanZone_gorstanvillage",
    east: "gorstanZone_runechamber",
    west: "gorstanZone_forgottenroad",
  },

  items: [
    "ancient_rune_fragment",
    "weathered_plaque",
    "mysterious_key",
    "old_banner",
  ],

  interactables: {
    spiral_staircase: {
      description:
        "A narrow, spiraling staircase carved into the stone, leading up into the mist.",
      actions: ["climb", "examine", "listen"],
      requires: [],
    },
    rune_panel: {
      description:
        "A section of the spire covered in glowing runes. Some appear to be interactive.",
      actions: ["examine", "activate", "translate"],
      requires: ["ancient_rune_fragment"],
    },
    plaque: {
      description:
        "A weathered plaque at the base of the spire, inscribed with faded text.",
      actions: ["read", "clean", "interpret"],
      requires: [],
    },
  },

  npcs: [],

  events: {
    onEnter: ["showSpireIntro", "checkForKeeper"],
    onExit: ["recordDescent"],
    onInteract: {
      spiral_staircase: ["climbStaircase", "encounterWind"],
      rune_panel: ["activateRunes", "revealKeeper"],
      plaque: ["readPlaque", "revealSecret"],
    },
  },

  flags: {
    runesActivated: false,
    keeperMet: false,
    plaqueRead: false,
    staircaseClimbed: false,
  },

  quests: {
    main: "Ascend Carron Spire",
    optional: [
      "Activate the Rune Panel",
      "Meet the Spire Keeper",
      "Read the Weathered Plaque",
      "Find the Ancient Rune Fragment",
    ],
  },

  environmental: {
    lighting: "misty_daylight",
    temperature: "cold_and_windy",
    airQuality: "crisp_with_mountain_air",
    soundscape: ["howling_wind", "distant_thunder", "stone_echoes"],
    hazards: ["high_winds", "unstable_stairs", "rune_energy"],
  },

  security: {
    level: "maximum",
    accessRequirements: [],
    alarmTriggers: ["tamper_with_runes"],
    surveillanceActive: false,
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "moderate",
    estimatedPlayTime: "10-15 minutes",
    keyFeatures: [
      "Vertical exploration",
      "Rune-based puzzles",
      "Spectral NPC",
      "Environmental hazards",
    ],
  },

  secrets: {
    hidden_chamber: {
      description:
        "A concealed chamber halfway up the spire, accessible only by activating the correct runes.",
      requirements: ["activate rune_panel", "climb spiral_staircase"],
      rewards: ["ancient_artifact", "lore_scroll"],
    },
    spire_vision: {
      description: "A vision of the past and future, granted at the summit.",
      requirements: ["ascend to summit", "meet spire_keeper"],
      rewards: ["future_hint", "historic_revelation"],
    },
  },

  customActions: {
    invoke_wind: {
      description: "Call upon the mountain winds to clear the mist.",
      requirements: ["weathered_plaque"],
      effects: ["improve_visibility", "reveal_hidden_path"],
    },
    restore_runes: {
      description: "Restore the power of the runes using a fragment.",
      requirements: ["ancient_rune_fragment"],
      effects: ["activate_rune_panel", "summon_spire_keeper"],
    },
  },
};

export default carronspire;

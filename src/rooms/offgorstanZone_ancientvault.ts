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

import { NPC } from '../types/NPCTypes';

import { Room } from '../types/Room';









const ancientvault: Room = {
  id: "ancientvault",
  zone: "offgorstanZone",
  title: "Ancient Vault",
  description: [
    "You step into the ancient vault, a place of forgotten treasures and lingering mysteries.",
    "The air is thick with the scent of old parchment and rusting metal.",
    "Dim light glints off piles of relics, and the silence is broken only by the faint creak of ancient hinges."
  ],
  image: "offgorstanZone_ancientvault.png",
  ambientAudio: "ancient_vault_ambience.mp3",

  consoleIntro: [
    ">> ANCIENT VAULT - TREASURE CHAMBER",
    ">> Access: RESTRICTED",
    ">> Tip: Examine relics carefully—some may be more than they appear."
  ],

  exits: {
    north: "offgorstanZone_ancientsroom",
    south: "offgorstanZone_multiversehub"
  },

  items: [
    "rusted_key",
    "ancient_coin",
    "sealed_scroll",
    "mysterious_amulet"
  ],

  interactables: {
    "locked_chest": {
      description: "A heavy chest bound with iron bands and an intricate lock.",
      actions: ["examine", "unlock", "open"],
      requires: ["rusted_key"],
    },
    "dusty_shelf": {
      description: "A shelf lined with relics, some covered in dust and cobwebs.",
      actions: ["search", "clean", "inspect"],
      requires: [],
    },
    "vault_door": {
      description: "The massive door you entered through, engraved with ancient runes.",
      actions: ["examine", "trace", "listen"],
      requires: [],
    }
  },

  npcs: [
    
  ],

  events: {
    onEnter: ["showAncientVaultIntro", "activateVaultRelics"],
    onExit: ["recordAncientVaultExit"],
    onInteract: {
      locked_chest: ["unlockChest", "openChest"],
      dusty_shelf: ["searchShelf", "inspectRelics"],
      vault_door: ["traceRunes", "listenAtDoor"],
    }
  },

  flags: {
    chestOpened: false,
    keeperMet: false,
    shelfSearched: false,
  },

  quests: {
    main: "Uncover the Secrets of the Ancient Vault",
    optional: [
      "Open the Locked Chest",
      "Meet the Vault Keeper",
      "Search the Dusty Shelf"
    ]
  },

  environmental: {
    lighting: "dim_and_dusty",
    temperature: "cool_and_stale",
    airQuality: "musty_with_age",
    soundscape: [
      "creaking_hinges",
      "soft_echoes",
      "rustling_paper"
    ],
    hazards: ["traps", "cursed_relics"]
  },

  security: {
    level: "high",
    accessRequirements: ["rusted_key"],
    alarmTriggers: ["unauthorized_opening"],
    surveillanceActive: true,
    surveillanceType: "vault_keeper"
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "hard",
    estimatedPlayTime: "10-20 minutes",
    keyFeatures: [
      "Treasure puzzles",
      "Guardian NPC",
      "Locked chest",
      "Ancient relics"
    ]
  },

  secrets: {
    hidden_compartment: {
      description: "A secret compartment inside the locked chest, revealed by careful inspection.",
      requirements: ["open locked_chest", "inspect chest"],
      rewards: ["rare_artifact", "vault_lore"],
    }
  },

  customActions: {
    "unlock_chest": {
      description: "Unlock the chest using the rusted key.",
      requirements: ["rusted_key"],
      effects: ["set_chestOpened", "reveal_secret"],
    },
    "search_shelf": {
      description: "Search the dusty shelf for hidden relics.",
      requirements: [],
      effects: ["set_shelfSearched", "find_item"],
    }
  }
};

export default ancientvault;



// offgorstanZone_ancientslibrary.ts — rooms/offgorstanZone_ancientslibrary.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: offgorstanZone_ancientslibrary

import { Room } from '../types/RoomTypes';

const ancientslibrary: Room = {
  id: "ancientslibrary",
  zone: "offgorstanZone",
  title: "Ancients' Library",
  description: [
    "You stand within the Ancients' Library, the true repository of all knowledge from all nine universes and all six iterations.",
    "Towering shelves spiral into infinity, each filled with tomes, scrolls, and crystalline data-cores inscribed with secrets lost to time.",
    "The air hums with the resonance of wisdom, and the architecture shifts subtly as if responding to your thoughts.",
    "A central dais glows with the light of convergence, where the boundaries of reality and possibility blur."
  ],
  image: "offgorstanZone_ancientslibrary.png",
  ambientAudio: "ancients_library_ambience.mp3",

  consoleIntro: [
    ">> ANCIENTS' LIBRARY - OMNIVERSAL ARCHIVE",
    ">> Access: UNRESTRICTED (with proper attunement)",
    ">> Knowledge Domains: ALL",
    ">> Tip: Seek the Codex of Iterations to unlock the deepest truths."
  ],

  exits: {
    south: "offgorstanZone_timelesshall",
    east: "offgorstanZone_voidatrium",
    west: "offgorstanZone_memoryvault"
  },

  items: [
    "codex_of_iterations",
    "universal_index",
    "infinite_scroll",
    "crystal_datacore",
    "ancient_quill"
  ],

  interactables: {
    "central_dais": {
      description: "A luminous dais at the heart of the library, pulsing with the energy of all realities.",
      actions: ["examine", "activate", "attune"],
      requires: ["codex_of_iterations"],
    },
    "infinite_shelves": {
      description: "Shelves that spiral endlessly, each containing knowledge from a different universe and iteration.",
      actions: ["search", "read", "catalogue"],
      requires: [],
    },
    "knowledge_conduit": {
      description: "A crystalline conduit that allows direct access to the library's archives.",
      actions: ["interface", "download", "query"],
      requires: ["universal_index"],
    }
  },

  npcs: [
{
      id: "omniscient_curator",
      name: "Omniscient Curator",
      description: "A timeless entity who oversees the preservation and distribution of all knowledge.",
      dialogue: {
        greeting: "Welcome, seeker. Here, all questions may find their answers.",
        help: "The Codex of Iterations is the key to understanding the cycles of existence.",
        farewell: "Return when you are ready to learn more. The library is eternal.",
      },
      spawnable: true,
      spawnCondition: "player_activates_central_dais",
    }
  ],

  events: {
    onEnter: ["showAncientsLibraryIntro", "attuneLibrary"],
    onExit: ["recordLibraryExit"],
    onInteract: {
      central_dais: ["activateDais", "attuneToLibrary"],
      infinite_shelves: ["searchShelves", "readTome"],
      knowledge_conduit: ["interfaceConduit", "downloadKnowledge"],
    }
  },

  flags: {
    daisActivated: false,
    curatorMet: false,
    codexFound: false,
    shelvesSearched: false,
    conduitAccessed: false,
  },

  quests: {
    main: "Uncover the Ultimate Truths of the Ancients' Library",
    optional: [
      "Find the Codex of Iterations",
      "Meet the Omniscient Curator",
      "Access the Knowledge Conduit",
      "Catalogue a Tome from Each Universe"
    ]
  },

  environmental: {
    lighting: "soft_omniversal_glow",
    temperature: "timeless_and_stable",
    airQuality: "charged_with_knowledge",
    soundscape: [
      "whispered_voices",
      "turning_pages",
      "resonant_chimes"
    ],
    hazards: ["knowledge_overload", "temporal_displacement"]
  },

  security: {
    level: "quarantined",
    accessRequirements: ["attunement", "codex_of_iterations"],
    alarmTriggers: ["unauthorized_access"],
    surveillanceActive: true,
    surveillanceType: "omniscient_curator"
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "1.0",
    playTested: false,
    difficulty: "disturbing",
    estimatedPlayTime: "30-60 minutes",
    keyFeatures: [
      "Omniversal knowledge",
      "Infinite shelves",
      "Central dais puzzle",
      "Omniscient NPC"
    ]
  },

  secrets: {
    hidden_chamber: {
      description: "A secret chamber accessible only by attuning the dais with the Codex of Iterations.",
      requirements: ["activate central_dais", "attune codex_of_iterations"],
      rewards: ["ultimate_truth", "ancient_artifact"],
    },
    curator_memory: {
      description: "A memory fragment from the Omniscient Curator, unlocked by accessing the knowledge conduit.",
      requirements: ["interface knowledge_conduit"],
      rewards: ["curator_story", "unique_insight"],
    }
  },

  customActions: {
    "attune_library": {
      description: "Attune yourself to the library's omniversal resonance.",
      requirements: ["codex_of_iterations"],
      effects: ["unlock_hidden_chamber", "gain_omniversal_vision"],
    },
    "catalogue_tome": {
      description: "Catalogue a tome from a specific universe and iteration.",
      requirements: [],
      effects: ["record_knowledge", "gain_insight"],
    }
  }
};

export default ancientslibrary;

// offgorstanZone_ancientsroom.ts — rooms/offgorstanZone_ancientsroom.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: offgorstanZone_ancientsroom

import { Room } from '../types/RoomTypes';

const ancientsroom: Room = {
  id: "ancientsroom",
  zone: "offgorstanZone",
  title: "Ancients' Room",
  description: [
    "You enter a quiet chamber set apart from the infinite shelves of the Ancients' Library.",
    "The walls are inscribed with shifting glyphs, softly glowing with ancient power.",
    "A sense of timelessness pervades the air, and the silence is deep and contemplative.",
    "In the center stands a pedestal holding a single artifact, radiating significance."
  ],
  image: "offgorstanZone_ancientsroom.png",
  ambientAudio: "ancients_room_ambience.mp3",

  consoleIntro: [
    ">> ANCIENTS' ROOM - PRIVATE CHAMBER",
    ">> Access: RESTRICTED",
    ">> Tip: Study the artifact and inscriptions for hidden wisdom."
  ],

  exits: {
    south: "offgorstanZone_ancientslibrary"
  },

  items: [
    "ancient_artifact",
    "inscribed_scroll"
  ],

  interactables: {
    "artifact_pedestal": {
      description: "A pedestal at the center of the room, supporting a mysterious artifact.",
      actions: ["examine", "take", "activate"],
      requires: [],
    },
    "glyphic_walls": {
      description: "Walls covered in shifting glyphs that seem to rearrange themselves as you watch.",
      actions: ["study", "trace", "decode"],
      requires: [],
    }
  },

  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],

  events: {
    onEnter: ["showAncientsRoomIntro", "activateGlyphs"],
    onExit: ["recordAncientsRoomExit"],
    onInteract: {
      artifact_pedestal: ["examineArtifact", "activateArtifact"],
      glyphic_walls: ["studyGlyphs", "decodeGlyphs"],
    }
  },

  flags: {
    artifactExamined: false,
    attendantMet: false,
    glyphsDecoded: false,
  },

  quests: {
    main: "Uncover the Purpose of the Ancients' Room",
    optional: [
      "Examine the Artifact",
      "Decode the Glyphic Walls",
      "Meet the Ancient Attendant"
    ]
  },

  environmental: {
    lighting: "soft_glyphic_glow",
    temperature: "timeless_and_still",
    airQuality: "charged_with_memory",
    soundscape: [
      "soft_hum",
      "whispered_glyphs"
    ],
    hazards: ["memory_overload"]
  },

  security: {
    level: "high",
    accessRequirements: ["artifact_permission"],
    alarmTriggers: ["unauthorized_removal"],
    surveillanceActive: true,
    surveillanceType: "ancient_attendant"
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
      "Private chamber",
      "Artifact puzzle",
      "Glyphic lore",
      "Guardian NPC"
    ]
  },

  secrets: {
    hidden_compartment: {
      description: "A secret compartment in the pedestal, revealed by activating the artifact.",
      requirements: ["activate artifact_pedestal"],
      rewards: ["ancient_memory", "unique_lore"],
    }
  },

  customActions: {
    "activate_artifact": {
      description: "Activate the artifact to reveal its hidden memory.",
      requirements: [],
      effects: ["set_artifactExamined", "unlock_secret"],
    },
    "decode_glyphs": {
      description: "Decode the shifting glyphs to gain insight.",
      requirements: [],
      effects: ["set_glyphsDecoded", "gain_knowledge"],
    }
  }
};

export default ancientsroom;

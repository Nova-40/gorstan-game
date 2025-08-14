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
// R.A.V.E.N. Chamber Room Component

import { Room } from "../types/Room.d";

const ravenChamberRoom: Room = {
  id: "ravenchamber",
  zone: "glitchZone",
  title: "R.A.V.E.N. Chamber",
  description: [
    "You step into a narrow chamber humming with quiet static. Cracked screens line the walls, some looping nonsense glyphs, others frozen mid-boot.",
    "At the far end, a sunken pedestal glows faintly blue. As you approach, an ancient AI console flickers to life, casting harsh white light.",
    "A synthetic voice—fragmented and uncertain—calls out to you, mistaking you for someone else.",
    "The air feels heavy with the weight of classified information and forgotten secrets.",
  ],
  image: "glitchZone_ravenchamber.png",
  ambientAudio: "glitchZone.mp3",
  exits: {
    back: "glitchinguniverse",
    out: "glitchinguniverse",
  },
  items: [],
  npcs: [],
  flags: {
    console_accessible: true,
    classified: true,
    securityClearanceRequired: true,
  },
  special: {
    hasConsole: true,
    isClassified: true,
    securityLevel: "REDACTED",
  },
  interactables: {
    console: {
      id: "console",
      name: "AI Console",
      description:
        "An ancient AI console with holographic displays and a palm scanner. The screen flickers with fragments of corrupted data.",
      commands: [
        "interact console",
        "access archive",
        "activate console",
        "touch console",
      ],
      responses: {
        examine:
          "The console is ancient but functional. Holographic displays flicker with fragments of corrupted data. A palm scanner glows faintly blue.",
        use: "You place your hand on the scanner. The console responds with a warm blue glow.",
        interact:
          "The console screen blazes to life. Ancient systems boot with crackling static...",
      },
    },
    screens: {
      id: "screens",
      name: "Cracked Screens",
      description:
        "Multiple screens line the walls, displaying corrupted data streams and glitched interfaces.",
      commands: ["look screens", "examine screens", "watch screens"],
      responses: {
        examine:
          "The screens show endless streams of corrupted data. Some display error messages in languages you don't recognize.",
        interact:
          "The screens are unresponsive to your touch, continuing their endless loops of broken code.",
      },
    },
    pedestal: {
      id: "pedestal",
      name: "Blue Pedestal",
      description:
        "A sunken pedestal at the far end of the chamber, glowing with faint blue light.",
      commands: ["examine pedestal", "touch pedestal", "approach pedestal"],
      responses: {
        examine:
          "The pedestal houses the main AI console. Its blue glow seems to pulse with a strange rhythm.",
        touch:
          "The pedestal feels warm to the touch, as if powered by some unknown energy source.",
      },
    },
  },

  // Custom room logic for redacted players
  onEnter: (gameState: any) => {
    const messages = [];

    if (gameState.flags?.playerIsRedacted) {
      messages.push({
        id: `raven-chamber-redacted-${Date.now()}`,
        text: "⚠️ The chamber recognizes you. Warning lights blink silently. Security protocols have been updated.",
        type: "error",
        timestamp: Date.now(),
      });
    }

    return { messages };
  },

  // Room-specific commands
  customCommands: {
    declassify: {
      description: "Attempt to declassify restricted information",
      handler: (gameState: any) => {
        if (gameState.flags?.playerIsRedacted) {
          return {
            messages: [
              {
                id: `declassify-${Date.now()}`,
                text: "🔐 Access granted. Your redacted status has been recognized.",
                type: "system",
                timestamp: Date.now(),
              },
            ],
          };
        } else {
          return {
            messages: [
              {
                id: `declassify-denied-${Date.now()}`,
                text: "❌ Access denied. Insufficient clearance level.",
                type: "error",
                timestamp: Date.now(),
              },
            ],
          };
        }
      },
    },
    "i know too much": {
      description: "Passphrase for redacted individuals",
      handler: (gameState: any) => {
        if (gameState.flags?.playerIsRedacted) {
          return {
            messages: [
              {
                id: `passphrase-accepted-${Date.now()}`,
                text: "🔓 Passphrase accepted. You may proceed.",
                type: "system",
                timestamp: Date.now(),
              },
            ],
          };
        } else {
          return {
            messages: [
              {
                id: `passphrase-unknown-${Date.now()}`,
                text: "❓ The system does not recognize that phrase.",
                type: "system",
                timestamp: Date.now(),
              },
            ],
          };
        }
      },
    },
  },
};

export default ravenChamberRoom;

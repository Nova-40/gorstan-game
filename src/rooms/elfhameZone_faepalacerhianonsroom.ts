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

import { Room } from "../types/Room";

const faepalacerhianonsroom: Room = {
  id: "faepalacerhianonsroom",
  zone: "elfhameZone",
  title: "Rhianon's Private Chamber",
  description: [
    "You enter the private chamber of Rhianon, one of the most powerful Fae nobles. The room is a study in elegant contrasts - walls of deepest midnight blue are studded with points of light that shift like captured stars, while furniture of pale silver wood seems to glow with its own inner radiance.",
    "A large window dominates one wall, but instead of showing the palace grounds, it displays a constantly shifting view of different realms and times. Through it, you can see alien worlds, distant futures, and memories of the distant past.",
    "The air is perfumed with the scent of night-blooming flowers and something else - the sharp, clean smell of magic being woven. Books float in the air around the room, their pages turning by themselves as they read their own contents.",
    "This is clearly the private space of someone with immense power and equally immense knowledge. Every object here hums with magic, and you sense that disturbing the wrong thing could have consequences beyond imagining.",
  ],
  image: "elfhameZone_faepalacerhianonsroom.png",
  ambientAudio: "fae_noble_chamber_ambience.mp3",

  consoleIntro: [
    ">> RHIANON'S PRIVATE CHAMBER - NOBLE QUARTERS - RESTRICTED ACCESS",
    ">> Location: PALACE UPPER LEVELS - PRIVATE WING",
    ">> Occupant: RHIANON - HIGH FAE NOBLE - EXTREME CAUTION",
    ">> Magical saturation: CRITICAL - Ambient magic at dangerous levels",
    ">> Temporal window: ACTIVE - Multiple timeline views accessible",
    ">> Floating library: SENTIENT - Books with autonomous intelligence",
    ">> Furniture animation: MODERATE - Silver wood responsive to presence",
    ">> WARNING: Do not disturb magical experiments in progress",
    ">> Privacy enchantments: MAXIMUM - Conversation may be monitored",
    ">> Exit protocols: RESPECTFUL - Proper courtesy required",
  ],

  exits: {
    south: "faepalacemainhall",
    down: "faepalacemainhall",
  },

  items: ["star_map", "magical_focus", "temporal_lens", "fae_grimoire"],

  interactables: {
    temporal_window: {
      description:
        "A large window that displays constantly shifting views of different realms and times.",
      actions: ["examine", "peer through", "focus"],
      requires: ["temporal_lens"],
    },
    floating_books: {
      description:
        "Books that float in the air, their pages turning by themselves as they read their own contents.",
      actions: ["examine", "read", "interact"],
      requires: [],
    },
    silver_furniture: {
      description:
        "Furniture of pale silver wood that glows with inner radiance and responds to presence.",
      actions: ["examine", "touch", "use"],
      requires: [],
    },
    star_walls: {
      description:
        "Walls of deepest midnight blue studded with points of light that shift like captured stars.",
      actions: ["examine", "touch", "map"],
      requires: ["star_map"],
    },
    magic_workbench: {
      description:
        "A workbench where powerful magic is woven, covered with arcane instruments and glowing materials.",
      actions: ["examine", "use", "experiment"],
      requires: ["magical_focus"],
    },
  },
};

export default faepalacerhianonsroom;

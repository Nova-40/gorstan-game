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

const elfhame: Room = {
  id: "elfhame",
  zone: "elfhameZone",
  title: "Elfhame - The Fae Realm",
  description: [
    "You stand at the heart of Elfhame, the ancient realm of the Fae. Ancient trees tower impossibly high, their silver bark gleaming with an otherworldly luminescence. The air itself seems to shimmer with magic, and whispers of ancient secrets drift on the ethereal breeze.",
    "Paths of starlight wind between the trees, leading to distant wonders barely visible through the perpetual twilight. The ground beneath your feet is carpeted with luminescent moss that glows softly with each step.",
    "The very air thrums with power, and you sense that this place exists outside the normal flow of time. Everything here feels both ancient beyond measure and eternally young.",
    "In the distance, you can glimpse the spires of a magnificent palace rising above the treeline, its crystalline walls catching and reflecting the eternal sunset that bathes this realm.",
  ],
  image: "elfhameZone_elfhame.png",
  ambientAudio: "fae_realm_ambience.mp3",

  consoleIntro: [
    ">> ELFHAME - THE FAE REALM - DIMENSIONAL ANCHOR ESTABLISHED",
    ">> Location: PRIMARY FAE TERRITORY - NEUTRAL GROUND",
    ">> Magical resonance: EXTREMELY HIGH - Caution advised",
    ">> Temporal flow: VARIABLE - Time moves differently here",
    ">> Fae presence: ACTIVE - Multiple entities detected",
    ">> Palace access: RESTRICTED - Requires proper introduction",
    ">> Lake region: ACCESSIBLE - Natural wonder beyond description",
    ">> WARNING: Fae bargains are binding - Consider all agreements carefully",
    ">> Local customs: UNKNOWN - Observe and adapt",
    ">> Exit protocols: ESTABLISHED - Return paths maintained",
  ],

  exits: {
    north: "faepalacemainhall",
    south: "faeglade",
    east: "faelake",
    west: "faelake",
  },

  Roomitem: ["whisper_stone"],

  interactables: {
    starlight_paths: {
      description:
        "Paths of pure starlight that wind between the ancient trees, leading to distant wonders.",
      actions: ["examine", "follow", "touch"],
      requires: [],
    },
    luminescent_moss: {
      description:
        "Soft, glowing moss that carpets the ground and responds to your presence.",
      actions: ["examine", "touch", "gather"],
      requires: [],
    },
    whispering_trees: {
      description:
        "Ancient trees whose silver bark gleams with otherworldly light, and whose branches whisper secrets.",
      actions: ["examine", "listen", "touch"],
      requires: [],
    },
    palace_spires: {
      description:
        "Distant crystalline spires of the Fae Palace, visible through the eternal twilight.",
      actions: ["examine", "observe"],
      requires: [],
    },
  },
};

export default elfhame;

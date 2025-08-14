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

const faepalacedungeons: Room = {
  id: "faepalacedungeons",
  zone: "elfhameZone",
  title: "Fae Palace Dungeons",
  description: [
    "Beneath the crystalline beauty of the Fae Palace lie these ancient dungeons, carved from living stone that pulses with a faint, eerie light. The walls are lined with cells that seem to exist in multiple dimensions simultaneously, their bars shimmering between solid reality and ethereal mist.",
    "The air down here is thick with the weight of forgotten years and the echo of long-silenced voices. Chains of silver and starlight hang from the ceiling, their purpose unclear but their magic unmistakable.",
    "Strange symbols carved into the floor glow with a cold blue light, forming patterns that hurt to look at directly. These are clearly not dungeons built by mortal hands, but something far older and more alien.",
    "Despite the oppressive atmosphere, there is a sense that these dungeons serve a purpose beyond mere imprisonment - they are a place where the laws of reality bend and break, where the Fae conduct their most secretive and dangerous experiments.",
  ],
  image: "elfhameZone_faepalacedungeons.png",
  ambientAudio: "fae_dungeons_ambience.mp3",

  consoleIntro: [
    ">> FAE PALACE DUNGEONS - RESTRICTED ACCESS - SECURITY LEVEL: EXTREME",
    ">> Location: SUBTERRANEAN LEVEL - BENEATH PALACE STRUCTURE",
    ">> Dimensional stability: UNSTABLE - Reality fluctuations detected",
    ">> Cell matrix: MULTIDIMENSIONAL - Containment beyond normal space",
    ">> Magical resonance: DARK - Experimental magic signatures present",
    ">> Prisoner count: CLASSIFIED - Ancient containment protocols active",
    ">> WARNING: Unauthorized access to experiments strictly forbidden",
    ">> Reality anchor: WEAKENED - Time and space distortions possible",
    ">> Exit protocols: EMERGENCY ONLY - Teleportation magic suppressed",
    ">> Caution: Some prisoners may not be entirely corporeal",
  ],

  exits: {
    up: "faepalacemainhall",
    north: "faepalacemainhall",
  },

  items: [
    "silver_chain",
    "reality_anchor",
    "dungeon_key",
    "containment_crystal",
  ],

  interactables: {
    dimensional_cells: {
      description:
        "Prison cells that exist in multiple dimensions, their bars shifting between solid metal and ethereal mist.",
      actions: ["examine", "touch", "peer into"],
      requires: [],
    },
    starlight_chains: {
      description:
        "Chains made of silver and starlight that hang from the ceiling, humming with contained power.",
      actions: ["examine", "touch", "manipulate"],
      requires: ["dungeon_key"],
    },
    reality_symbols: {
      description:
        "Strange symbols carved into the floor that glow with cold blue light and form painful patterns.",
      actions: ["examine", "trace", "decipher"],
      requires: [],
    },
    living_stone_walls: {
      description:
        "Walls carved from living stone that pulse with faint, eerie light and seem to breathe.",
      actions: ["examine", "touch", "listen"],
      requires: [],
    },
  },
};

export default faepalacedungeons;

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

export const peacefulStanton: Room = {
  image: "stantonZone_peacefulStanton.png",
  description: [
    "Peaceful Stanton is a haven of calm, where the gentle hum of nature creates a soothing backdrop.",
    "The streets are lined with vibrant flower beds, and the cottages here seem to radiate warmth and hospitality.",
    "A small fountain bubbles quietly at the center of the square, its crystal-clear water catching the sunlight.",
    "Children’s laughter echoes faintly in the distance, blending harmoniously with the chirping of birds.",
    "The atmosphere is idyllic, a stark contrast to the other parts of Stanton, offering a moment of respite.",
  ],
  zone: "stantonZone",
  title: "Peaceful Stanton",

  consoleIntro: [
    ">> PEACEFUL STANTON - IDYLLIC AREA - DIMENSIONAL ANCHOR ESTABLISHED",
    ">> Location: PRIMARY STANTON TERRITORY - NEUTRAL GROUND",
    ">> Magical resonance: LOW - Proceed with ease",
    ">> Temporal flow: STABLE - Time flows normally here",
    ">> Fountain: ACTIVE - Potential for interaction detected",
    ">> WARNING: Prolonged exposure to tranquility may induce complacency",
  ],

  exits: {
    north: "stantonharcourt",
    south: "silentStanton",
    east: "glitchStanton",
    west: "ascendantStanton",
  },

  items: [
    "flower_petals",
    "fountain_coin",
    "sunlight_crystal",
    "childrens_toy",
  ],

  interactables: {
    fountain: {
      description:
        "A small fountain bubbling quietly at the center of the square.",
      actions: ["examine", "drink", "throw_coin"],
      requires: [],
    },
    flower_beds: {
      description:
        "Vibrant flower beds lining the streets, radiating color and life.",
      actions: ["examine", "collect", "smell"],
      requires: [],
    },
    cottages: {
      description: "Warm and hospitable cottages, inviting you to explore.",
      actions: ["examine", "enter", "knock"],
      requires: [],
    },
  },

  id: "peacefulStanton",
};

export default peacefulStanton;

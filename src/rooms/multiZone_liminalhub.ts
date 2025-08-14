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

export const liminalhub: Room = {
  id: "liminalhub",
  title: "The Liminal Hub",
  zone: "multiZone",
  image: "liminalhub.png",
  description: [
    "A vast, circular chamber stretches out before you, its walls shimmering with a pearlescent, shifting light that defies easy description. The floor is a seamless expanse of polished obsidian, reflecting the ethereal glow from above.",
    "There are no visible doors or windows, giving the space a boundless, infinite quality. In the center of the room, a low, circular platform hums with a quiet energy. The air is still, clean, and carries a faint scent of ozone and sterile electronics.",
  ],
  lookDescription:
    "Looking closer, you see faint, ghostly images of other places flickering across the walls, like half-remembered dreams. They are too indistinct to make out, but they give the impression of a place connected to everywhere and nowhere at once.",
  exits: {},
  items: [],
  npcs: [],

  flags: {
    no_random_encounter: true,
    is_hub: true,
  },
};

export default liminalhub;

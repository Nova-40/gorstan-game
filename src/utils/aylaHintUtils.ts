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
// Game module.

// --- Function: getAylaHint ---
export function getAylaHint(
  room: { id?: string },
  flags: Record<string, any>,
  inventory: string[],
  traits: string[],
): string {
  const id = room?.id;

  if (flags?.godmode)
    {return "🛠 You're in godmode. Try /goto or /solve if you're stuck.";}

  if (id === "resetroom" && !flags.resetButtonPressed)
    {return "🔴 Try pressing the big glowing button. Worst case? Multiverse annihilation.";}

  if (
    ["controlnexus", "hiddenlab"].includes(id || "") &&
    !inventory.includes("coffee")
  )
    {return "☕ You dropped your coffee earlier… maybe try throwing it?";}

  if (id === "greasystoreroom" && !inventory.includes("dirty napkin"))
    {return "🧻 That greasy napkin may be more than it seems.";}

  if (id === "introreset")
    {return "🌀 Strange place, isn’t it? You might need to retrace your steps.";}

  if (traits.includes("curious") && id?.startsWith("maze"))
    {return "🧠 You've been here before. Look closer — something has changed.";}

  return "🤷 Honestly? I'm not sure. But I believe in you, mostly.";
}

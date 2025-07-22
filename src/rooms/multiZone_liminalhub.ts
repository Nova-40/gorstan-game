import { Room } from '../types/RoomTypes';

import { Room } from './RoomTypes';



// multiZone_liminalhub.ts — rooms/multiZone_liminalhub.ts
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Description: The Liminal Hub is a special, futuristic zone that acts as a central travel nexus.


/**
 * The Liminal Hub is a special, futuristic zone that acts as a central travel nexus.
 * Players who possess the 'universal remote' item can use it here to travel to any known room.
 * It can be populated by various transient NPCs, but never Ayla.
 */
export const liminalhub: Room = {
  id: 'liminalhub',
  title: 'The Liminal Hub',
  zone: 'multiZone',
  image: 'liminalhub.png',
  description: [
    'A vast, circular chamber stretches out before you, its walls shimmering with a pearlescent, shifting light that defies easy description. The floor is a seamless expanse of polished obsidian, reflecting the ethereal glow from above.',
    'There are no visible doors or windows, giving the space a boundless, infinite quality. In the center of the room, a low, circular platform hums with a quiet energy. The air is still, clean, and carries a faint scent of ozone and sterile electronics.',
  ],
  lookDescription: 'Looking closer, you see faint, ghostly images of other places flickering across the walls, like half-remembered dreams. They are too indistinct to make out, but they give the impression of a place connected to everywhere and nowhere at once.',
  exits: {}, // No standard exits; travel is handled by the remote.
  items: [], // The remote is found elsewhere.
  npcs: [
    // NPCs managed dynamically by wanderingNPCController
  ],
  // events: [
  //   {
  //     id: 'event_hub_travel',
  //     trigger: 'command',
  //     // This condition requires the player to have the remote and use it.
  //     condition: "command.verb === 'use' && command.noun === 'remote' && player.inventory.includes('universal_remote')",
  //     action: 'special:hub_travel',
  //     parameters: {
  //       prompt: 'The remote whirs to life. Select destination:',
  //     },
  //     repeatable: true,
  //   },
  // ],
  flags: ['no_random_encounter', 'is_hub'],
};

export default liminalhub

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

import { FlagMap } from '../state/flagRegistry';



import { useFlags } from './useFlags';










export const useLibrarianLogic = (
  state: any,
  dispatch: React.Dispatch<any>,
  room: any,
  loadModule: (path: string) => Promise<any>
) => {
  const { hasFlag, clearFlag } = useFlags();

// Variable declaration
  const handleLibrarian = () => {
    if (hasFlag(FlagMap.npc.pendingLibrarianCommand)) {
      loadModule('../engine/librarianController').then(({ handleLibrarianInteraction }) => {
        handleLibrarianInteraction(state, dispatch);
        clearFlag(FlagMap.npc.pendingLibrarianCommand);
      });
    }
  };

// Variable declaration
  const spawnLibrarianIfFlagged = () => {
    if (hasFlag(FlagMap.npc.forceLibrarianSpawn) && room) {
      loadModule('../engine/librarianController').then(({ spawnLibrarian }) => {
        spawnLibrarian(room, state, dispatch);
        console.log('[DEBUG] Librarian forcibly spawned.');
        clearFlag(FlagMap.npc.forceLibrarianSpawn);
      });
    }
  };

  

  return {
    handleLibrarian,
    spawnLibrarianIfFlagged
  };
};

// src/hooks/useLibrarianLogic.ts
// Gorstan Game Beta 1
// Code Licence MIT
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

import { FlagMap } from '../state/flagRegistry';


// Use the unified flag management hook
import { useFlags } from './useFlags';



// src/hooks/useLibrarianLogic.ts
// Gorstan Game (c) Geoff Webster 2025
// Code MIT Licence
// Hook to manage Librarian-specific logic



export const useLibrarianLogic = (
  state: any,
  dispatch: React.Dispatch<any>,
  room: any,
  loadModule: (path: string) => Promise<any>
) => {
  const { hasFlag, clearFlag } = useFlags();

  const handleLibrarian = () => {
    if (hasFlag(FlagMap.npc.pendingLibrarianCommand)) {
      loadModule('../engine/librarianController').then(({ handleLibrarianInteraction }) => {
        handleLibrarianInteraction(state, dispatch);
        clearFlag(FlagMap.npc.pendingLibrarianCommand);
      });
    }
  };

  const spawnLibrarianIfFlagged = () => {
    if (hasFlag(FlagMap.npc.forceLibrarianSpawn) && room) {
      loadModule('../engine/librarianController').then(({ spawnLibrarian }) => {
        spawnLibrarian(room, state, dispatch);
        console.log('[DEBUG] Librarian forcibly spawned.');
        clearFlag(FlagMap.npc.forceLibrarianSpawn);
      });
    }
  };

  // Removed checkLibrarianStatus as the flag does not exist in FlagMap

  return {
    handleLibrarian,
    spawnLibrarianIfFlagged
  };
};

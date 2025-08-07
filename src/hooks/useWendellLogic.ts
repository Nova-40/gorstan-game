// src/hooks/useWendellLogic.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import { FlagMap } from '../state/flagRegistry';

import { useFlags } from './useFlags';










export const useWendellLogic = (
  state: any,
  dispatch: React.Dispatch<any>,
  room: any,
  loadModule: (path: string) => Promise<any>
) => {
  const { hasFlag, clearFlag } = useFlags();

// Variable declaration
  const handleWendell = () => {
    if (hasFlag(FlagMap.npc.pendingWendellCommand)) {
      loadModule('../engine/mrWendellController').then(({ handleWendellInteraction }) => {
        handleWendellInteraction(state, dispatch);
        clearFlag(FlagMap.npc.pendingWendellCommand);
      });
    }
  };

// Variable declaration
  const spawnWendellIfFlagged = () => {
    if (hasFlag(FlagMap.npc.forceWendellSpawn) && room) {
      loadModule('../engine/mrWendellController').then((module) => {
        module.spawnWendell(room, state, dispatch);
        console.log('[DEBUG] Mr. Wendell forcibly spawned.');
        clearFlag(FlagMap.npc.forceWendellSpawn);
      });
    }
  };

// Variable declaration
  const checkWendellStatus = () => {
    if (hasFlag(FlagMap.npc.checkWendellStatus)) {
      loadModule('../engine/mrWendellController').then(({ isWendellActive, getWendellRoom }) => {
        console.log('[DEBUG] Mr. Wendell Status:');
        console.log('- Active:', isWendellActive());
        console.log('- Current Room:', getWendellRoom());
        clearFlag(FlagMap.npc.checkWendellStatus);
      });
    }
  };

  return {
    handleWendell,
    spawnWendellIfFlagged,
    checkWendellStatus
  };
};

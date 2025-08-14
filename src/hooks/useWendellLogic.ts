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

import { FlagMap } from "../state/flagRegistry";
import { useFlags } from "./useFlags";
import type { LocalGameState } from "../state/gameState";
import type { GameAction } from "../types/GameTypes";
import type { Dispatch } from "react";
import type { Room } from "../types/Room";

export const useWendellLogic = (
  state: LocalGameState,
  dispatch: Dispatch<GameAction>,
  room: Room | undefined,
  loadModule: (path: string) => Promise<unknown>,
) => {
  const { hasFlag, clearFlag } = useFlags();

  // Variable declaration
  const handleWendell = () => {
    if (hasFlag(FlagMap.npc.pendingWendellCommand)) {
      loadModule("../engine/mrWendellController").then((mod) => {
        const { handleWendellInteraction } =
          (mod as typeof import("../engine/mrWendellController")) || {};
        if (typeof handleWendellInteraction === "function") {
          // Note: pending command value is handled elsewhere; this is a convenience trigger
          handleWendellInteraction("", state, dispatch);
        }
        clearFlag(FlagMap.npc.pendingWendellCommand);
      });
    }
  };

  // Variable declaration
  const spawnWendellIfFlagged = () => {
    if (hasFlag(FlagMap.npc.forceWendellSpawn) && room) {
      loadModule("../engine/mrWendellController").then((module) => {
        const { spawnWendell } = module as any as {
          spawnWendell?: (
            room: Room,
            state: LocalGameState,
            dispatch: Dispatch<GameAction>,
          ) => void;
        };
        spawnWendell?.(room, state, dispatch);
        console.log("[DEBUG] Mr. Wendell forcibly spawned.");
        clearFlag(FlagMap.npc.forceWendellSpawn);
      });
    }
  };

  // Variable declaration
  const checkWendellStatus = () => {
    if (hasFlag(FlagMap.npc.checkWendellStatus)) {
      loadModule("../engine/mrWendellController").then((mod) => {
        const { isWendellActive, getWendellRoom } =
          (mod as typeof import("../engine/mrWendellController")) || {};
        console.log("[DEBUG] Mr. Wendell Status:");
        console.log(
          "- Active:",
          typeof isWendellActive === "function" ? isWendellActive() : false,
        );
        console.log(
          "- Current Room:",
          typeof getWendellRoom === "function" ? getWendellRoom() : undefined,
        );
        clearFlag(FlagMap.npc.checkWendellStatus);
      });
    }
  };

  return {
    handleWendell,
    spawnWendellIfFlagged,
    checkWendellStatus,
  };
};

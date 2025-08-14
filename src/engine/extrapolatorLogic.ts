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

interface GameFlags {
  schrCoinSeen?: boolean;
  schrCoinPicked?: boolean;
  napkinExtrapolated?: boolean;
}

interface GameState {
  flags: GameFlags;
  inventory: string[];
  currentRoomId: string;
}

export function canUseExtrapolator(state: GameState): boolean {
  const { flags } = state;
  return Boolean(flags.schrCoinSeen) && !flags.schrCoinPicked;
}

export function runExtrapolator(state: GameState): string {
  if (state.flags.schrCoinPicked) {
    import("./specialDeathEffects").then((mod) => mod.paradoxDeathSequence());
    return "The extrapolator emits a grinding sound... then explodes. You've broken causality.";
  }
  if (!canUseExtrapolator(state)) {
    return "The extrapolator hums, but nothing happens. A faint message glows: 'Insufficient quantum anchor.'";
  }
  state.flags.napkinExtrapolated = true;
  return "The napkin glows, unfurling complex plans in shimmering ink. The extrapolator clicks and falls silent.";
}

export function canEnterStanton(state: GameState): boolean {
  return !!state.flags.napkinExtrapolated;
}

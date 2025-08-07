
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
  return Boolean(flags.schrCoinSeen) && !Boolean(flags.schrCoinPicked);
}

export function runExtrapolator(state: GameState): string {
  if (state.flags.schrCoinPicked) {
    import('./specialDeathEffects').then(mod => mod.paradoxDeathSequence());
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

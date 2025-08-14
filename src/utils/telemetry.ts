// Telemetry system for gameplay metrics (DEV_ONLY)

export interface TelemetryMetrics {
  time_to_first_interaction?: number;
  time_to_first_choice?: number;
  time_to_first_puzzle_success?: number;
  stuck_time_per_room: Record<string, number>;
  hint_triggers: number;
  npc_convo_loops: number;
  teleport_uses: number;
  coin_interactions: number;
  session_length?: number;
  rage_quit_events: number;
}

const telemetry: TelemetryMetrics = {
  stuck_time_per_room: {},
  hint_triggers: 0,
  npc_convo_loops: 0,
  teleport_uses: 0,
  coin_interactions: 0,
  rage_quit_events: 0,
};

let sessionStartTime: number | null = null;

export function startSession(): void {
  sessionStartTime = Date.now();
}

export function logInteraction(): void {
  if (!telemetry.time_to_first_interaction) {
    telemetry.time_to_first_interaction = Date.now() - (sessionStartTime || Date.now());
  }
}

export function logChoice(): void {
  if (!telemetry.time_to_first_choice) {
    telemetry.time_to_first_choice = Date.now() - (sessionStartTime || Date.now());
  }
}

export function logPuzzleSuccess(): void {
  if (!telemetry.time_to_first_puzzle_success) {
    telemetry.time_to_first_puzzle_success = Date.now() - (sessionStartTime || Date.now());
  }
}

export function logStuckTime(roomId: string, idleTime: number): void {
  telemetry.stuck_time_per_room[roomId] = (telemetry.stuck_time_per_room[roomId] || 0) + idleTime;
}

export function logHintTrigger(): void {
  telemetry.hint_triggers++;
}

export function logNpcConvoLoop(): void {
  telemetry.npc_convo_loops++;
}

export function logTeleportUse(): void {
  telemetry.teleport_uses++;
}

export function logCoinInteraction(): void {
  telemetry.coin_interactions++;
}

export function endSession(): void {
  if (sessionStartTime) {
    telemetry.session_length = Date.now() - sessionStartTime;
  }
}

export function logRageQuit(): void {
  telemetry.rage_quit_events++;
}

export function getTelemetry(): TelemetryMetrics {
  return telemetry;
}

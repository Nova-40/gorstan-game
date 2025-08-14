import type { AylaHintContext } from "./aylaHintSystem";

export function analyzeStuckState(context: AylaHintContext) {
  const { recentCommands, timeInRoom, failedAttempts, currentRoom } = context;

  const stuckIndicators: {
    isStuck: boolean;
    confidence: number;
    reasons: string[];
    category:
      | "general"
      | "navigation"
      | "puzzle"
      | "interaction"
      | "inventory"
      | "social"
      | "miniquest";
  } = {
    isStuck: false,
    confidence: 0,
    reasons: [],
    category: "general",
  };

  // Time-based stuck detection
  if (timeInRoom > 120000) {
    stuckIndicators.isStuck = true;
    stuckIndicators.confidence += 0.3;
    stuckIndicators.reasons.push("extended_time_in_room");
  }

  // Repetitive command patterns
  const uniqueCommands = new Set(recentCommands.slice(-10));
  if (recentCommands.length >= 5 && uniqueCommands.size <= 2) {
    stuckIndicators.isStuck = true;
    stuckIndicators.confidence += 0.4;
    stuckIndicators.reasons.push("repetitive_commands");
  }

  // Failed attempts
  if (failedAttempts.length >= 3) {
    stuckIndicators.isStuck = true;
    stuckIndicators.confidence += 0.5;
    stuckIndicators.reasons.push("multiple_failures");
  }

  // Navigation confusion
  const directionCommands = recentCommands.filter((cmd) =>
    ["north", "south", "east", "west", "go", "back", "up", "down"].some((dir) =>
      cmd.includes(dir),
    ),
  );
  if (directionCommands.length >= 4) {
    stuckIndicators.category = "navigation";
    stuckIndicators.isStuck = true;
    stuckIndicators.confidence += 0.3;
    stuckIndicators.reasons.push("navigation_confusion");
  }

  return stuckIndicators;
}

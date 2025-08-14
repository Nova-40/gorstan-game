# NOW Phase Summary

## Overview
This document summarizes the key changes and outcomes of the NOW phase.

### Features Implemented
- **Objective Markers**: Added markers to early rooms to clarify objectives.
- **Teleport Feedback**: Implemented destination previews and arrival orientation messages.
- **Hint System**: Adjusted hint cadence for Tier-3 puzzles to reduce frustration.

## Flags & States
The following flags were added or modified in `src/config/flags.ts`:
- `DEV_ONLY_OBJECTIVE_MARKERS`
- `DEV_ONLY_TELEPORT_PREVIEWS`
- `DEV_ONLY_HINT_CADENCE`

## Files Changed (Last 50 Commits)
Branch: `feat/gameplay-now-pass`

| Commit Hash | Date       | Message                                      |
|-------------|------------|----------------------------------------------|
| ccdf3c5     | 2025-08-14 | feat: adjust hint cadence for Tier-3 puzzles |
| cc8819b     | 2025-08-13 | feat: add DEV-ONLY teleport previews         |
| 7505823     | 2025-08-12 | feat: add DEV-ONLY objective markers         |

## KPI Snapshot
- **First Choice Time**: PENDING
- **First Success Time**: PENDING
- **Stuck Time Reduction**: PENDING
- **Teleport Latency**: PENDING
- **NPC Loops**: PENDING
- **Rage Quits**: PENDING

## Risks & Notes
- Ensure DEV-ONLY features are disabled in production.
- Monitor for unintended side effects during playtests.

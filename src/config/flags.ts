/* Feature Flags for Development */

export const FLAGS = {
  DEV_ONLY: process.env.NODE_ENV === "development",
  ENABLE_OBJECTIVE_MARKERS: false,
  ENABLE_TELEPORT_PREVIEWS: false,
  ENABLE_HINT_CADENCE_ADJUSTMENTS: false,
};

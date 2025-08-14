import { FLAGS } from "../config/flags";

export function teleportTo(destination: string) {
  if (FLAGS.DEV_ONLY && FLAGS.ENABLE_TELEPORT_PREVIEWS) {
    console.log(`Preview: Teleporting to ${destination}`);
  }

  // Simulate teleportation logic
  console.log(`Arrived at ${destination}`);

  if (FLAGS.DEV_ONLY && FLAGS.ENABLE_TELEPORT_PREVIEWS) {
    console.log(`Orientation: You are now in ${destination}. Explore to find your next objective.`);
  }
}
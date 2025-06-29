export function getDialogue(npc, state) {
  switch (npc) {
    case 'Ayla':
      return state?.trust > 3 ? "You're doing well." : "Try exploring more.";
    case 'Polly':
      return "Oh, you're still alive. How quaint.";
    default:
      return "They stare at you silently.";
  }
}
const glitches = [
  "Reality distortion detected...",
  "Signal degradation escalating...",
  "Error: Entity duplication suspected...",
];

export function getGlitchMessage() {
  return glitches[Math.floor(Math.random() * glitches.length)];
}
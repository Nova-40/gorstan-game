const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

const sounds = {
  success: '/src/assets/sounds/success.wav',
  failure: '/src/assets/sounds/fail.wav',
  teleport: '/src/assets/sounds/portal.mp3',
};

export function playSFX(type: keyof typeof sounds): void {
  const soundUrl = sounds[type];
  if (!soundUrl) return;

  fetch(soundUrl)
    .then((response) => response.arrayBuffer())
    .then((buffer) => audioContext.decodeAudioData(buffer))
    .then((decodedData) => {
      const source = audioContext.createBufferSource();
      source.buffer = decodedData;
      source.connect(audioContext.destination);
      source.start(0);
    })
    .catch((error) => console.error('Error playing sound:', error));
}

import { PitchDetectorNeural } from './utils/pitchDetector/PitchDetectorNeural';

let isLoaded = false;
window.addEventListener('click', async () => {
  if (isLoaded) {
    return;
  }

  isLoaded = true;
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const pitchDet = new PitchDetectorNeural(ctx, ({ pitch, confidence }) => {
    /* if (confidence < 0.9) {
      gain.gain.value = 0;
      return;
    } */

    const confidenceSigmoid = (Math.tanh(confidence * 100 - 20) + 1) / 2;

    oscillator.frequency.value = pitch * 2;
    gain.gain.value = confidenceSigmoid * 0.8;
  });

  oscillator.frequency.value = 440;
  oscillator.connect(gain);
  oscillator.start();
  gain.connect(ctx.destination);
  await pitchDet.init('crepe');

  const stream = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(() => alert('Please allow microphone!'));

  void pitchDet.start(ctx.createMediaStreamSource(stream as MediaStream));
});

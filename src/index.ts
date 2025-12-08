import { CrepePitchDetector } from './utils/pitchDetection/CrepePitchDetector';

let isLoaded = false;
window.addEventListener('click', async () => {
  if (isLoaded) {
    return;
  }

  isLoaded = true;
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const movingWindow: [number, number][] = [];
  const pitchDet = new CrepePitchDetector(ctx, ({ pitch, confidence }) => {
    movingWindow.push([pitch, confidence]);
    if (movingWindow.length > 40) {
      movingWindow.unshift();
    }

    const { sum, cnt } = movingWindow.reduce(
      ({ sum, cnt }, [pitch, confidence]) => ({
        sum: sum + pitch * confidence,
        cnt: cnt + confidence,
      }),
      { sum: 0, cnt: 0 }
    );

    oscillator.frequency.value = sum / cnt;
    gain.gain.value = cnt / 70;
  });

  oscillator.frequency.value = 440;
  oscillator.connect(gain);
  oscillator.start();
  gain.connect(ctx.destination);
  await pitchDet.init();
  void pitchDet.start(await fetch('/puzzle-girl.mp3').then(res => res.arrayBuffer()));
});

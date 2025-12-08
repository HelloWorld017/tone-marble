import Meyda from 'meyda';
import { CrepePitchDetector } from './utils/pitchDetection/CrepePitchDetector';
import type { MeydaFeaturesObject } from 'meyda';

let isLoaded = false;
window.addEventListener('click', async () => {
  if (isLoaded) {
    return;
  }

  isLoaded = true;
  const ctx = new AudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  const audio = await fetch('/Hollowness-692637037.mp3').then(res => res.arrayBuffer());
  const audioBuffer = await ctx.decodeAudioData(audio);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.start();

  const analyzer = Meyda.createMeydaAnalyzer({
    audioContext: ctx,
    source,
    bufferSize: 1024,
    featureExtractors: ['chroma'],
    inputs: 2,
    callback: (feature: MeydaFeaturesObject) => {
      const sum = feature.chroma.reduce((prev, curr) => prev + curr);
      const maxChroma = feature.chroma.reduce(
        (prev, value, index) => (prev.value < value ? { value, index } : prev),
        { value: 0, index: -1 }
      );

      if (sum === 0) {
        return;
      }

      const snr = maxChroma.value / sum;
      gain.gain.value = Math.min(1, Math.max(0, (snr * snr - 0.1 * 0.1) / (0.25 * 0.25))) * 0.6;
      oscillator.frequency.value = 440 * Math.pow(2, (72 + maxChroma.index - 69) / 12);
    },
  });

  oscillator.frequency.value = 440;
  oscillator.connect(gain);
  oscillator.start();
  analyzer.start();
  gain.connect(ctx.destination);
});

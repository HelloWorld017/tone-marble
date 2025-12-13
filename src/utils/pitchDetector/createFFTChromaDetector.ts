import { coerceToChromatic } from './coerceToChromatic';
import metronomeProcessorWorklet from './metronomeWorklet?url';

const NOISE_THRESHOLD = -100;
const MIN_FREQUENCY = 32;
const MAX_FREQUENCY = 4096;

export interface ChromaResult {
  chroma: number;
  confidence: number;
}

const workletEnabledContext = new WeakSet<AudioContext>();

export const createFFTChromaDetector = async (
  ctx: AudioContext,
  callback: (result: ChromaResult) => void
) => {
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 4096;

  const frequencyBuffer = new Float32Array(analyser.frequencyBinCount);
  const onProcess = () => {
    analyser.getFloatFrequencyData(frequencyBuffer);

    const chromaPool = new Float32Array(12);
    const sampleRate = ctx.sampleRate;
    const binCount = analyser.frequencyBinCount;

    for (let i = 0; i < binCount; i++) {
      const db = frequencyBuffer[i];
      if (db < NOISE_THRESHOLD) {
        continue;
      }

      const frequency = (i * sampleRate) / analyser.fftSize;
      if (frequency < MIN_FREQUENCY || frequency > MAX_FREQUENCY) {
        continue;
      }

      const { chroma, weight } = coerceToChromatic(frequency);
      const amplitude = Math.pow(10, db / 20);
      chromaPool[chroma] += amplitude * weight;
    }

    const result = chromaPool.reduce(
      (prev, weight, chroma) => (weight > prev.weight ? { weight, chroma } : prev),
      { weight: -1, chroma: 0 }
    );

    callback({ chroma: result.chroma, confidence: result.weight });
  };

  await (workletEnabledContext.has(ctx)
    ? Promise.resolve()
    : ctx.audioWorklet
        .addModule(metronomeProcessorWorklet)
        .then(() => workletEnabledContext.add(ctx)));

  const workletNode = new AudioWorkletNode(ctx, 'metronome-processor');
  workletNode.port.onmessage = () => {
    void onProcess();
  };

  analyser.connect(workletNode);
  return analyser;
};

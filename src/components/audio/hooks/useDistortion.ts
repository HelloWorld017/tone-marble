import { DEG2RAD } from '@/constants';
import { buildAudioNodeHook } from '../utils/buildAudioNodeHook';

export const useDistortion = buildAudioNodeHook(
  ctx => ctx.createWaveShaper(),
  (node, { amount = 50 }: { amount: number }) => {
    const samples = node.context.sampleRate;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + amount) * x * 20 * DEG2RAD) / (Math.PI + amount * Math.abs(x));
    }

    node.curve = curve;
    node.oversample = 'none';
  }
);

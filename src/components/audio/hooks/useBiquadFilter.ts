import { buildAudioNodeHook } from '../utils/buildAudioNodeHook';

export const useBiquadFilter = buildAudioNodeHook(
  ctx => ctx.createBiquadFilter(),
  (node, { type, frequency, Q }: Pick<BiquadFilterOptions, 'type' | 'frequency' | 'Q'>) => {
    if (type) {
      node.type = type;
    }

    if (frequency) {
      node.frequency.value = frequency;
    }

    if (Q) {
      node.Q.value = Q;
    }
  }
);

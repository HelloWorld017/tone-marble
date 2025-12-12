import { buildAudioNodeHook } from '../utils/buildAudioNodeHook';

export const useDynamicsCompressor = buildAudioNodeHook(
  ctx => ctx.createDynamicsCompressor(),
  (node, props: { threshold: number; ratio: number }) => {
    node.threshold.value = props.threshold;
    node.ratio.value = props.ratio;
  }
);

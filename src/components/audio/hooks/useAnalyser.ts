import { buildAudioNodeHook } from '../utils/buildAudioNodeHook';

export const useAnalyser = buildAudioNodeHook(
  ctx => ctx.createAnalyser(),
  (node, props: { fftSize: number }) => {
    node.fftSize = props.fftSize;
  }
);

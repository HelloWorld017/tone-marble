import { buildAudioNodeHook } from '../utils/buildAudioNodeHook';

export const useBufferSource = buildAudioNodeHook(
  ctx => ctx.createBufferSource(),
  (node, { buffer, loop = false }: { buffer?: AudioBuffer; loop?: boolean }) => {
    if (buffer) {
      node.buffer = buffer;
    }

    node.loop = loop;
  }
);

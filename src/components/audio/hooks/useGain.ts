import { buildAudioNodeHook } from '../utils/buildAudioNodeHook';

export const useGain = buildAudioNodeHook(
  ctx => ctx.createGain(),
  (gain, props: { gain: number }) => {
    gain.gain.value = props.gain;
  }
);

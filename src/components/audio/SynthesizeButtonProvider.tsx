import { useMemo } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import { useAudioContext } from './AudioContextProvider';
import { useSynthesize } from './SynthesizeProvider';
import { createPinkNoiseBuffer } from './utils/createPinkNoiseBuffer';
import { updatePannerForPosition } from './utils/updatePannerForPosition';
import type { Position } from '@/types/Position';

type SynthOpts = {
  startTime?: number;
  destination?: AudioNode;
  position?: Position;
  gain?: number;
};

export const [SynthesizeButtonProvider, useSynthesizeButton] = buildContext(() => {
  const ctx = useAudioContext();
  const masterOut = useSynthesize(state => state.masterOut);
  const pinkNoise = useMemo(() => ctx && createPinkNoiseBuffer(ctx, 0.2), [ctx]);

  const synthesizeButton = useLatestCallback((frequency: number, opts: SynthOpts = {}) => {
    const destination = opts.destination ?? masterOut;

    if (!ctx || !destination) {
      return;
    }

    const t = opts.startTime ?? ctx.currentTime + 0.05;

    const synthOut = ctx.createDynamicsCompressor();
    synthOut.attack.value = 0.005;
    synthOut.release.value = 0.3;
    synthOut.threshold.value = -10;
    synthOut.ratio.value = 12;

    const synthGain = ctx.createGain();
    synthGain.gain.value = opts.gain ?? 1;

    let panner: PannerNode | null = null;
    if (opts.position) {
      panner = ctx.createPanner();
      panner.rolloffFactor = 0.05;
      updatePannerForPosition(panner, opts.position);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = pinkNoise;
    noise.loop = true;

    const oscLow = ctx.createOscillator();
    oscLow.type = 'sawtooth';
    oscLow.frequency.value = frequency / 6.27;
    oscLow.frequency.setValueAtTime(frequency / 6.27, t);
    oscLow.frequency.exponentialRampToValueAtTime(frequency / 13.98, t + 0.03);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = frequency;
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.exponentialRampToValueAtTime(frequency / 2, t + 0.03);

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0;
    oscGain.gain.setValueAtTime(0, t);
    oscGain.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    noiseFilter.frequency.exponentialRampToValueAtTime(500, t + 0.03);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.7, t + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

    osc.connect(oscGain);
    oscLow.connect(oscGain);
    oscGain.connect(synthOut);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(synthOut);
    synthOut.connect(synthGain);
    synthGain.connect(panner ?? destination);
    panner?.connect(destination);

    noise.start(t);
    noise.stop(t + 0.05);
    oscLow.start(t);
    oscLow.stop(t + 0.05);
    osc.start(t);
    osc.stop(t + 0.05);
    osc.onended = () => {
      osc.disconnect();
      oscLow.disconnect();
      oscGain.disconnect();
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      synthOut.disconnect();
      synthGain.disconnect();
      panner?.disconnect();
    };
  });

  const synthesizeTick = useLatestCallback((opts?: SynthOpts) => synthesizeButton(500, opts));
  const synthesizeTock = useLatestCallback((opts?: SynthOpts) => synthesizeButton(200, opts));

  return {
    synthesizeButton,
    synthesizeTick,
    synthesizeTock,
  };
});

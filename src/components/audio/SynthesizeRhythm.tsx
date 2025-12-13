import { useEffect, useMemo, useState } from 'react';
import { createCrakleGenerator } from '@/utils/crakleGenerator';
import { usePitchMap } from '../providers/PitchMapProvider';
import { useAudioContext } from './AudioContextProvider';
import { useSynthesize } from './SynthesizeProvider';
import { useBiquadFilter } from './hooks/useBiquadFilter';
import { useBufferSource } from './hooks/useBufferSource';
import { useConnectNode } from './hooks/useConnectNode';
import { useGain } from './hooks/useGain';
import { createPinkNoiseBuffer } from './utils/createPinkNoiseBuffer';
import { createWhiteNoiseBuffer } from './utils/createWhiteNoiseBuffer';

const WHITENOISE_BUFFER_SIZE = 2;
const PINKNOISE_BUFFER_SIZE = 10;

export const SynthesizeRhythm = () => {
  const destinationOut = useSynthesize(state => state.destinationOut);
  const analyzerOut = useSynthesize(state => state.analyzerOut);

  const ctx = useAudioContext();

  const pinkNoise = useMemo(() => ctx && createPinkNoiseBuffer(ctx, PINKNOISE_BUFFER_SIZE), [ctx]);
  const whiteNoise = useMemo(
    () => ctx && createWhiteNoiseBuffer(ctx, WHITENOISE_BUFFER_SIZE),
    [ctx]
  );

  /* Lo-Fi Vinyl Scratch Synthesizer */
  const loFiOut = useGain({ gain: 1 }, analyzerOut);
  useConnectNode(loFiOut, destinationOut);

  const addEffect = useSynthesize(state => state.addEffect);
  const filterOut = useGain({ gain: 1 }, null);
  const filterGainPassThru = useGain({ gain: 1 }, filterOut);
  const filterGain = useGain({ gain: 0 }, filterOut);
  const filterHandle = useBiquadFilter({ type: 'lowpass', frequency: 1200, Q: 0 }, filterGain);
  const filterIn = useGain({ gain: 1 }, filterGainPassThru);
  useConnectNode(filterIn, filterHandle);
  useEffect(() => addEffect(filterIn, filterOut), [filterIn, filterOut]);

  const hissGain = useGain({ gain: 0.01 }, loFiOut);
  const hiss = useBufferSource({ loop: true }, hissGain);
  useEffect(() => {
    if (hiss && !hiss.buffer && pinkNoise) {
      hiss.buffer = pinkNoise;
      hiss.start();
    }
  }, [hiss, pinkNoise]);

  const [crakle, setCrakle] = useState<AudioWorkletNode | null>(null);
  const crakleGain = useGain({ gain: 0.03 }, loFiOut);
  useEffect(() => {
    let isCanceled = false;
    if (ctx) {
      void createCrakleGenerator(ctx).then(generator => {
        if (!isCanceled) {
          setCrakle(generator);
        }
      });
    }

    return () => {
      isCanceled = true;
      setCrakle(null);
    };
  }, [ctx]);

  useConnectNode(crakle, crakleGain);

  const effectiveSpeed = usePitchMap(state => state.effectiveSpeed);
  useEffect(() => {
    if (!ctx || !loFiOut) {
      return () => {};
    }

    const t = ctx.currentTime;
    const intervalId = setInterval(() => {
      const blendRate = Math.max(-50, Math.min(effectiveSpeed.current - 50, 50)) / 100 + 0.5;
      const loFiVolume = effectiveSpeed.current < 10 ? 0 : 1 - blendRate;
      loFiOut.gain.linearRampToValueAtTime(loFiVolume, t + 0.15);
      filterGain?.gain.linearRampToValueAtTime(loFiVolume, t + 0.15);
      filterGainPassThru?.gain.linearRampToValueAtTime(1 - loFiVolume, t + 0.15);
    }, 150);

    return () => clearInterval(intervalId);
  }, [ctx, loFiOut, filterGain, filterGainPassThru, effectiveSpeed]);

  return <></>;
};

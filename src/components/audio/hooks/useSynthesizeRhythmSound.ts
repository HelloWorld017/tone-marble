import { useEffect, useMemo, useRef, useState } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { createCrakleGenerator } from '@/utils/crakleGenerator';
import { useAudioContext } from '../AudioContextProvider';
import { useSynthesize } from '../SynthesizeProvider';
import { createPinkNoiseBuffer } from '../utils/createPinkNoiseBuffer';
import { createWhiteNoiseBuffer } from '../utils/createWhiteNoiseBuffer';
import { updatePannerForPosition } from '../utils/updatePannerForPosition';
import { useBufferSource } from './useBufferSource';
import { useConnectNode } from './useConnectNode';
import { useGain } from './useGain';

const WHITENOISE_BUFFER_SIZE = 2;
const PINKNOISE_BUFFER_SIZE = 10;

export const useSynthesizeRhythmSound = () => {
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

  /* Kick and Hi-Hat Synthesizer */
  const rhythmOut = useGain({ gain: 1 }, analyzerOut);
  useConnectNode(rhythmOut, destinationOut);

  const synthesizeKick = useLatestCallback(() => {
    if (!ctx || !rhythmOut) {
      return;
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createPanner();

    osc.frequency.setValueAtTime(144, t);
    osc.frequency.exponentialRampToValueAtTime(1, t + 0.5);
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    updatePannerForPosition(panner, [0, 0, 0]);
    panner.rolloffFactor = 0.2;

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(rhythmOut);

    osc.start(t);
    osc.stop(t + 0.5);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      panner.disconnect();
    };
  });

  const synthesizeHiHat = useLatestCallback(() => {
    if (!ctx || !rhythmOut) {
      return;
    }

    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = whiteNoise;
    source.loop = true;
    source.loopStart = Math.random() * (WHITENOISE_BUFFER_SIZE - 0.7);
    source.loopEnd = source.loopStart + 0.6;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    const gain = ctx.createGain();
    const panner = ctx.createPanner();

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    updatePannerForPosition(panner, [0, 0, 0]);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(panner);
    panner.connect(rhythmOut);

    source.start(t);
    source.stop(t + 0.05);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
      panner.disconnect();
    };
  });

  const isUpBeatRef = useRef(false);
  const synthesizeRhythm = useLatestCallback(() => {
    if (isUpBeatRef.current) {
      synthesizeKick();
    }

    synthesizeHiHat();
    isUpBeatRef.current = !isUpBeatRef.current;
  });

  return {
    synthesizeRhythm,
    synthesizeKick,
    synthesizeHiHat,
    loFiOut,
    rhythmOut,
  };
};

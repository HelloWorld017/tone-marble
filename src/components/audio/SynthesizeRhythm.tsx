import { useEffect, useMemo, useState } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { useLatestRef } from '@/hooks/useLatestRef';
import { createCrakleGenerator } from '@/utils/crakleGenerator';
import { useInterfaceState } from '../providers/InterfaceStateProvider';
import { usePitchMap } from '../providers/PitchMapProvider';
import { useAudioContext } from './AudioContextProvider';
import { useSynthesize } from './SynthesizeProvider';
import { useBufferSource } from './hooks/useBufferSource';
import { useConnectNode } from './hooks/useConnectNode';
import { useGain } from './hooks/useGain';
import { createPinkNoiseBuffer } from './utils/createPinkNoiseBuffer';
import { createWhiteNoiseBuffer } from './utils/createWhiteNoiseBuffer';
import { updatePannerForPosition } from './utils/updatePannerForPosition';

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
  });

  const effectiveSpeed = usePitchMap(state => state.effectiveSpeed);
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isUpBeat = false;

    const play = () => {
      if (isUpBeat) {
        synthesizeKick();
      }

      synthesizeHiHat();
      isUpBeat = !isUpBeat;

      const currentSpeed = Math.max(effectiveSpeed.current, 10);
      timeoutId = setTimeout(play, 1000 * (30 / currentSpeed));
    };

    play();
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [effectiveSpeed, synthesizeKick, synthesizeHiHat]);

  const overallVolume = useInterfaceState(state => state.rhythm);
  const overallVolumeRef = useLatestRef(overallVolume);
  useEffect(() => {
    if (!ctx || !loFiOut || !rhythmOut) {
      return () => {};
    }

    const t = ctx.currentTime;
    const intervalId = setInterval(() => {
      const blendRate = Math.max(-50, Math.min(effectiveSpeed.current - 50, 50)) / 100 + 0.5;
      const loFiVolume = effectiveSpeed.current < 10 ? 0 : 1 - blendRate;
      const rhythmVolume = effectiveSpeed.current < 10 ? 0 : blendRate;
      loFiOut.gain.linearRampToValueAtTime(loFiVolume * overallVolumeRef.current, t + 0.15);
      rhythmOut.gain.linearRampToValueAtTime(rhythmVolume * overallVolumeRef.current, t + 0.15);
    }, 150);

    return () => clearInterval(intervalId);
  }, [ctx, loFiOut, effectiveSpeed, overallVolumeRef]);

  return <></>;
};

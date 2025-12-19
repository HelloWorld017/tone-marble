import { useMemo, useRef } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { useAudioContext } from '../AudioContextProvider';
import { useSynthesize } from '../SynthesizeProvider';
import { createWhiteNoiseBuffer } from '../utils/createWhiteNoiseBuffer';
import { updatePannerForPosition } from '../utils/updatePannerForPosition';
import type { Position } from '@/types/Position';

const WHITENOISE_BUFFER_SIZE = 10;

type SynthOpts = {
  position: Position;
  gain: number;
  frequency: number;
};

export const useSynthesizeMarbleSound = () => {
  const ctx = useAudioContext();
  const analyzerOut = useSynthesize(state => state.analyzerOut);
  const destinationOut = useSynthesize(state => state.destinationOut);
  const activeVoices = useRef(0);

  const whiteNoise = useMemo(
    () => ctx && createWhiteNoiseBuffer(ctx, WHITENOISE_BUFFER_SIZE),
    [ctx]
  );

  const synthesizeGlass = useLatestCallback(({ position, gain, frequency }: SynthOpts) => {
    if (!ctx || !destinationOut || !analyzerOut) {
      return;
    }

    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = frequency;

    const envelope = ctx.createGain();
    const attack = 0.01;
    const decay = 0.1 + gain * 0.2;
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(Math.min(1, gain * 3), t + attack);
    envelope.gain.exponentialRampToValueAtTime(0.001, t + attack + decay);

    const panner = ctx.createPanner();
    updatePannerForPosition(panner, position);

    osc.connect(envelope);
    envelope.connect(panner);
    envelope.connect(analyzerOut);
    panner.connect(destinationOut);
    activeVoices.current++;

    osc.start(t);
    osc.stop(t + attack + decay + 0.1);
    osc.onended = () => {
      osc.disconnect();
      envelope.disconnect();
      panner.disconnect();
      activeVoices.current--;
    };
  });

  const synthesizeSand = useLatestCallback(({ position, gain, frequency }: SynthOpts) => {
    if (!ctx || !destinationOut || !analyzerOut) {
      return;
    }

    const t = ctx.currentTime;

    const source = ctx.createBufferSource();
    source.buffer = whiteNoise;
    source.loop = true;
    source.loopStart = Math.random() * (WHITENOISE_BUFFER_SIZE - 0.5);
    source.loopEnd = source.loopStart + 0.5;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = 0.5 + Math.random() * 0.5;

    const envelope = ctx.createGain();
    const attack = 0.05 + Math.random() * 0.05;
    const decay = 0.2 + gain * 0.5;
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(gain * 0.15, t + attack);
    envelope.gain.linearRampToValueAtTime(0, t + attack + decay);

    const panner = ctx.createPanner();
    updatePannerForPosition(panner, position);

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(panner);
    envelope.connect(analyzerOut);
    panner.connect(destinationOut);
    activeVoices.current++;

    source.start(t);
    source.stop(t + attack + decay + 0.1);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      envelope.disconnect();
      panner.disconnect();
      activeVoices.current--;
    };
  });

  const synthesizeWind = useLatestCallback(({ gain, position, frequency }: SynthOpts) => {
    if (!ctx || !destinationOut || !analyzerOut) {
      return;
    }

    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const envelope = ctx.createGain();
    const panner = ctx.createPanner();

    source.buffer = whiteNoise;
    source.loop = true;
    source.loopStart = Math.random() * (WHITENOISE_BUFFER_SIZE - 2);
    source.loopEnd = source.loopStart + 2;

    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.setValueAtTime(5, t);
    filter.Q.linearRampToValueAtTime(9.5 + Math.random(), t + 2);

    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(gain * 0.8, t + 1.5);
    envelope.gain.linearRampToValueAtTime(0, t + 2);

    panner.rolloffFactor = 0.6;
    updatePannerForPosition(panner, position);

    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(panner);
    envelope.connect(analyzerOut);
    panner.connect(destinationOut);
    activeVoices.current++;

    source.start(t);
    source.stop(t + 2);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      envelope.disconnect();
      panner.disconnect();
      activeVoices.current--;
    };
  });

  return {
    activeVoices,
    synthesizeSand,
    synthesizeWind,
    synthesizeGlass,
  };
};

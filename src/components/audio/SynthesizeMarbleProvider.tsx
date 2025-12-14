import { useMemo, useRef } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import { useInterfaceState } from '../providers/InterfaceStateProvider';
import { usePitchMap } from '../providers/PitchMapProvider';
import { useAudioContext } from './AudioContextProvider';
import { useSynthesize } from './SynthesizeProvider';
import { createWhiteNoiseBuffer } from './utils/createWhiteNoiseBuffer';
import { updatePannerForPosition } from './utils/updatePannerForPosition';
import type { Position } from '@/types/Position';

const MAX_VOICES = 100;
const HARMONIC_RATIOS = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0];
const WHITENOISE_BUFFER_SIZE = 10;

/*
 * Utilities
 * ----
 */
const shouldPlay = (activeVoices: number, effectiveGain: number) => {
  if (activeVoices >= MAX_VOICES) {
    return false;
  }

  if (activeVoices > 80) {
    return effectiveGain >= 0.15;
  }

  if (activeVoices >= 50) {
    return effectiveGain >= 0.05;
  }

  return effectiveGain >= 0.001;
};

const getRandomFrequency = (baseFrequency: number) => {
  const ratio = HARMONIC_RATIOS[~~(Math.random() * HARMONIC_RATIOS.length)];
  const detune = 1 + (Math.random() * 0.01 - 0.005);
  return baseFrequency * ratio * detune;
};

/*
 * Provider
 * ----
 */
export const [SynthesizeMarbleProvider, useSynthesizeMarble] = buildContext(() => {
  const ctx = useAudioContext();
  const analyzerOut = useSynthesize(state => state.analyzerOut);
  const destinationOut = useSynthesize(state => state.destinationOut);
  const calculateEffectiveGain = useSynthesize(state => state.calculateEffectiveGain);

  const activeVoices = useRef(0);
  const readPitch = usePitchMap(state => state.readPitch);

  const whiteNoise = useMemo(
    () => ctx && createWhiteNoiseBuffer(ctx, WHITENOISE_BUFFER_SIZE),
    [ctx]
  );

  const synthesizeGlass = useLatestCallback((position: Position, gain: number) => {
    if (!ctx || !destinationOut || !analyzerOut) {
      return;
    }

    const effectiveGain = calculateEffectiveGain(gain, position);
    if (!shouldPlay(activeVoices.current, effectiveGain)) {
      return;
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();
    const panner = ctx.createPanner();

    const frequency = getRandomFrequency(readPitch());
    osc.type = 'sine';
    osc.frequency.value = frequency;

    const attack = 0.01;
    const decay = 0.1 + gain * 0.2;
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(Math.min(1, gain * 3), t + attack);
    envelope.gain.exponentialRampToValueAtTime(0.001, t + attack + decay);

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

  const synthesizeSand = useLatestCallback((position: Position, gain: number) => {
    if (!ctx || !destinationOut || !analyzerOut) {
      return;
    }

    const effectiveGain = calculateEffectiveGain(gain, position);
    if (!shouldPlay(activeVoices.current, effectiveGain)) {
      return;
    }

    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const envelope = ctx.createGain();
    const panner = ctx.createPanner();

    source.buffer = whiteNoise;
    source.loop = true;
    source.loopStart = Math.random() * (WHITENOISE_BUFFER_SIZE - 0.5);
    source.loopEnd = source.loopStart + 0.5;

    const frequency = getRandomFrequency(readPitch());
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = 0.5 + Math.random() * 0.5;

    const attack = 0.05 + Math.random() * 0.05;
    const decay = 0.2 + gain * 0.5;
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(gain * 0.15, t + attack);
    envelope.gain.linearRampToValueAtTime(0, t + attack + decay);

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

  const synthesizeWind = useLatestCallback((position: Position, gain: number) => {
    if (!ctx || !destinationOut || !analyzerOut) {
      return;
    }

    const effectiveGain = calculateEffectiveGain(gain, position);
    if (!shouldPlay(activeVoices.current, effectiveGain)) {
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

    const frequency = getRandomFrequency(readPitch());
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

  const sandActivePillars = useInterfaceState(state => state.sandActivePillars);
  const glassActivePillars = useInterfaceState(state => state.glassActivePillars);
  const windActivePillars = useInterfaceState(state => state.windActivePillars);
  const synthesize = useLatestCallback((row: number, position: Position, gain: number) => {
    const activeSynthes = [];
    const mask = 1 << row;
    if (windActivePillars & mask) {
      activeSynthes.push(synthesizeWind);
    }

    if (sandActivePillars & mask) {
      activeSynthes.push(synthesizeSand, synthesizeSand);
    }

    if (glassActivePillars & mask) {
      activeSynthes.push(synthesizeGlass, synthesizeGlass, synthesizeGlass);
    }

    if (!activeSynthes.length) {
      return;
    }

    activeSynthes[~~(Math.random() * activeSynthes.length)](position, gain);
  });

  return {
    synthesizeGlass,
    synthesizeSand,
    synthesizeWind,
    synthesize,
  };
});

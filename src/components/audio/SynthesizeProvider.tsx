import { useMemo, useRef } from 'react';
import { usePitchMap } from '@/components/providers/PitchMapProvider';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import { useAudioContext } from './AudioContextProvider';
import { useDynamicsCompressor } from './hooks/useDynamicsCompressor';
import { useGain } from './hooks/useGain';

type Position = [number, number, number];

const MAX_VOICES = 100;
const MAX_DISTANCE = 100;
const HARMONIC_RATIOS = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0];
const WHITENOISE_BUFFER_SIZE = 10;

/*
 * Utilities
 * ----
 */
const createWhiteNoiseBuffer = (ctx: AudioContext, length = 2): AudioBuffer => {
  const bufferSize = Math.ceil(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
};

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

const getEffectiveGain = (gain: number, origin: Position, listener: Position) => {
  const distance = Math.hypot(
    origin[0] - listener[0],
    origin[1] - listener[1],
    origin[2] - listener[2]
  );
  const attenuation = 1 / (1 + distance);
  return gain * attenuation;
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
export const [SynthesizeProvider, useSynthesize] = buildContext(() => {
  const activeVoices = useRef(0);
  const listenerPosition = useRef<Position>([0, 0, 0]);
  const readPitch = usePitchMap(state => state.readPitch);

  const ctx = useAudioContext();
  const masterCompressor = useDynamicsCompressor({ threshold: -10, ratio: 12 }, ctx?.destination);
  const destinationOut = useGain({ gain: 1 }, masterCompressor);
  const analyzerOut = useGain({ gain: 1 }, null);
  const whiteNoise = useMemo(
    () => ctx && createWhiteNoiseBuffer(ctx, WHITENOISE_BUFFER_SIZE),
    [ctx]
  );

  const updateListenerPosition = useLatestCallback((position: Position) => {
    if (!ctx) {
      return;
    }

    listenerPosition.current = position;
    ctx.listener.positionX.value = position[0];
    ctx.listener.positionY.value = position[1];
    ctx.listener.positionZ.value = position[2];
  });

  const updatePannerForPosition = useLatestCallback((panner: PannerNode, position: Position) => {
    panner.panningModel = 'equalpower';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = MAX_DISTANCE;
    panner.positionX.value = position[0];
    panner.positionY.value = position[1];
    panner.positionZ.value = position[2];
  });

  const readBaseFrequency = useLatestCallback(
    () => 440 * Math.pow(2, (readPitch() + 48 - 69) / 12)
  );

  /* Sine-based Synthesizer */
  const synthesizeSine = useLatestCallback((position: Position, gain: number) => {
    if (!ctx || !destinationOut) {
      return;
    }

    const effectiveGain = getEffectiveGain(gain, position, listenerPosition.current);
    if (!shouldPlay(activeVoices.current, effectiveGain)) {
      return;
    }

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();
    const panner = ctx.createPanner();

    const frequency = getRandomFrequency(readBaseFrequency());
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

  /* Noise-based Synthesizer */
  const synthesizeNoise = useLatestCallback((position: Position, gain: number) => {
    if (!ctx || !destinationOut || !analyzerOut) {
      return;
    }

    const effectiveGain = getEffectiveGain(gain, position, listenerPosition.current);
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

    const frequency = getRandomFrequency(readBaseFrequency());
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

  const playAudio = useLatestCallback((audio: AudioBuffer, position?: Position) => {
    if (!ctx || !masterCompressor) {
      return;
    }

    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    let target: AudioNode = masterCompressor;

    if (position) {
      const panner = ctx.createPanner();
      updatePannerForPosition(panner, position);
      panner.connect(target);
      target = panner;
    }

    source.buffer = audio;
    source.connect(target);

    source.start(t);
    source.onended = () => {
      source.disconnect();
      if (position) {
        target.disconnect();
      }
    };
  });

  return {
    analyzerOut,
    destinationOut,
    updateListenerPosition,
    synthesizeSine,
    synthesizeNoise,
    playAudio,
  };
});

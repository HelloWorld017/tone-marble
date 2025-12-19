import { useRef } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import { useInterfaceState } from '../providers/InterfaceStateProvider';
import { usePitchMap } from '../providers/PitchMapProvider';
import { useSynthesize } from './SynthesizeProvider';
import { useSynthesizeMarbleSound } from './hooks/useSynthesizeMarbleSound';
import type { Position } from '@/types/Position';

const MAX_VOICES = 100;
const HARMONIC_RATIOS = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0];

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
  const calculateEffectiveGain = useSynthesize(state => state.calculateEffectiveGain);

  const activeVoices = useRef(0);
  const readPitch = usePitchMap(state => state.readPitch);

  const sandActivePillars = useInterfaceState(state => state.sandActivePillars);
  const glassActivePillars = useInterfaceState(state => state.glassActivePillars);
  const windActivePillars = useInterfaceState(state => state.windActivePillars);
  const { synthesizeSand, synthesizeWind, synthesizeGlass } = useSynthesizeMarbleSound();
  const synthesize = useLatestCallback((row: number, position: Position, gain: number) => {
    const effectiveGain = calculateEffectiveGain(gain, position);
    if (!shouldPlay(activeVoices.current, effectiveGain)) {
      return;
    }

    const activeSynthes: (typeof synthesizeSand)[] = [];
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

    const frequency = getRandomFrequency(readPitch());
    activeSynthes[~~(Math.random() * activeSynthes.length)]({ position, gain, frequency });
  });

  return { synthesize };
});

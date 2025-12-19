import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import { useInterfaceState } from '../providers/InterfaceStateProvider';
import { usePitchMap } from '../providers/PitchMapProvider';
import { useSynthesize } from './SynthesizeProvider';
import { useSynthesizeMarbleSound } from './hooks/useSynthesizeMarbleSound';
import { getRandomHarmonicPitch } from './utils/getRandomHarmonicPitch';
import type { Position } from '@/types/Position';

const MAX_VOICES = 100;

/*
 * Utilities
 * ----
 */
const shouldPlay = (activeVoices: number, effectiveGain: number) => {
  if (activeVoices >= MAX_VOICES) {
    return false;
  }

  if (activeVoices > MAX_VOICES * 0.8) {
    return effectiveGain >= 0.15;
  }

  if (activeVoices >= MAX_VOICES * 0.7) {
    return effectiveGain >= 0.05;
  }

  if (activeVoices >= MAX_VOICES * 0.5) {
    return effectiveGain >= 0.025;
  }

  return effectiveGain >= 0.001;
};

/*
 * Provider
 * ----
 */
export const [SynthesizeMarbleProvider, useSynthesizeMarble] = buildContext(() => {
  const calculateEffectiveGain = useSynthesize(state => state.calculateEffectiveGain);

  const readPitch = usePitchMap(state => state.readPitch);

  const sandActivePillars = useInterfaceState(state => state.sandActivePillars);
  const glassActivePillars = useInterfaceState(state => state.glassActivePillars);
  const windActivePillars = useInterfaceState(state => state.windActivePillars);
  const { activeVoices, synthesizeSand, synthesizeWind, synthesizeGlass } =
    useSynthesizeMarbleSound();

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

    const frequency = getRandomHarmonicPitch(readPitch());
    activeSynthes[~~(Math.random() * activeSynthes.length)]({ position, gain, frequency });
  });

  return { synthesize };
});

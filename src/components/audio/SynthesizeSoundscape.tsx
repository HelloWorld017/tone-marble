import { useEffect } from 'react';
import { useLatestRef } from '@/hooks/useLatestRef';
import { useInterfaceState } from '../providers/InterfaceStateProvider';
import { usePitchMap } from '../providers/PitchMapProvider';
import { useAudioContext } from './AudioContextProvider';
import { useSynthesizeSoundscapeSound } from './hooks/useSynthesizeSoundscapeSound';

export const SynthesizeSoundscape = () => {
  const effectiveSpeed = usePitchMap(state => state.effectiveSpeed);
  const { synthesizeRhythm, loFiOut, rhythmOut } = useSynthesizeSoundscapeSound();
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const play = () => {
      synthesizeRhythm();
      const currentSpeed = Math.max(effectiveSpeed.current, 10);
      timeoutId = setTimeout(play, 1000 * (30 / currentSpeed));
    };

    play();
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [effectiveSpeed, synthesizeRhythm]);

  const ctx = useAudioContext();
  const overallVolume = useInterfaceState(state => state.rhythm);
  const overallVolumeRef = useLatestRef(overallVolume);
  useEffect(() => {
    if (!ctx || !loFiOut || !rhythmOut) {
      return () => {};
    }

    const t = ctx.currentTime;
    const intervalId = setInterval(() => {
      const blendRate = Math.max(-50, Math.min(effectiveSpeed.current - 50, 50)) / 100 + 0.5;
      const loFiVolume = effectiveSpeed.current < 10 ? 0.1 : 1 - blendRate;
      const rhythmVolume = effectiveSpeed.current < 10 ? 0 : blendRate;
      loFiOut.gain.linearRampToValueAtTime(loFiVolume * overallVolumeRef.current, t + 0.15);
      rhythmOut.gain.linearRampToValueAtTime(rhythmVolume * overallVolumeRef.current, t + 0.15);
    }, 150);

    return () => clearInterval(intervalId);
  }, [ctx, loFiOut, effectiveSpeed, overallVolumeRef]);

  return <></>;
};

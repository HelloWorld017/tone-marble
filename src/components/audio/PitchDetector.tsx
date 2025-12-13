import { useCallback, useMemo, useRef, useState } from 'react';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { usePitchMap } from '@/components/providers/PitchMapProvider';
import { useMicrophone } from './hooks/useMicrophone';
import { usePitchDetector } from './hooks/usePitchDetector';
import { coerceToChromatic } from './utils/coerceToChromatic';
import type { PitchResult } from '@/utils/pitchDetector';

const WEIGHT_MIN = 0.1;

type PitchDetectorProps = {
  filterSize?: number;
};

export const PitchDetector = ({ filterSize = 32 }: PitchDetectorProps) => {
  const [runningAverage] = useState(() => new Float32Array(12));
  const weightPool = useMemo(() => new Float32Array(filterSize), [filterSize]);
  const chromaticPool = useMemo(() => new Uint8Array(filterSize), [filterSize]);
  const pointer = useRef(0);

  const updatePitch = usePitchMap(state => state.updatePitch);
  const updatePitchByRunningAverage = useCallback(() => {
    const result = runningAverage.reduce(
      (prev, weight, pitch) => (weight > prev.weight ? { weight, pitch } : prev),
      { weight: -1, pitch: 0 }
    );

    if (result.weight > WEIGHT_MIN) {
      updatePitch(result.pitch);
    }
  }, [updatePitch, runningAverage]);

  const isRecording = useInterfaceState(state => state.isRecording);
  const microphone = useMicrophone(isRecording);
  usePitchDetector(microphone, ({ pitch, confidence }: PitchResult) => {
    const { chromatic, weight } = coerceToChromatic(pitch);
    runningAverage[chromaticPool[pointer.current]] -= weightPool[pointer.current];
    chromaticPool[pointer.current] = chromatic;
    weightPool[pointer.current] = (weight * confidence) / weightPool.length;
    runningAverage[chromatic] += weightPool[pointer.current];
    pointer.current = (pointer.current + 1) % filterSize;

    updatePitchByRunningAverage();
  });

  return <></>;
};

import { useEffect, useState } from 'react';
import { useLatestRef } from '@/hooks/useLatestRef';
import { createNeuralPitchDetector } from '@/utils/pitchDetector';
import { useAudioContext } from '../AudioContextProvider';
import { useConnectNode } from './useConnectNode';
import type { PitchResult } from '@/utils/pitchDetector';

export const usePitchDetector = (
  from: AudioNode | null,
  onDetect: (result: PitchResult) => void
) => {
  const ctx = useAudioContext();
  const [pitchDetector, setPitchDetector] = useState<AudioNode | null>(null);
  const onPitchDetection = useLatestRef(onDetect);

  useEffect(() => {
    if (!ctx) {
      return () => {};
    }

    let isCanceled = false;
    void createNeuralPitchDetector(ctx, result => onPitchDetection.current(result)).then(
      node => !isCanceled && setPitchDetector(node)
    );

    return () => {
      isCanceled = true;
      setPitchDetector(null);
    };
  }, [ctx, onPitchDetection]);

  useConnectNode(from, pitchDetector);
};

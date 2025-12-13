import { useEffect, useState } from 'react';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { useLatestRef } from '@/hooks/useLatestRef';
import { createFFTChromaDetector, createNeuralPitchDetector } from '@/utils/pitchDetector';
import { useAudioContext } from '../AudioContextProvider';
import { useConnectNode } from './useConnectNode';
import type { PitchResult, ChromaResult } from '@/utils/pitchDetector';

export const useNeuralPitchDetector = (
  from: AudioNode | null,
  onDetect: (result: PitchResult) => void
) => {
  const ctx = useAudioContext();
  const [pitchDetector, setPitchDetector] = useState<AudioNode | null>(null);
  const onPitchDetection = useLatestRef(onDetect);
  const pitchModelKind = useInterfaceState(state => state.pitchModelKind);

  useEffect(() => {
    if (!ctx) {
      return () => {};
    }

    if (pitchModelKind === 'fft') {
      return () => {};
    }

    let isCanceled = false;
    void createNeuralPitchDetector(ctx, result => onPitchDetection.current(result), {
      modelKind: pitchModelKind,
    }).then(node => !isCanceled && setPitchDetector(node));

    return () => {
      isCanceled = true;
      setPitchDetector(null);
    };
  }, [ctx, onPitchDetection, pitchModelKind]);

  useConnectNode(from, pitchDetector);
};

export const useFFTChromaDetector = (
  from: AudioNode | null,
  onDetect: (result: ChromaResult) => void
) => {
  const ctx = useAudioContext();
  const [chromaDetector, setChromaDetector] = useState<AudioNode | null>(null);
  const onChromaDetection = useLatestRef(onDetect);
  const pitchModelKind = useInterfaceState(state => state.pitchModelKind);

  useEffect(() => {
    if (!ctx) {
      return () => {};
    }

    if (pitchModelKind !== 'fft') {
      return () => {};
    }

    let isCanceled = false;
    void createFFTChromaDetector(ctx, result => onChromaDetection.current(result)).then(
      node => !isCanceled && setChromaDetector(node)
    );

    return () => {
      isCanceled = true;
      setChromaDetector(null);
    };
  }, [ctx, onChromaDetection, pitchModelKind]);

  useConnectNode(from, chromaDetector);
};

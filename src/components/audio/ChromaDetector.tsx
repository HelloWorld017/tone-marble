import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { coerceToChromatic } from '@/utils/pitchDetector';
import { usePitchMap } from '../providers/PitchMapProvider';
import { useMicrophone } from './hooks/useMicrophone';
import { useFFTChromaDetector, useNeuralPitchDetector } from './hooks/usePitchDetector';
import type { ChromaResult, PitchResult } from '@/utils/pitchDetector';

const WEIGHT_MIN_NEURAL = 0.1;
const WEIGHT_MIN_FFT = 0.005;

type ChromaDetectorProps = {
  filterSize?: number;
};

export const ChromaDetector = ({ filterSize = 32 }: ChromaDetectorProps) => {
  const [runningAverage] = useState(() => new Float32Array(12));
  const weightPool = useMemo(() => new Float32Array(filterSize), [filterSize]);
  const chromaPool = useMemo(() => new Uint8Array(filterSize), [filterSize]);
  const pointer = useRef(0);

  const pitchModelKind = useInterfaceState(state => state.pitchModelKind);
  useEffect(() => {
    weightPool.fill(0);
    chromaPool.fill(0);
    runningAverage.fill(0);
  }, [pitchModelKind]);

  const minWeight = pitchModelKind === 'fft' ? WEIGHT_MIN_FFT : WEIGHT_MIN_NEURAL;
  const updateChroma = usePitchMap(state => state.updateChroma);
  const updateChromaByRunningAverage = useCallback(() => {
    const result = runningAverage.reduce(
      (prev, weight, chroma) => (weight > prev.weight ? { weight, chroma } : prev),
      { weight: -1, chroma: 0 }
    );

    if (result.weight > minWeight) {
      updateChroma(result.chroma);
    }
  }, [updateChroma, runningAverage, minWeight]);

  const isRecording = useInterfaceState(state => state.isRecording);
  const microphone = useMicrophone(isRecording);
  useNeuralPitchDetector(microphone, ({ pitch, confidence }: PitchResult) => {
    const { chroma, weight } = coerceToChromatic(pitch);
    runningAverage[chromaPool[pointer.current]] -= weightPool[pointer.current];
    chromaPool[pointer.current] = chroma;
    weightPool[pointer.current] = (weight * confidence) / weightPool.length;
    runningAverage[chroma] += weightPool[pointer.current];
    pointer.current = (pointer.current + 1) % filterSize;

    updateChromaByRunningAverage();
  });

  useFFTChromaDetector(microphone, ({ chroma, confidence }: ChromaResult) => {
    runningAverage[chromaPool[pointer.current]] -= weightPool[pointer.current];
    chromaPool[pointer.current] = chroma;
    weightPool[pointer.current] = confidence / weightPool.length;
    runningAverage[chroma] += weightPool[pointer.current];
    pointer.current = (pointer.current + 1) % filterSize;

    updateChromaByRunningAverage();
  });

  return <></>;
};

import { useEffect, useRef } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { createVolumeAnalyzer } from '@/utils/volumeAnalyzer';
import { useAudioContext } from './AudioContextProvider';
import { useSynthesize } from './SynthesizeProvider';

export const VolumeAnalyzer = ({ onVolume }: { onVolume: (volume: number) => void }) => {
  const ctx = useAudioContext();
  const analyzerOut = useSynthesize(state => state.analyzerOut);
  const lastAnalyze = useRef(0);
  const onVolumeLatest = useLatestCallback(onVolume);

  useEffect(() => {
    if (!ctx || !analyzerOut) {
      return;
    }

    const intervalId = setInterval(() => {
      if (performance.now() - lastAnalyze.current > 75) {
        onVolumeLatest(0);
      }
    }, 100);

    const volumeAnalyzerPromise = createVolumeAnalyzer(ctx, volume => {
      const volumeMapped = Math.min(1, volume / 0.3);
      onVolumeLatest(volumeMapped);
      lastAnalyze.current = performance.now();
    });

    let isCanceled = false;
    let volumeAnalyzerNode: AudioNode | null = null;
    void volumeAnalyzerPromise.then(volumeAnalyzer => {
      if (!isCanceled) {
        volumeAnalyzerNode = volumeAnalyzer;
        analyzerOut.connect(volumeAnalyzer);
      }
    });

    return () => {
      isCanceled = true;
      clearInterval(intervalId);
      if (volumeAnalyzerNode) {
        analyzerOut.disconnect(volumeAnalyzerNode);
      }
    };
  }, [ctx, analyzerOut, onVolumeLatest]);

  return <></>;
};

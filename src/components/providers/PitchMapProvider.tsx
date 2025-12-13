import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { POINTER_ADVANCE, RECORD_SIZE } from '@/constants';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import { useInterfaceState } from './InterfaceStateProvider';

const TEXTURE_SIZE = 512;
const TEXTURE_RADIUS = 192;
const PITCH_COLORS = Array.from({ length: 12 }).map(
  (_, index) => `oklch(0.6096 0.1744 ${360 / index})`
);

const TIMESTAMP_POOL_SIZE = 64;
const useEffectiveSpeed = () => {
  const pointer = useRef(0);
  const [timestampPool] = useState(() => new Float32Array(TIMESTAMP_POOL_SIZE));
  const effectiveSpeed = useRef(0);

  const onAdvance = useLatestCallback(() => {
    const lastTimestamp = timestampPool[pointer.current];
    const now = performance.now();
    timestampPool[pointer.current] = now;
    if (lastTimestamp === 0 && pointer.current > 0) {
      effectiveSpeed.current = (pointer.current / (now - timestampPool[0])) * 2000;
    } else {
      effectiveSpeed.current = (TIMESTAMP_POOL_SIZE / (now - lastTimestamp)) * 2000;
    }

    pointer.current = (pointer.current + 1) % TIMESTAMP_POOL_SIZE;
  });

  return { effectiveSpeed, onAdvance };
};

export const [PitchMapProvider, usePitchMap] = buildContext(() => {
  const isRecording = useInterfaceState(state => state.isRecording);
  const pointer = useRef(0);
  const [pitchMap] = useState(() => new Float32Array(RECORD_SIZE));
  const latestPendingPitch = useRef<number | null>(null);

  const updatePitch = useCallback((nextPitch: number) => {
    latestPendingPitch.current = nextPitch;
  }, []);

  const readPitch = useLatestCallback(() => {
    if (latestPendingPitch.current !== null) {
      return latestPendingPitch.current;
    }

    return pitchMap[~~pointer.current];
  });

  const [pitchTexture, setPitchTexture] = useState<HTMLCanvasElement | null>(null);
  const [subscriptions] = useState(() => new Set<() => void>());
  const subscribePitchTexture = useCallback(
    (onUpdate: () => void) => {
      subscriptions.add(onUpdate);
      return () => void subscriptions.delete(onUpdate);
    },
    [subscriptions]
  );

  const ctx = useMemo(() => pitchTexture?.getContext('2d'), [pitchTexture]);
  useLayoutEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = TEXTURE_SIZE;
    canvas.height = TEXTURE_SIZE;

    setPitchTexture(canvas);
  }, []);

  const getPointerAngle = useCallback(
    (ptr: number = pointer.current) => (ptr / RECORD_SIZE) * Math.PI * 2,
    []
  );

  const writePitchInternal = useCallback(
    (pitch: number, intPointer: number) => {
      pitchMap[intPointer] = pitch;
      if (!ctx) {
        return;
      }

      const angle = getPointerAngle(intPointer) + Math.PI / 2;
      const angleNext = getPointerAngle(intPointer + 1) + Math.PI / 2;

      ctx.beginPath();
      ctx.arc(TEXTURE_SIZE / 2, TEXTURE_SIZE / 2, TEXTURE_RADIUS, angle, angleNext);
      ctx.strokeStyle = PITCH_COLORS[pitch];
      ctx.lineCap = 'round';
      ctx.lineWidth = 5;
      ctx.stroke();
      subscriptions.forEach(subscription => subscription());
    },
    [pitchMap, ctx]
  );

  const { effectiveSpeed, onAdvance: onUpdateSpeed } = useEffectiveSpeed();
  const advancePointer = useLatestCallback(() => {
    const nextPointer = (pointer.current + POINTER_ADVANCE) % RECORD_SIZE;
    const prevIntPointer = ~~pointer.current;
    if (prevIntPointer !== ~~nextPointer) {
      if (latestPendingPitch.current !== null) {
        writePitchInternal(latestPendingPitch.current, prevIntPointer);
        // Just keep write until new pitch arrives
        // latestPendingPitch.current = null;
      }

      onUpdateSpeed();
    }

    pointer.current = nextPointer;
  });

  useEffect(() => {
    if (!isRecording) {
      latestPendingPitch.current = null;
    }
  }, [isRecording]);

  return {
    // Playback
    pointer,
    effectiveSpeed,
    advancePointer,
    getPointerAngle,

    // Pitch
    pitchMap,
    pitchTexture,
    subscribePitchTexture,
    updatePitch,
    readPitch,
  };
});

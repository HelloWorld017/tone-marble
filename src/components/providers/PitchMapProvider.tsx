import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { POINTER_ADVANCE, RECORD_SIZE } from '@/constants';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';

const TEXTURE_SIZE = 512;
const TEXTURE_RADIUS = 192;
const PITCH_COLORS = Array.from({ length: 12 }).map(
  (_, index) => `oklch(0.6096 0.1744 ${360 / index})`
);

export const [PitchMapProvider, usePitchMap] = buildContext(() => {
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

  const advancePointer = useLatestCallback(() => {
    const nextPointer = (pointer.current + POINTER_ADVANCE) % RECORD_SIZE;
    const prevIntPointer = ~~pointer.current;
    if (prevIntPointer !== ~~nextPointer && latestPendingPitch.current !== null) {
      writePitchInternal(latestPendingPitch.current, prevIntPointer);
      // Just keep write until new pitch arrives
      // latestPendingPitch.current = null;
    }

    pointer.current = nextPointer;
  });

  return {
    pointer,
    pitchMap,
    pitchTexture,
    subscribePitchTexture,
    updatePitch,
    readPitch,
    advancePointer,
    getPointerAngle,
  };
});

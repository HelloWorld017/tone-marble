import { useEffect } from 'react';
import { useLatestRef } from './useLatestRef';

export const useAnimationFrame = (onAnimationFrame: () => void) => {
  const onAnimationFrameRef = useLatestRef(onAnimationFrame);
  useEffect(() => {
    let rafId: number | null = null;
    const render = () => {
      onAnimationFrameRef.current();
      rafId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [onAnimationFrameRef]);
};

import { to, useSpringValue } from '@react-spring/web';
import { createUseGesture, dragAction, wheelAction } from '@use-gesture/react';
import { debounce, throttle } from 'es-toolkit';
import { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import type { RefObject } from 'react';

const useGesture = createUseGesture([dragAction, wheelAction]);
const useContainerWidth = (containerRef: RefObject<HTMLDivElement | null>) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const setContainerWidthThrottled = useMemo(() => throttle(setContainerWidth, 150), []);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new ResizeObserver(entries => {
      setContainerWidthThrottled(entries[0].contentRect.width);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return containerWidth;
};

type UsePiledScrollProps = {
  itemCount: number;
  itemWidth: number;
  gap: number;
};

export const usePiledScroll = ({ itemCount, itemWidth, gap }: UsePiledScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  const totalItemWidth = itemWidth + gap;
  const maxScroll = useMemo(
    () => Math.max(0, itemCount * totalItemWidth - gap - containerWidth),
    [itemCount, totalItemWidth, gap, containerWidth]
  );

  const x = useSpringValue(0);
  const inertia = useSpringValue(0);
  const resetXDebounced = useMemo(() => debounce(() => inertia.start(0), 500), []);

  useGesture(
    {
      onDrag: ({ offset: [offsetX], velocity: [velocityX], active }) => {
        void x.start(-offsetX, { immediate: active });
        void inertia.start(active ? Math.max(-20, Math.min(velocityX * 20, 20)) : 0);
      },
      onWheel: ({ event, offset: [, offsetY], velocity: [, velocityY], active }) => {
        if (event.cancelable) {
          event.preventDefault();
        }

        void x.start(offsetY);
        void inertia.start(active ? Math.max(-20, Math.min(velocityY * 20, 20)) : 0);
        resetXDebounced();
      },
    },
    {
      target: containerRef,
      drag: {
        from: () => [-x.get(), 0],
        bounds: { left: -maxScroll, right: 0 },
        rubberband: true,
      },
      wheel: {
        from: () => [0, x.get()],
        bounds: { top: 0, bottom: maxScroll },
        rubberband: true,
        eventOptions: { passive: false },
      },
    }
  );

  const getStyle = useLatestCallback((index: number) => {
    const itemBasePos = index * totalItemWidth;
    const getPileFactor = (currentX: number) => {
      const distance = itemBasePos - currentX;
      const leftEdge = 0;
      const rightEdge = containerWidth - itemWidth;

      const overflow = (() => {
        if (distance < leftEdge) {
          return distance;
        }

        if (distance > rightEdge) {
          return distance - rightEdge;
        }

        return 0;
      })();

      const pileFactor = Math.min(1, Math.abs(overflow) / (totalItemWidth * 2));
      return { pileFactor, overflow };
    };

    const transform = to([x, inertia], (currentX, currentInertia) => {
      const { pileFactor, overflow } = getPileFactor(currentX);
      const pileDeltaX = overflow * 0.15;
      const pileDeltaZ = Math.abs(overflow) * -0.8;

      const inertiaRotation = currentInertia * (1 - pileFactor);
      const baseRotation = pileDeltaX * 0.05;
      return (
        `translate3d(${(pileDeltaX - currentX).toFixed(2)}px, 0, ${pileDeltaZ.toFixed(2)}px) ` +
        `rotateY(${(baseRotation + inertiaRotation).toFixed(2)}deg)`
      );
    });

    return {
      transform,
      opacity: x.to(currentX => 1 - getPileFactor(currentX).pileFactor),
      width: `${itemWidth}px`,
    };
  });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return () => {};
    }

    container.style.gap = `${gap}px`;
    return () => {
      container.style.gap = '';
    };
  }, [gap]);

  return { containerRef, getStyle };
};

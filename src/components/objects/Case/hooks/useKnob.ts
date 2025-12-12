import { useSpring } from '@react-spring/three';
import { throttle } from 'es-toolkit';
import { useMemo, useRef } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { useHover } from './useHover';

const MAX_BLEND_DISTANCE = 5;

type UseKnobProps = {
  state: number;
  onChange: (nextState: number) => void;
};

export const useKnob = ({ state, onChange }: UseKnobProps) => {
  const onChangeLatest = useLatestCallback(onChange);
  const onChangeThrottled = useMemo(() => throttle(onChangeLatest, 150), [onChange]);
  const { boneRotate } = useSpring({
    boneRotate: -state * Math.PI * 1.5,
  });

  const initialState = useRef({ x: 0, y: 0, rotate: boneRotate.get() });
  const { isActive, groupProps } = useHover({
    interfaceKind: 'xy',
    onPointerDown: event => {
      initialState.current = { x: event.clientX, y: event.clientY, rotate: boneRotate.get() };
    },
  });

  const onPointerMove = (event: PointerEvent) => {
    if (!isActive) {
      return;
    }

    event.stopPropagation();

    const deltaX = event.clientX - initialState.current.x;
    const deltaY = initialState.current.y - event.clientY;

    // Intentionally inversed order, to rotate 90deg
    const angle = Math.atan2(deltaX, deltaY) + Math.PI;
    const magnitude = Math.hypot(deltaX, deltaY);

    const rotation =
      (1 / 4) * Math.PI - Math.max((1 / 4) * Math.PI, Math.min(angle, (7 / 4) * Math.PI));

    const blendRate = Math.min(magnitude / MAX_BLEND_DISTANCE, 1);
    const nextRotation = initialState.current.rotate * (1 - blendRate) + rotation * blendRate;
    onChangeThrottled(-nextRotation / (Math.PI * 1.5));
    boneRotate.start(nextRotation).catch(() => {});
  };

  return {
    boneRotate,
    groupProps: { ...groupProps, onPointerMove },
  };
};

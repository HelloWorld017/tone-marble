import { useSpring } from '@react-spring/three';
import { throttle } from 'es-toolkit';
import { useMemo, useRef, useState } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { useHover } from './useHover';
import type { ThreeEvent } from '@react-three/fiber';
import type { PointerEvent } from 'react';
import type { Object3D } from 'three';

type UseSliderProps = {
  bone: Object3D;
  state: number;
  width: number;
  offset?: number;
  sensitivity?: number;
  onChange: (nextState: number) => void;
};

export const useSlider = ({
  bone,
  state,
  width,
  offset = 0,
  sensitivity = 0.02,
  onChange,
}: UseSliderProps) => {
  const [initialX] = useState(() => bone.position.x);
  const initialState = useRef({
    x: 0,
    state: 0,
  });

  const onChangeLatest = useLatestCallback(onChange);
  const onChangeThrottled = useMemo(() => throttle(onChangeLatest, 150), [onChange]);
  const { stateSpring } = useSpring({
    stateSpring: state,
  });

  const boneX = stateSpring.to(state => initialX + offset - state * width);

  const { groupProps, isActive } = useHover({
    interfaceKind: 'x',
    onPointerDown: event => {
      initialState.current.x = event.clientX;
      initialState.current.state = state;
    },
  });

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isActive) {
      return;
    }

    event.stopPropagation();

    const deltaX =
      ((event.clientX - initialState.current.x) / width) * sensitivity * event.distance;

    const nextState = Math.max(0, Math.min(initialState.current.state + deltaX, 1));
    void stateSpring.start(nextState);
    onChangeThrottled(nextState);
  };

  return {
    groupProps: { ...groupProps, onPointerMove },
    boneX,
  };
};

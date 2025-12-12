import { useSpring } from '@react-spring/three';
import { throttle } from 'es-toolkit';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useInterfaceState } from '@/components/InterfaceStateProvider';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import type { ThreeEvent } from '@react-three/fiber';
import type { PointerEvent } from 'react';
import type { Object3D } from 'three';

type UseSliderProps = {
  bone: Object3D;
  state: number;
  width: number;
  onChange: (nextState: number) => void;
};

export const useSlider = ({ bone, state, width, onChange }: UseSliderProps) => {
  const id = useId();
  const updateInterfaceKind = useInterfaceState(state => state.updateInterfaceKind);
  useEffect(() => updateInterfaceKind(id, 'x'), [id]);

  const hoverTarget = useInterfaceState(state => state.hoverTarget);
  const activeTarget = useInterfaceState(state => state.activeTarget);
  const setHoverTarget = useInterfaceState(state => state.setHoverTarget);
  const setActiveTarget = useInterfaceState(state => state.setActiveTarget);

  const [initialX] = useState(() => bone.position.x);
  const initialState = useRef({
    intersections: 0,
  });

  const onChangeLatest = useLatestCallback(onChange);
  const onChangeThrottled = useMemo(() => throttle(onChangeLatest, 150), [onChange]);
  const { boneX } = useSpring({
    boneX: initialX - 1.5 - width * 2 * state,
  });

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    (event.target as Element).setPointerCapture(event.pointerId);
    setActiveTarget(id);
  };

  const onPointerUp = (event: PointerEvent) => {
    event.stopPropagation();
    (event.target as Element).releasePointerCapture(event.pointerId);

    if (activeTarget === id) {
      setActiveTarget(null);
    }
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (activeTarget !== id) {
      return;
    }

    if (event.intersections.length <= initialState.current.intersections) {
      return;
    }

    event.stopPropagation();

    const localPoint = bone.worldToLocal(event.point.clone());
    const nextState = Math.max(0, Math.min((initialX - localPoint.x) / width, 1));
    const nextX = initialX - 1.5 - width * 2 * nextState;
    boneX.start(nextX).catch(() => {});
    onChangeThrottled(nextState);
  };

  const onPointerEnter = () => {
    setHoverTarget(id);
  };

  const onPointerLeave = () => {
    if (hoverTarget === id) {
      setHoverTarget(null);
    }

    if (activeTarget === id) {
      setActiveTarget(null);
    }
  };

  return {
    groupProps: { onPointerDown, onPointerUp, onPointerEnter, onPointerLeave, onPointerMove },
    boneX,
  };
};

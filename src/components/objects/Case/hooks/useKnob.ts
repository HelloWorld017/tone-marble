import { useSpring } from '@react-spring/three';
import { throttle } from 'es-toolkit';
import { useEffect, useId, useMemo, useRef } from 'react';
import { useInterfaceState } from '@/components/InterfaceStateProvider';
import { useLatestCallback } from '@/hooks/useLatestCallback';

const MAX_BLEND_DISTANCE = 50;

type UseKnobProps = {
  state: number;
  onChange: (nextState: number) => void;
};

export const useKnob = ({ state, onChange }: UseKnobProps) => {
  const id = useId();
  const updateInterfaceKind = useInterfaceState(state => state.updateInterfaceKind);
  useEffect(() => updateInterfaceKind(id, 'xy'), [id]);

  const hoverTarget = useInterfaceState(state => state.hoverTarget);
  const activeTarget = useInterfaceState(state => state.activeTarget);
  const setHoverTarget = useInterfaceState(state => state.setHoverTarget);
  const setActiveTarget = useInterfaceState(state => state.setActiveTarget);

  const onChangeLatest = useLatestCallback(onChange);
  const onChangeThrottled = useMemo(() => throttle(onChangeLatest, 150), [onChange]);
  const { boneRotate } = useSpring({
    boneRotate: -state * Math.PI * 1.5,
  });

  const initialState = useRef({ x: 0, y: 0, rotate: boneRotate.get() });
  const onPointerDown = (event: PointerEvent) => {
    event.stopPropagation();
    (event.target as Element).setPointerCapture(event.pointerId);
    initialState.current = { x: event.clientX, y: event.clientY, rotate: boneRotate.get() };
    setActiveTarget(id);
  };

  const onPointerUp = (event: PointerEvent) => {
    event.stopPropagation();
    (event.target as Element).releasePointerCapture(event.pointerId);

    if (activeTarget === id) {
      setActiveTarget(null);
    }
  };

  const onPointerMove = (event: PointerEvent) => {
    if (activeTarget !== id) {
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
    boneRotate,
    groupProps: { onPointerDown, onPointerUp, onPointerMove, onPointerEnter, onPointerLeave },
  };
};

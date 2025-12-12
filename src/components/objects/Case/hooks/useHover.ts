import { useEffect, useId } from 'react';
import { useInterfaceState } from '@/components/InterfaceStateProvider';
import type { InterfaceKind } from '@/components/InterfaceStateProvider';
import type { ThreeEvent } from '@react-three/fiber';

type PointerEventHandler = (event: ThreeEvent<PointerEvent>) => void;
type UseHoverProps = {
  interfaceKind?: InterfaceKind;
  onPointerDown?: PointerEventHandler;
  onPointerUpActive?: PointerEventHandler;
  onPointerEnter?: PointerEventHandler;
  onPointerLeave?: PointerEventHandler;
};

export const useHover = (props: UseHoverProps) => {
  const id = useId();
  const updateInterfaceKind = useInterfaceState(state => state.updateInterfaceKind);
  useEffect(
    () => updateInterfaceKind(id, props.interfaceKind ?? 'click'),
    [id, props.interfaceKind]
  );

  const hoverTarget = useInterfaceState(state => state.hoverTarget);
  const activeTarget = useInterfaceState(state => state.activeTarget);
  const setHoverTarget = useInterfaceState(state => state.setHoverTarget);
  const setActiveTarget = useInterfaceState(state => state.setActiveTarget);

  const onPointerDown: PointerEventHandler = event => {
    event.stopPropagation();
    (event.target as Element).setPointerCapture(event.pointerId);
    setActiveTarget(id);
    props?.onPointerDown?.(event);
  };

  const onPointerUp: PointerEventHandler = event => {
    event.stopPropagation();
    (event.target as Element).releasePointerCapture(event.pointerId);

    if (activeTarget === id) {
      setActiveTarget(null);
      props?.onPointerUpActive?.(event);
    }
  };

  const onPointerEnter: PointerEventHandler = event => {
    event.stopPropagation();
    setHoverTarget(id);
    props?.onPointerEnter?.(event);
  };

  const onPointerLeave: PointerEventHandler = event => {
    event.stopPropagation();
    props?.onPointerLeave?.(event);

    if (hoverTarget === id) {
      setHoverTarget(null);
    }
  };

  return {
    isActive: id === activeTarget,
    isHover: id === hoverTarget,
    groupProps: {
      onPointerDown,
      onPointerUp,
      onPointerEnter,
      onPointerLeave,
    },
  };
};

import { useSpring } from '@react-spring/three';
import { useId, useMemo, useState } from 'react';
import { useInterfaceState } from '@/components/InterfaceStateProvider';
import type { PointerEvent } from 'react';
import type { Object3D } from 'three';

type UseToggleButtonProps = {
  bone: Object3D;
  state: boolean;
  onChange: (nextState: boolean) => void;
  baseZ?: number;
  toggleByBone?: boolean;
};

export const useToggleButton = ({
  bone,
  state,
  onChange,
  baseZ = 0,
  toggleByBone = false,
}: UseToggleButtonProps) => {
  const id = useId();
  const hoverTarget = useInterfaceState(state => state.hoverTarget);
  const activeTarget = useInterfaceState(state => state.activeTarget);
  const setHoverTarget = useInterfaceState(state => state.setHoverTarget);
  const setActiveTarget = useInterfaceState(state => state.setActiveTarget);

  const [initialZ] = useState(() => bone.position.z);

  const boneZOffset = useMemo(() => {
    const isActive = activeTarget === id;
    if (toggleByBone) {
      if (isActive) {
        return 0.5;
      }

      return state ? 0.3 : baseZ;
    }

    return isActive ? 0.5 : baseZ;
  }, [activeTarget, state, toggleByBone]);

  const { boneZ } = useSpring({
    boneZ: initialZ + boneZOffset,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  const { lightIntensity } = useSpring({
    lightIntensity: state ? 3.0 : 0.2,
    config: { duration: 200 },
  });

  const onPointerDown = (event: PointerEvent) => {
    event.stopPropagation();
    (event.target as Element).setPointerCapture(event.pointerId);
    setActiveTarget(id);
  };

  const onPointerUp = (event: PointerEvent) => {
    event.stopPropagation();
    (event.target as Element).releasePointerCapture(event.pointerId);

    if (activeTarget === id) {
      setActiveTarget(null);
      onChange(!state);
    }
  };

  const onPointerEnter = (event: PointerEvent) => {
    event.stopPropagation();
    setHoverTarget(id);
  };

  const onPointerLeave = (event: PointerEvent) => {
    event.stopPropagation();

    if (hoverTarget === id) {
      setHoverTarget(null);
    }

    if (activeTarget === id) {
      setActiveTarget(null);
    }
  };

  return {
    groupProps: { onPointerDown, onPointerUp, onPointerEnter, onPointerLeave },
    boneZ,
    lightIntensity,
  };
};

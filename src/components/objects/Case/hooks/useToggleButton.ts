import { useSpring } from '@react-spring/three';
import { useMemo, useState } from 'react';
import { useSynthesizeSFX } from '@/components/audio/SynthesizeSFXProvider';
import { useHover } from './useHover';
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
  const synthesizeTick = useSynthesizeSFX(state => state.synthesizeTick);
  const synthesizeTock = useSynthesizeSFX(state => state.synthesizeTock);

  const { isActive, groupProps } = useHover({
    onPointerDown: () => synthesizeTick({ position: bone.position.toArray(), gain: 2 }),
    onPointerUpActive: () => {
      onChange(!state);
      synthesizeTock({ position: bone.position.toArray(), gain: 2 });
    },
  });

  const [initialZ] = useState(() => bone.position.z);
  const boneZOffset = useMemo(() => {
    if (!toggleByBone) {
      return isActive ? 0.5 : baseZ;
    }

    return isActive ? 0.5 : state ? 0.3 : baseZ;
  }, [isActive, state, toggleByBone]);

  const { boneZ } = useSpring({
    boneZ: initialZ + boneZOffset,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  const { lightIntensity } = useSpring({
    lightIntensity: state ? 3.0 : 0.2,
    config: { duration: 200 },
  });

  return {
    groupProps,
    boneZ,
    lightIntensity,
  };
};

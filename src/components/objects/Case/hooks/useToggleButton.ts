import { useSpring } from '@react-spring/three';
import { useLoader } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import { AudioLoader, type Object3D } from 'three';
import ToggleTickSound from '@/assets/audio/toggle-tick.mp3';
import ToggleTockSound from '@/assets/audio/toggle-tock.mp3';
import { useSynthesize } from '@/components/audio/SynthesizeProvider';
import { useHover } from './useHover';

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
  const playAudio = useSynthesize(state => state.playAudio);
  const toggleTickSoundBuffer = useLoader(AudioLoader, ToggleTickSound);
  const toggleTockSoundBuffer = useLoader(AudioLoader, ToggleTockSound);

  const { isActive, groupProps } = useHover({
    onPointerDown: () => playAudio(bone.position.toArray(), toggleTickSoundBuffer),
    onPointerUpActive: () => {
      onChange(!state);
      playAudio(bone.position.toArray(), toggleTockSoundBuffer);
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

useLoader.preload(AudioLoader, ToggleTickSound);
useLoader.preload(AudioLoader, ToggleTockSound);

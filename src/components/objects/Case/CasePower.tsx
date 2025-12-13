import { animated, useSpring } from '@react-spring/three';
import { useLoader } from '@react-three/fiber';
import { throttle } from 'es-toolkit';
import { useEffect, useMemo, useState } from 'react';
import { AudioLoader } from 'three';
import UindowsBootSound from '@/assets/audio/uindows-boot.mp3?url';
import UindowsOffSound from '@/assets/audio/uindows-off.mp3?url';
import { useSynthesize } from '@/components/audio/SynthesizeProvider';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { DEG2RAD } from '@/constants';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { useHover } from './hooks/useHover';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { GLTFResult } from '@/types/GLTFResult';

const a = animated as unknown as AnimatedSimple;

export const CasePower = ({ nodes, materials }: Pick<GLTFResult, 'nodes' | 'materials'>) => {
  const isPoweredOn = useInterfaceState(state => state.isPoweredOn);
  const setIsPoweredOn = useInterfaceState(state => state.setIsPoweredOn);

  const [isPoweredOnInternal, setIsPoweredOnInternal] = useState(isPoweredOn);
  useEffect(() => setIsPoweredOnInternal(isPoweredOn), [isPoweredOn]);
  useEffect(() => {
    if (isPoweredOnInternal !== isPoweredOn) {
      const timeoutId = setTimeout(() => setIsPoweredOn(isPoweredOnInternal), 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isPoweredOn, isPoweredOnInternal]);

  const playAudio = useSynthesize(state => state.playAudio);
  const uindowsBootSoundBuffer = useLoader(AudioLoader, UindowsBootSound);
  const uindowsOffSoundBuffer = useLoader(AudioLoader, UindowsOffSound);

  const togglePowerUpDown = useLatestCallback(() => {
    setTimeout(() => {
      playAudio(isPoweredOnInternal ? uindowsOffSoundBuffer : uindowsBootSoundBuffer);
      setIsPoweredOnInternal(!isPoweredOnInternal);
    }, 300);
  });

  const togglePowerUpDownThrottled = useMemo(() => throttle(togglePowerUpDown, 3000), []);
  const { groupProps } = useHover({
    onPointerUpActive: togglePowerUpDownThrottled,
  });

  const { rotateY, translationX } = useSpring({
    rotateY: isPoweredOnInternal ? -10 * DEG2RAD : 0,
    translationX: isPoweredOnInternal ? 0.1 : 0,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  const [initialPositionX] = useState(() => nodes.PowerBone.position.x);
  const [initialRotateY] = useState(() => nodes.PowerBone.rotation.y);
  const boneRotateY = rotateY.to(offset => initialRotateY + offset);
  const bonePositionX = translationX.to(offset => initialPositionX + offset);

  return (
    <group {...groupProps}>
      <a.primitive object={nodes.PowerBone} position-x={bonePositionX} rotation-y={boneRotateY} />
      <primitive object={nodes.neutral_bone_8} />
      <skinnedMesh
        geometry={nodes.PowerMesh_1.geometry}
        material={materials.Base}
        skeleton={nodes.PowerMesh_1.skeleton}
      />
      <skinnedMesh
        geometry={nodes.PowerMesh_2.geometry}
        material={materials.Power}
        skeleton={nodes.PowerMesh_2.skeleton}
      />
    </group>
  );
};

useLoader.preload(AudioLoader, UindowsBootSound);
useLoader.preload(AudioLoader, UindowsOffSound);

import { useSpring } from '@react-spring/three';
import { useThree } from '@react-three/fiber';
import { throttle } from 'es-toolkit';
import { useMemo, useRef } from 'react';
import { Vector3 } from 'three';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { useHover } from './useHover';
import type { Object3D } from 'three';

const MAX_BLEND_DISTANCE = 15;
const MAX_BLEND_DISTANCE_INFINITE = 50;

type UseKnobProps = {
  bone: Object3D;
  state: number;
  onChange: (nextState: number) => void;
  infinite?: boolean;
};

export const useKnob = ({ bone, state, onChange, infinite = false }: UseKnobProps) => {
  const onChangeLatest = useLatestCallback(onChange);
  const onChangeThrottled = useMemo(() => throttle(onChangeLatest, 150), [onChange]);
  const { boneRotate } = useSpring({
    boneRotate: -state * Math.PI * (infinite ? 2 : 1.5),
  });

  const initialState = useRef({ x: 0, y: 0, rotate: boneRotate.get() });
  const { camera, size } = useThree();
  const { isActive, groupProps } = useHover({
    interfaceKind: 'xy',
    onPointerDown: () => {
      const center = bone.getWorldPosition(new Vector3()).project(camera);
      const centerX = (center.x * 0.5 + 0.5) * size.width;
      const centerY = (-center.y * 0.5 + 0.5) * size.height;
      initialState.current = { x: centerX, y: centerY, rotate: boneRotate.get() };
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

    const rotation = infinite
      ? (-(7 / 4) * Math.PI - angle) % (2 * Math.PI)
      : (1 / 4) * Math.PI - Math.max((1 / 4) * Math.PI, Math.min(angle, (7 / 4) * Math.PI));

    const maxBlendDistance = infinite ? MAX_BLEND_DISTANCE_INFINITE : MAX_BLEND_DISTANCE;
    const blendRate = Math.min(magnitude / maxBlendDistance, 1);
    const nextRotation = initialState.current.rotate * (1 - blendRate) + rotation * blendRate;
    const nextState = -nextRotation / (Math.PI * (infinite ? 2 : 1.5));

    onChangeThrottled(nextState);

    if (infinite) {
      boneRotate.set(nextRotation);
      return;
    }

    void boneRotate.start(nextRotation);
  };

  return {
    boneRotate,
    groupProps: { ...groupProps, onPointerMove },
  };
};

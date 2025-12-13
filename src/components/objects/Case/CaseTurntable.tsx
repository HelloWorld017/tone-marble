import { animated } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { usePitchMap } from '@/components/providers/PitchMapProvider';
import { useToggleButton } from './hooks/useToggleButton';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { GLTFResult } from '@/types/GLTFResult';
import type { MeshStandardMaterial } from 'three';

const a = animated as unknown as AnimatedSimple;

export const CaseTurntable = ({ nodes, materials }: Pick<GLTFResult, 'nodes' | 'materials'>) => {
  const button = useToggleButton({
    bone: nodes.DiscButtonBone,
    state: useInterfaceState(state => state.isRecording),
    onChange: useInterfaceState(state => state.setIsRecording),
    toggleByBone: true,
  });

  const getPointerAngle = usePitchMap(state => state.getPointerAngle);
  useFrame(() => {
    nodes.DiscDiscBone.rotation.y = Math.PI * 2 - getPointerAngle();
  });

  const isPoweredOn = useInterfaceState(state => state.isPoweredOn);
  const pitchTexture = usePitchMap(state => state.pitchTexture);
  const pitchCanvasTextureRef = useRef<MeshStandardMaterial | null>(null);
  const subscribePitchTexture = usePitchMap(state => state.subscribePitchTexture);
  useEffect(
    () =>
      subscribePitchTexture(() => {
        if (pitchCanvasTextureRef.current) {
          pitchCanvasTextureRef.current.needsUpdate = true;
        }
      }),
    [subscribePitchTexture]
  );

  return (
    <group position={[0, 0.5, -5.8]}>
      <a.primitive object={nodes.DiscButtonBone} position-z={button.boneZ} />
      <a.primitive object={nodes.DiscDiscBone} />
      <primitive object={nodes.neutral_bone_6} />
      <skinnedMesh
        geometry={nodes.DiscMesh_1.geometry}
        material={materials.Base}
        skeleton={nodes.DiscMesh_1.skeleton}
      />
      <group {...button.groupProps}>
        <skinnedMesh
          geometry={nodes.DiscMesh_2.geometry}
          material={materials.Button}
          skeleton={nodes.DiscMesh_2.skeleton}
        />
        <skinnedMesh
          geometry={nodes.DiscMesh_3.geometry}
          material={materials['Button.Image']}
          skeleton={nodes.DiscMesh_3.skeleton}
        />
      </group>
      <skinnedMesh geometry={nodes.DiscMesh_4.geometry} skeleton={nodes.DiscMesh_4.skeleton}>
        <meshStandardMaterial
          {...materials['Turntable.Simple']}
          emissive="white"
          emissiveIntensity={isPoweredOn && pitchTexture ? 5 : 0}
        >
          {pitchTexture && (
            <canvasTexture attach="emissiveMap" image={pitchTexture} ref={pitchCanvasTextureRef} />
          )}
        </meshStandardMaterial>
      </skinnedMesh>
      <skinnedMesh
        geometry={nodes.DiscMesh_5.geometry}
        material={materials['Turntable.Simple']}
        skeleton={nodes.DiscMesh_5.skeleton}
      />
    </group>
  );
};

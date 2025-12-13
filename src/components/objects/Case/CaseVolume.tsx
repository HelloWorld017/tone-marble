import { animated } from '@react-spring/three';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { useSlider } from './hooks/useSlider';
import { useToggleButton } from './hooks/useToggleButton';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { GLTFResult } from '@/types/GLTFResult';

const a = animated as unknown as AnimatedSimple;

export const CaseVolume = ({ nodes, materials }: Pick<GLTFResult, 'nodes' | 'materials'>) => {
  const muteButton = useToggleButton({
    bone: nodes.LargeButtonSandBone,
    state: useInterfaceState(state => state.isMuted),
    onChange: useInterfaceState(state => state.setIsMuted),
    toggleByBone: true,
    baseZ: 0.15,
  });

  const slider = useSlider({
    bone: nodes.ButtonMuteBone,
    state: useInterfaceState(state => state.volume),
    onChange: useInterfaceState(state => state.setVolume),
    width: 3.8,
    offset: -1.75,
    sensitivity: 0.001,
  });

  return (
    <>
      <group position={[0, 0.5, -5.8]}>
        <a.primitive object={nodes.SliderBone} position-x={slider.boneX} />
        <primitive object={nodes.neutral_bone_3} />
        <skinnedMesh
          geometry={nodes.SliderMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.SliderMesh_1.skeleton}
        />

        <group {...slider.groupProps}>
          <skinnedMesh
            geometry={nodes.SliderMesh_2.geometry}
            material={materials['Slider.Handle']}
            skeleton={nodes.SliderMesh_2.skeleton}
          />
          <skinnedMesh
            geometry={nodes.SliderMesh_3.geometry}
            material={materials['Slider.Track']}
            skeleton={nodes.SliderMesh_3.skeleton}
          />
        </group>
      </group>
      <group position={[0, 0.5, -5.8]}>
        <a.primitive object={nodes.ButtonMuteBone} position-z={muteButton.boneZ} />
        <primitive object={nodes.neutral_bone_4} />
        <skinnedMesh
          geometry={nodes.ButtonMuteMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.ButtonMuteMesh_1.skeleton}
        />
        <group {...muteButton.groupProps}>
          <skinnedMesh
            geometry={nodes.ButtonMuteMesh_2.geometry}
            material={materials.Button}
            skeleton={nodes.ButtonMuteMesh_2.skeleton}
          />
          <skinnedMesh
            geometry={nodes.ButtonMuteMesh_3.geometry}
            material={materials['Button.Image']}
            skeleton={nodes.ButtonMuteMesh_3.skeleton}
          />
        </group>
      </group>
    </>
  );
};

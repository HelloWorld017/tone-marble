import { animated } from '@react-spring/three';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { useKnob } from './hooks/useKnob';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { GLTFResult } from '@/types/GLTFResult';

const a = animated as unknown as AnimatedSimple;

export const CaseKnobs = ({ nodes, materials }: Pick<GLTFResult, 'nodes' | 'materials'>) => {
  const knobRhythm = useKnob({
    state: useInterfaceState(state => state.rhythm),
    onChange: useInterfaceState(state => state.setRhythm),
  });

  const knobRadius = useKnob({
    state: useInterfaceState(state => state.radius),
    onChange: useInterfaceState(state => state.setRadius),
    infinite: true,
  });

  return (
    <>
      <group position={[0, 0.5, -5.8]}>
        <a.primitive object={nodes.KnobWaveBone} rotation-y={knobRhythm.boneRotate} />
        <primitive object={nodes.neutral_bone_5} />
        <skinnedMesh
          geometry={nodes.KnobWaveMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.KnobWaveMesh_1.skeleton}
        />
        <skinnedMesh
          geometry={nodes.KnobWaveMesh_2.geometry}
          material={materials['Knob']}
          skeleton={nodes.KnobWaveMesh_2.skeleton}
        />
        <group {...knobRhythm.groupProps}>
          <skinnedMesh
            geometry={nodes.KnobWaveMesh_3.geometry}
            material={materials['Knob.Face']}
            skeleton={nodes.KnobWaveMesh_3.skeleton}
          />
          <skinnedMesh
            geometry={nodes.KnobWaveMesh_4.geometry}
            skeleton={nodes.KnobWaveMesh_4.skeleton}
          >
            <meshStandardMaterial
              {...materials['Knob.Side']}
              color="white"
              emissive="white"
              emissiveIntensity={0.1}
              lightMapIntensity={0.5}
            />
          </skinnedMesh>
        </group>
      </group>
      <group position={[0, 0.5, -5.8]}>
        <a.primitive object={nodes.KnobSelectBone} rotation-y={knobRadius.boneRotate} />
        <primitive object={nodes.neutral_bone_9} />
        <skinnedMesh
          geometry={nodes.KnobSelectMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.KnobSelectMesh_1.skeleton}
        />
        <skinnedMesh
          geometry={nodes.KnobSelectMesh_2.geometry}
          skeleton={nodes.KnobSelectMesh_2.skeleton}
          {...knobRadius.groupProps}
        >
          <meshStandardMaterial
            {...materials['Knob']}
            color="white"
            emissive="white"
            lightMapIntensity={0.8}
            emissiveIntensity={0.05}
          />
        </skinnedMesh>
      </group>
    </>
  );
};

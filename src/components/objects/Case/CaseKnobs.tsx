import { animated } from '@react-spring/three';
import { useInterfaceState } from '@/components/InterfaceStateProvider';
import { useKnob } from './hooks/useKnob';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { GLTFResult } from '@/types/GLTFResult';

const a = animated as unknown as AnimatedSimple;

export const CaseKnobs = ({ nodes, materials }: Pick<GLTFResult, 'nodes' | 'materials'>) => {
  const knobWaves = useKnob({
    state: useInterfaceState(state => state.wave),
    onChange: useInterfaceState(state => state.setWave),
  });

  const knobRadius = useKnob({
    state: useInterfaceState(state => state.radius),
    onChange: useInterfaceState(state => state.setRadius),
  });

  return (
    <>
      <group position={[0, 0.5, -5.8]}>
        <a.primitive object={nodes.KnobWaveBone} rotation-y={knobWaves.boneRotate} />
        <primitive object={nodes.neutral_bone_5} />
        <skinnedMesh
          geometry={nodes.KnobWaveMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.KnobWaveMesh_1.skeleton}
        />
        <skinnedMesh
          geometry={nodes.KnobWaveMesh_2.geometry}
          material={materials.Knob}
          skeleton={nodes.KnobWaveMesh_2.skeleton}
        />
        <group {...knobWaves.groupProps}>
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
            />
          </skinnedMesh>
        </group>
      </group>
      <group position={[0, 0.5, -5.8]}>
        <a.primitive object={nodes.KnobRadiusBone} rotation-y={knobRadius.boneRotate} />
        <primitive object={nodes.neutral_bone_6} />
        <skinnedMesh
          geometry={nodes.KnobRadiusMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.KnobRadiusMesh_1.skeleton}
        />
        <skinnedMesh
          geometry={nodes.KnobRadiusMesh_2.geometry}
          material={materials.Knob}
          skeleton={nodes.KnobRadiusMesh_2.skeleton}
        />
        <group {...knobRadius.groupProps}>
          <skinnedMesh
            geometry={nodes.KnobRadiusMesh_3.geometry}
            material={materials['Knob.Face']}
            skeleton={nodes.KnobRadiusMesh_3.skeleton}
          />
          <skinnedMesh
            geometry={nodes.KnobRadiusMesh_4.geometry}
            skeleton={nodes.KnobRadiusMesh_4.skeleton}
          >
            <meshStandardMaterial
              {...materials['Knob.Side']}
              color="white"
              emissive="white"
              emissiveIntensity={0.1}
            />
          </skinnedMesh>
        </group>
      </group>
    </>
  );
};

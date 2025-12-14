import { animated } from '@react-spring/three';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { useToggleButton } from './hooks/useToggleButton';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { GLTFResult } from '@/types/GLTFResult';
import type { Object3D } from 'three';

const a = animated as unknown as AnimatedSimple;

type UseSelectionToggleButtonProps = {
  bone: Object3D;
  state: number;
  onChange: (nextState: number) => void;
};

const useSelectionToggleButton = ({ bone, state, onChange }: UseSelectionToggleButtonProps) => {
  const mask = useInterfaceState(state => state.selectionMask);
  const isActive = (state & mask) === mask;
  const setIsActive = (nextIsActive: boolean) =>
    onChange(nextIsActive ? state | mask : state & ~mask);

  return useToggleButton({
    bone,
    state: isActive,
    onChange: setIsActive,
  });
};

export const CaseButtons = ({ nodes, materials }: Pick<GLTFResult, 'nodes' | 'materials'>) => {
  const sandButton = useSelectionToggleButton({
    bone: nodes.LargeButtonSandBone,
    state: useInterfaceState(state => state.sandActivePillars),
    onChange: useInterfaceState(state => state.setSandActivePillars),
  });

  const glassButton = useSelectionToggleButton({
    bone: nodes.LargeButtonGlassBone,
    state: useInterfaceState(state => state.glassActivePillars),
    onChange: useInterfaceState(state => state.setGlassActivePillars),
  });

  const windButton = useSelectionToggleButton({
    bone: nodes.LargeButtonMetalBone,
    state: useInterfaceState(state => state.windActivePillars),
    onChange: useInterfaceState(state => state.setWindActivePillars),
  });

  return (
    <>
      <group position={[0, 0.5, -5.8]}>
        <a.primitive object={nodes.LargeButtonGlassBone} position-z={glassButton.boneZ} />
        <primitive object={nodes.neutral_bone} />
        <skinnedMesh
          geometry={nodes.LargeButtonGlassMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.LargeButtonGlassMesh_1.skeleton}
        />
        <group {...glassButton.groupProps}>
          <skinnedMesh
            geometry={nodes.LargeButtonGlassMesh_2.geometry}
            material={materials.Button}
            skeleton={nodes.LargeButtonGlassMesh_2.skeleton}
          />
          <skinnedMesh
            geometry={nodes.LargeButtonGlassMesh_3.geometry}
            skeleton={nodes.LargeButtonGlassMesh_3.skeleton}
          >
            <a.meshStandardMaterial
              {...materials['Button.Light']}
              emissiveIntensity={glassButton.lightIntensity}
            />
          </skinnedMesh>
          <skinnedMesh
            geometry={nodes.LargeButtonGlassMesh_4.geometry}
            material={materials['Button.Image']}
            skeleton={nodes.LargeButtonGlassMesh_4.skeleton}
          />
        </group>
      </group>
      <group position={[0, 0.5, -5.8]}>
        <a.primitive object={nodes.LargeButtonSandBone} position-z={sandButton.boneZ} />
        <primitive object={nodes.neutral_bone_1} />
        <skinnedMesh
          geometry={nodes.LargeButtonSandMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.LargeButtonSandMesh_1.skeleton}
        />

        <group {...sandButton.groupProps}>
          <skinnedMesh
            geometry={nodes.LargeButtonSandMesh_2.geometry}
            material={materials.Button}
            skeleton={nodes.LargeButtonSandMesh_2.skeleton}
          />
          <skinnedMesh
            geometry={nodes.LargeButtonSandMesh_3.geometry}
            skeleton={nodes.LargeButtonSandMesh_3.skeleton}
          >
            <a.meshStandardMaterial
              {...materials['Button.Light']}
              emissiveIntensity={sandButton.lightIntensity}
            />
          </skinnedMesh>
          <skinnedMesh
            geometry={nodes.LargeButtonSandMesh_4.geometry}
            material={materials['Button.Image']}
            skeleton={nodes.LargeButtonSandMesh_4.skeleton}
          />
        </group>
      </group>
      <group position={[0, 0.5, -5.8]}>
        <a.primitive object={nodes.LargeButtonMetalBone} position-z={windButton.boneZ} />
        <primitive object={nodes.neutral_bone_2} />
        <skinnedMesh
          geometry={nodes.LargeButtonMetalMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.LargeButtonMetalMesh_1.skeleton}
        />
        <group {...windButton.groupProps}>
          <skinnedMesh
            geometry={nodes.LargeButtonMetalMesh_2.geometry}
            material={materials.Button}
            skeleton={nodes.LargeButtonMetalMesh_2.skeleton}
          />
          <skinnedMesh
            geometry={nodes.LargeButtonMetalMesh_3.geometry}
            skeleton={nodes.LargeButtonMetalMesh_3.skeleton}
          >
            <a.meshStandardMaterial
              {...materials['Button.Light']}
              emissiveIntensity={windButton.lightIntensity}
            />
          </skinnedMesh>
          <skinnedMesh
            geometry={nodes.LargeButtonMetalMesh_4.geometry}
            material={materials['Button.Image']}
            skeleton={nodes.LargeButtonMetalMesh_4.skeleton}
          />
        </group>
      </group>
    </>
  );
};

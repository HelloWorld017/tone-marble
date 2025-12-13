import { animated, useSpringValue } from '@react-spring/three';
import { VolumeAnalyzer } from '@/components/audio/VolumeAnalyzer';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { GLTFResult } from '@/types/GLTFResult';

const a = animated as unknown as AnimatedSimple;

export const CaseIndicator = ({ nodes, materials }: Pick<GLTFResult, 'nodes' | 'materials'>) => {
  const volumeSpring = useSpringValue(0);

  return (
    <group position={[0, 0.5, -5.8]}>
      <VolumeAnalyzer onVolume={volume => void volumeSpring.start(volume)} />
      <a.primitive
        object={nodes.IndicatorBaseBone}
        scale-y={volumeSpring.to(y => Math.min(y, 0.8) / 0.8)}
      />

      <a.primitive
        object={nodes.IndicatorHighlightBone}
        scale-y={volumeSpring.to(y => Math.max(0, Math.min(y - 0.8, 0.2)) / 0.2)}
      />

      <primitive object={nodes.neutral_bone_8} />
      <skinnedMesh
        geometry={nodes.IndicatorMesh_1.geometry}
        material={materials.Base}
        skeleton={nodes.IndicatorMesh_1.skeleton}
      />
      <skinnedMesh
        geometry={nodes.IndicatorMesh_2.geometry}
        material={materials['Base.Image']}
        skeleton={nodes.IndicatorMesh_2.skeleton}
      />
      <skinnedMesh
        geometry={nodes.IndicatorMesh_3.geometry}
        material={materials['Base.Film']}
        skeleton={nodes.IndicatorMesh_3.skeleton}
      />
      <skinnedMesh
        geometry={nodes.IndicatorMesh_4.geometry}
        material={materials['Meter.Light']}
        skeleton={nodes.IndicatorMesh_4.skeleton}
      />
      <skinnedMesh
        geometry={nodes.IndicatorMesh_5.geometry}
        material={materials['Meter.Highlight']}
        skeleton={nodes.IndicatorMesh_5.skeleton}
      />
    </group>
  );
};

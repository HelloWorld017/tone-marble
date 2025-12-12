import { useGLTF } from '@react-three/drei';
import CaseObject from '@/assets/objects/case.glb?url';
import LightmapTexture from '@/assets/textures/lightmap.webp?url';
import { useLightMap } from '@/hooks/useLightMap';
import { CaseButtons } from './CaseButtons';
import { CaseKnobs } from './CaseKnobs';
import { CaseVolume } from './CaseVolume';
import type { GLTFResult } from '@/types/GLTFResult';

export const Case = () => {
  const { nodes, materials } = useGLTF(CaseObject) as GLTFResult;
  useLightMap(LightmapTexture, materials, {
    excludedMaterials: ['Knob.Side'],
  });

  return (
    <group dispose={null} position={[0, -10, 0]} rotation={[0, Math.PI, 0]}>
      <group position={[0, 0.5, -5.8]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.IconAudio_1.geometry}
          material={materials.Base}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.IconAudio_2.geometry}
          material={materials['Base.Image']}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.IconWave_1.geometry}
          material={materials.Base}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.IconWave_2.geometry}
          material={materials['Base.Image']}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.InputMesh.geometry}
          material={materials.Base}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.InputMesh_1.geometry}
          material={materials.Connector}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Speaker_1.geometry}
          material={materials.Base}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Speaker_2.geometry}
          material={materials.Hole}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <mesh castShadow receiveShadow geometry={nodes.Base_1.geometry} material={materials.Base} />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Base_2.geometry}
          material={materials['Base.Image']}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.IconRadius_1.geometry}
          material={materials.Base}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.IconRadius_2.geometry}
          material={materials['Base.Image']}
        />
      </group>
      <CaseButtons nodes={nodes} materials={materials} />
      <CaseKnobs nodes={nodes} materials={materials} />
      <CaseVolume nodes={nodes} materials={materials} />
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.DiscButtonBone} />
        <primitive object={nodes.DiscDiscBone} />
        <primitive object={nodes.neutral_bone_7} />
        <skinnedMesh
          geometry={nodes.DiscMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.DiscMesh_1.skeleton}
        />
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
        <skinnedMesh
          geometry={nodes.DiscMesh_4.geometry}
          material={materials['Turntable.Simple']}
          skeleton={nodes.DiscMesh_4.skeleton}
        />
        <skinnedMesh
          geometry={nodes.DiscMesh_5.geometry}
          material={materials['Turntable.Simple']}
          skeleton={nodes.DiscMesh_5.skeleton}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.IndicatorBaseBone} />
        <primitive object={nodes.IndicatorHighlightBone} />
        <primitive object={nodes.neutral_bone_9} />
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
      <mesh castShadow receiveShadow geometry={nodes.Body_1.geometry} material={materials.Base} />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Body_2.geometry}
        material={materials['Glass.Outer']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Body_3.geometry}
        material={materials['Glass.Inner']}
      />
      <primitive object={nodes.PowerBone} />
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

useGLTF.preload(CaseObject);

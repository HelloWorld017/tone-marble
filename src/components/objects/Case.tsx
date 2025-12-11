import { useGLTF } from '@react-three/drei';
import { type Mesh, type MeshStandardMaterial, type SkinnedMesh } from 'three';
import CaseObject from '@/assets/objects/case.glb?url';
import LightmapTexture from '@/assets/textures/lightmap.webp?url';
import { useLightMap } from '@/hooks/useLightMap';

type GLTF = ReturnType<typeof useGLTF>;
type GLTFResult = GLTF & {
  nodes: {
    [key: string]: Mesh & SkinnedMesh;
  };
  materials: {
    [key: string]: MeshStandardMaterial;
  };
};

// Generated using gltf2jsx
export const Case = () => {
  const { nodes, materials } = useGLTF(CaseObject) as GLTFResult;
  useLightMap(LightmapTexture, materials);

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
        <mesh castShadow receiveShadow geometry={nodes.Base_2.geometry} material={materials.Base} />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Base_3.geometry}
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
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.Bone} />
        <primitive object={nodes.neutral_bone} />
        <skinnedMesh
          geometry={nodes.LargeButtonGlassMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.LargeButtonGlassMesh_1.skeleton}
        />
        <skinnedMesh
          geometry={nodes.LargeButtonGlassMesh_2.geometry}
          material={materials.Button}
          skeleton={nodes.LargeButtonGlassMesh_2.skeleton}
        />
        <skinnedMesh
          geometry={nodes.LargeButtonGlassMesh_3.geometry}
          material={materials['Button.Light']}
          skeleton={nodes.LargeButtonGlassMesh_3.skeleton}
        />
        <skinnedMesh
          geometry={nodes.LargeButtonGlassMesh_4.geometry}
          material={materials['Button.Image']}
          skeleton={nodes.LargeButtonGlassMesh_4.skeleton}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.Bone_1} />
        <primitive object={nodes.neutral_bone_1} />
        <skinnedMesh
          geometry={nodes.LargeButtonSandMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.LargeButtonSandMesh_1.skeleton}
        />
        <skinnedMesh
          geometry={nodes.LargeButtonSandMesh_2.geometry}
          material={materials.Button}
          skeleton={nodes.LargeButtonSandMesh_2.skeleton}
        />
        <skinnedMesh
          geometry={nodes.LargeButtonSandMesh_3.geometry}
          material={materials['Button.Light']}
          skeleton={nodes.LargeButtonSandMesh_3.skeleton}
        />
        <skinnedMesh
          geometry={nodes.LargeButtonSandMesh_4.geometry}
          material={materials['Button.Image']}
          skeleton={nodes.LargeButtonSandMesh_4.skeleton}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.Bone_2} />
        <primitive object={nodes.neutral_bone_2} />
        <skinnedMesh
          geometry={nodes.LargeButtonMetalMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.LargeButtonMetalMesh_1.skeleton}
        />
        <skinnedMesh
          geometry={nodes.LargeButtonMetalMesh_2.geometry}
          material={materials.Button}
          skeleton={nodes.LargeButtonMetalMesh_2.skeleton}
        />
        <skinnedMesh
          geometry={nodes.LargeButtonMetalMesh_3.geometry}
          material={materials['Button.Light']}
          skeleton={nodes.LargeButtonMetalMesh_3.skeleton}
        />
        <skinnedMesh
          geometry={nodes.LargeButtonMetalMesh_4.geometry}
          material={materials['Button.Image']}
          skeleton={nodes.LargeButtonMetalMesh_4.skeleton}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.Bone_3} />
        <primitive object={nodes.neutral_bone_3} />
        <skinnedMesh
          geometry={nodes.SliderMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.SliderMesh_1.skeleton}
        />
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
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.Bone_4} />
        <primitive object={nodes.neutral_bone_4} />
        <skinnedMesh
          geometry={nodes.ButtonMuteMesh_1.geometry}
          material={materials.Base}
          skeleton={nodes.ButtonMuteMesh_1.skeleton}
        />
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
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.Bone_5} />
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
        <skinnedMesh
          geometry={nodes.KnobWaveMesh_3.geometry}
          material={materials['Knob.Face']}
          skeleton={nodes.KnobWaveMesh_3.skeleton}
        />
        <skinnedMesh
          geometry={nodes.KnobWaveMesh_4.geometry}
          material={materials['Knob.Side']}
          skeleton={nodes.KnobWaveMesh_4.skeleton}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.Bone_6} />
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
        <skinnedMesh
          geometry={nodes.KnobRadiusMesh_3.geometry}
          material={materials['Knob.Face']}
          skeleton={nodes.KnobRadiusMesh_3.skeleton}
        />
        <skinnedMesh
          geometry={nodes.KnobRadiusMesh_4.geometry}
          material={materials['Knob.Side']}
          skeleton={nodes.KnobRadiusMesh_4.skeleton}
        />
      </group>
      <group position={[0, 0.5, -5.8]}>
        <primitive object={nodes.Bone_7} />
        <primitive object={nodes.Disc_1} />
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
        <primitive object={nodes.Base_1} />
        <primitive object={nodes.Highlight} />
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
      <primitive object={nodes.Bone_8} />
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

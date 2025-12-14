import { useGLTF } from '@react-three/drei';
import CaseObject from '@/assets/objects/case.glb?url';
import LightmapTexture from '@/assets/textures/lightmap.webp';
import { useLightMap } from '@/hooks/useLightMap';
import { CaseButtons } from './CaseButtons';
import { CaseIndicator } from './CaseIndicator';
import { CaseKnobs } from './CaseKnobs';
import { CaseMIDI } from './CaseMIDI';
import { CasePower } from './CasePower';
import { CaseTurntable } from './CaseTurntable';
import { CaseVolume } from './CaseVolume';
import type { GLTFResult } from '@/types/GLTFResult';

export const Case = () => {
  const { nodes, materials } = useGLTF(CaseObject) as GLTFResult;
  useLightMap(LightmapTexture, materials, {
    excludedMaterials: [],
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
      <CaseButtons nodes={nodes} materials={materials} />
      <CaseKnobs nodes={nodes} materials={materials} />
      <CaseVolume nodes={nodes} materials={materials} />
      <CasePower nodes={nodes} materials={materials} />
      <CaseIndicator nodes={nodes} materials={materials} />
      <CaseTurntable nodes={nodes} materials={materials} />
      <CaseMIDI nodes={nodes} materials={materials} />
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
    </group>
  );
};

useGLTF.preload(CaseObject);
useLightMap.preload(LightmapTexture);

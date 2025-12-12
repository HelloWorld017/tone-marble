import type { useGLTF } from '@react-three/drei';
import type { Mesh, MeshStandardMaterial, SkinnedMesh } from 'three';

type GLTF = ReturnType<typeof useGLTF>;
export type GLTFResult = GLTF & {
  nodes: {
    [key: string]: Mesh & SkinnedMesh;
  };
  materials: {
    [key: string]: MeshStandardMaterial;
  };
};

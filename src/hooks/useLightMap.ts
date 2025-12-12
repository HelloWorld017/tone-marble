import { useTexture } from '@react-three/drei';
import { useEffect } from 'react';
import { NoColorSpace } from 'three';
import type { MeshStandardMaterial } from 'three';

const glsl = String.raw;
const UNLIT_DIFFUSE_PREAMBLE = glsl`
  void RE_IndirectDiffuse_Unlit(
    const in vec3 irradiance,
    const in vec3 geometryPosition,
    const in vec3 geometryNormal,
    const in vec3 geometryViewDir,
    const in vec3 geometryClearcoatNormal,
    const in PhysicalMaterial material,
    inout ReflectedLight reflectedLight
  ) {
    vec4 lightMapTexel = texture2D(lightMap, vLightMapUv);
    vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
    reflectedLight.indirectDiffuse = lightMapIrradiance * BRDF_Lambert(material.diffuseColor);
  }

  #undef RE_IndirectDiffuse
  #define RE_IndirectDiffuse RE_IndirectDiffuse_Unlit
`;

type UseLightMapProps = {
  excludedMaterials?: string[];
};

export const useLightMap = (
  texture: string,
  materials: Record<string, MeshStandardMaterial>,
  opts: UseLightMapProps = {}
) => {
  const lightMap = useTexture(texture);
  lightMap.flipY = false;
  lightMap.colorSpace = NoColorSpace;
  lightMap.channel = 1;

  useEffect(() => {
    Object.entries(materials).forEach(([key, material]) => {
      if (opts.excludedMaterials?.includes(key)) {
        return;
      }

      material.onBeforeCompile = shader => {
        shader.fragmentShader = shader.fragmentShader.replace(
          /void\s+main.*/,
          `${UNLIT_DIFFUSE_PREAMBLE}\n$&`
        );
      };
      material.lightMap = lightMap;
      material.lightMapIntensity = 1.2;
      material.needsUpdate = true;
    });
  }, []);
};

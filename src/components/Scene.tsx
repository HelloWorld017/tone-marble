import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas, extend, useThree } from '@react-three/fiber';
import { Bloom, FXAA, ToneMapping, EffectComposer } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import { EffectPass, RenderPass, type EffectComposer as EffectComposerType } from 'postprocessing';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { SSGIEffect, VelocityDepthNormalPass } from './effects';
import { Case } from './objects/Case';
import { Frame } from './objects/Frame';
import { Marbles } from './objects/Marbles';
import { Pillars } from './objects/Pillars';

const SceneLights = () => (
  <>
    <ambientLight intensity={0} />
    <directionalLight
      position={[10, 10, 10]}
      intensity={0.2}
      castShadow
      shadow-mapSize={[2048, 2048]}
    />
    <Environment preset="city" environmentIntensity={0.3} />
  </>
);

const SceneObjects = () => (
  <>
    <Case />
    <Physics gravity={[0, -20, 0]}>
      <Frame planeWidth={10} planeHeight={32} planeAngle={-5 * (Math.PI / 180)} height={10} />
      <Pillars planeAngle={-5 * (Math.PI / 180)} rows={20} columns={6} />
      <Marbles spawnX={-12} spawnY={5} />
    </Physics>
  </>
);

const ssgiConfig = {
  importanceSampling: true,
  steps: 20,
  refineSteps: 4,
  spp: 1,
  resolutionScale: 1,
  missedRays: false,
  distance: 5.980000000000011,
  thickness: 2.829999999999997,
  denoiseIterations: 1,
  denoiseKernel: 3,
  denoiseDiffuse: 25,
  denoiseSpecular: 25.54,
  radius: 11,
  phi: 0.5760000000000001,
  lumaPhi: 20.651999999999997,
  depthPhi: 23.37,
  normalPhi: 26.087,
  roughnessPhi: 18.477999999999998,
  specularPhi: 7.099999999999999,
  envBlur: 0.8,
};

export function Effects() {
  const scene = useThree(state => state.scene);
  const camera = useThree(state => state.camera);
  const initializeComposer = useLatestCallback((composer: EffectComposerType) => {
    const velocityDepthNormalPass = new VelocityDepthNormalPass(scene, camera);
    composer.addPass(velocityDepthNormalPass);
    composer.addPass(
      new EffectPass(
        camera,
        new SSGIEffect(composer, scene, camera, { ...ssgiConfig, velocityDepthNormalPass })
      )
    );

    return () => {
      composer.removeAllPasses();
    };
  });

  return (
    <EffectComposer multisampling={0} ref={initializeComposer}>
      <Bloom mipmapBlur luminanceThreshold={0.1} intensity={0.9} levels={7} />
      <FXAA />
      <ToneMapping />
    </EffectComposer>
  );
}

export const Scene = () => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <Canvas shadows camera={{ position: [0, 0, 30], fov: 50 }}>
      <color attach="background" args={['#111']} />
      <SceneLights />
      <SceneObjects />
      <OrbitControls target={[0, 0, 0]} />
      <Effects />
    </Canvas>
  </div>
);

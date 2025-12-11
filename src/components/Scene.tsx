import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import { Case } from './objects/Case';
import { Frame } from './objects/Frame';
import { Marbles } from './objects/Marbles';
import { Pillars } from './objects/Pillars';

const SceneLight = () => (
  <>
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
      <Frame planeWidth={10} planeHeight={32} planeAngle={-5 * (Math.PI / 180)} height={20} />
      <Pillars planeAngle={-5 * (Math.PI / 180)} rows={20} columns={6} />
      <Marbles spawnX={-12} spawnY={5} />
    </Physics>
  </>
);

const Effects = () => (
  <EffectComposer>
    <Bloom />
    <ToneMapping />
  </EffectComposer>
);

export const Scene = () => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <Canvas shadows camera={{ position: [0, 0, 30], fov: 50 }} flat>
      <color attach="background" args={['#c0c0c0']} />
      <SceneLight />
      <SceneObjects />
      <OrbitControls target={[0, 0, 0]} />
      <Effects />
    </Canvas>
  </div>
);

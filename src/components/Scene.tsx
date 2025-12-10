import { Environment, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Frame } from './objects/Frame';
import { Marbles } from './objects/Marbles';
import { Pillars } from './objects/Pillars';

export const Scene = () => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <Canvas shadows camera={{ position: [0, 0, 30], fov: 50 }}>
      <color attach="background" args={['#111']} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <Environment preset="city" />

      <Physics gravity={[0, -20, 0]}>
        <Frame planeWidth={10} planeHeight={32} planeAngle={-5 * (Math.PI / 180)} height={10} />
        <Pillars planeAngle={-5 * (Math.PI / 180)} rows={20} columns={6} />
        <Marbles spawnX={-12} />
      </Physics>

      <OrbitControls target={[0, 0, 0]} />
    </Canvas>
  </div>
);

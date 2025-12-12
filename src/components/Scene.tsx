import { Cloud, Clouds, Environment, Html, OrbitControls, useProgress } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  ToneMapping,
} from '@react-three/postprocessing';
import { Physics } from '@react-three/rapier';
import { Suspense, useEffect } from 'react';
import {
  AudioContext as ThreeAudioContext,
  AudioListener as ThreeAudioListener,
  MeshBasicMaterial,
  Vector2,
} from 'three';
import { InterfaceStateProvider, useInterfaceState } from './InterfaceStateProvider';
import {
  AudioContextProvider,
  AudioContextTestInitializer,
  useAudioContext,
} from './audio/AudioContextProvider';
import { SynthesizeProvider, useSynthesize } from './audio/SynthesizeProvider';
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
    <Clouds material={MeshBasicMaterial}>
      <Cloud
        seed={1}
        segments={15}
        volume={3}
        bounds={[2, 0.3, 2]}
        position={[-12, 5, 0]}
        color="white"
      />
      <Cloud
        seed={2}
        segments={24}
        volume={10}
        bounds={[2, 1, 4.5]}
        position={[15, -2, 0]}
        color="white"
      />
      <pointLight position={[-12, 4, 0]} color="blue" intensity={20} />
    </Clouds>
    <Physics gravity={[0, -20, 0]} interpolate={false}>
      <Frame planeWidth={10} planeHeight={32} planeAngle={-5 * (Math.PI / 180)} height={20} />
      <Pillars planeAngle={-5 * (Math.PI / 180)} rows={20} columns={6} />
      <Marbles spawnX={-12} spawnY={5} />
    </Physics>
  </>
);

const SceneAudioListener = () => {
  const ctx = useAudioContext();
  const { camera } = useThree();
  const isMuted = useInterfaceState(state => state.isMuted);
  const volume = useInterfaceState(state => state.volume);
  const destinationOut = useSynthesize(state => state.destinationOut);

  useEffect(() => {
    if (!ctx) {
      return () => {};
    }

    ThreeAudioContext.setContext(ctx);

    const listener = new ThreeAudioListener();
    camera.add(listener);

    return () => camera.remove(listener);
  }, [ctx, camera]);

  useEffect(() => {
    if (destinationOut) {
      destinationOut.gain.value = +!isMuted * volume;
    }
  }, [destinationOut, isMuted, volume]);

  return <></>;
};

const SceneEffects = ({ useChromaticAberration = false }) => (
  <EffectComposer>
    <Bloom />
    <ToneMapping />
    {useChromaticAberration ? (
      <ChromaticAberration
        offset={new Vector2(0.003, 0.003)}
        radialModulation
        modulationOffset={0.64}
      />
    ) : (
      <></>
    )}
  </EffectComposer>
);

const SceneOrbitControls = () => {
  const activeTarget = useInterfaceState(state => state.activeTarget);
  return <OrbitControls target={[0, 0, 0]} enabled={!activeTarget} />;
};

const SceneProgress = () => {
  const { progress } = useProgress();
  return <Html center>{progress.toFixed(2)} % loaded</Html>;
};

export const Scene = () => (
  <AudioContextProvider>
    <AudioContextTestInitializer />
    <SynthesizeProvider>
      <InterfaceStateProvider>
        <div style={{ width: '100vw', height: '100vh' }}>
          <Canvas shadows camera={{ position: [0, 0, 30], fov: 50 }} flat>
            <Suspense fallback={<SceneProgress />}>
              <color attach="background" args={['#c0c0c0']} />
              <SceneAudioListener />
              <SceneLight />
              <SceneObjects />
              <SceneEffects />
              <SceneOrbitControls />
            </Suspense>
          </Canvas>
        </div>
      </InterfaceStateProvider>
    </SynthesizeProvider>
  </AudioContextProvider>
);

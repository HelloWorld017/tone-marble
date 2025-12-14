import {
  Cloud,
  Clouds,
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Preload,
} from '@react-three/drei';
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
import UnfinishedOfficeHDRI from '@/assets/hdris/unfinished_office_1k.exr?url';
import CloudTexture from '@/assets/textures/cloud.png?url';
import { DEG2RAD, PILLAR_ROWS } from '@/constants';
import { useAudioContext } from './audio/AudioContextProvider';
import { useSynthesize } from './audio/SynthesizeProvider';
import { useFluorescentBlink } from './hooks/useFluorescentBlink';
import { Case } from './objects/Case';
import { Frame } from './objects/Frame';
import { Marbles } from './objects/Marbles';
import { Pillars } from './objects/Pillars';
import { useInterfaceState } from './providers/InterfaceStateProvider';
import { Progress } from './ui/Progress';

const SceneEnvironment = () => {
  const isPoweredOn = useInterfaceState(state => state.isPoweredOn);
  const intensity = useFluorescentBlink(isPoweredOn);

  return (
    <>
      <directionalLight
        position={[10, 10, 10]}
        intensity={intensity * 0.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <Environment files={UnfinishedOfficeHDRI} environmentIntensity={intensity * 0.3} />
      <Clouds texture={CloudTexture} material={MeshBasicMaterial}>
        <Cloud
          seed={1}
          segments={15}
          volume={3}
          bounds={[2, 0.3, 2]}
          position={[-12, 5, 0]}
          color="white"
          opacity={intensity}
        />
        <Cloud
          seed={2}
          segments={24}
          volume={10}
          bounds={[2, 1, 4.5]}
          position={[15, -2, 0]}
          color="white"
          opacity={intensity}
        />
        <pointLight position={[-12, 4, 0]} color="blue" intensity={intensity * 20} />
      </Clouds>
    </>
  );
};

const SceneObjects = () => (
  <>
    <Case />
    <Physics gravity={[0, -20, 0]} interpolate={false}>
      <Frame planeWidth={10} planeHeight={32} planeAngle={-5 * DEG2RAD} height={20} />
      <Pillars planeAngle={-5 * DEG2RAD} rows={PILLAR_ROWS} columns={6} />
      <Marbles spawnX={-12} spawnY={5} />
    </Physics>
  </>
);

const SceneAudioListener = () => {
  const ctx = useAudioContext();
  const { camera } = useThree();
  let isMuted = useInterfaceState(state => state.isMuted);
  const isPoweredOn = useInterfaceState(state => state.isPoweredOn);
  const volume = useInterfaceState(state => state.volume);
  const analyzerOut = useSynthesize(state => state.analyzerOut);
  const destinationOut = useSynthesize(state => state.destinationOut);

  isMuted ||= !isPoweredOn;

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
    if (analyzerOut && destinationOut) {
      analyzerOut.gain.value = +!isMuted * volume;
      destinationOut.gain.value = +!isMuted * volume;
    }
  }, [analyzerOut, destinationOut, isMuted, volume]);

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

export const Scene = () => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <Canvas shadows flat>
      <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={50} near={0.01} far={500} />
      <Suspense fallback={<Progress />}>
        <color attach="background" args={['#c0c0c0']} />
        <SceneAudioListener />
        <SceneEffects />
        <SceneEnvironment />
        <SceneObjects />
        <SceneOrbitControls />
        <Preload all />
      </Suspense>
    </Canvas>
  </div>
);

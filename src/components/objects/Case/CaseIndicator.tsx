import { animated, useSpringValue } from '@react-spring/three';
import { useEffect, useRef } from 'react';
import { useAudioContext } from '@/components/audio/AudioContextProvider';
import { useSynthesize } from '@/components/audio/SynthesizeProvider';
import { createVolumeAnalyzer } from '@/utils/volumeAnalyzer';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { GLTFResult } from '@/types/GLTFResult';

const a = animated as unknown as AnimatedSimple;

export const CaseIndicator = ({ nodes, materials }: Pick<GLTFResult, 'nodes' | 'materials'>) => {
  const ctx = useAudioContext();
  const analyzerOut = useSynthesize(state => state.analyzerOut);
  const volumeSpring = useSpringValue(0);
  const lastAnalyze = useRef(0);

  useEffect(() => {
    if (!ctx || !analyzerOut) {
      return;
    }

    const intervalId = setInterval(() => {
      if (performance.now() - lastAnalyze.current > 75) {
        void volumeSpring.start(0);
      }
    }, 100);

    const volumeAnalyzerPromise = createVolumeAnalyzer(ctx, volume => {
      const volumeMapped = Math.min(1, volume / 0.3);
      void volumeSpring.start(volumeMapped);
      lastAnalyze.current = performance.now();
    });

    let isCanceled = false;
    let volumeAnalyzerNode: AudioNode | null = null;
    void volumeAnalyzerPromise.then(volumeAnalyzer => {
      if (!isCanceled) {
        volumeAnalyzerNode = volumeAnalyzer;
        analyzerOut.connect(volumeAnalyzer);
      }
    });

    return () => {
      isCanceled = true;
      clearInterval(intervalId);
      if (volumeAnalyzerNode) {
        analyzerOut.disconnect(volumeAnalyzerNode);
      }
    };
  }, [ctx, analyzerOut]);

  return (
    <group position={[0, 0.5, -5.8]}>
      <a.primitive
        object={nodes.IndicatorBaseBone}
        scale-y={volumeSpring.to(y => Math.min(y, 0.8) / 0.8)}
      />

      <a.primitive
        object={nodes.IndicatorHighlightBone}
        scale-y={volumeSpring.to(y => Math.max(0, Math.min(y - 0.8, 0.2)) / 0.2)}
      />

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
  );
};

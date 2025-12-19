import { useCallback, useEffect, useState } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import { useAudioContext } from './AudioContextProvider';
import { useConnectNodeChain } from './hooks/useConnectNode';
import { useDynamicsCompressor } from './hooks/useDynamicsCompressor';
import { useGain } from './hooks/useGain';
import type { Position } from '@/types/Position';

export const [SynthesizeProvider, useSynthesize] = buildContext(
  ({ gain = 1 }: { gain?: number }) => {
    const ctx = useAudioContext();
    const additionalGain = useGain({ gain: 1 }, ctx?.destination);
    useEffect(() => {
      if (additionalGain) {
        additionalGain.gain.value = gain;
      }
    }, [gain]);

    const masterCompressor = useDynamicsCompressor({ threshold: -10, ratio: 12 }, additionalGain);
    const effectChainInput = useGain({ gain: 1 }, null);
    const [effects, setEffects] = useState<[AudioNode, AudioNode][]>([]);
    useConnectNodeChain(effectChainInput, effects, masterCompressor);

    const addEffect = useCallback((newEffectIn: AudioNode | null, newEffectOut = newEffectIn) => {
      if (newEffectIn === null || newEffectOut === null) {
        return () => {};
      }

      setEffects(effects => [...effects, [newEffectIn, newEffectOut]]);
      return () =>
        setEffects(effects =>
          effects.filter(
            ([effectIn, effectOut]) => effectIn === newEffectIn && effectOut === newEffectOut
          )
        );
    }, []);

    const destinationOut = useGain({ gain: 1 }, masterCompressor);
    const analyzerOut = useGain({ gain: 1 }, null);

    const updateListenerPosition = useLatestCallback((position: Position) => {
      if (!ctx) {
        return;
      }

      ctx.listener.positionX.value = position[0];
      ctx.listener.positionY.value = position[1];
      ctx.listener.positionZ.value = position[2];
    });

    const calculateEffectiveGain = useLatestCallback((gain: number, origin: Position) => {
      const distance = Math.hypot(
        origin[0] - (ctx?.listener.positionX.value ?? 0),
        origin[1] - (ctx?.listener.positionY.value ?? 0),
        origin[2] - (ctx?.listener.positionZ.value ?? 0)
      );
      const attenuation = 1 / (1 + distance);
      return gain * attenuation;
    });

    return {
      analyzerOut,
      destinationOut,
      masterOut: masterCompressor,
      updateListenerPosition,
      calculateEffectiveGain,
      addEffect,
    };
  }
);

import { useEffect, useRef, useState } from 'react';
import { useLatestRef } from '@/hooks/useLatestRef';
import { useAudioContext } from '../AudioContextProvider';
import { useConnectNode } from '../hooks/useConnectNode';

export const buildAudioNodeHook = <TNode extends AudioNode, TProps, TState>(
  onCreate: (ctx: AudioContext) => TNode | { node: TNode; state: TState },
  onUpdate: (node: TNode, props: TProps, state: TState) => void
) => {
  const useAudioNode = (props: TProps, next: AudioNode | null | undefined) => {
    const [node, setNode] = useState<TNode | null>(null);
    const latestPropRef = useLatestRef(props);
    const stateRef = useRef<TState | null>(null);
    const ctx = useAudioContext();

    useEffect(() => {
      if (ctx) {
        const output = onCreate(ctx);
        stateRef.current = output instanceof AudioNode ? null : output.state;
        setNode(output instanceof AudioNode ? output : output.node);
        return () => setNode(null);
      }

      return () => {};
    }, [ctx]);

    useEffect(() => {
      if (node) {
        onUpdate(node, latestPropRef.current, stateRef.current!);
      }
    }, [node, latestPropRef]);

    useConnectNode(node, next ?? null);

    return node;
  };

  return useAudioNode;
};

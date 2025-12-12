import { useEffect, useRef, useState } from 'react';
import { useAudioContext } from '../AudioContextProvider';

export const buildAudioNodeHook = <TNode extends AudioNode, TProps, TState>(
  onCreate: (ctx: AudioContext) => TNode | { node: TNode; state: TState },
  onUpdate: (node: TNode, props: TProps, state: TState) => void
) => {
  const useAudioNode = (props: TProps, next: AudioNode | null | undefined) => {
    const [node, setNode] = useState<TNode | null>(null);
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
        onUpdate(node, props, stateRef.current!);
      }
    }, [node]);

    useEffect(() => {
      if (!node || !next) {
        return () => {};
      }

      node.connect(next);
      return () => node.disconnect(next);
    }, [next, node]);

    return node;
  };

  return useAudioNode;
};

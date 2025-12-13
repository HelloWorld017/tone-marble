import { useEffect, useMemo } from 'react';

const isEveryNonNull = <T>(array: (T | null | undefined)[]): array is T[] =>
  array.every(value => value !== null && value !== undefined);

export const useConnectNodeChain = (
  input: AudioNode | null,
  chain: [AudioNode | null, AudioNode | null][],
  output: AudioNode | null
) => {
  const nodes = useMemo(() => [[null, input], ...chain, [output, null]], [input, chain, output]);

  useEffect(() => {
    if (!isEveryNonNull(nodes.flat().slice(1, -1)) || !nodes.length) {
      return () => {};
    }

    nodes.reduce((prev, curr) => {
      if (curr[0]) {
        prev[1]?.connect(curr[0]);
      }

      return curr;
    });

    return () => {
      nodes.reduce((prev, curr) => {
        try {
          if (curr[0]) {
            prev[1]?.disconnect(curr[0]);
          }
        } catch {
          // When the node is already cleaned up
        }

        return curr;
      });
    };
  }, [nodes]);
};

export const useConnectNode = (node: AudioNode | null, next: AudioNode | null) => {
  useEffect(() => {
    if (!node || !next) {
      return () => {};
    }

    node.connect(next);
    return () => {
      try {
        node.disconnect(next);
      } catch {
        // When the node is already cleaned up
      }
    };
  }, [next, node]);
};

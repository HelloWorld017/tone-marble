import type { SpringValue } from '@react-spring/three';
import type { FunctionComponent, JSX } from 'react';

// To mitigate pmndrs/react-three-fiber#3584
export type AnimatedSimple = {
  [K in keyof JSX.IntrinsicElements]: FunctionComponent<{
    [P in keyof JSX.IntrinsicElements[K]]:
      | JSX.IntrinsicElements[K][P]
      | SpringValue<Required<JSX.IntrinsicElements[K]>[P]>;
  }>;
};

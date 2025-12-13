import type { SpringValue } from '@react-spring/three';
import type { FunctionComponent, JSX } from 'react';

type ApplySpringValue<T> = T extends unknown ? SpringValue<T> : never;

// To mitigate pmndrs/react-three-fiber#3584
export type AnimatedSimple = {
  [K in keyof JSX.IntrinsicElements]: FunctionComponent<{
    [P in keyof JSX.IntrinsicElements[K]]:
      | JSX.IntrinsicElements[K][P]
      | ApplySpringValue<Required<JSX.IntrinsicElements[K]>[P]>;
  }>;
};

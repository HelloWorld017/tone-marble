import type { FrameValue } from '@react-spring/three';
import type { CSSProperties, FunctionComponent, JSX } from 'react';

type ApplyFrameValue<T> = T extends unknown ? FrameValue<T> : never;

// To mitigate pmndrs/react-three-fiber#3584
export type AnimatedSimple = {
  [K in keyof JSX.IntrinsicElements]: FunctionComponent<
    Omit<
      {
        [P in keyof JSX.IntrinsicElements[K]]:
          | JSX.IntrinsicElements[K][P]
          | ApplyFrameValue<NonNullable<JSX.IntrinsicElements[K][P]>>;
      },
      'style'
    > & {
      style?:
        | ApplyFrameValue<CSSProperties>
        | {
            [P in keyof CSSProperties]:
              | CSSProperties[P]
              | ApplyFrameValue<NonNullable<CSSProperties[P]>>;
          };
    }
  >;
};

import { animated, useScroll } from '@react-spring/web';
import { useMemo } from 'react';
import * as styles from './CirclesPanout.css';

export const CirclesPanout = () => {
  const scroll = useScroll();
  const panout = scroll.scrollY.to(y => y / (3 * window.innerHeight));
  const circles = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, index) => ({
        key: index,
        index,
        angle: Math.random() * 0.1 - 0.05,
        offset: Math.random() * 0.75 + 0.75,
      })),
    []
  );

  return (
    <div css={styles.containerStyle}>
      <div css={styles.circlesPanoutStyle}>
        {circles.map(({ key, angle, index, offset }) => (
          <animated.div
            key={key}
            css={styles.circleStyle}
            style={{
              translate: panout.to(
                x =>
                  `${(Math.cos(angle) * x * (index * offset) * 80).toFixed(2)}%,` +
                  `${(Math.sin(angle) * x * index * 100).toFixed(2)}px`
              ),
            }}
          />
        ))}
      </div>
    </div>
  );
};

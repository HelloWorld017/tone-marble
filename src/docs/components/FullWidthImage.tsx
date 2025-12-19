import { animated, useScroll } from '@react-spring/web';
import * as styles from './FullWidthImage.css';
import type { AnimatedSimple } from '@/types/AnimatedSimple';

const a = animated as unknown as AnimatedSimple;

export const FullWidthImage = ({ src }: { src: string }) => {
  const scroll = useScroll();

  return (
    <a.img
      src={src}
      css={styles.imageStyle}
      style={{
        objectPosition: scroll.scrollY.to(
          y => `center ${(Math.min(y / window.innerHeight, 1) * 100).toFixed(2)}%`
        ),
      }}
    />
  );
};

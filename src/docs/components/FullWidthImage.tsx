import { animated, useScroll } from '@react-spring/web';
import * as styles from './FullWidthImage.css';

export const FullWidthImage = ({ src }: { src: string }) => {
  const scroll = useScroll();

  return (
    <animated.img
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

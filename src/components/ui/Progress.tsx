import { ThemeProvider } from '@emotion/react';
import { Html, useProgress } from '@react-three/drei';
import { IconPercent } from '@/assets/icons/lucide';
import PayloadSynthesis from '@/assets/svgs/payload-synthesis.svg?react';
import { DEFAULT_THEME } from '@/constants/theme';
import * as styles from './Progress.css';

export const Progress = () => {
  const { progress } = useProgress();
  return (
    <Html fullscreen>
      <ThemeProvider theme={DEFAULT_THEME}>
        <div css={styles.backgroundStyle}>
          <div css={styles.progressStyle}>
            {progress.toFixed()}
            <i>
              <IconPercent />
            </i>
          </div>
          <PayloadSynthesis css={styles.logoStyle} />
        </div>
      </ThemeProvider>
    </Html>
  );
};

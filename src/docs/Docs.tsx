import { Global, ThemeProvider } from '@emotion/react';
import { AudioContextProvider } from '@/components/audio/AudioContextProvider';
import { SynthesizeProvider } from '@/components/audio/SynthesizeProvider';
import { LIGHT_THEME } from '@/constants/theme';
import { globalStyle } from '@/utils/css';
import Content from './Content.mdx';
import * as styles from './Docs.css';
import type { ReactNode } from 'react';

export const DocsProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={LIGHT_THEME}>
    <Global styles={globalStyle} />
    <AudioContextProvider>
      <SynthesizeProvider>{children}</SynthesizeProvider>
    </AudioContextProvider>
  </ThemeProvider>
);

export const Docs = () => (
  <DocsProviders>
    <main css={styles.mainStyle}>
      <div css={styles.contentStyle}>
        <Content />
      </div>
    </main>
  </DocsProviders>
);

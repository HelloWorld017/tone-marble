import { Global, ThemeProvider } from '@emotion/react';
import { LIGHT_THEME } from '@/constants/theme';
import { globalStyle } from '@/utils/css';
import Content from './Content.mdx';
import * as styles from './Docs.css';

export const Docs = () => (
  <ThemeProvider theme={LIGHT_THEME}>
    <Global styles={globalStyle} />
    <main css={styles.mainStyle}>
      <div css={styles.contentStyle}>
        <Content />
      </div>
    </main>
  </ThemeProvider>
);

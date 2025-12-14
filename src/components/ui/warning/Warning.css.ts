import { css } from '@emotion/react';
import * as indexStyles from '../index.css';
import type { Theme } from '@emotion/react';

export { titleStyle } from '../index.css';

export const contentStyle = (theme: Theme) => css`
  margin-top: 0.6rem;
  ${indexStyles.contentStyle(theme)};
`;

import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const titleStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  font-weight: 500;
  color: ${theme.colors.fillPrimary};
  text-transform: uppercase;
`;

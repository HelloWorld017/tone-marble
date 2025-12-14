import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const titleStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${theme.colors.fillPrimary};
  text-transform: uppercase;
`;

export const contentStyle = (theme: Theme) => css`
  margin-top: 0.6rem;
  font-size: 1.2rem;
  line-height: 1.6rem;
  color: ${theme.colors.fillSecondary};
`;

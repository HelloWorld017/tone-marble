import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const footerStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
  border-top: 1px solid ${theme.colors.fillLine};
`;

export const logoStyle = (theme: Theme) => css`
  color: ${theme.colors.fillSecondary};
  width: 150px;
  height: auto;
`;

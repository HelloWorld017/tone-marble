import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const backgroundStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

export const progressStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 10rem;
  height: 10rem;
  padding: 1.2rem;
  background: ${theme.colors.bgBase};

  color: ${theme.colors.fillPrimary};
  font-size: 4rem;

  i {
    display: flex;
    justify-content: flex-end;
    font-size: 2.4rem;
    color: ${theme.colors.fillSecondary};
    align-self: flex-end;
  }
`;

export const logoStyle = css`
  position: absolute;
  bottom: 6rem;
  left: 50%;
  color: #404040;
  transform: translate(-50%);
  width: 150px;
  height: auto;
`;

import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const containerStyle = css`
  overflow: hidden;
`;

export const circlesPanoutStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
  margin-top: 100px;
  height: 400px;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

export const circleStyle = (theme: Theme) => css`
  position: absolute;
  left: 1.6rem;
  border: 1rem solid ${theme.colors.fillSecondary};
  width: 300px;
  height: 300px;
  border-radius: 150px;

  @media (max-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;

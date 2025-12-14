import { css } from '@emotion/react';

export const imageStyle = css`
  width: 100%;
  margin-top: 150px;
  height: 40vh;
  min-height: 300px;
  object-fit: cover;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

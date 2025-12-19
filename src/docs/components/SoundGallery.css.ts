import { css } from '@emotion/react';

export const galleryStyle = css`
  display: flex;
  perspective: 500px;
  transform-style: preserve-3d;

  button {
    position: relative;
    width: 20rem;
    height: 20rem;
    flex: 0 0 auto;
  }
`;

export const preventOverflowStyle = css`
  overflow: hidden;
`;

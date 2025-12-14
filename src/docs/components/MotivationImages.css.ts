import { css } from '@emotion/react';

export const gridStyle = css`
  display: grid;
  margin-top: 2rem;
  gap: 0.5rem;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(6, auto);
  grid-template-areas:
    'pb pb te te rs rs'
    'pb pb te te rs rs'
    'dv dv te te rs rs'
    'dv dv cd cd rs rs'
    'ma ma cd cd ui ui'
    'ma ma cd cd ui ui';

  & > * {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    border-radius: 0.8rem;
  }

  & > :nth-of-type(1) {
    grid-area: cd;
  }

  & > :nth-of-type(2) {
    grid-area: pb;
  }

  & > :nth-of-type(3) {
    grid-area: ma;
  }

  & > :nth-of-type(4) {
    grid-area: dv;
  }

  & > :nth-of-type(5) {
    grid-area: rs;
  }

  & > :nth-of-type(6) {
    grid-area: te;
  }

  & > :nth-of-type(7) {
    grid-area: ui;
  }
`;

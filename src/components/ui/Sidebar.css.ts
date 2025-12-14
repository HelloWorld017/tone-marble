import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const asideStyle = (theme: Theme) => css`
  position: fixed;
  top: 1.6rem;
  left: 1.6rem;

  background: ${theme.colors.bgBase};
  border-radius: 0.8rem;
  padding: 0.8rem;

  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const asideItemStyle = (isActive: boolean) => (theme: Theme) => css`
  cursor: pointer;

  display: flex;
  justify-content: center;
  align-items: center;

  border-radius: 0.2rem;
  padding: 0.6rem;
  color: ${theme.colors.fillPrimary};
  border: 1px solid ${isActive ? theme.colors.fillLine : 'transparent'};
  background: ${isActive ? theme.colors.bgElevated : theme.colors.bgBase};
  transition:
    background ${theme.easings.default},
    border-color ${theme.easings.default};
  font-size: 2rem;
`;

export const contentsStyle = (theme: Theme) => css`
  position: fixed;
  top: 1.6rem;
  left: 7.6rem;
  width: 30rem;
  max-width: calc(100vw - 9.6rem);

  background: ${theme.colors.bgBase};
  border-radius: 0.8rem;
  padding: 1.2rem;

  display: flex;
  flex-direction: column;
`;

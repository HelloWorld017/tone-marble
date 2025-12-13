import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const titleStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${theme.colors.fillPrimary};
  text-transform: uppercase;
`;

export const rowStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.6rem;
  gap: 1.2rem;
`;

export const rowTitleStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  line-height: 1.4rem;
  color: ${theme.colors.fillPrimary};
`;

export const selectStyle = (theme: Theme) => css`
  position: relative;
  color: ${theme.colors.fillPrimary};
`;

export const selectInputStyle = (theme: Theme) => css`
  appearance: none;
  background: ${theme.colors.bgElevated};
  border: 1px solid ${theme.colors.fillLine};
  border-radius: 0.8rem;
  font-size: 1.2rem;
  padding: 0.6rem 1.2rem;
  padding-right: 4.8rem;
  outline: none;
`;

export const selectDecoratorStyle = css`
  position: absolute;
  width: 1.2rem;
  top: 50%;
  right: 1.2rem;
  transform: translate(0, -50%);
  pointer-events: none;
`;

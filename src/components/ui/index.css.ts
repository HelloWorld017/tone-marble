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

export const contentStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  line-height: 1.6rem;
  color: ${theme.colors.fillSecondary};
`;

export const rowTitleStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  line-height: 1.4rem;
  color: ${theme.colors.fillPrimary};
`;

export const sectionStyle = (theme: Theme) => css`
  margin-top: 1.6rem;
  border-top: 1px solid ${theme.colors.fillLine};
  padding-top: 1.6rem;
`;

export const rangeStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 0;
  padding: 1.2rem 0.4rem;
  margin-right: 0.8rem;
`;

export const rangeTrackStyle = (theme: Theme) => css`
  position: relative;
  width: 100%;
  height: 0.2rem;
  border-radius: 0.2rem;
  background: ${theme.colors.fillLine};

  &::before {
    content: '';
    display: flex;

    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--progress);
    background: ${theme.colors.fillPrimary};
    border-radius: 0.2rem;
  }
`;

export const rangeHandleStyle = (theme: Theme) => css`
  position: absolute;
  display: flex;
  align-items: center;
  top: 0;
  bottom: 0;
  left: 0.4rem;
  right: 0.8rem;

  &::after {
    content: '';
    display: flex;
    position: absolute;
    left: var(--progress);
    transform: translateX(-50%);
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 0.2rem;
    background: ${theme.colors.fillPrimary};
    transform: rotate(45deg);
  }
`;

export const rangeInputStyle = css`
  position: absolute;
  inset: 0;
  appearance: none;
  opacity: 0;
`;

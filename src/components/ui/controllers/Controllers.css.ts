import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const titleStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${theme.colors.fillPrimary};
  text-transform: uppercase;
`;

export const headerStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.6rem;
`;

export const sectionStyle = (theme: Theme) => css`
  margin-top: 1.6rem;
  border-top: 1px solid ${theme.colors.fillLine};
  padding-top: 1.6rem;
`;

export const guideStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const guideContentStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  line-height: 1.6rem;
  color: ${theme.colors.fillSecondary};
`;

export const urlStyle = (theme: Theme) => css`
  display: block;
  margin: 0.4rem 0;
  font-size: 1.4rem;
  border-radius: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: ${theme.colors.bgElevated};
`;

export const rowStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.6rem;
  gap: 1rem;
`;

export const rowTitleStyle = (theme: Theme) => css`
  font-size: 1.2rem;
  line-height: 1.4rem;
  color: ${theme.colors.fillPrimary};
`;

export const statusStyle = (isActive: boolean) => (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.2rem;
  color: ${theme.colors.fillSecondary};

  &::before {
    content: '';
    display: block;
    background: ${isActive ? theme.colors.fillHighlight : theme.colors.fillSecondary};
    width: 0.6rem;
    height: 0.6rem;
    border-radius: 0.3rem;
  }
`;

export const disconnectStyle = (theme: Theme) => css`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.fillSecondary};
  font-size: 1rem;
  padding: 0.4rem;
  margin: -0.4rem;
  margin-right: 0;
  border-radius: 0.2rem;
  background: transparent;
  transition: all ${theme.easings.default};

  &:hover {
    background: ${theme.colors.bgElevated};
  }
`;

export const rangeStyle = css`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 0;
  padding: 1.2rem 0.4rem;
  margin-top: 0.4rem;
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

const WIDTH = 60;
const HEIGHT = 120;
const DEPTH = 10;

export const orientationContainerStyle = (theme: Theme) => css`
  width: 20rem;
  height: 20rem;
  display: flex;
  justify-content: center;
  align-items: center;
  perspective: 1000px;
  margin-top: 2rem;
  background: ${theme.colors.bgElevated};
  border: 1px solid ${theme.colors.fillLine};
  border-radius: 0.8rem;
`;

export const orientationBodyStyle = css`
  position: relative;
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  transform-style: preserve-3d;
  transition: transform 0.1s linear;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const faceStyle = css`
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  backface-visibility: visible;
  transform-origin: center;
`;

export const frontFaceStyle = css`
  ${faceStyle};
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  transform: rotateY(0deg) translateZ(${DEPTH / 2}px);
  background: rgba(255, 255, 255, 0.1);
`;

export const backFaceStyle = css`
  ${faceStyle};
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  transform: rotateY(180deg) translateZ(${DEPTH / 2}px);
`;

export const rightFaceStyle = css`
  ${faceStyle};
  width: ${DEPTH}px;
  height: ${HEIGHT}px;
  transform: rotateY(90deg) translateZ(${WIDTH / 2}px);
`;

export const leftFaceStyle = css`
  ${faceStyle};
  width: ${DEPTH}px;
  height: ${HEIGHT}px;
  transform: rotateY(-90deg) translateZ(${WIDTH / 2}px);
`;

export const topFaceStyle = css`
  ${faceStyle};
  width: ${WIDTH}px;
  height: ${DEPTH}px;
  transform: rotateX(90deg) translateZ(${HEIGHT / 2}px);
`;

export const bottomFaceStyle = css`
  ${faceStyle};
  width: ${WIDTH}px;
  height: ${DEPTH}px;
  transform: rotateX(-90deg) translateZ(${HEIGHT / 2}px);
`;

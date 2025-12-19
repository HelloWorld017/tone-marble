import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const containerStyle = (theme: Theme) => css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  aspect-ratio: 16 / 9;
  background: ${theme.colors.bgBase};
  border-radius: 0.8rem;
  overflow: hidden;
`;

export const videoElementStyle = css`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const playButtonStyle = (isPlaying: boolean) => (theme: Theme) => css`
  cursor: pointer;
  position: absolute;
  width: 8rem;
  height: 8rem;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 3.2rem;
  color: #ffffff;

  border-radius: 20rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(16px);
  opacity: ${+!isPlaying};
  pointer-events: ${!isPlaying ? 'auto' : 'none'};
  transition:
    background ${theme.easings.default},
    opacity ${theme.easings.default};

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

export const overlayStyle = (theme: Theme) => css`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;

  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  padding: 1.2rem 2.4rem;
  opacity: 0;
  transition:
    opacity ${theme.easings.default},
    transform ${theme.easings.default};
  transform: translateY(10px);

  *:hover > & {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const controlRowStyle = css`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  padding-bottom: 0.4rem;
`;

export const iconButtonStyle = (theme: Theme) => css`
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0.8rem;
  margin: 0 -0.4rem;
  background: transparent;
  font-size: 2rem;
  color: #ffffff;
  border-radius: 0.6rem;
  transition: background ${theme.easings.default};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const progressStyle = css`
  display: flex;
  gap: 0.4rem;

  color: #ffffff;
  font-size: 1.2rem;

  & > * {
    opacity: 0.5;

    &:first-of-type {
      opacity: 1;
    }
  }
`;

export const rangeStyle = css`
  position: relative;
  flex: 1 1 0;
  display: flex;
  align-items: center;
  padding: 1.2rem 0.4rem;
  margin-right: 0.8rem;
`;

export const rangeTrackStyle = (theme: Theme) => css`
  position: relative;
  width: 100%;
  height: 0.8rem;
  border-radius: 0.8rem;
  background: ${theme.colors.fillLine};
  overflow: hidden;

  &::before {
    content: '';
    display: flex;

    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--progress);
    background: white;
    border-radius: 0.8rem;
  }
`;

export const rangeInputStyle = css`
  position: absolute;
  inset: 0;
  appearance: none;
  opacity: 0;
`;

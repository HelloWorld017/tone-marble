import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export const rootStyle = css`
  overflow: hidden;

  & + section {
    padding-top: 30px;

    @media (max-width: 768px) {
      padding-top: 20px;
    }
  }
`;

// To prevent items with lower z value being clicked
export const galleryWrapperStyle = css`
  transform-style: preserve-3d;
`;

// The root's section style is applied
export const gallerySectionStyle = css`
  && {
    padding-top: 30px;
    padding-bottom: 1px;
    ${galleryWrapperStyle};

    @media (max-width: 768px) {
      padding-top: 20px;
    }
  }
`;

export const galleryContainerStyle = (theme: Theme) => css`
  ${galleryWrapperStyle};
  border-radius: 1rem;
  border: 1px solid ${theme.colors.fillLine};
  padding: 3rem;
  touch-action: pan-y;

  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

export const galleryStyle = css`
  display: flex;
  transform-style: preserve-3d;
`;

export const buttonStyle = css`
  cursor: pointer;
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 2rem;
  overflow: hidden;
  flex: 0 0 auto;

  & > img {
    width: 100%;
    height: 100%;
  }

  @media (max-width: 768px) {
    border-radius: 1.5rem;
  }
`;

export const buttonPauseStyle = (isActive: boolean) => (theme: Theme) => css`
  position: absolute;
  inset: 0;

  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;

  background: rgba(0, 0, 0, 0.8);
  color: #ffffff;
  opacity: ${+isActive};
  transition: opacity ${theme.easings.default};
`;

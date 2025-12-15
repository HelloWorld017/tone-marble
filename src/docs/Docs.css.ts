import { css } from '@emotion/react';
import PlusPattern from './assets/svgs/plus.svg';
import type { Theme } from '@emotion/react';

/* prettier-ignore */
/* The url must be quoted in double quotes */
export const mainStyle = (theme: Theme) => css`
  background-image: url("${PlusPattern}");
  background-color: ${theme.colors.bgBase};
  background-repeat: repeat;
  min-height: 100vh;
`;

export const contentStyle = (theme: Theme) => css`
  font-size: 2rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }

  section {
    max-width: 900px;
    margin: 0 auto;
    padding: 0 32px;
    padding-top: 150px;

    @media (max-width: 768px) {
      padding: 0 16px;
      padding-top: 150px;
    }
  }

  a {
    color: ${theme.colors.fillHighlight};
  }

  a.cta {
    display: inline-flex;
    margin-top: 3rem;
    padding: 1rem 2rem;
    font-size: 2rem;
    background: ${theme.colors.fillTertiary};
    color: ${theme.colors.bgBase};

    &.secondary {
      margin-top: 2rem;
      background: transparent;
      border: 4px solid ${theme.colors.fillTertiary};
      color: ${theme.colors.fillTertiary};
      font-weight: 600;
    }

    &::after {
      display: inline-block;
      content: '→';
      margin-left: 0.5rem;
      transition: transform ${theme.easings.default};
    }

    &:hover::after {
      transform: translate(0.5rem);
    }
  }

  p {
    margin: 2rem 0;
  }

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 10rem;
    line-height: 12rem;
    font-weight: 600;
    color: ${theme.colors.fillPrimary};

    & > span {
      display: block;
      margin-top: 1rem;
      font-size: 5rem;
      line-height: 6rem;
      font-weight: 400;
      color: ${theme.colors.fillSecondary};
    }
  }

  h2 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 5rem;
    line-height: 6rem;
    font-weight: 600;
    color: ${theme.colors.fillPrimary};

    & > i {
      display: block;
      font-size: 8rem;
      line-height: 10rem;
      font-weight: 400;
      color: ${theme.colors.fillSecondary};
    }

    & > span {
      display: block;
      margin-top: 1rem;
      font-size: 3rem;
      line-height: 3.4rem;
      font-weight: 400;
      color: ${theme.colors.fillSecondary};
    }
  }

  h3,
  h4 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 3rem;
    line-height: 3.6rem;
    font-weight: 600;
    margin-top: 3.6rem;
    color: ${theme.colors.fillPrimary};
  }

  h4 {
    font-size: 2.4rem;
    line-height: 3rem;
  }

  strong,
  b {
    font-weight: 600;
  }

  ul,
  ol {
    margin-left: 2rem;
  }

  code {
    padding: 0.2rem 0.7rem;
    border-radius: 0.4rem;
    background: ${theme.colors.bgElevated};
    color: ${theme.colors.fillSecondary};
  }

  mark {
    padding: 0.2rem 0.7rem;
    margin: 0 0.8rem;
    border-radius: 0.4rem;
    border: 2px solid ${theme.colors.fillHighlight};
    color: ${theme.colors.fillHighlight};
  }

  blockquote {
    margin-top: 2rem;
    padding: 0.4rem 2.4rem;
    background: ${theme.colors.bgElevated};
    border-left: 4px solid ${theme.colors.fillPrimary};
  }

  .main-image {
    margin-top: 20px;
    width: 100%;
    max-width: unset;
    margin-right: 0;
    padding: 0;
  }

  .twocols {
    display: flex;
    gap: 2rem;

    & > div {
      flex: 1 1 0;
    }

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }
`;

import { css } from '@emotion/react';
import type { Theme } from '@emotion/react';

export {
  titleStyle,
  rowStyle,
  rowTitleStyle,
  rangeStyle,
  rangeTrackStyle,
  rangeInputStyle,
  rangeHandleStyle,
  sectionStyle,
} from '../index.css';

export const buttonStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  width: 100%;
  padding: 0.6rem 1.2rem;
  border: 1px solid ${theme.colors.fillLine};
  border-radius: 0.8rem;
  background: ${theme.colors.bgElevated};

  font-size: 1.2rem;
  color: ${theme.colors.fillPrimary};
  transition: all ${theme.easings.default};

  &:hover {
    background: rgb(from ${theme.colors.bgElevated} r g b / 0.8);
    border-color: rgb(from ${theme.colors.fillLine} r g b / 0.05);
  }
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

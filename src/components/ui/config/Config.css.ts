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
} from '../index.css';

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

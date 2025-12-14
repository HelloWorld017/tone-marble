import { useRef } from 'react';
import { IconChevronDown } from '@/assets/icons/lucide';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import * as styles from './Config.css';
import type { PitchModelKind } from '@/utils/pitchDetector';

export const Config = () => {
  const pitchModelKind = useInterfaceState(state => state.pitchModelKind);
  const setPitchModelKind = useInterfaceState(state => state.setPitchModelKind);

  const additionalGain = useInterfaceState(state => state.additionalGain);
  const setAdditionalGain = useInterfaceState(state => state.setAdditionalGain);
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <h2 css={styles.titleStyle}>Config</h2>
      <div css={styles.rowStyle}>
        <span css={styles.rowTitleStyle}>Chroma Estimator</span>
        <div css={styles.selectStyle}>
          <select
            css={styles.selectInputStyle}
            value={pitchModelKind}
            onChange={e => setPitchModelKind(e.target.value as PitchModelKind | 'fft')}
          >
            <option value={'crepe' satisfies PitchModelKind}>Crepe</option>
            <option value={'spice' satisfies PitchModelKind}>Spice</option>
            <option value="fft">FFT</option>
          </select>
          <IconChevronDown css={styles.selectDecoratorStyle} />
        </div>
      </div>
      <div css={styles.rowStyle}>
        <span css={styles.rowTitleStyle}>Additional Gain</span>
        <label
          css={styles.rangeStyle}
          ref={labelRef}
          style={{ '--progress': `${(additionalGain - 1) * 50}%` }}
        >
          <span css={styles.rangeTrackStyle} />
          <span css={styles.rangeHandleStyle} />
          <input
            ref={inputRef}
            css={styles.rangeInputStyle}
            value={(additionalGain - 1) * 50}
            type="range"
            min={0}
            max={100}
            onChange={e => setAdditionalGain(1 + e.currentTarget.valueAsNumber / 50)}
          />
        </label>
      </div>
    </>
  );
};

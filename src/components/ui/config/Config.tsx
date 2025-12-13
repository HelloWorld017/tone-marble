import { IconChevronDown } from '@/assets/icons/lucide';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import * as styles from './Config.css';
import type { PitchModelKind } from '@/utils/pitchDetector';

export const Config = () => {
  const pitchModelKind = useInterfaceState(state => state.pitchModelKind);
  const setPitchModelKind = useInterfaceState(state => state.setPitchModelKind);
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
    </>
  );
};

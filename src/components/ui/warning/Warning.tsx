import * as styles from './Warning.css';

export const Warning = () => (
  <>
    <h2 css={styles.titleStyle}>Warning</h2>
    <br />
    <div css={styles.contentStyle}>
      The TM-07 is turned off. <br />
      You can use the blue side button to turn it on.
    </div>
  </>
);

import { useLayoutEffect, useRef, useState } from 'react';
import { IconLinkOff } from '@/assets/icons/lucide';
import { useController } from '@/components/providers/ControllerProvider';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import * as styles from './Controllers.css';

const FlowRateControl = () => {
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const readFlowRate = useController(state => state.readFlowRate);
  const updateFlowRate = useController(state => state.updateFlowRate);

  useAnimationFrame(() => {
    if (!labelRef.current || !inputRef.current) {
      return;
    }

    const value = Math.round(readFlowRate() * 100);
    labelRef.current.style.setProperty('--progress', `${value}%`);
    inputRef.current.valueAsNumber = value;
  });

  return (
    <div css={styles.sectionStyle}>
      <span css={styles.rowTitleStyle}>Flowrate</span>
      <label css={styles.rangeStyle} ref={labelRef}>
        <span css={styles.rangeTrackStyle} />
        <span css={styles.rangeHandleStyle} />
        <input
          ref={inputRef}
          css={styles.rangeInputStyle}
          type="range"
          min={0}
          max={100}
          onChange={e => updateFlowRate(e.currentTarget.valueAsNumber / 100)}
        />
      </label>
    </div>
  );
};

const DeviceConnected = () => {
  const orientationBodyRef = useRef<HTMLDivElement | null>(null);
  const orientationRef = useController(state => state.orientationRef);
  const disconnect = useController(state => state.disconnect);
  useAnimationFrame(() => {
    if (!orientationBodyRef.current) {
      return;
    }

    const [alpha, beta, gamma] = orientationRef.current;
    orientationBodyRef.current.style.transform = `rotateZ(${alpha}deg) rotateX(${beta}deg) rotateY(${-gamma}deg)`;
  });

  return (
    <div>
      <div css={styles.headerStyle}>
        <div css={styles.statusStyle(true)}>Connected</div>
        <button css={styles.disconnectStyle} onClick={disconnect} type="button">
          <IconLinkOff />
        </button>
      </div>
      <FlowRateControl />
      <div css={styles.orientationContainerStyle}>
        <div css={styles.orientationBodyStyle} ref={orientationBodyRef}>
          <div css={styles.frontFaceStyle} />
          <div css={styles.backFaceStyle} />
          <div css={styles.leftFaceStyle} />
          <div css={styles.rightFaceStyle} />
          <div css={styles.topFaceStyle} />
          <div css={styles.bottomFaceStyle} />
        </div>
      </div>
    </div>
  );
};

const NoDeviceConnected = () => {
  const deviceId = useController(state => state.selfId);
  const [url, setURL] = useState<string | null>();
  useLayoutEffect(() => setURL(new URL(`./connect/?${deviceId}`, location.href).href), [deviceId]);

  return (
    <div>
      <div css={styles.headerStyle}>
        <div css={styles.statusStyle(false)}>Disconnected</div>
      </div>
      <FlowRateControl />
      <div css={styles.sectionStyle}>
        <div css={styles.guideStyle}>
          <div css={styles.rowTitleStyle}>Connection Guide</div>
          <div css={styles.guideContentStyle}>
            Open your phone, then navigate to following link.
            <code css={styles.urlStyle}>{url}</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Controllers = () => {
  const device = useController(state => state.device);
  return (
    <>
      <h2 css={styles.titleStyle}>Controllers</h2>
      {device ? <DeviceConnected /> : <NoDeviceConnected />}
    </>
  );
};

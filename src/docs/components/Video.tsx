import { animated, useSpringValue } from '@react-spring/web';
import { throttle } from 'es-toolkit';
import { useState, useRef, useMemo } from 'react';
import { IconPause, IconPlay, IconVolume2, IconVolumeX } from '@/assets/icons/lucide';
import { useLatestRef } from '@/hooks/useLatestRef';
import * as styles from './Video.css';
import type { AnimatedSimple } from '@/types/AnimatedSimple';

const a = animated as unknown as AnimatedSimple;
export const Video = ({ src, thumbnail }: { src: string; thumbnail: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const [duration, setDuration] = useState(0);
  const durationRef = useLatestRef(duration);

  const [progress, setProgress] = useState(0);
  const progressSpring = useSpringValue(0);
  const setProgressThrottled = useMemo(
    () =>
      throttle((value: number) => {
        setProgress(value);
        void progressSpring.start((value / durationRef.current) * 100);
      }, 150),
    []
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onPlayPause = (nextIsPlaying: boolean) => {
    void videoRef.current?.[nextIsPlaying ? 'play' : 'pause']();
  };

  const onSliderChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setProgressThrottled(value);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const hours = Math.floor(timestamp / 3600)
      .toFixed()
      .padStart(2, '0');

    const minutes = Math.floor((timestamp % 3600) / 60)
      .toFixed()
      .padStart(2, '0');

    const seconds = Math.floor(timestamp % 60)
      .toFixed()
      .padStart(2, '0');

    return `${hours !== '00' ? `${hours}:` : ''}${minutes}:${seconds}`;
  };

  return (
    <div css={styles.containerStyle}>
      <video
        ref={videoRef}
        css={styles.videoElementStyle}
        poster={thumbnail}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
        onTimeUpdate={() => videoRef.current && setProgressThrottled(videoRef.current.currentTime)}
        onClick={() => onPlayPause(!isPlaying)}
        muted={isMuted}
      >
        <source src={src} type="video/mp4" />
      </video>

      <button css={styles.playButtonStyle(isPlaying)} onClick={() => onPlayPause(true)}>
        <IconPlay fill="currentColor" />
      </button>

      <div css={styles.overlayStyle}>
        <div css={styles.controlRowStyle}>
          <button css={styles.iconButtonStyle} onClick={() => onPlayPause(!isPlaying)}>
            {isPlaying ? <IconPause strokeWidth={1.5} /> : <IconPlay strokeWidth={1.5} />}
          </button>

          <span css={styles.progressStyle}>
            <span>{formatTimestamp(progress)}</span>
            <span>/</span>
            <span>{formatTimestamp(duration)}</span>
          </span>

          <a.label
            css={styles.rangeStyle}
            ref={labelRef}
            style={{ '--progress': progressSpring.to(value => `${value}%`) }}
          >
            <span css={styles.rangeTrackStyle} />
            <input
              ref={inputRef}
              css={styles.rangeInputStyle}
              value={progress}
              type="range"
              min={0}
              max={duration}
              onChange={e => onSliderChange(e.currentTarget.valueAsNumber)}
            />
          </a.label>

          <button css={styles.iconButtonStyle} onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <IconVolumeX strokeWidth={1.5} /> : <IconVolume2 strokeWidth={1.5} />}
          </button>
        </div>
      </div>
    </div>
  );
};

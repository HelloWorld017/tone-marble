import { throttle } from 'es-toolkit';
import { Play, Pause } from 'lucide-react';
import { useState, useRef, useMemo, useEffect } from 'react';
import { IconPause, IconPlay } from '@/assets/icons/lucide';
import * as styles from './Video.css';

export const Video = ({ src, thumbnail }: { src: string; thumbnail: string }) => {
  const [isInitial, setIsInitial] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const setProgressThrottled = useMemo(() => throttle(setProgress, 150), []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isPlaying) {
      setIsInitial(false);
    }
  }, [isPlaying]);

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
      >
        <source src={src} type="video/mp4" />
      </video>

      <button css={styles.playButtonStyle(isPlaying)} onClick={() => onPlayPause(true)}>
        <IconPlay fill="currentColor" />
      </button>

      <div css={styles.overlayStyle(isInitial)}>
        <div css={styles.controlRowStyle}>
          <button css={styles.iconButtonStyle} onClick={() => onPlayPause(!isPlaying)}>
            {isPlaying ? <IconPause strokeWidth={1.5} /> : <IconPlay strokeWidth={1.5} />}
          </button>

          <span css={styles.progressStyle}>
            <span>{formatTimestamp(progress)}</span>
            <span>{formatTimestamp(duration)}</span>
          </span>

          <label
            css={styles.rangeStyle}
            ref={labelRef}
            style={{ '--progress': `${(progress / duration) * 100}%` }}
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
          </label>
        </div>
      </div>
    </div>
  );
};

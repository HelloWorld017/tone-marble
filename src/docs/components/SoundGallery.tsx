import { animated } from '@react-spring/web';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useAudioContext,
  useInitializeAudioContext,
} from '@/components/audio/AudioContextProvider';
import { useSynthesize } from '@/components/audio/SynthesizeProvider';
import { useSynthesizeMarbleSound } from '@/components/audio/hooks/useSynthesizeMarbleSound';
import { useSynthesizeSFXSound } from '@/components/audio/hooks/useSynthesizeSFXSound';
import { useSynthesizeSoundscapeSound } from '@/components/audio/hooks/useSynthesizeSoundscapeSound';
import { chromaToPitch } from '@/components/audio/utils/chromaToPitch';
import { getRandomHarmonicPitch } from '@/components/audio/utils/getRandomHarmonicPitch';
import { cltRandom } from '@/utils/random';
import CoverButtons from '../assets/images/cover-buttons.png';
import CoverGlass from '../assets/images/cover-glass.png';
import CoverLoFi from '../assets/images/cover-lofi.png';
import CoverPowerOff from '../assets/images/cover-power-off.png';
import CoverPowerOn from '../assets/images/cover-power-on.png';
import CoverRhythm from '../assets/images/cover-rhythm.png';
import CoverSand from '../assets/images/cover-sand.png';
import CoverWind from '../assets/images/cover-wind.png';
import * as styles from './SoundGallery.css';
import { usePiledScroll } from './hooks/usePiledScroll';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { Position } from '@/types/Position';

type SoundKind =
  | 'glass'
  | 'sand'
  | 'wind'
  | 'power-on'
  | 'power-off'
  | 'buttons'
  | 'lofi'
  | 'rhythm';

const CROSSFADE_DURATION = 0.1;

const a = animated as unknown as AnimatedSimple;

export const SoundGallery = () => {
  const ctx = useAudioContext();
  const masterOut = useSynthesize(state => state.masterOut);

  const [playingSound, setPlaingSound] = useState<SoundKind | null>(null);
  const synthMarble = useSynthesizeMarbleSound();
  const { loFiOut, rhythmOut, ...synthSoundscape } = useSynthesizeSoundscapeSound();
  const synthSFX = useSynthesizeSFXSound();

  useEffect(() => {
    const currentSynth = (() => {
      if (playingSound === 'glass') {
        return synthMarble.synthesizeGlass;
      }

      if (playingSound === 'wind') {
        return synthMarble.synthesizeWind;
      }

      if (playingSound === 'sand') {
        return synthMarble.synthesizeSand;
      }

      return null;
    })();

    if (currentSynth === null) {
      return () => {};
    }

    let currentChroma = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let chromaTimeoutId: ReturnType<typeof setTimeout> | null = null;
    const onPlaySound = () => {
      const frequency = getRandomHarmonicPitch(chromaToPitch(currentChroma));
      const position: Position = [Math.random() * 10 - 5, Math.random(), Math.random() * 5 - 5];
      const gain = Math.random();
      currentSynth({ position, frequency, gain });
      timeoutId = setTimeout(onPlaySound, cltRandom() * 50 + 100);
    };

    const onChangeChroma = () => {
      currentChroma = Math.floor(Math.random() * 12);
      chromaTimeoutId = setTimeout(onChangeChroma, 2000);
    };

    onChangeChroma();
    onPlaySound();

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      if (chromaTimeoutId !== null) {
        clearTimeout(chromaTimeoutId);
      }
    };
  }, [playingSound]);

  useEffect(() => {
    if (!ctx || !masterOut) {
      return () => {};
    }

    if (playingSound === 'power-on') {
      const stopTimeout = setTimeout(() => setPlaingSound(null), 5000);
      const powerOnGain = ctx.createGain();
      powerOnGain.connect(masterOut);
      synthSFX.synthesizePowerOn({ destination: powerOnGain });
      return () => {
        clearTimeout(stopTimeout);
        powerOnGain.gain.linearRampToValueAtTime(0, ctx.currentTime + CROSSFADE_DURATION);
        setTimeout(() => powerOnGain.disconnect(), CROSSFADE_DURATION * 1000);
      };
    }

    if (playingSound === 'power-off') {
      const stopTimeout = setTimeout(() => setPlaingSound(null), 5000);
      const powerOffGain = ctx.createGain();
      powerOffGain.connect(masterOut);
      synthSFX.synthesizePowerOff({ destination: powerOffGain });
      return () => {
        clearTimeout(stopTimeout);
        powerOffGain.gain.linearRampToValueAtTime(0, ctx.currentTime + CROSSFADE_DURATION);
        setTimeout(() => powerOffGain.disconnect(), CROSSFADE_DURATION * 1000);
      };
    }

    if (playingSound === 'buttons') {
      const stopTimeout = setTimeout(() => setPlaingSound(null), 1500);

      const t = ctx.currentTime;
      const buttonGain = ctx.createGain();
      buttonGain.connect(masterOut);
      synthSFX.synthesizeTick({ destination: buttonGain, startTime: t });
      synthSFX.synthesizeTock({ destination: buttonGain, startTime: t + 0.15 });
      synthSFX.synthesizeTick({ destination: buttonGain, startTime: t + 1 });
      synthSFX.synthesizeTock({ destination: buttonGain, startTime: t + 1.3 });
      return () => {
        clearTimeout(stopTimeout);
        buttonGain.disconnect();
      };
    }

    return () => {};
  }, [playingSound, ctx, masterOut]);

  useEffect(() => {
    if (!ctx) {
      return () => {};
    }

    if (loFiOut && playingSound === 'lofi') {
      loFiOut.gain.linearRampToValueAtTime(1, ctx.currentTime + CROSSFADE_DURATION);

      return () => {
        loFiOut.gain.linearRampToValueAtTime(0, ctx.currentTime + CROSSFADE_DURATION);
      };
    }

    if (rhythmOut && playingSound === 'rhythm') {
      const intervalId = setInterval(() => synthSoundscape.synthesizeRhythm(), 166);
      rhythmOut.gain.linearRampToValueAtTime(0.3, ctx.currentTime + CROSSFADE_DURATION);

      return () => {
        clearInterval(intervalId);
        rhythmOut.gain.linearRampToValueAtTime(0, ctx.currentTime + CROSSFADE_DURATION);
      };
    }

    return () => {};
  }, [playingSound, loFiOut, rhythmOut]);

  const initialize = useInitializeAudioContext();
  const toggleSound = useCallback(
    (sound: SoundKind) => () => {
      if (!ctx) {
        initialize();
      }

      setPlaingSound(prevSound => (prevSound === sound ? null : sound));
    },
    [initialize]
  );

  const items = useMemo(
    (): { kind: SoundKind; cover: string }[] => [
      { kind: 'glass', cover: CoverGlass },
      { kind: 'sand', cover: CoverSand },
      { kind: 'wind', cover: CoverWind },
      { kind: 'lofi', cover: CoverLoFi },
      { kind: 'rhythm', cover: CoverRhythm },
      { kind: 'power-on', cover: CoverPowerOn },
      { kind: 'power-off', cover: CoverPowerOff },
      { kind: 'buttons', cover: CoverButtons },
    ],
    [toggleSound]
  );

  const { containerRef, getStyle } = usePiledScroll({
    itemCount: items.length,
    itemWidth: 200,
    gap: 5,
  });

  return (
    <div css={styles.preventOverflowStyle}>
      <section>
        <div css={styles.galleryStyle} ref={containerRef}>
          {items.map(({ kind, cover }, index) => (
            <a.button key={kind} style={getStyle(index)} onClick={toggleSound(kind)} type="button">
              <img
                src={cover}
                alt={kind.replace(/(?:^|-)([a-z])/g, (_, c: string) => c.toUpperCase())}
              />
            </a.button>
          ))}
        </div>
      </section>
    </div>
  );
};

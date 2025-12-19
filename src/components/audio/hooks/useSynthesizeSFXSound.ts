import { useMemo } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { useAudioContext } from '../AudioContextProvider';
import { useSynthesize } from '../SynthesizeProvider';
import { createPinkNoiseBuffer } from '../utils/createPinkNoiseBuffer';
import { createReverbEffect } from '../utils/createReverbEffect';
import { createWhiteNoiseBuffer } from '../utils/createWhiteNoiseBuffer';
import { updatePannerForPosition } from '../utils/updatePannerForPosition';
import type { Position } from '@/types/Position';

const OFF_BASE_FREQUENCY = 345;

type SynthOpts = {
  startTime?: number;
  destination?: AudioNode;
};

type SynthButtonOpts = SynthOpts & {
  position?: Position;
  gain?: number;
};

export const useSynthesizeSFXSound = () => {
  const ctx = useAudioContext();
  const whiteNoise = useMemo(() => ctx && createWhiteNoiseBuffer(ctx, 3), [ctx]);
  const pinkNoise = useMemo(() => ctx && createPinkNoiseBuffer(ctx, 3), [ctx]);
  const masterOut = useSynthesize(state => state.masterOut);

  const synthesizeButton = useLatestCallback((frequency: number, opts: SynthButtonOpts = {}) => {
    const destination = opts.destination ?? masterOut;

    if (!ctx || !destination) {
      return;
    }

    const t = opts.startTime ?? ctx.currentTime + 0.05;

    const synthOut = ctx.createDynamicsCompressor();
    synthOut.attack.value = 0.005;
    synthOut.release.value = 0.3;
    synthOut.threshold.value = -10;
    synthOut.ratio.value = 12;

    const synthGain = ctx.createGain();
    synthGain.gain.value = opts.gain ?? 1;

    let panner: PannerNode | null = null;
    if (opts.position) {
      panner = ctx.createPanner();
      panner.rolloffFactor = 0.05;
      updatePannerForPosition(panner, opts.position);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = pinkNoise;
    noise.loop = true;

    const oscLow = ctx.createOscillator();
    oscLow.type = 'sawtooth';
    oscLow.frequency.value = frequency / 6.27;
    oscLow.frequency.setValueAtTime(frequency / 6.27, t);
    oscLow.frequency.exponentialRampToValueAtTime(frequency / 13.98, t + 0.03);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = frequency;
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.exponentialRampToValueAtTime(frequency / 2, t + 0.03);

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0;
    oscGain.gain.setValueAtTime(0, t);
    oscGain.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    noiseFilter.frequency.exponentialRampToValueAtTime(500, t + 0.03);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.7, t + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

    osc.connect(oscGain);
    oscLow.connect(oscGain);
    oscGain.connect(synthOut);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(synthOut);
    synthOut.connect(synthGain);
    synthGain.connect(panner ?? destination);
    panner?.connect(destination);

    noise.start(t);
    noise.stop(t + 0.05);
    oscLow.start(t);
    oscLow.stop(t + 0.05);
    osc.start(t);
    osc.stop(t + 0.05);
    osc.onended = () => {
      osc.disconnect();
      oscLow.disconnect();
      oscGain.disconnect();
      noise.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      synthOut.disconnect();
      synthGain.disconnect();
      panner?.disconnect();
    };
  });

  const synthesizeTick = useLatestCallback((opts?: SynthButtonOpts) => synthesizeButton(500, opts));
  const synthesizeTock = useLatestCallback((opts?: SynthButtonOpts) => synthesizeButton(200, opts));

  const synthesizePowerOff = useLatestCallback((opts: SynthOpts = {}) => {
    const destination = opts.destination ?? masterOut;

    if (!ctx || !destination) {
      return;
    }

    const t = opts.startTime ?? ctx.currentTime;

    const oscOut = ctx.createGain();
    oscOut.gain.value = 0.05;

    const sfxOut = ctx.createGain();
    sfxOut.gain.value = 0.6;

    const delay = ctx.createDelay();
    delay.delayTime.value = 0.1;

    const feedback = ctx.createGain();
    feedback.gain.value = 0.4;
    feedback.gain.setValueAtTime(0.4, t + 0.9);
    feedback.gain.linearRampToValueAtTime(0, t + 3);

    sfxOut.connect(destination);
    oscOut.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(destination);

    [0.5, 1.0, 2.0, 2.3, 3.1, 4.2].forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(OFF_BASE_FREQUENCY * ratio * (0.99 - Math.random() * 0.005), t);
      osc.frequency.linearRampToValueAtTime(OFF_BASE_FREQUENCY * ratio - Math.random(), t + 1);
      osc.frequency.linearRampToValueAtTime(OFF_BASE_FREQUENCY * ratio * 0.2, t + 3);

      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, t + ratio * 0.05);
      gain.gain.linearRampToValueAtTime(0.6 / (1 + Math.abs(1 - i)), t + 1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3);
      gain.gain.linearRampToValueAtTime(0, t + 3.1);

      osc.connect(gain);
      gain.connect(oscOut);
      osc.start(t);
      osc.stop(t + 3);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });

    synthesizeTick({ destination: sfxOut, startTime: t + 1.0 });
    synthesizeTock({ destination: sfxOut, startTime: t + 1.1 });
    synthesizeTick({ destination: sfxOut, startTime: t + 2 });

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noiseGain.gain.setValueAtTime(0, t + 0.3);
    noiseGain.gain.linearRampToValueAtTime(0.5, t + 1.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 3);
    noiseGain.gain.linearRampToValueAtTime(0, t + 3.1);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.value = 20;
    noiseFilter.frequency.value = OFF_BASE_FREQUENCY * 20;
    noiseFilter.frequency.linearRampToValueAtTime(OFF_BASE_FREQUENCY * 20.2, t + 1);

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = whiteNoise;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(oscOut);

    noiseSource.start(t + 0.3);
    noiseSource.stop(t + 3.1);
    noiseSource.onended = () => {
      oscOut.disconnect();
      feedback.disconnect();
      delay.disconnect();
      noiseSource.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
      sfxOut.disconnect();
    };
  });

  const synthesizePowerOnChords = useLatestCallback((opts: SynthOpts = {}) => {
    const destination = opts.destination ?? masterOut;

    if (!ctx || !destination) {
      return;
    }

    const t = opts.startTime ?? ctx.currentTime;

    const oscOut = ctx.createGain();
    oscOut.gain.setValueAtTime(1, t);
    oscOut.gain.exponentialRampToValueAtTime(0.001, t + 5);

    const sweep = ctx.createBiquadFilter();
    sweep.type = 'lowpass';
    sweep.frequency.value = 10;
    sweep.frequency.exponentialRampToValueAtTime(3000, t + 2);

    oscOut.connect(sweep);
    sweep.connect(destination);

    [111, 222, 332.61, 443.98, 559.39, 665.24, 880].map((frequency, index, { length }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = frequency;
      osc.detune.value = (Math.random() - 0.5) * 10;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 1;
      filter.frequency.setValueAtTime(2000, t);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.5);

      const envelope = ctx.createGain();
      envelope.gain.setValueAtTime(0, t);
      envelope.gain.linearRampToValueAtTime(0.9, t + 1.5);
      envelope.gain.linearRampToValueAtTime(0.001, t + 5);

      const panner = ctx.createStereoPanner();
      panner.pan.value = (index % 2 === 0 ? -1 : 1) * (index / length) * 0.5;

      osc.connect(filter);
      filter.connect(envelope);
      envelope.connect(panner);
      panner.connect(oscOut);

      osc.start(t);
      osc.stop(t + 5);
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        envelope.disconnect();
        panner.disconnect();

        if (index === 0) {
          oscOut.disconnect();
          sweep.disconnect();
        }
      };
    });
  });

  const synthesizePowerOn: (opts?: SynthOpts) => void = useLatestCallback(
    async (opts: SynthOpts = {}) => {
      const destination = opts.destination ?? masterOut;

      if (!ctx || !destination) {
        return setTimeout(() => synthesizePowerOn(opts), 50);
      }

      const {
        reverbIn,
        reverbOut,
        disconnect: disconnectReverb,
      } = await createReverbEffect(ctx, { reverbTime: 0.1 });

      const output = ctx.createGain();
      output.connect(reverbIn);
      reverbOut.connect(destination);

      const t = opts.startTime ?? ctx.currentTime;
      synthesizeTick({ destination: output, startTime: t });
      synthesizeTock({ destination: output, startTime: t + 0.15 });
      synthesizeTick({ destination: output, startTime: t + 0.3 });

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0;
      noiseGain.gain.setValueAtTime(0, t + 0.2);
      noiseGain.gain.linearRampToValueAtTime(1, t + 1.7);
      noiseGain.gain.setValueAtTime(1, t + 2);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
      noiseGain.gain.linearRampToValueAtTime(0, t + 2.41);

      const noise = ctx.createBufferSource();
      noise.buffer = pinkNoise;

      const lpf = ctx.createBiquadFilter();
      lpf.type = 'lowpass';
      lpf.Q.value = 30;
      lpf.frequency.setValueAtTime(20, t);
      lpf.frequency.linearRampToValueAtTime(150, t + 2.5);

      const bpf = ctx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.Q.value = 50;
      bpf.frequency.setValueAtTime(2000, t);
      bpf.frequency.linearRampToValueAtTime(2500, t + 2.5);

      const bpfGain = ctx.createGain();
      bpfGain.gain.value = 0;
      bpfGain.gain.setValueAtTime(0.2, t);
      bpfGain.gain.exponentialRampToValueAtTime(0.8, t + 2.5);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2000, t);
      osc.frequency.linearRampToValueAtTime(2500, t + 2.5);

      const oscGain = ctx.createGain();
      oscGain.gain.value = 0;
      oscGain.gain.setValueAtTime(0, t + 0.2);
      oscGain.gain.linearRampToValueAtTime(0.01, t + 2);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
      oscGain.gain.linearRampToValueAtTime(0, t + 2.41);

      osc.connect(oscGain);
      oscGain.connect(output);
      noise.connect(noiseGain);
      noiseGain.connect(lpf);
      noiseGain.connect(bpf);
      lpf.connect(output);
      bpf.connect(bpfGain);
      bpfGain.connect(output);

      noise.start(t + 0.2);
      noise.stop(t + 2.5);
      osc.start(t + 0.2);
      osc.stop(t + 2.5);
      osc.onended = () => {
        disconnectReverb();
        osc.disconnect();
        oscGain.disconnect();
        noise.disconnect();
        noiseGain.disconnect();
        lpf.disconnect();
        bpf.disconnect();
        bpfGain.disconnect();
        output.disconnect();
      };

      synthesizePowerOnChords({ ...opts, startTime: t + 2.3 });
    }
  );

  return {
    synthesizeTick,
    synthesizeTock,
    synthesizePowerOn,
    synthesizePowerOff,
  };
};

import toggleTick from '@/assets/audio/toggle-tick.mp3?url';
import toggleTock from '@/assets/audio/toggle-tock.mp3?url';
import { createWhiteNoiseBuffer } from '@/components/audio/utils/createWhiteNoiseBuffer';

declare global {
  interface Window {
    synth: () => void;
  }
}

const BASE_FREQUENCY = 456;

let ctx: AudioContext;

window.synth = async () => {
  ctx = ctx ?? new AudioContext();

  const fetchAudio = async (url: string) => {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
  };

  const tickSound = await fetchAudio(toggleTick);
  const tockSound = await fetchAudio(toggleTock);

  const t = ctx.currentTime;

  const master = ctx.createGain();
  master.gain.value = 0.2;

  const delay = ctx.createDelay();
  delay.delayTime.value = 0.1;

  const feedback = ctx.createGain();
  feedback.gain.value = 0.4;
  feedback.gain.linearRampToValueAtTime(0.4, t + 1.4);
  feedback.gain.linearRampToValueAtTime(0, t + 3);

  master.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(ctx.destination);

  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0;
  noiseGain.gain.setValueAtTime(0, t + 0.3);
  noiseGain.gain.linearRampToValueAtTime(0.5, t + 1.1);
  noiseGain.gain.setValueAtTime(0.5, t + 1.6);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 3);
  noiseGain.gain.linearRampToValueAtTime(0, t + 3.1);
  noiseGain.connect(master);

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = BASE_FREQUENCY * 20;
  noiseFilter.frequency.linearRampToValueAtTime(BASE_FREQUENCY * 20.2, t + 1.5);
  noiseFilter.Q.value = 20;
  noiseFilter.connect(noiseGain);

  const noise = ctx.createBufferSource();
  noise.buffer = createWhiteNoiseBuffer(ctx, 3);
  noise.connect(noiseFilter);
  noise.start(t + 0.3);
  noise.stop(t + 3.1);

  const sfx = ctx.createGain();
  sfx.gain.value = 0.6;
  sfx.connect(ctx.destination);

  const tick = ctx.createBufferSource();
  tick.buffer = tickSound;
  tick.connect(sfx);
  tick.start(t + 1.5);

  const tock = ctx.createBufferSource();
  tock.buffer = tockSound;
  tock.connect(sfx);
  tock.start(t + 1.6);

  const tick2 = ctx.createBufferSource();
  tick2.buffer = tickSound;
  tick2.connect(sfx);
  tick2.start(t + 2.0);

  [0.5, 1.0, 1.0, 2.0, 2.0, 2.5, 3.0, 4.2, 5.0, 5.8, 8.0].forEach((ratio, index) => {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, t + ratio * 0.05);
    gain.gain.linearRampToValueAtTime(1 / (1 + Math.abs(1 - index)), t + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3);
    gain.gain.linearRampToValueAtTime(0, t + 3.1);
    gain.connect(master);

    ratio *= 1 + Math.random() * 0.002 - 0.001;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(BASE_FREQUENCY * ratio * (0.99 - Math.random() * 0.005), t);
    osc.frequency.linearRampToValueAtTime(BASE_FREQUENCY * ratio - Math.random(), t + 1.5);
    osc.frequency.linearRampToValueAtTime(BASE_FREQUENCY * ratio * 0.2, t + 3);
    osc.connect(gain);
    osc.start();
  });
};

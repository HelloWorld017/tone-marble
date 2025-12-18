import { createPinkNoiseBuffer } from '@/components/audio/utils/createPinkNoiseBuffer';
import { createReverbEffect } from '@/components/audio/utils/createReverbEffect';

declare global {
  interface Window {
    synth?(): void;
    synthClick?(): void;
  }
}

window.synth = async () => {
  const ctx = new AudioContext();

  const {
    reverbIn,
    reverbOut,
    disconnect: disconnectReverb,
  } = await createReverbEffect(ctx, { reverbTime: 0.1 });

  const output = ctx.createGain();
  output.connect(reverbIn);
  reverbOut.connect(ctx.destination);

  const t = ctx.currentTime;

  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0;
  noiseGain.gain.setValueAtTime(0, t + 0.2);
  noiseGain.gain.linearRampToValueAtTime(1, t + 1.7);
  noiseGain.gain.setValueAtTime(1, t + 2);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 2.4);
  noiseGain.gain.linearRampToValueAtTime(0, t + 2.41);

  const noise = ctx.createBufferSource();
  noise.buffer = createPinkNoiseBuffer(ctx, 3);

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

  const chimeOsc = ctx.createOscillator();
  chimeOsc.type = 'sine';
  chimeOsc.frequency.value = 2500;

  const chimeGain = ctx.createGain();
  chimeGain.gain.value = 0;
  chimeGain.gain.setValueAtTime(0, t + 2.09);
  chimeGain.gain.exponentialRampToValueAtTime(1, t + 2.1);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 2.49);
  chimeGain.gain.linearRampToValueAtTime(0, t + 2.5);

  osc.connect(oscGain);
  oscGain.connect(output);
  chimeOsc.connect(chimeGain);
  chimeGain.connect(output);
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
  chimeOsc.start(t + 2.1);
  chimeOsc.stop(t + 2.5);
  chimeOsc.onended = () => {
    disconnectReverb();
    osc.disconnect();
    oscGain.disconnect();
    chimeOsc.disconnect();
    chimeGain.disconnect();
    noise.disconnect();
    noiseGain.disconnect();
    lpf.disconnect();
    bpf.disconnect();
    bpfGain.disconnect();
    output.disconnect();
  };
};

window.synthClick = (frequency = 500) => {
  const ctx = new AudioContext();
  const t = ctx.currentTime;

  const noise = ctx.createBufferSource();
  noise.buffer = createPinkNoiseBuffer(ctx);

  const oscLow = ctx.createOscillator();
  oscLow.type = 'sawtooth';
  oscLow.frequency.setValueAtTime(frequency / 13.98, t);
  oscLow.frequency.exponentialRampToValueAtTime(frequency / 25.74, t + 0.03);

  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(frequency, t);
  osc.frequency.exponentialRampToValueAtTime(frequency / 2, t + 0.03);

  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0, t);
  oscGain.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;
  filter.frequency.exponentialRampToValueAtTime(500, t + 0.03);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.7, t + 0.005);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);

  osc.connect(oscGain);
  oscLow.connect(oscGain);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  oscGain.connect(ctx.destination);

  osc.start();
  noise.start();
  osc.stop(ctx.currentTime + 0.05);
  noise.stop(ctx.currentTime + 0.05);
};

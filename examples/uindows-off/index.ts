declare global {
  interface Window {
    synth: () => void;
  }
}

const BASE_FREQUENCY = 456;

let ctx: AudioContext;

window.synth = () => {
  ctx = ctx ?? new AudioContext();

  const t = ctx.currentTime;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = BASE_FREQUENCY;
  filter.frequency.setValueAtTime(BASE_FREQUENCY, t + 1.5);
  filter.frequency.linearRampToValueAtTime(BASE_FREQUENCY * 0.2, t + 3);
  filter.Q.value = 6;

  const filter2 = ctx.createBiquadFilter();
  filter2.frequency.value = BASE_FREQUENCY * 2;
  filter2.frequency.setValueAtTime(BASE_FREQUENCY * 2, t + 1.5);
  filter2.frequency.linearRampToValueAtTime(BASE_FREQUENCY * 0.4, t + 3);
  filter.connect(filter2);
  filter2.connect(ctx.destination);

  [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.2, 5.0, 5.8, 8.0].forEach(ratio => {
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, t + ratio * 0.05);
    gain.gain.linearRampToValueAtTime(1, t + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 3);
    gain.gain.setValueAtTime(0, t + 3.1);
    gain.connect(filter);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(BASE_FREQUENCY * ratio * (0.99 - Math.random() * 0.005), t);
    osc.frequency.linearRampToValueAtTime(BASE_FREQUENCY * ratio - Math.random(), t + 1.5);
    osc.frequency.linearRampToValueAtTime(BASE_FREQUENCY * ratio * 0.2, t + 3);
    osc.connect(gain);
    osc.start();
  });
};

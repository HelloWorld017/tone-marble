import { createWhiteNoiseBuffer } from './createWhiteNoiseBuffer';

export const createReverbEffect = async (
  ctx: AudioContext,
  { reverbTime = 0.05, wet = 0.6, dry = 0.4 }
) => {
  const rctx = new OfflineAudioContext(2, ctx.sampleRate * reverbTime, ctx.sampleRate);

  const t = rctx.currentTime;
  const envelope = rctx.createGain();
  envelope.gain.setValueAtTime(1, t);
  envelope.gain.linearRampToValueAtTime(0, t + reverbTime / 3);

  const osc = rctx.createBufferSource();
  osc.buffer = createWhiteNoiseBuffer(rctx as unknown as AudioContext, 1);
  osc.connect(envelope);

  const lpf = rctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.value = 5000;
  lpf.Q.value = 1;

  const hpf = rctx.createBiquadFilter();
  hpf.type = 'highpass';
  hpf.frequency.value = 500;
  hpf.Q.value = 1;

  envelope.connect(hpf);
  hpf.connect(lpf);
  lpf.connect(rctx.destination);

  osc.start(t);
  osc.stop(t + reverbTime);

  const buffer = await rctx.startRendering();
  const reverb = ctx.createConvolver();
  const reverbIn = ctx.createGain();
  const reverbOut = ctx.createGain();
  const reverbDry = ctx.createGain();
  const reverbWet = ctx.createGain();

  reverb.buffer = buffer;
  reverbWet.gain.value = wet;
  reverbDry.gain.value = dry;

  reverbIn.connect(reverbDry);
  reverbIn.connect(reverb);
  reverb.connect(reverbWet);
  reverbWet.connect(reverbOut);
  reverbDry.connect(reverbOut);

  return {
    reverbIn,
    reverbOut,
    disconnect: () => {
      reverbIn.disconnect();
      reverb.disconnect();
      reverbWet.disconnect();
      reverbDry.disconnect();
      reverbOut.disconnect();
    },
  };
};

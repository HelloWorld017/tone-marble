export const createWhiteNoiseBuffer = (ctx: AudioContext, length = 2): AudioBuffer => {
  const bufferSize = Math.ceil(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
};

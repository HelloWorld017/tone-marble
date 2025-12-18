// Filter-based pink noise generation
// > Algorithm from:
// > https://www.musicdsp.org/en/latest/Filters/76-pink-noise-filter.html

export const createPinkNoiseBuffer = (
  ctx: AudioContext | OfflineAudioContext,
  length = 2
): AudioBuffer => {
  const bufferSize = Math.ceil(ctx.sampleRate * length);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0,
    b1 = 0,
    b2 = 0,
    b3 = 0,
    b4 = 0,
    b5 = 0,
    b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;

    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    data[i] *= 0.11;

    b6 = white * 0.115926;
  }

  return buffer;
};

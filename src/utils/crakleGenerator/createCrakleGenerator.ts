import crakleGeneratorWorklet from './worklet?url';

const workletEnabledContext = new WeakSet<AudioContext>();

export const createCrakleGenerator = async (ctx: AudioContext, threshold?: number) => {
  await (workletEnabledContext.has(ctx)
    ? Promise.resolve()
    : ctx.audioWorklet
        .addModule(crakleGeneratorWorklet)
        .then(() => workletEnabledContext.add(ctx)));

  return new AudioWorkletNode(ctx, 'crakle-processor', { processorOptions: { threshold } });
};

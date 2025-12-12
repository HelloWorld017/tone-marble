import volumeProcessorWorklet from './worklet?url';

const workletEnabledContext = new WeakSet<AudioContext>();

export const createVolumeAnalyzer = async (
  ctx: AudioContext,
  callback: (volume: number) => void
) => {
  await (workletEnabledContext.has(ctx)
    ? Promise.resolve()
    : ctx.audioWorklet
        .addModule(volumeProcessorWorklet)
        .then(() => workletEnabledContext.add(ctx)));

  const workletNode = new AudioWorkletNode(ctx, 'volume-processor');
  workletNode.port.onmessage = event => {
    const { volume } = event.data as { volume: number };
    callback(volume);
  };

  return workletNode;
};

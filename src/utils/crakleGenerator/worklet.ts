class CrakleProcessor extends AudioWorkletProcessor {
  private threshold: number;

  constructor(options: AudioWorkletNodeOptions) {
    super();
    this.threshold = (options.processorOptions as { threshold?: number }).threshold ?? 0.9993;
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const [output] = outputs;
    if (!output || output.length === 0) {
      return true;
    }

    const outputChannel = output[0];

    for (let i = 0; i < outputChannel.length; i++) {
      const random = Math.random();
      if (random > this.threshold) {
        outputChannel[i] = (Math.random() * 2 - 1) * 0.8;
      }
    }

    return true;
  }
}

registerProcessor('crakle-processor', CrakleProcessor);

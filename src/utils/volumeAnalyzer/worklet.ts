class VolumeProcessor extends AudioWorkletProcessor {
  private lastUpdate: number = 0;
  private mean: number = 0;
  private peak: number = 0;
  private readonly updateInterval: number;

  constructor() {
    super();
    this.updateInterval = sampleRate * 0.05;
  }

  process(inputs: Float32Array[][]) {
    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }

    const inputChannel = input[0];

    let sum = 0;
    let peak = 0;
    for (let i = 0; i < inputChannel.length; i++) {
      const absolute = Math.abs(inputChannel[i]);
      peak = absolute < peak ? peak : absolute;
      sum += inputChannel[i] * inputChannel[i];
    }

    const rms = Math.sqrt(sum / inputChannel.length);
    this.mean = this.mean * 0.75 + rms * 0.25;
    this.peak = this.peak * 0.75 + peak * 0.25;

    if (this.lastUpdate + this.updateInterval <= currentTime * sampleRate) {
      this.port.postMessage({ mean: this.mean, peak: this.peak });
      this.lastUpdate = currentTime;
    }

    return true;
  }
}

registerProcessor('volume-processor', VolumeProcessor);

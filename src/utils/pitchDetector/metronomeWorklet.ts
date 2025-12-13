const TARGET_SIZE = 4096;

class MetronomeProcessor extends AudioWorkletProcessor {
  private samples = 0;

  constructor() {
    super();
  }

  process(inputs: Float32Array[][]) {
    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }

    const inputChannel = input[0];
    this.samples += inputChannel.length;

    if (this.samples >= TARGET_SIZE) {
      this.port.postMessage({ samples: this.samples });
      this.samples = 0;
    }

    return true;
  }
}
registerProcessor('metronome-processor', MetronomeProcessor);

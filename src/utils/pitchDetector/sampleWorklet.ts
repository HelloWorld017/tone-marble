const TARGET_SAMPLE_RATE = 16000;
const BUFFER_SIZE = 1024;
const OVERLAP_SIZE = 256;

class SampleProcessor extends AudioWorkletProcessor {
  private buffer: Float32Array;
  private samplesWritten: number = 0;
  private phase: number = 0;
  private lastInputSample: number = 0;
  private readonly step: number;

  constructor() {
    super();
    this.buffer = new Float32Array(BUFFER_SIZE);
    this.step = sampleRate / TARGET_SAMPLE_RATE;
  }

  process(inputs: Float32Array[][]): boolean {
    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }

    const inputChannel = input[0];

    // Linear interpolate re-sampling
    while (this.phase < inputChannel.length) {
      const index = Math.floor(this.phase);
      const fraction = this.phase - index;

      let s0: number;
      let s1: number;

      if (index < 0) {
        s0 = this.lastInputSample;
        s1 = inputChannel[0];
      } else if (index >= inputChannel.length - 1) {
        break;
      } else {
        s0 = inputChannel[index];
        s1 = inputChannel[index + 1];
      }

      const value = s0 + (s1 - s0) * fraction;
      this.pushToBuffer(value);
      this.phase += this.step;
    }

    this.phase = this.phase - inputChannel.length;
    this.lastInputSample = inputChannel[inputChannel.length - 1];

    return true;
  }

  private pushToBuffer(value: number) {
    this.buffer[this.samplesWritten] = value;
    this.samplesWritten++;

    if (this.samplesWritten >= BUFFER_SIZE) {
      const sendData = this.buffer.slice();
      this.port.postMessage({ audioData: sendData }, [sendData.buffer]);

      this.buffer.copyWithin(0, BUFFER_SIZE - OVERLAP_SIZE, BUFFER_SIZE);
      this.samplesWritten = OVERLAP_SIZE;
    }
  }
}

registerProcessor('sample-processor', SampleProcessor);

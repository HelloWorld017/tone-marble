class PitchProcessor extends AudioWorkletProcessor {
  private readonly BUFFER_SIZE = 1024;
  private readonly OVERLAP_SIZE = 256;
  private buffer: Float32Array;
  private samplesWritten: number = 0;

  constructor() {
    super();
    this.buffer = new Float32Array(this.BUFFER_SIZE);
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }

    const channelData = input[0];

    let inputWritten = 0;
    let inputLeft = channelData.length;
    let spaceLeft = this.BUFFER_SIZE - this.samplesWritten;
    while (spaceLeft <= inputLeft) {
      this.buffer.set(
        channelData.subarray(inputWritten, inputWritten + spaceLeft),
        this.samplesWritten
      );

      inputWritten += spaceLeft;
      inputLeft -= spaceLeft;

      const sendData = this.buffer.slice();
      this.port.postMessage({ audioData: sendData }, [sendData.buffer]);
      this.buffer.copyWithin(0, this.BUFFER_SIZE - this.OVERLAP_SIZE, this.BUFFER_SIZE);
      this.samplesWritten = this.OVERLAP_SIZE;
      spaceLeft = this.BUFFER_SIZE - this.samplesWritten;
    }

    this.buffer.set(channelData.subarray(inputWritten), this.samplesWritten);
    this.samplesWritten += inputLeft;

    // Output Pass-through
    const output = outputs[0];
    for (let channel = 0; channel < output.length; channel++) {
      output[channel].set(input[channel]);
    }

    return true;
  }
}

registerProcessor('pitch-processor', PitchProcessor);

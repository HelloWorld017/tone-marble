import * as tf from '@tensorflow/tfjs';
import pitchProcessorWorklet from '@/worklets/pitchProcessorWorklet?url';
import '@tensorflow/tfjs-backend-webgpu';

export interface PitchResult {
  pitch: number;
  confidence: number;
}

const postprocess = (activations: Float32Array | Int32Array | Uint8Array) => {
  let maxVal = -Infinity;
  let maxIdx = -1;
  for (let i = 0; i < activations.length; i++) {
    if (activations[i] > maxVal) {
      maxVal = activations[i];
      maxIdx = i;
    }
  }

  let cent = 0;
  const CENTS_SCALE = 20;
  const CENTS_OFFSET = 1997.3794084376191;
  cent = CENTS_SCALE * maxIdx + CENTS_OFFSET;

  const pitch = 10 * Math.pow(2, cent / 1200);
  const confidence = maxVal;
  return { pitch, confidence };
};

export class CrepePitchDetector {
  private audioContext: AudioContext;
  private model: tf.LayersModel | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private isReady: boolean = false;

  public callback: ((result: PitchResult) => void) | null = null;

  constructor(ctx: AudioContext, callback: (result: PitchResult) => void) {
    this.audioContext = ctx;
    this.callback = callback;
  }

  async init() {
    const audioWorkletPromise = this.audioContext.audioWorklet.addModule(pitchProcessorWorklet);
    const modelPromise = tf
      .ready()
      .then(() => tf.loadLayersModel('/assets/neuralnets/crepe/model.json'));

    [this.model] = await Promise.all([modelPromise, audioWorkletPromise]);
    this.isReady = true;
  }

  async start(audio: ArrayBuffer) {
    if (!this.isReady) {
      await this.init();
    }

    const audioBuffer = await this.audioContext.decodeAudioData(audio);
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    this.workletNode = new AudioWorkletNode(this.audioContext, 'pitch-processor');
    this.workletNode.port.onmessage = event => {
      const { audioData } = event.data as { audioData: Float32Array };
      this.predict(audioData);
    };

    this.workletNode.connect(this.audioContext.destination);
    source.connect(this.workletNode);
    source.start();

    return source;
  }

  private predict(audioData: Float32Array) {
    if (!this.model) {
      return;
    }

    const result = tf.tidy(() => {
      const inputTensor = tf.tensor(audioData).reshape([1, 1024]);
      const output = this.model!.predict(inputTensor) as tf.Tensor;
      const activations = output.dataSync();
      return postprocess(activations);
    });

    this.callback?.(result);
  }
}

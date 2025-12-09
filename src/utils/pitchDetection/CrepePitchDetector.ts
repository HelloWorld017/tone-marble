import * as tf from '@tensorflow/tfjs';
import pitchProcessorWorklet from '@/worklets/pitchProcessorWorklet?url';
import '@tensorflow/tfjs-backend-webgpu';

export interface PitchResult {
  pitch: number;
  confidence: number;
}

const postprocessCrepe = (activations: Float32Array | Int32Array | Uint8Array) => {
  let maxVal = -Infinity;
  let maxIdx = -1;
  for (let i = 0; i < activations.length; i++) {
    if (activations[i] > maxVal) {
      maxVal = activations[i];
      maxIdx = i;
    }
  }

  const CENTS_SCALE = 20;
  const CENTS_OFFSET = 1997.3794084376191;
  let adjustment = 0;

  if (maxIdx > 0 && maxIdx < activations.length - 1) {
    const prev = activations[maxIdx - 1];
    const next = activations[maxIdx + 1];
    adjustment = (next - prev) / (prev + next + maxVal);
  }

  const cent = CENTS_SCALE * (maxIdx + adjustment) + CENTS_OFFSET;
  const pitch = 10 * Math.pow(2, cent / 1200);
  const confidence = maxVal;
  return { pitch, confidence };
};

const postprocessSpice = (activations: [Float32Array, Float32Array]) => {
  const pitchSum = activations[0].reduce<number>((a, b) => a + b, 0);
  const uncertaintySum = activations[1].reduce<number>((a, b) => a + b, 0);
  const pitchRaw = pitchSum / activations[0].length;
  const uncertainty = uncertaintySum / activations[1].length;

  const PT_OFFSET = 25.58;
  const PT_SLOPE = 63.07;
  const FMIN = 10;
  const BINS_PER_OCTAVE = 12;
  const cqtBin = pitchRaw * PT_SLOPE + PT_OFFSET;
  const pitch = FMIN * 2 ** (cqtBin / BINS_PER_OCTAVE);
  const confidence = 1.0 - uncertainty;
  return { pitch, confidence };
};

export class CrepePitchDetector {
  private audioContext: AudioContext;
  private model: tf.LayersModel | tf.GraphModel | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private isReady: boolean = false;
  private modelKind: 'crepe' | 'spice' = 'crepe';

  public callback: ((result: PitchResult) => void) | null = null;

  constructor(ctx: AudioContext, callback: (result: PitchResult) => void) {
    this.audioContext = ctx;
    this.callback = callback;
  }

  async init() {
    const audioWorkletPromise = this.audioContext.audioWorklet.addModule(pitchProcessorWorklet);
    const modelPromise = tf
      .ready()
      .then(
        (): Promise<tf.LayersModel | tf.GraphModel> =>
          this.modelKind === 'spice'
            ? tf.loadGraphModel('/assets/neuralnets/spice/model.json')
            : tf.loadLayersModel('/assets/neuralnets/crepe/model.json')
      );

    [this.model] = await Promise.all([modelPromise, audioWorkletPromise]);
    this.isReady = true;
  }

  async start(audio: AudioBufferSourceNode | MediaStreamAudioSourceNode) {
    if (!this.isReady) {
      await this.init();
    }

    this.workletNode = new AudioWorkletNode(this.audioContext, 'pitch-processor');
    this.workletNode.port.onmessage = event => {
      const { audioData } = event.data as { audioData: Float32Array };
      void this.predict(audioData);
    };

    audio.connect(this.workletNode);
  }

  private async predict(audioData: Float32Array) {
    if (!this.model) {
      return;
    }

    if (this.modelKind === 'spice') {
      const result = tf.tidy(() => {
        const inputTensor = tf.tensor(audioData).reshape([1024]);
        return this.model!.predict(inputTensor) as [tf.Tensor, tf.Tensor];
      });

      try {
        const activations = await Promise.all([result[0].data(), result[1].data()]);
        this.callback?.(postprocessSpice(activations as [Float32Array, Float32Array]));
      } finally {
        result[0].dispose();
        result[1].dispose();
      }
    } else {
      const result = tf.tidy(() => {
        const inputTensor = tf.tensor(audioData).reshape([1, 1024]);
        return this.model!.predict(inputTensor) as tf.Tensor;
      });

      try {
        const activations = await result.data();
        this.callback?.(postprocessCrepe(activations));
      } finally {
        result.dispose();
      }
    }
  }
}

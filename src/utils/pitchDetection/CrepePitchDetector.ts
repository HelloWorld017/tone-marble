import * as tf from '@tensorflow/tfjs';
import pitchProcessorWorklet from '@/worklets/pitchProcessorWorklet?url';
import '@tensorflow/tfjs-backend-webgpu';

export interface PitchResult {
  pitch: number;
  confidence: number;
}

export class CrepePitchDetector {
  private audioContext: AudioContext;
  private model: tf.LayersModel | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private isReady: boolean = false;

  public onPitchDetected: ((result: PitchResult) => void) | null = null;

  constructor() {
    this.audioContext = new AudioContext({ sampleRate: 16000 });
  }

  async init() {
    this.model = await tf.loadLayersModel('/assets/neuralnets/crepe/model.json');
    await this.audioContext.audioWorklet.addModule(pitchProcessorWorklet);

    this.isReady = true;
  }

  async loadAudioFile(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  async start(audioUrl: string) {
    if (!this.isReady) {
      throw new Error('Not initialized!');
    }

    const audioBuffer = await this.loadAudioFile(audioUrl);
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    this.workletNode = new AudioWorkletNode(this.audioContext, 'pitch-processor');
    this.workletNode.port.onmessage = event => {
      const { audioData } = event.data as { audioData: Float32Array };
      this.predict(audioData);
    };

    source.connect(this.workletNode);
    this.workletNode.connect(this.audioContext.destination);

    source.start();
  }

  private predict(audioData: Float32Array) {
    if (!this.model) {
      return;
    }

    const result = tf.tidy(() => {
      const inputTensor = tf.tensor(audioData).reshape([1, 1024]);
      const output = this.model!.predict(inputTensor) as tf.Tensor;
      const activations = output.dataSync();
      return this.processCrepeOutput(activations);
    });

    if (this.onPitchDetected) {
      this.onPitchDetected({ ...result });
    }
  }

  private processCrepeOutput(activations: Float32Array | Int32Array | Uint8Array) {
    let maxVal = -Infinity;
    let maxIdx = -1;
    for (let i = 0; i < activations.length; i++) {
      if (activations[i] > maxVal) {
        maxVal = activations[i];
        maxIdx = i;
      }
    }

    const confidence = maxVal;

    let cent = 0;
    const CENTS_SCALE = 20;
    const CENTS_OFFSET = 1997.3794084376191;
    cent = CENTS_SCALE * maxIdx + CENTS_OFFSET;

    const frequency = 10 * Math.pow(2, cent / 1200);

    return { pitch: frequency, confidence };
  }
}

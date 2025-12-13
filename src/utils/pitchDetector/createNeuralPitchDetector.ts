import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';

import { exhaustive } from '@/utils/exhaustive';
import sampleProcessorWorklet from './worklet?url';

export type PitchModelKind = 'crepe' | 'spice';
export interface PitchResult {
  pitch: number;
  confidence: number;
}

/*
 * Crepe Implementation
 * ----
 */
const CENTS_SCALE = 20;
const CENTS_OFFSET = 1997.3794084376191;

const predictCrepe = async (model: tf.GraphModel | tf.LayersModel, audioData: Float32Array) => {
  const result = tf.tidy(() => {
    const inputTensor = tf.tensor(audioData).reshape([1, 1024]);
    return model.predict(inputTensor) as tf.Tensor;
  });

  try {
    const activations = await result.data();
    let maxVal = -Infinity;
    let maxIdx = -1;
    for (let i = 0; i < activations.length; i++) {
      if (activations[i] > maxVal) {
        maxVal = activations[i];
        maxIdx = i;
      }
    }

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
  } finally {
    result.dispose();
  }
};

/*
 * Spice Implementation
 * ----
 */
const PT_OFFSET = 25.58;
const PT_SLOPE = 63.07;
const FMIN = 10;
const BINS_PER_OCTAVE = 12;

type SpiceActivation = [Float32Array, Float32Array];

const predictSpice = async (model: tf.GraphModel | tf.LayersModel, audioData: Float32Array) => {
  const result = tf.tidy(() => {
    const inputTensor = tf.tensor(audioData).reshape([1024]);
    return model.predict(inputTensor) as [tf.Tensor, tf.Tensor];
  });

  try {
    const activations = (await Promise.all([
      result[0].data(),
      result[1].data(),
    ])) as SpiceActivation;

    const pitchSum = activations[0].reduce<number>((a, b) => a + b, 0);
    const uncertaintySum = activations[1].reduce<number>((a, b) => a + b, 0);
    const pitchRaw = pitchSum / activations[0].length;
    const uncertainty = uncertaintySum / activations[1].length;

    const cqtBin = pitchRaw * PT_SLOPE + PT_OFFSET;
    const pitch = FMIN * 2 ** (cqtBin / BINS_PER_OCTAVE);
    const confidence = 1.0 - uncertainty;

    return { pitch, confidence };
  } finally {
    result[0].dispose();
    result[1].dispose();
  }
};

/*
 * PitchDetector Node Implementation
 * ----
 */

const workletEnabledContext = new WeakSet<AudioContext>();

type CreateNeuralPitchDetectorProps = {
  modelKind?: PitchModelKind;
};

const loadModel = (modelKind: PitchModelKind) =>
  tf
    .ready()
    .then(
      (): Promise<tf.LayersModel | tf.GraphModel> =>
        modelKind === 'crepe'
          ? tf.loadLayersModel('/assets/neuralnets/crepe/model.json')
          : tf.loadGraphModel('/assets/neuralnets/spice/model.json')
    );

let modelPromise = {
  kind: 'crepe' as PitchModelKind,
  promise: loadModel('crepe'),
};

export const createNeuralPitchDetector = async (
  ctx: AudioContext,
  callback: (result: PitchResult) => void,
  opts?: CreateNeuralPitchDetectorProps
) => {
  const audioWorkletPromise = workletEnabledContext.has(ctx)
    ? Promise.resolve()
    : ctx.audioWorklet.addModule(sampleProcessorWorklet).then(() => workletEnabledContext.add(ctx));

  const modelKind = opts?.modelKind ?? 'crepe';
  if (modelPromise.kind !== modelKind) {
    modelPromise = { kind: modelKind, promise: loadModel(modelKind) };
  }

  const [model] = await Promise.all([modelPromise.promise, audioWorkletPromise]);

  const predict = async (audioData: Float32Array) => {
    if (modelKind === 'spice') {
      callback(await predictSpice(model, audioData));
      return;
    }

    if (modelKind === 'crepe') {
      callback(await predictCrepe(model, audioData));
      return;
    }

    exhaustive(modelKind);
  };

  const workletNode = new AudioWorkletNode(ctx, 'sample-processor');
  workletNode.port.onmessage = event => {
    const { audioData } = event.data as { audioData: Float32Array };
    void predict(audioData);
  };

  return workletNode;
};

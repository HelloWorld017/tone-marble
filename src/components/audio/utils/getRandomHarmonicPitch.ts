const HARMONIC_RATIOS = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0, 5.0, 6.0];

export const getRandomHarmonicPitch = (baseFrequency: number) => {
  const ratio = HARMONIC_RATIOS[~~(Math.random() * HARMONIC_RATIOS.length)];
  const detune = 1 + (Math.random() * 0.01 - 0.005);
  return baseFrequency * ratio * detune;
};

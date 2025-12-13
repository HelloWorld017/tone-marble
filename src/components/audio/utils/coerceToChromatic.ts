export const coerceToChromatic = (frequency: number) => {
  const midiFloat = 69 + 12 * Math.log2(frequency / 440);
  const midiRounded = Math.round(midiFloat);
  const offTune = midiFloat - midiRounded;

  const weight = 1 - (2 * offTune) ** 2;
  const chromatic = midiRounded % 12;
  return { chromatic, weight };
};

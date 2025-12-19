export const cltRandom = (samples = 3) => {
  let value = 0;
  for (let i = 0; i < samples; i++) {
    value += Math.random();
  }

  return value / samples;
};

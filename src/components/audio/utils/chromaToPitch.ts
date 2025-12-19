export const chromaToPitch = (chroma: number) => 440 * Math.pow(2, (chroma + 48 - 69) / 12);

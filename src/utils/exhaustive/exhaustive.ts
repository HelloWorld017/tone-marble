export const exhaustive = (value: never) => {
  throw new Error(`Invariant: expected never, got ${value as string}`);
};

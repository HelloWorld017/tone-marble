import { useEffect, useState } from 'react';

export const useFluorescentBlink = (isEnabled: boolean) => {
  const [intensity, setIntensity] = useState(isEnabled ? 1 : 0);

  useEffect(() => {
    if (!isEnabled) {
      setIntensity(0);
      return;
    }

    const maxIteration = 8;
    let iteration = 0;
    let isTurnedOn = false;
    let interval = 100;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const blink = () => {
      if (iteration >= maxIteration) {
        timeoutId = null;
        setIntensity(1);
        return;
      }

      const nextTimeout = isTurnedOn
        ? interval
        : interval * (1 - (iteration / maxIteration) ** 2) * 4;

      const nextIntensity = isTurnedOn ? 0 : 1 * 0.7 + 1 * Math.random() * 0.2;
      setIntensity(nextIntensity);

      interval -= Math.random() * 10;
      isTurnedOn = !isTurnedOn;
      iteration++;
      timeoutId = setTimeout(blink, nextTimeout);
    };

    timeoutId = setTimeout(blink, 500);

    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [isEnabled]);

  return intensity;
};

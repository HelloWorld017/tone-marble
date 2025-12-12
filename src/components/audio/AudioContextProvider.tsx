import { useEffect, useState } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';

const [AudioContextProvider, useAudioContextProvider] = buildContext(() => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const initialize = useLatestCallback(() => {
    if (audioContext === null) {
      setAudioContext(new AudioContext());
    }
  });

  useEffect(
    () => () => {
      void audioContext?.close();
    },
    [audioContext]
  );

  return {
    audioContext,
    initialize,
  };
});

export const useAudioContext = () => useAudioContextProvider(state => state.audioContext);
export const useInitializeAudioContext = () => useAudioContextProvider(state => state.initialize);
export { AudioContextProvider };

export const AudioContextClickInitializer = () => {
  const initialize = useInitializeAudioContext();
  useEffect(() => {
    window.addEventListener('click', initialize, { capture: true });
    return () => window.removeEventListener('click', initialize, { capture: true });
  }, []);

  return null;
};

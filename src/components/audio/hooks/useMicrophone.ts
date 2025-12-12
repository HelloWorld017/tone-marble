import { useEffect, useState } from 'react';
import { useAudioContext } from '../AudioContextProvider';

export const useMicrophone = (isEnabled: boolean) => {
  const ctx = useAudioContext();
  const [source, setSource] = useState<MediaStreamAudioSourceNode | null>(null);
  useEffect(() => {
    if (!ctx || !isEnabled) {
      return () => {};
    }

    let isCanceled = false;
    let source: MediaStreamAudioSourceNode | null = null;
    void navigator.mediaDevices
      .getUserMedia({ audio: true })
      .catch(() => {
        // TODO show toast
      })
      .then(stream => {
        if (stream && !isCanceled) {
          source = ctx.createMediaStreamSource(stream);
          setSource(source);
        }
      });

    return () => {
      isCanceled = true;
      if (source) {
        source.disconnect();
        setSource(null);
      }
    };
  }, [ctx, isEnabled]);

  return source;
};

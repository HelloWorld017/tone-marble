import { useEffect, useRef, useState } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import type { PitchModelKind } from '@/utils/pitchDetector';
import type { CSSProperties } from 'react';

export type InterfaceKind = 'click' | 'xy' | 'x';

const useInterfaceKindCursor = (hoverTarget: string | null, activeTarget: string | null) => {
  const interfaceKinds = useRef<Record<string, InterfaceKind>>({});
  const updateInterfaceKind = useLatestCallback((id: string, kind: InterfaceKind) => {
    interfaceKinds.current[id] = kind;
    return () => {
      delete interfaceKinds.current[id];
    };
  });

  useEffect(() => {
    const nextCursor = ((): NonNullable<CSSProperties['cursor']> => {
      const target = activeTarget || hoverTarget;
      if (target && interfaceKinds.current[target] === 'xy') {
        return 'move';
      }

      if (target && interfaceKinds.current[target] === 'x') {
        return 'ew-resize';
      }

      if (target) {
        return 'pointer';
      }

      return 'auto';
    })();

    document.body.style.cursor = nextCursor;
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [activeTarget, hoverTarget]);

  return { updateInterfaceKind };
};

export const [InterfaceStateProvider, useInterfaceState] = buildContext(() => {
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const { updateInterfaceKind } = useInterfaceKindCursor(hoverTarget, activeTarget);

  const [isSandActive, setIsSandActive] = useState(true);
  const [isGlassActive, setIsGlassActive] = useState(true);
  const [isMetalActive, setIsMetalActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [rhythm, setRhythm] = useState(0);
  const [radius, setRadius] = useState(0);
  const [volume, setVolume] = useState(1);

  const [pitchModelKind, setPitchModelKind] = useState<PitchModelKind | 'fft'>('fft');

  return {
    // Cursor Management
    hoverTarget,
    activeTarget,
    setHoverTarget,
    setActiveTarget,
    updateInterfaceKind,

    // Buttons
    isSandActive: isPoweredOn && isSandActive,
    isGlassActive: isPoweredOn && isGlassActive,
    isMetalActive: isPoweredOn && isMetalActive,
    isMuted,
    isPoweredOn,
    isRecording: isPoweredOn && isRecording,
    setIsSandActive,
    setIsGlassActive,
    setIsMetalActive,
    setIsMuted,
    setIsPoweredOn,
    setIsRecording,

    // Knobs
    rhythm,
    radius,
    setRhythm,
    setRadius,

    // Sliders
    volume,
    setVolume,

    // UI
    pitchModelKind,
    setPitchModelKind,
  };
});

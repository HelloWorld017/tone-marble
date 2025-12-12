import { useEffect, useRef, useState } from 'react';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import type { CSSProperties } from 'react';

type InterfaceKind = 'click' | 'xy' | 'x';

export const [InterfaceStateProvider, useInterfaceState] = buildContext(() => {
  const interfaceKinds = useRef<Record<string, InterfaceKind>>({});
  const updateInterfaceKind = useLatestCallback((id: string, kind: InterfaceKind) => {
    interfaceKinds.current[id] = kind;
    return () => {
      delete interfaceKinds.current[id];
    };
  });

  const [isSandActive, setIsSandActive] = useState(true);
  const [isGlassActive, setIsGlassActive] = useState(true);
  const [isMetalActive, setIsMetalActive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const [activeTarget, setActiveTarget] = useState<string | null>(null);
  const [wave, setWave] = useState(0);
  const [radius, setRadius] = useState(0);
  const [volume, setVolume] = useState(1);

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

  return {
    // Cursor Management
    hoverTarget,
    activeTarget,
    setHoverTarget,
    setActiveTarget,
    updateInterfaceKind,

    // Buttons
    isSandActive,
    isGlassActive,
    isMetalActive,
    isMuted,
    setIsSandActive,
    setIsGlassActive,
    setIsMetalActive,
    setIsMuted,

    // Knobs
    wave,
    radius,
    setWave,
    setRadius,

    // Sliders
    volume,
    setVolume,
  };
});

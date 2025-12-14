import { useEffect, useRef, useState } from 'react';
import {
  PILLAR_ROWS,
  PILLAR_SELECTION_ALL,
  PILLAR_SELECTION_FILTER,
  PILLAR_SELECTION_SLIDE,
} from '@/constants';
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

  const [sandActivePillars, setSandActivePillars] = useState(-1);
  const [glassActivePillars, setGlassActivePillars] = useState(-1);
  const [windActivePillars, setWindActivePillars] = useState(-1);

  const [isMuted, setIsMuted] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const [rhythm, setRhythm] = useState(1);
  const [selection, setSelection] = useState(PILLAR_SELECTION_ALL);
  const selectionAllMask = (1 << PILLAR_ROWS) - 1;
  const selectionMask =
    selection === PILLAR_SELECTION_ALL
      ? selectionAllMask
      : (PILLAR_SELECTION_FILTER << (selection * PILLAR_SELECTION_SLIDE)) & selectionAllMask;

  const [volume, setVolume] = useState(1);

  const [pitchModelKind, setPitchModelKind] = useState<PitchModelKind | 'fft'>('fft');

  return {
    // Cursor Management
    hoverTarget,
    activeTarget,
    setHoverTarget,
    setActiveTarget,
    updateInterfaceKind,

    // Large Buttons
    sandActivePillars: isPoweredOn ? sandActivePillars : 0,
    glassActivePillars: isPoweredOn ? glassActivePillars : 0,
    windActivePillars: isPoweredOn ? windActivePillars : 0,
    setSandActivePillars,
    setGlassActivePillars,
    setWindActivePillars,

    // Buttons
    isMuted,
    isPoweredOn,
    isRecording: isPoweredOn && isRecording,
    setIsMuted,
    setIsPoweredOn,
    setIsRecording,

    // Knobs
    rhythm,
    selection,
    selectionMask,
    setRhythm,
    setSelection,

    // Sliders
    volume,
    setVolume,

    // UI
    pitchModelKind,
    setPitchModelKind,
  };
});

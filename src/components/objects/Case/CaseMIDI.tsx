import { animated, useSpringValue } from '@react-spring/three';
import { useEffect, useRef, useState } from 'react';
import { useInterfaceState } from '@/components/providers/InterfaceStateProvider';
import { usePitchMap } from '@/components/providers/PitchMapProvider';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { useHover } from './hooks/useHover';
import type { AnimatedSimple } from '@/types/AnimatedSimple';
import type { GLTFResult } from '@/types/GLTFResult';

const a = animated as unknown as AnimatedSimple;

export const CaseMIDI = ({ nodes, materials }: Pick<GLTFResult, 'nodes' | 'materials'>) => {
  const [midiAccess, setMIDIAccess] = useState<MIDIAccess | null>(null);
  const isPoweredOn = useInterfaceState(state => state.isPoweredOn);
  const { groupProps } = useHover({
    onPointerUpActive: () => {
      if (navigator.requestMIDIAccess) {
        navigator
          .requestMIDIAccess()
          .then(midiAccess => setMIDIAccess(midiAccess))
          .catch(() => {});
      }
    },
  });

  const light = useSpringValue('#000000');
  useEffect(() => {
    void light.start(isPoweredOn && midiAccess ? '#001eff' : '#000000');
  }, [isPoweredOn, midiAccess]);

  const lastInput = useRef<number | null>(null);
  const updateChroma = usePitchMap(state => state.updateChroma);
  const onMIDIMessage = useLatestCallback((event: MIDIMessageEvent) => {
    if (!event.data || event.data.length < 2) {
      return;
    }

    const [command, note, velocity = 255] = event.data;
    if (command === 144 && velocity > 0) {
      lastInput.current = note;
      updateChroma(note % 12);
    }

    if (command === 128 || (command === 144 && velocity === 0)) {
      if (lastInput.current === note) {
        updateChroma(null);
      }
    }
  });

  useEffect(() => {
    if (!midiAccess) {
      return;
    }

    midiAccess.inputs.forEach(input => {
      input.addEventListener('midimessage', onMIDIMessage);
    });

    const onStateChange = (event: MIDIConnectionEvent) => {
      const port = event.port;
      if (!port) {
        return;
      }

      if (port.type === 'input' && port.state === 'connected') {
        (port as MIDIInput).addEventListener('midimessage', onMIDIMessage);
      }
    };

    midiAccess.addEventListener('statechange', onStateChange);
    return () => {
      midiAccess.removeEventListener('statechange', onStateChange);
      midiAccess.inputs.forEach(input => {
        input.removeEventListener('midimessage', onMIDIMessage);
      });
    };
  }, [midiAccess]);

  return (
    <group position={[0, 0.5, -5.8]}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.InputMesh.geometry}
        material={materials.Base}
      />

      <group {...groupProps}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.InputMesh_1.geometry}
          material={materials.Connector}
        />
        <mesh castShadow receiveShadow geometry={nodes.InputMesh_2.geometry}>
          <a.meshStandardMaterial
            {...materials['Connector.WallInner']}
            emissive={light}
            emissiveIntensity={10}
          />
        </mesh>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.InputMesh_3.geometry}
          material={materials['Connector.Outer']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.InputMesh_4.geometry}
          material={materials['Connector.Front']}
        />
      </group>
    </group>
  );
};

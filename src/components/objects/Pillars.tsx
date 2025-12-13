import { Instance, Instances } from '@react-three/drei';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { useMemo } from 'react';
import { useSynthesize } from '@/components/audio/SynthesizeProvider';
import { usePitchMap } from '@/components/providers/PitchMapProvider';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import type { ContactForceHandler } from '@react-three/rapier';

const MAX_COLLISION_FORCE = 20;
const PILLAR_RADIUS = 0.1;
const PILLAR_HEIGHT = 0.5;
const PILLAR_SEGMENTS = 16;

type PillarsProps = {
  planeAngle: number;
  rows: number;
  rowGap?: number;
  columns: number;
  columnGap?: number;
};

export const Pillars = ({
  planeAngle,
  rows,
  rowGap = 1.5,
  columns,
  columnGap = 1.5,
}: PillarsProps) => {
  const pillars = useMemo(() => {
    const instances = [];
    for (let row = 0; row < rows; row++) {
      const columnsOfRow = row % 2 === 1 ? columns - 1 : columns;

      for (let column = 0; column < columnsOfRow; column++) {
        const x = (row - (rows - 1) / 2) * rowGap;
        const y = Math.tan(planeAngle) * x;
        const z = (column - (columnsOfRow - 1) / 2) * columnGap;

        instances.push({
          key: `${row};${column}`,
          position: [x, y, z] as const,
          rotation: [0, 0, 0] as const,
        });
      }
    }

    return instances;
  }, [planeAngle, rows, rowGap, columns, columnGap]);

  const synthesizeSine = useSynthesize(state => state.synthesizeSine);
  const synthesizeNoise = useSynthesize(state => state.synthesizeNoise);
  const advancePointer = usePitchMap(state => state.advancePointer);
  const onCollide = useLatestCallback<ContactForceHandler>(event => {
    if (event.maxForceMagnitude < 1) {
      return;
    }

    const position = event.other.rigidBody?.translation();
    if (!position) {
      return;
    }

    (Math.random() < 0.5 ? synthesizeSine : synthesizeNoise)(
      [position.x, position.y, position.z],
      Math.max(0, Math.min(1, event.maxForceMagnitude / MAX_COLLISION_FORCE))
    );

    advancePointer();
  });

  return (
    <>
      <Instances>
        <cylinderGeometry args={[PILLAR_RADIUS, PILLAR_RADIUS, PILLAR_HEIGHT, PILLAR_SEGMENTS]} />
        <meshPhysicalMaterial transparent transmission={0.7} opacity={0.7} color="#f0f0f0" />
        {pillars.map(data => (
          <Instance key={data.key} position={data.position} rotation={data.rotation} />
        ))}
      </Instances>

      <RigidBody type="fixed" onContactForce={onCollide}>
        {pillars.map(data => (
          <CapsuleCollider
            key={data.key}
            position={data.position}
            rotation={data.rotation}
            args={[(PILLAR_HEIGHT - PILLAR_RADIUS / 2) / 2, PILLAR_RADIUS]}
          />
        ))}
      </RigidBody>
    </>
  );
};

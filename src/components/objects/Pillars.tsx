import { Instance, Instances } from '@react-three/drei';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { useMemo } from 'react';
import { usePitchMap } from '@/components/providers/PitchMapProvider';
import { PILLAR_SELECTION_ALL } from '@/constants';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { useSynthesizeMarble } from '../audio/SynthesizeMarbleProvider';
import { useInterfaceState } from '../providers/InterfaceStateProvider';
import type { Position } from '@/types/Position';
import type { ContactForceHandler } from '@react-three/rapier';

const MAX_COLLISION_FORCE = 20;
const PILLAR_RADIUS = 0.1;
const PILLAR_HEIGHT = 0.5;
const PILLAR_SEGMENTS = 16;

type Pillar = {
  key: string;
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
};

const PillarRow = ({ row, pillars }: { row: number; pillars: Pillar[] }) => {
  const isPoweredOn = useInterfaceState(state => state.isPoweredOn);
  const isSelected = useInterfaceState(
    state => state.selection !== PILLAR_SELECTION_ALL && !!(state.selectionMask & (1 << row))
  );

  return (
    <Instances>
      <cylinderGeometry args={[PILLAR_RADIUS, PILLAR_RADIUS, PILLAR_HEIGHT, PILLAR_SEGMENTS]} />
      <meshPhysicalMaterial
        transparent
        transmission={0.7}
        opacity={0.7}
        color="#f0f0f0"
        emissive="#001eff"
        emissiveIntensity={isPoweredOn && isSelected ? 5 : 0}
      />
      {pillars.map(data => (
        <Instance key={data.key} position={data.position} rotation={data.rotation} />
      ))}
    </Instances>
  );
};

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
  const [pillarsByRow, pillars] = useMemo(() => {
    const instances = [];
    for (let row = 0; row < rows; row++) {
      const columnsOfRow = row % 2 === 1 ? columns - 1 : columns;
      const rowInstances = [];

      for (let column = 0; column < columnsOfRow; column++) {
        const x = (row - (rows - 1) / 2) * rowGap;
        const y = Math.tan(planeAngle) * x;
        const z = (column - (columnsOfRow - 1) / 2) * columnGap;

        rowInstances.push({
          key: `${row};${column}`,
          position: [x, y, z] as const,
          rotation: [0, 0, 0] as const,
        });
      }

      instances.push(rowInstances);
    }

    return [instances, instances.flat()];
  }, [planeAngle, rows, rowGap, columns, columnGap]);

  const synthesize = useSynthesizeMarble(state => state.synthesize);
  const advancePointer = usePitchMap(state => state.advancePointer);
  const onCollide = useLatestCallback<ContactForceHandler>(event => {
    if (event.maxForceMagnitude < 1) {
      return;
    }

    const position = event.other.rigidBody?.translation();
    if (!position) {
      return;
    }

    advancePointer();

    const positionTuple: Position = [position.x, position.y, position.z];
    const gain = Math.max(0, Math.min(1, event.maxForceMagnitude / MAX_COLLISION_FORCE));
    const rowParsed = parseInt(event.target.colliderObject?.name.split(';')[0] ?? '', 10);
    const row = isFinite(rowParsed) ? rowParsed : -1;
    synthesize(row, positionTuple, gain);
  });

  return (
    <>
      {pillarsByRow.map((pillars, row) => (
        <PillarRow key={row} row={row} pillars={pillars} />
      ))}

      <RigidBody type="fixed" onContactForce={onCollide}>
        {pillars.map(data => (
          <CapsuleCollider
            key={data.key}
            name={data.key}
            position={data.position}
            rotation={data.rotation}
            args={[(PILLAR_HEIGHT - PILLAR_RADIUS / 2) / 2, PILLAR_RADIUS]}
          />
        ))}
      </RigidBody>
    </>
  );
};

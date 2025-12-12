import { useFrame } from '@react-three/fiber';
import { InstancedRigidBodies, type RapierRigidBody } from '@react-three/rapier';
import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef } from 'react';
import { Matrix4, Vector3 } from 'three';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import type { Ref } from 'react';
import type { InstancedMesh } from 'three';

const MARBLES_SEGMENT = 16;
const HOLD_POS = new Vector3(0, -100, 0);
const HOLD_MATRIX = new Matrix4().makeScale(0, 0, 0).setPosition(HOLD_POS);

export type MarblesHandle = { spawn: () => void };
export type MarblesProps = {
  ref?: Ref<MarblesHandle>;
  count?: number;
  marbleSize?: number;
  spawnWidth?: number;
  spawnHeight?: number;
  spawnX?: number;
  spawnY?: number;
  resetBound?: [[number, number, number], [number, number, number]];
  resetX?: number;
  resetY?: number;
  automatic?: boolean;
};

export const Marbles = ({
  ref,
  marbleSize = 0.3,
  count = 500,
  spawnWidth = 5,
  spawnHeight = 1,
  spawnX = -12,
  spawnY = 5,
  resetBound = [
    [spawnX - 5, -5, -5],
    [13, spawnY + 1, 5],
  ],
  automatic = true,
}: MarblesProps) => {
  const spawnIndex = useRef(0);
  const bodiesRef = useRef<RapierRigidBody[]>(null);
  const meshRef = useRef<InstancedMesh>(null);

  // Initialize Marbles
  const positions = useMemo(
    () => Array.from({ length: count }).map(() => [HOLD_POS.x, HOLD_POS.y, HOLD_POS.z] as const),
    [count]
  );

  const despawnMarble = (index: number) => {
    const body = bodiesRef.current?.[index];
    if (!body || !meshRef.current) {
      throw new Error('Marble does not exist!');
    }

    body.setTranslation(HOLD_POS, false);
    body.sleep();
    body.setEnabled(false);

    meshRef.current.setMatrixAt(index, HOLD_MATRIX);
    meshRef.current.instanceMatrix.needsUpdate = true;
  };

  // Disable all marbles
  useLayoutEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const checkAndDisable = () => {
      if (!bodiesRef.current?.length || !meshRef.current) {
        timeoutId = setTimeout(checkAndDisable, 50);
        return;
      }

      for (let i = 0; i < count; i++) {
        despawnMarble(i);
      }
    };

    checkAndDisable();
    return () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [count]);

  // Spawn Logic
  const spawn = useLatestCallback(() => {
    if (!meshRef.current || !bodiesRef.current) {
      return;
    }

    const index = spawnIndex.current++;
    spawnIndex.current %= count;

    const initPosition = new Vector3(
      (Math.random() - 0.5) * spawnHeight + spawnX,
      spawnY,
      (Math.random() - 0.5) * spawnWidth
    );

    // Initialize RigidBody
    const body = bodiesRef.current[index];
    body.setTranslation(initPosition, true);
    body.setLinvel({ x: 0, y: -Math.random() * 2, z: 0 }, true);
    body.setAngvel(
      { x: Math.random() - 0.5, y: Math.random() - 0.5, z: Math.random() - 0.5 },
      true
    );
    body.setEnabled(true);
    body.wakeUp();

    // Initialize Mesh
    const matrix = new Matrix4().makeScale(1, 1, 1).setPosition(initPosition);
    meshRef.current.setMatrixAt(index, matrix);
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  useEffect(() => {
    if (!automatic) {
      return () => {};
    }

    const intervalId = setInterval(() => {
      if (!meshRef.current || !bodiesRef.current) {
        return;
      }

      spawn();
    }, 100);

    return () => clearInterval(intervalId);
  }, [automatic, spawn]);

  useImperativeHandle(ref, () => ({ spawn }));

  // Despawn Logic
  useFrame(() => {
    if (!meshRef.current || !bodiesRef.current) {
      return;
    }

    bodiesRef.current.forEach((body, i) => {
      if (body.isSleeping()) {
        return;
      }

      const translation = body.translation();
      if (
        translation.x < resetBound[0][0] ||
        translation.x > resetBound[1][0] ||
        translation.y < resetBound[0][1] ||
        translation.y > resetBound[1][1] ||
        translation.z < resetBound[0][2] ||
        translation.z > resetBound[1][2]
      ) {
        despawnMarble(i);
      }
    });
  });

  return (
    <InstancedRigidBodies
      ref={bodiesRef}
      instances={positions.map((pos, i) => ({
        key: i,
        position: pos,
        rotation: [0, 0, 0],
      }))}
      colliders="ball"
      restitution={0.7}
      friction={0.1}
      mass={1}
    >
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, count]}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[marbleSize, MARBLES_SEGMENT, MARBLES_SEGMENT]} />
        <meshStandardMaterial roughness={0.1} metalness={0.2} />
      </instancedMesh>
    </InstancedRigidBodies>
  );
};

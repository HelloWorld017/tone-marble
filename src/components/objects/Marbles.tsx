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
  resetY?: number;
  automatic?: boolean;
};

export const Marbles = ({
  ref,
  marbleSize = 0.3,
  count = 500,
  spawnWidth = 5,
  spawnHeight = 1,
  spawnX = -10,
  spawnY = 10,
  resetY = -5,
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

  // Sleep all marbles
  useLayoutEffect(() => {
    if (!meshRef.current) {
      return;
    }

    for (let i = 0; i < count; i++) {
      meshRef.current.setMatrixAt(i, HOLD_MATRIX);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [count]);

  useLayoutEffect(() => {
    bodiesRef.current?.forEach(body => {
      body.sleep();
    });
  }, []);

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

    let needsUpdate = false;
    bodiesRef.current.forEach((body, i) => {
      if (body.isSleeping()) {
        return;
      }

      if (body.translation().y < resetY) {
        // Clean RigidBody
        body.sleep();

        // Clean Mesh
        meshRef.current!.setMatrixAt(i, HOLD_MATRIX);
        needsUpdate = true;
      }
    });

    if (needsUpdate) {
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
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

import { CuboidCollider, RigidBody } from '@react-three/rapier';

type FrameProps = {
  planeWidth: number;
  planeHeight: number;
  planeY?: number;
  planeAngle: number;
  holeHeight?: number;
  height: number;
};

export const Frame = ({
  planeWidth,
  planeHeight,
  planeY = -0.25,
  planeAngle,
  holeHeight = 2,
  height,
}: FrameProps) => {
  const wallY = (Math.tan(planeAngle) * (planeHeight / 2) + height) / 2;

  return (
    <>
      <RigidBody type="fixed" friction={0.5} restitution={0.2} colliders="cuboid">
        <mesh
          receiveShadow
          position={[-holeHeight / 2, planeY, -0.5]}
          rotation={[0, 0, planeAngle]}
        >
          <boxGeometry args={[planeHeight - holeHeight, 0.2, planeWidth]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </RigidBody>

      <RigidBody type="fixed">
        <CuboidCollider
          args={[planeHeight / 2, height / 2, 0.5]}
          position={[0, wallY, -planeWidth / 2]}
        />
        <CuboidCollider
          args={[planeHeight / 2, height / 2, 0.5]}
          position={[0, wallY, planeWidth / 2]}
        />
        <CuboidCollider
          args={[0.5, height / 2, planeWidth / 2]}
          position={[planeHeight / 2, wallY, 0]}
        />
        <CuboidCollider
          args={[0.5, height / 2, planeWidth / 2]}
          position={[-planeHeight / 2, wallY, 0]}
        />
      </RigidBody>
    </>
  );
};

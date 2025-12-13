import { DEG2RAD } from '@/constants';

const MIN_POUR_ANGLE = 70 * DEG2RAD;
const MAX_POUR_ANGLE = 150 * DEG2RAD;

export const calculateFlowRate = ([, beta, gamma]: [number, number, number]) => {
  const cosTheta = Math.cos(beta * DEG2RAD) * Math.cos(gamma * DEG2RAD);
  const tiltAngle = Math.acos(cosTheta);
  return (
    Math.max(Math.min(tiltAngle, MAX_POUR_ANGLE) - MIN_POUR_ANGLE, 0) /
    (MAX_POUR_ANGLE - MIN_POUR_ANGLE)
  );
};

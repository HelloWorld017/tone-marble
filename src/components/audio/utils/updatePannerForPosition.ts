import type { Position } from '@/types/Position';

const MAX_DISTANCE = 100;

export const updatePannerForPosition = (panner: PannerNode, position: Position) => {
  panner.panningModel = 'equalpower';
  panner.distanceModel = 'inverse';
  panner.refDistance = 1;
  panner.maxDistance = MAX_DISTANCE;
  panner.positionX.value = position[0];
  panner.positionY.value = position[1];
  panner.positionZ.value = position[2];
};

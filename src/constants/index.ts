export const DEG2RAD = (1 / 180) * Math.PI;
export const PEER_ID_PREFIX = 'tone-marble-';

export const RECORD_SIZE = 2048;
export const POINTER_ADVANCE = 0.5;

export const PILLAR_ROWS = 18;
export const PILLAR_SELECTION_LEVEL = Math.ceil(PILLAR_ROWS / 5);
export const PILLAR_SELECTION_SLIDE = Math.ceil(PILLAR_ROWS / PILLAR_SELECTION_LEVEL);
export const PILLAR_SELECTION_FILTER = (1 << PILLAR_SELECTION_SLIDE) - 1;
export const PILLAR_SELECTION_ALL = PILLAR_SELECTION_LEVEL;

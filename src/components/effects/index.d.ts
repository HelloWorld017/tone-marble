import type { Effect, EffectComposer, Pass } from 'postprocessing';
import type { Scene, Camera } from 'three';

export const SSGIEffect: Effect &
  (new (
    composer: EffectComposer,
    scene: Scene,
    camera: Camera,
    config: Record<string, unknown>
  ) => SSGIEffect);

export const VelocityDepthNormalPass: Pass &
  (new (scene: Scene, camera: Camera) => VelocityDepthNormalPass);

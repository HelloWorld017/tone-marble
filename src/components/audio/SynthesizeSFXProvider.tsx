import { buildContext } from '@/utils/context';
import { useSynthesizeSFXSound } from './hooks/useSynthesizeSFXSound';

export const [SynthesizeSFXProvider, useSynthesizeSFX] = buildContext(useSynthesizeSFXSound);

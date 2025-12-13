import { useCallback, useRef } from 'react';
import { buildContext } from '@/utils/context';

export const [FlowRateProvider, useFlowRate] = buildContext(() => {
  const flowRateRef = useRef<number>(0);
  const readFlowRate = useCallback(() => flowRateRef.current, []);
  const updateFlowRate = useCallback((nextFlowRate: number) => {
    flowRateRef.current = nextFlowRate;
  }, []);

  return {
    readFlowRate,
    updateFlowRate,
  };
});

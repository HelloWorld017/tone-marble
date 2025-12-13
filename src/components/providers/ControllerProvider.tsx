import { Peer } from 'peerjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PEER_ID_PREFIX } from '@/constants';
import { useLatestCallback } from '@/hooks/useLatestCallback';
import { buildContext } from '@/utils/context';
import { calculateFlowRate } from '@/utils/flowRate';
import type { Position } from '@/types/Position';
import type { DataConnection } from 'peerjs';

export type Device = {
  id: string;
  connection: DataConnection;
};

const MAX_TIMEOUT = 5000;

export const [ControllerProvider, useController] = buildContext(() => {
  const flowRateRef = useRef<number>(0);
  const orientationRef = useRef<Position>([0, 0, 0]);
  const readFlowRate = useCallback(() => flowRateRef.current, []);
  const updateFlowRate = useCallback((nextFlowRate: number) => {
    flowRateRef.current = nextFlowRate;
  }, []);

  const [epoch, setEpoch] = useState(0);
  const [selfId, setSelfId] = useState<string | null>(null);
  useEffect(() => {
    setSelfId(() => Math.random().toString(36).slice(2, 7));
  }, [epoch]);

  const [device, setDevice] = useState<Device | null>(null);
  const disconnect = useLatestCallback(() => {
    device?.connection.close();
    setEpoch(epoch => epoch + 1);
  });

  const heartBeatRef = useRef<number | null>(null);
  useEffect(() => {
    if (!selfId) {
      return;
    }

    const peer = new Peer(PEER_ID_PREFIX + selfId);
    peer.on('connection', connection => {
      heartBeatRef.current = performance.now();
      setDevice({ id: connection.connectionId, connection });

      connection.on('data', payload => {
        if (!(payload instanceof ArrayBuffer) || payload.byteLength !== 12) {
          return;
        }

        const buffer = new Float32Array(payload);
        orientationRef.current[0] = buffer[0];
        orientationRef.current[1] = buffer[1];
        orientationRef.current[2] = buffer[2];

        heartBeatRef.current = performance.now();
        flowRateRef.current = calculateFlowRate(orientationRef.current);
      });

      connection.on('close', () => {
        setDevice(null);
      });
    });

    return () => {
      peer.destroy();
    };
  }, [selfId]);

  useEffect(() => {
    if (!device) {
      return;
    }

    const intervalId = setInterval(() => {
      if (heartBeatRef.current && performance.now() - heartBeatRef.current > MAX_TIMEOUT) {
        device.connection.close();
        setDevice(null);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [device]);

  return {
    selfId,
    device,
    setDevice,
    disconnect,
    heartBeatRef,
    orientationRef,
    readFlowRate,
    updateFlowRate,
  };
});

export const ControllerHandler = () => {};

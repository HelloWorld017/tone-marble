import { css, Global, ThemeProvider } from '@emotion/react';
import { Peer } from 'peerjs';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PEER_ID_PREFIX } from './constants';
import { DEFAULT_THEME } from './constants/theme';
import { useLatestCallback } from './hooks/useLatestCallback';
import { globalStyle } from './utils/css';
import type { Theme } from '@emotion/react';
import type { DataConnection } from 'peerjs';

const appStyle = (theme: Theme) => css`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  justify-content: center;
  align-items: center;
  text-align: center;

  background: ${theme.colors.bgBase};
  color: ${theme.colors.fillPrimary};
  font-size: 2rem;

  button {
    cursor: pointer;
    font-size: 1.4rem;
    margin-top: 1rem;
    border-radius: 0.6rem;
    padding: 1rem 2rem;
    background: ${theme.colors.bgElevated};
    border: 1px solid ${theme.colors.fillLine};
  }
`;

type DeviceOrientationEventIOS = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};
const getRequestPermission = (): (() => Promise<boolean>) | null => {
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    'requestPermission' in DeviceOrientationEvent &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    return async () =>
      (await (DeviceOrientationEvent as DeviceOrientationEventIOS).requestPermission?.()) ===
      'granted';
  }

  return null;
};

const ConnectApp = () => {
  const [query] = useState(() => location.search.slice(1));
  const [peer, setPeer] = useState<Peer | null>(null);
  useEffect(() => {
    let peer = new Peer();
    peer.on('open', () => setPeer(peer));
    return () => {
      peer.destroy();
      setPeer(null);
    };
  }, []);

  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [state, setState] = useState('Not Connected');
  useEffect(() => {
    if (!peer) {
      return () => {};
    }

    let connection: DataConnection | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isCanceled = false;
    const createConnection = () => {
      setState('Connecting');
      connection = peer.connect(`${PEER_ID_PREFIX}${query}`);
      connection.on('open', () => {
        setState('Connected');
        setConnection(connection);
      });

      connection.on('error', error => {
        setState('Error');
        console.error(error);
      });

      connection.on('close', () => {
        setConnection(null);
        if (!isCanceled) {
          timeoutId = setTimeout(() => createConnection(), 1000);
        }
      });
    };

    createConnection();
    return () => {
      isCanceled = true;

      if (connection !== null) {
        connection.close();
      }

      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      setState('Not Connected');
      setConnection(null);
    };
  }, [query, peer]);

  const [lastOrientationRef] = useState(new Float32Array(3));
  const onDeviceOrientation = useLatestCallback((event: DeviceOrientationEvent) => {
    lastOrientationRef[0] = event.alpha ?? 0;
    lastOrientationRef[1] = event.beta ?? 0;
    lastOrientationRef[2] = event.gamma ?? 0;
  });

  const [requestPermission, setRequestPermission] = useState(() => getRequestPermission());

  useEffect(() => {
    if (!requestPermission) {
      window.addEventListener('deviceorientation', onDeviceOrientation);
      return () => window.removeEventListener('deviceorientation', onDeviceOrientation);
    }

    return () => {};
  }, [onDeviceOrientation, requestPermission]);

  useEffect(() => {
    if (!connection) {
      return () => {};
    }

    const intervalId = setInterval(() => {
      void connection?.send(lastOrientationRef);
    }, 16);

    return () => clearInterval(intervalId);
  }, [connection]);

  return (
    <ThemeProvider theme={DEFAULT_THEME}>
      <Global styles={globalStyle} />
      <div css={appStyle}>
        <span>{'ondeviceorientation' in window ? state : 'No orientation supported'}</span>
        {requestPermission && (
          <button
            type="button"
            onClick={async () => {
              if (await requestPermission()) {
                setRequestPermission(null);
              }
            }}
          >
            Allow Permissions
          </button>
        )}
      </div>
    </ThemeProvider>
  );
};

createRoot(document.querySelector('#app')!).render(<ConnectApp />);

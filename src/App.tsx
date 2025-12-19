import { Global, ThemeProvider } from '@emotion/react';
import { Scene } from './components/Scene';
import {
  AudioContextClickInitializer,
  AudioContextProvider,
} from './components/audio/AudioContextProvider';
import { ChromaDetector } from './components/audio/ChromaDetector';
import { SynthesizeMarbleProvider } from './components/audio/SynthesizeMarbleProvider';
import { SynthesizeProvider } from './components/audio/SynthesizeProvider';
import { SynthesizeRhythm } from './components/audio/SynthesizeRhythm';
import { SynthesizeSFXProvider } from './components/audio/SynthesizeSFXProvider';
import { ControllerProvider } from './components/providers/ControllerProvider';
import {
  InterfaceStateProvider,
  useInterfaceState,
} from './components/providers/InterfaceStateProvider';
import { PitchMapProvider } from './components/providers/PitchMapProvider';
import { Sidebar } from './components/ui/Sidebar';
import { DEFAULT_THEME } from './constants/theme';
import { globalStyle } from './utils/css/global';
import type { ReactNode } from 'react';

const AppSynthesizeProvider = ({ children }: { children: ReactNode }) => {
  const additionalGain = useInterfaceState(state => state.additionalGain);
  return <SynthesizeProvider gain={additionalGain}>{children}</SynthesizeProvider>;
};

const AppProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={DEFAULT_THEME}>
    <Global styles={[globalStyle]} />
    <AudioContextProvider>
      <AudioContextClickInitializer />
      <ControllerProvider>
        <InterfaceStateProvider>
          <PitchMapProvider>
            <ChromaDetector />
            <AppSynthesizeProvider>
              <SynthesizeSFXProvider>
                <SynthesizeMarbleProvider>
                  <SynthesizeRhythm />
                  {children}
                </SynthesizeMarbleProvider>
              </SynthesizeSFXProvider>
            </AppSynthesizeProvider>
          </PitchMapProvider>
        </InterfaceStateProvider>
      </ControllerProvider>
    </AudioContextProvider>
  </ThemeProvider>
);

export const App = () => (
  <AppProviders>
    <Scene />
    <Sidebar />
  </AppProviders>
);

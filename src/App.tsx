import { Global, ThemeProvider } from '@emotion/react';
import { Scene } from './components/Scene';
import {
  AudioContextClickInitializer,
  AudioContextProvider,
} from './components/audio/AudioContextProvider';
import { ChromaDetector } from './components/audio/ChromaDetector';
import { SynthesizeButtonProvider } from './components/audio/SynthesizeButtonProvider';
import { SynthesizeMarbleProvider } from './components/audio/SynthesizeMarbleProvider';
import { SynthesizePowerProvider } from './components/audio/SynthesizePowerProvider';
import { SynthesizeProvider } from './components/audio/SynthesizeProvider';
import { SynthesizeRhythm } from './components/audio/SynthesizeRhythm';
import { ControllerProvider } from './components/providers/ControllerProvider';
import { InterfaceStateProvider } from './components/providers/InterfaceStateProvider';
import { PitchMapProvider } from './components/providers/PitchMapProvider';
import { Sidebar } from './components/ui/Sidebar';
import { DEFAULT_THEME } from './constants/theme';
import { globalStyle } from './utils/css/global';
import type { ReactNode } from 'react';

const AppProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={DEFAULT_THEME}>
    <Global styles={[globalStyle]} />
    <AudioContextProvider>
      <AudioContextClickInitializer />
      <ControllerProvider>
        <InterfaceStateProvider>
          <PitchMapProvider>
            <ChromaDetector />
            <SynthesizeProvider>
              <SynthesizeButtonProvider>
                <SynthesizeMarbleProvider>
                  <SynthesizePowerProvider>
                    <SynthesizeRhythm />
                    {children}
                  </SynthesizePowerProvider>
                </SynthesizeMarbleProvider>
              </SynthesizeButtonProvider>
            </SynthesizeProvider>
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

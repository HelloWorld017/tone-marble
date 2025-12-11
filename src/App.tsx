import { Global } from '@emotion/react';
import { Scene } from './components/Scene';
import { globalStyle } from './utils/css/global';

export const App = () => (
  <>
    <Global styles={[globalStyle]} />
    <Scene />
  </>
);

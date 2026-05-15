import { registerRootComponent } from 'expo';
import App from './App';

if (typeof window !== 'undefined') {
  // Web: load Skia WASM before rendering
  const { LoadSkiaWeb } = require('@shopify/react-native-skia/lib/commonjs/web');
  LoadSkiaWeb({ locateFile: (file: string) => `/Evolution/${file}` })
    .then(() => {
      registerRootComponent(App);
    })
    .catch((err: unknown) => {
      console.error('Skia failed to load:', err);
      registerRootComponent(App);
    });
} else {
  registerRootComponent(App);
}

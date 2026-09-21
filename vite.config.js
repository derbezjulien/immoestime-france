import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true',
      hmrNotifier: true,
      navigationNotifier: true,
      analyticsTracker: true,
      visualEditAgent: true
    }),
    react(),
    // Compatibilité navigateurs anciens : génère un second bundle (SystemJS + polyfills
    // core-js / regenerator-runtime) chargé automatiquement via <script nomodule> par les
    // navigateurs qui ne comprennent pas <script type="module"> (vieux WebView Android,
    // Safari < 11, anciennes tablettes…). Les navigateurs modernes chargent le bundle ES.
    legacy({
      targets: [
        'defaults',
        'iOS >= 9',
        'Android >= 4.4',
        'Chrome >= 30',
        'Firefox >= 48',
        'Safari >= 9'
      ],
      // Polyfills automatiques (core-js) détectés selon les cibles, pour les deux bundles.
      polyfills: true,
      modernPolyfills: true,
      // Indispensable pour async/await sur les très vieux moteurs JS.
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],
  build: {
    // Cible du bundle moderne : ES2017 (async/await) reste compatible avec les
    // navigateurs récents ET avec les plus anciens qui supportent <script type="module">
    // (Safari 10.1, Firefox 60, Chrome 56). ES2018 (object spread) serait cassant pour
    // Safari 10.1. La syntaxe plus récente est abaisée par esbuild.
    target: ['es2017', 'safari10.1', 'chrome56', 'firefox60']
  }
});
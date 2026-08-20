import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
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
    react()
  ],
  build: {
    // Cible des navigateurs plus anciens (legacy) : ES2018 reste compatible avec les
    // vieilles tablettes / anciens navigateurs (Safari 11.1+, Chrome 60+, Firefox 60+)
    // tout en permettant à esbuild d'abaisser la syntaxe moderne (optional chaining,
    // nullish coalescing...) sans échec sur le destructuring.
    target: ['es2018', 'safari11.1', 'chrome60', 'firefox60']
  }
});
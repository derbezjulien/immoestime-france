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
    // Cible des navigateurs plus anciens (legacy) : transpile la syntaxe moderne
    // (optional chaining, nullish coalescing...) vers ES2015 pour éviter l'écran
    // blanc sur les vieux appareils / anciens navigateurs.
    target: ['es2015', 'safari11', 'chrome61', 'firefox60', 'edge16']
  }
});
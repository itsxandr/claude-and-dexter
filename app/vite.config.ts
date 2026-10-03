/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Update the saved app files on the next load, no prompt needed.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: '[APP NAME]',
        short_name: '[APP NAME]',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1f6feb',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        // /api/* must always go to the network, never get the cached app page.
        // No runtime cache rule is added for /api/*.
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  test: {
    // No tests exist yet; do not fail `npm test` because of that.
    passWithNoTests: true,
  },
})

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
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'KodiGo',
        short_name: 'KodiGo',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#1f6feb',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
                // Save the fonts too, so text looks right with no internet.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
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

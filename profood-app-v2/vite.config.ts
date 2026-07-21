import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// `base: './'` makes the built index.html reference assets with relative paths,
// which is required when Capacitor serves the bundle from a `file://` (iOS)
// or `https://localhost` (Android) WebView origin. Browser dev (`npm run dev`)
// is unaffected because Vite ignores `base` in dev.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // PWA : app installable + coquille hors-ligne. Workbox précache les assets
    // hashés du build et se met à jour tout seul (autoUpdate).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/logo-profood-symbole.svg'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2}'],
        // Les photos produits (~9 Mo) ne sont pas précachées : servies au
        // besoin puis mises en cache runtime (stale-while-revalidate).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/images/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'profood-images',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'profood-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      manifest: {
        name: 'PROFOOD — Boucherie halal Dakar',
        short_name: 'PROFOOD',
        description: 'Commandez vos découpes de viande halal, préparées et livrées à Dakar.',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f6f3ee',
        theme_color: '#f07c24',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// `base: './'` makes the built index.html reference assets with relative paths,
// which is required when Capacitor serves the bundle from a `file://` (iOS)
// or `https://localhost` (Android) WebView origin. Browser dev (`npm run dev`)
// is unaffected because Vite ignores `base` in dev.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})

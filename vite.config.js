import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      // Lets Firebase Auth popups observe window.closed for signInWithPopup.
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})

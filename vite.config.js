import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/bienstar-total-public/',
  plugins: [react()],
  resolve: {
    alias: {
      cookie: '/src/empty-module.js'
    }
  }
})

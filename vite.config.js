import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/bienstar-total-public/', // ruta base para GitHub Pages
  plugins: [react()],
  build: {
    rollupOptions: {
      // Ignorar el paquete 'cookie' que rompe el build
      external: ['cookie']
    }
  },
  resolve: {
    alias: {
      // Si alguna librería intenta usar Node built-ins, puedes redirigirlos a vacío
      'cookie': '/empty-module.js'
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/bienstar-total-public/',
  plugins: [react()],
})

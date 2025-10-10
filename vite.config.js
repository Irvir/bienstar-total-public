import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: "./", // 👈 Esto genera rutas relativas compatibles con Vercel
  plugins: [react()],
});

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/LD-58-Forest-Hoarder/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
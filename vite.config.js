import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: [
      '5173-i1woejibay2m6i8rdfue1-e315901d.manusvm.computer',
      'localhost',
      '127.0.0.1',
      '0.0.0.0'
    ],
    port: 5173,
    strictPort: true
  }
})

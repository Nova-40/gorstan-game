/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Vite build configuration.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
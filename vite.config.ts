// Module: vite.config.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ✅ ensures @ maps to /src
    },
  },
  build: {
    // Increase chunk size warning limit for Vercel
    chunkSizeWarningLimit: 1000,
    // Enable sourcemaps for production debugging
    sourcemap: false,
    // Minimize output
    minify: 'terser',
    // Target modern browsers for better optimization
    target: 'esnext',
    rollupOptions: {
      output: {
        // Optimize chunk naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        manualChunks: {
          // Split large dependencies into separate chunks
          'framer-motion': ['framer-motion'],
          'lucide-react': ['lucide-react'],
          'react-vendor': ['react', 'react-dom'],
          // Split game engine into separate chunks
          'game-engine': [
            './src/engine/commandParser',
            './src/engine/wanderingNPCController',
            './src/engine/librarianController',
            './src/engine/mrWendellController'
          ],
          'game-logic': [
            './src/logic/achievementEngine',
            './src/logic/codexTracker',
            './src/state/scoreManager',
            './src/state/scoreEffects'
          ]
        }
      }
    }
  }
});


/*
  Gorstan – Copyright © 2025 Geoff Webster. All Rights Reserved.
  
  You may play Gorstan for free for personal entertainment only.
  You may NOT copy, redistribute, modify, or sell the game, its code, 
  artwork, storyline, or any other part without written permission.
  
  Gorstan includes third-party libraries and assets:
    - React © Meta Platforms, Inc. – MIT Licence
    - Lucide Icons © Lucide Contributors – ISC Licence
    - Flaticon icons © Flaticon.com – Free Licence with attribution
    - Other packages under their respective licences (see package.json)

  Full licence terms: see EULA.md in the project root.
*/

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


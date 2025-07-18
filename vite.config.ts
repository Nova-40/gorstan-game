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
});


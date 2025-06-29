// MIT License © 2025 Geoff Webster
// Gorstan v2.5
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// Correct PostCSS config: only the plugins array is needed.
// Remove unrelated fields like name, version, type, etc.

export default {
  plugins: [tailwindcss, autoprefixer]
};

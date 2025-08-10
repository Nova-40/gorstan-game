// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: postcss.config.js
// Path: postcss.config.js


// MIT License © 2025 Geoff Webster
// Gorstan v2.5
import tailwindcssPostCSS from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

// Correct PostCSS config for Tailwind CSS v4.x
export default {
  plugins: [tailwindcssPostCSS, autoprefixer]
};
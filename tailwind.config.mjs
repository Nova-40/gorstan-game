// TailwindCSS Configuration File
// This file customizes the TailwindCSS framework for the Gorstan project.
// It extends the default theme with custom fonts, colors, spacing, animations, and plugins to enhance the game's styling and interactivity.

import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';

export default {
  // Specify the files Tailwind should scan for class names
  content: [
    './index.html', // Include the main HTML file
    './src/**/*.{js,ts,jsx,tsx}', // Include all JavaScript, TypeScript, and JSX/TSX files in the src directory
  ],
  theme: {
    extend: {
      // Extend the default font families
      fontFamily: {
        handwriting: ['Caveat', 'cursive'], // Handwriting-style font for special effects
        sans: ['Roboto', 'sans-serif'], // Clean, modern sans-serif font for general text
      },
      // Extend the default color palette with custom colors
      colors: {
        'ayla-yellow': '#f9d29d', // Custom yellow for Ayla-related elements
        'player-gray': '#d1d5db', // Neutral gray for player UI elements
        'gorstan-blue': '#1e3a8a', // Custom blue for Gorstan branding
        'danger-red': '#ef4444', // Bright red for warnings and errors
        'success-green': '#10b981', // Green for success messages
        'dark-bg': '#121212', // Dark background for immersive gameplay
      },
      // Add custom box shadows
      boxShadow: {
        glow: '0 0 10px rgba(255, 255, 255, 0.5)', // Glowing shadow effect for interactive elements
        intense: '0 0 20px rgba(255, 255, 255, 0.8)', // Intense glow for special effects
      },
      // Add custom spacing values
      spacing: {
        '128': '32rem', // Large spacing for wide layouts
        '144': '36rem', // Extra-large spacing
        '160': '40rem', // Additional custom spacing
      },
      // Add custom border radius values
      borderRadius: {
        xl: '1.5rem', // Large border radius for rounded elements
        '2xl': '2rem', // Extra-large border radius
      },
      // Add custom animations
      animation: {
        fadeIn: 'fadeIn 1s ease-in-out', // Fade-in animation
        fadeOut: 'fadeOut 1s ease-in-out', // Fade-out animation
        bounce: 'bounce 1s infinite', // Bounce animation
        pulseGlow: 'pulseGlow 1.5s infinite alternate ease-in-out', // Pulsing glow animation
      },
      // Define custom keyframes for animations
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        fadeOut: {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
        pulseGlow: {
          '0%': { boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)' },
        },
      },
    },
  },
  plugins: [
    forms, // Tailwind Forms plugin for better form styling
    typography, // Typography plugin for rich text styling
    aspectRatio, // Aspect Ratio plugin for responsive media
  ],
};
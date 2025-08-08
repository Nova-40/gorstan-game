// src/celebrate/gen/run-generator.ts
// Simple runner for the celebration data generator

import { generateAllCelebrationData } from './build-all';

// Run the generator
generateAllCelebrationData()
  .then(() => console.log('🎉 All celebration data generated successfully!'))
  .catch(error => console.error('❌ Error generating celebration data:', error));

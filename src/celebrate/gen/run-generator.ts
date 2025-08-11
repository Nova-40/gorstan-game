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

// src/celebrate/gen/run-generator.ts
// Simple runner for the celebration data generator

import { generateAllCelebrationData } from './build-all';

// Run the generator
generateAllCelebrationData()
  .then(() => console.log('🎉 All celebration data generated successfully!'))
  .catch(error => console.error('❌ Error generating celebration data:', error));

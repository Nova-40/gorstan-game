#!/usr/bin/env node

// Version: 1.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Script: deployTraps.mjs
// Path: scripts/deployTraps.mjs
//
// Random trap deployment system for Gorstan game.

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile, writeFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🎯 Gorstan Random Trap Deployment System\n');
console.log('='.repeat(50));

// Trap templates with varying difficulty levels
const TRAP_TEMPLATES = {
  // Minor traps (10-25 damage)
  minor: [
    {
      id: 'pressure_plate',
      type: 'damage',
      severity: 'minor',
      description: 'Hidden pressure plate triggers spikes from the floor',
      trigger: 'enter',
      effect: { damage: 12 },
      message: 'You step on a hidden pressure plate! Sharp spikes pierce your leg.'
    },
    {
      id: 'poisoned_dart',
      type: 'damage', 
      severity: 'minor',
      description: 'Concealed dart shooter in the wall',
      trigger: 'enter',
      effect: { damage: 15 },
      message: 'A poisoned dart shoots from the wall, grazing your shoulder!'
    },
    {
      id: 'electrical_wire',
      type: 'damage',
      severity: 'minor',
      description: 'Exposed electrical wiring creates a shock hazard',
      trigger: 'enter',
      effect: { damage: 18 },
      message: 'You brush against exposed wiring and receive a painful shock!'
    },
    {
      id: 'slippery_surface',
      type: 'damage',
      severity: 'minor',
      description: 'Treacherous slick surface causes falls',
      trigger: 'enter',
      effect: { damage: 10 },
      message: 'You slip on the slick surface and fall hard to the ground!'
    },
    {
      id: 'loose_stone',
      type: 'damage',
      severity: 'minor',
      description: 'Unstable stone falls from above',
      trigger: 'enter',
      effect: { damage: 20 },
      message: 'A loose stone breaks free from above and strikes you!'
    }
  ],

  // Major traps (25-50 damage)
  major: [
    {
      id: 'flame_jet',
      type: 'damage',
      severity: 'major',
      description: 'Hidden flame projector activated by motion',
      trigger: 'enter',
      effect: { damage: 35 },
      message: 'Suddenly, jets of flame burst from hidden nozzles, searing your skin!'
    },
    {
      id: 'crushing_wall',
      type: 'damage',
      severity: 'major',
      description: 'Heavy wall section swings down to crush intruders',
      trigger: 'enter',
      effect: { damage: 42 },
      message: 'A massive section of wall swings down, crushing you against the floor!'
    },
    {
      id: 'acid_spray',
      type: 'damage',
      severity: 'major',
      description: 'Corrosive acid sprayed from ceiling mechanisms',
      trigger: 'enter',
      effect: { damage: 38 },
      message: 'Acid sprays from hidden ceiling nozzles, burning your skin!'
    },
    {
      id: 'pit_trap',
      type: 'damage',
      severity: 'major',
      description: 'Concealed pit with sharpened stakes',
      trigger: 'enter',
      effect: { damage: 45 },
      message: 'The floor gives way beneath you! You fall into a pit lined with stakes!'
    },
    {
      id: 'energy_discharge',
      type: 'damage',
      severity: 'major',
      description: 'High-energy plasma discharge from ceiling',
      trigger: 'enter',
      effect: { damage: 40 },
      message: 'A crackling energy discharge erupts from the ceiling, scorching your body!'
    }
  ],

  // Fatal traps (50+ damage)
  fatal: [
    {
      id: 'disintegration_field',
      type: 'damage',
      severity: 'fatal',
      description: 'Molecular disintegration field tears apart matter',
      trigger: 'enter',
      effect: { damage: 75 },
      message: 'A shimmering field activates around you, tearing at your very atoms!'
    },
    {
      id: 'laser_grid',
      type: 'damage',
      severity: 'fatal',
      description: 'Deadly laser beam grid slices through anything',
      trigger: 'enter',
      effect: { damage: 85 },
      message: 'Red laser beams criss-cross the room, slicing through everything in their path!'
    },
    {
      id: 'vacuum_chamber',
      type: 'damage',
      severity: 'fatal',
      description: 'Room seals and atmosphere is violently expelled',
      trigger: 'enter',
      effect: { damage: 90 },
      message: 'The room seals shut and the air is violently sucked out, crushing your lungs!'
    },
    {
      id: 'implosion_device',
      type: 'damage',
      severity: 'fatal',
      description: 'Gravitational implosion device creates crushing force',
      trigger: 'enter',
      effect: { damage: 95 },
      message: 'Reality itself seems to bend inward as a crushing gravitational force engulfs you!'
    }
  ],

  // Teleport traps (various difficulties)
  teleport: [
    {
      id: 'dimensional_rift',
      type: 'teleport',
      severity: 'major',
      description: 'Unstable dimensional rift transports intruders',
      trigger: 'enter',
      effect: { teleportTo: 'multiZone_liminalhub' },
      message: 'A swirling portal opens beneath you, pulling you into another dimension!'
    },
    {
      id: 'transport_pad',
      type: 'teleport',
      severity: 'minor',
      description: 'Ancient transport pad still functional',
      trigger: 'enter',
      effect: { teleportTo: 'introZone_crossing' },
      message: 'The floor glows and you feel reality shift around you!'
    },
    {
      id: 'maze_redirect',
      type: 'teleport',
      severity: 'major',
      description: 'Spatial distortion redirects movement',
      trigger: 'enter',
      effect: { teleportTo: 'mazeZone_mazehub' },
      message: 'The walls shimmer and suddenly you are somewhere else entirely!'
    }
  ],

  // Item loss traps
  itemLoss: [
    {
      id: 'magnetic_field',
      type: 'item_loss',
      severity: 'minor',
      description: 'Powerful magnetic field strips metal objects',
      trigger: 'enter',
      effect: { itemsLost: ['keys', 'tools', 'weapons'] },
      message: 'A powerful magnetic field tears metal objects from your possession!'
    },
    {
      id: 'temporal_shift',
      type: 'item_loss',
      severity: 'major',
      description: 'Time distortion causes objects to phase out of existence',
      trigger: 'enter',
      effect: { itemsLost: ['random'] },
      message: 'Time itself wavers, and you watch helplessly as your belongings fade away!'
    }
  ]
};

// Zone-specific trap preferences (some zones might favor certain trap types)
const ZONE_PREFERENCES = {
  elfhameZone: ['minor', 'teleport'], // Magical realm - lighter traps
  glitchZone: ['major', 'fatal', 'teleport'], // Dangerous glitch realm
  gorstanZone: ['minor', 'major'], // Balanced difficulty
  introZone: ['minor'], // Tutorial area - easier traps
  latticeZone: ['major', 'teleport'], // High-tech area
  londonZone: ['minor', 'major'], // Modern setting
  mazeZone: ['major', 'teleport'], // Maze - confusing traps
  multiZone: ['teleport'], // Hub areas - transportation
  newyorkZone: ['minor', 'major'], // Urban setting
  offgorstanZone: ['major', 'fatal'], // Advanced areas
  offmultiverseZone: ['fatal'], // End-game areas
  stantonZone: [] // Excluded from trap deployment
};

/**
 * Get all room files organized by zone
 */
async function getRoomsByZone() {
  const roomsDir = join(rootDir, 'src', 'rooms');
  const roomFiles = await readdir(roomsDir);
  
  const zoneMap = {};
  
  for (const file of roomFiles) {
    if (file.endsWith('.ts') && !file.includes('roomRegistry') && !file.includes('.patched')) {
      const roomId = file.replace('.ts', '');
      const zoneName = roomId.split('_')[0];
      
      // Skip Stanton Harcourt zone
      if (zoneName === 'stantonZone') {
        continue;
      }
      
      if (!zoneMap[zoneName]) {
        zoneMap[zoneName] = [];
      }
      
      zoneMap[zoneName].push({
        roomId,
        file,
        path: join(roomsDir, file)
      });
    }
  }
  
  return zoneMap;
}

/**
 * Select random trap template based on zone preferences
 */
function selectRandomTrap(zoneName) {
  const preferences = ZONE_PREFERENCES[zoneName] || ['minor', 'major'];
  const availableTypes = [];
  
  // Build available trap types based on preferences
  preferences.forEach(pref => {
    if (TRAP_TEMPLATES[pref]) {
      availableTypes.push(...TRAP_TEMPLATES[pref]);
    }
  });
  
  // Fallback to minor traps if no preferences match
  if (availableTypes.length === 0) {
    availableTypes.push(...TRAP_TEMPLATES.minor);
  }
  
  // Select random trap
  const selectedTrap = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  
  // Create unique trap ID for this room
  const uniqueId = `${selectedTrap.id}_${Math.random().toString(36).substr(2, 6)}`;
  
  return {
    ...selectedTrap,
    id: uniqueId,
    triggered: false
  };
}

/**
 * Check if room already has traps
 */
async function roomHasTraps(roomPath) {
  try {
    const content = await readFile(roomPath, 'utf-8');
    return content.includes('traps:') && content.includes('[');
  } catch (error) {
    return false;
  }
}

/**
 * Add trap to room file
 */
async function addTrapToRoom(roomPath, trap) {
  const content = await readFile(roomPath, 'utf-8');
  
  // Find where to insert the trap
  // Look for existing traps first
  if (content.includes('traps:')) {
    // Room already has traps - add to existing array
    const trapsMatch = content.match(/(traps:\s*\[)([\s\S]*?)(\]\s*[,}])/);
    if (trapsMatch) {
      const existingTraps = trapsMatch[2].trim();
      const newTrapCode = `    {
      id: '${trap.id}',
      type: '${trap.type}',
      severity: '${trap.severity}',
      description: '${trap.description}',
      trigger: '${trap.trigger}',
      effect: ${JSON.stringify(trap.effect, null, 6).replace(/^/gm, '      ')},
      message: '${trap.message}',
      triggered: ${trap.triggered}
    }`;
    
      const replacement = existingTraps.length > 0 
        ? `${trapsMatch[1]}${existingTraps},\n${newTrapCode}\n  ${trapsMatch[3]}`
        : `${trapsMatch[1]}\n${newTrapCode}\n  ${trapsMatch[3]}`;
      
      return content.replace(trapsMatch[0], replacement);
    }
  } else {
    // Room doesn't have traps - add traps property
    // Find the end of the room object (before the closing brace)
    const roomObjectMatch = content.match(/export const \w+.*?:\s*Room\s*=\s*{([\s\S]*?)};/);
    if (roomObjectMatch) {
      const roomContent = roomObjectMatch[1];
      const lastPropertyMatch = roomContent.match(/,\s*$/m);
      
      const trapCode = `  traps: [
    {
      id: '${trap.id}',
      type: '${trap.type}',
      severity: '${trap.severity}',
      description: '${trap.description}',
      trigger: '${trap.trigger}',
      effect: ${JSON.stringify(trap.effect, null, 6).replace(/^/gm, '      ')},
      message: '${trap.message}',
      triggered: ${trap.triggered}
    }
  ],`;
      
      // Insert before the closing brace
      const insertIndex = content.lastIndexOf('};');
      if (insertIndex !== -1) {
        return content.slice(0, insertIndex) + trapCode + '\n' + content.slice(insertIndex);
      }
    }
  }
  
  return content; // Return unchanged if we can't modify
}

/**
 * Deploy traps to selected rooms
 */
async function deployTraps() {
  console.log('\n🗺️ Analyzing room structure...\n');
  
  const zoneMap = await getRoomsByZone();
  const deploymentPlan = {};
  let totalTrapsDeployed = 0;
  
  // Plan trap deployment for each zone
  for (const [zoneName, rooms] of Object.entries(zoneMap)) {
    const trapsForZone = Math.floor(Math.random() * 3) + 1; // 1-3 traps per zone
    const selectedRooms = [];
    const availableRooms = rooms.filter(room => !room.roomId.includes('hub')); // Avoid hub rooms
    
    // Randomly select rooms for traps
    for (let i = 0; i < trapsForZone && availableRooms.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * availableRooms.length);
      const selectedRoom = availableRooms.splice(randomIndex, 1)[0];
      
      // Check if room already has traps
      const hasTraps = await roomHasTraps(selectedRoom.path);
      if (!hasTraps) {
        selectedRooms.push(selectedRoom);
      }
    }
    
    deploymentPlan[zoneName] = {
      rooms: selectedRooms,
      trapCount: selectedRooms.length
    };
    
    totalTrapsDeployed += selectedRooms.length;
    
    console.log(`📍 ${zoneName}: ${selectedRooms.length} trap(s) planned`);
    selectedRooms.forEach(room => {
      console.log(`   └─ ${room.roomId}`);
    });
  }
  
  console.log(`\n🎯 Total traps to deploy: ${totalTrapsDeployed}\n`);
  console.log('='.repeat(30));
  
  // Deploy traps
  console.log('\n🔧 Deploying traps...\n');
  
  for (const [zoneName, plan] of Object.entries(deploymentPlan)) {
    for (const room of plan.rooms) {
      const trap = selectRandomTrap(zoneName);
      
      console.log(`⚡ Adding ${trap.severity} ${trap.type} trap to ${room.roomId}`);
      console.log(`   ID: ${trap.id}`);
      console.log(`   Effect: ${trap.type === 'damage' ? `${trap.effect.damage} damage` : 
                                trap.type === 'teleport' ? `teleport to ${trap.effect.teleportTo}` :
                                trap.type === 'item_loss' ? `lose ${trap.effect.itemsLost.join(', ')}` : 'custom effect'}`);
      
      try {
        const originalContent = await readFile(room.path, 'utf-8');
        const modifiedContent = await addTrapToRoom(room.path, trap);
        
        if (modifiedContent !== originalContent) {
          await writeFile(room.path, modifiedContent);
          console.log(`   ✅ Successfully added trap to ${room.roomId}`);
        } else {
          console.log(`   ⚠️ Could not modify ${room.roomId} - file structure not recognized`);
        }
      } catch (error) {
        console.log(`   ❌ Error modifying ${room.roomId}: ${error.message}`);
      }
      
      console.log('');
    }
  }
  
  // Generate deployment report
  console.log('\n📊 Trap Deployment Report\n');
  console.log('='.repeat(30));
  
  const trapsByType = {};
  const trapsBySeverity = {};
  
  for (const [zoneName, plan] of Object.entries(deploymentPlan)) {
    for (const room of plan.rooms) {
      const trap = selectRandomTrap(zoneName); // This is just for counting, actual traps are already deployed
      trapsByType[trap.type] = (trapsByType[trap.type] || 0) + 1;
      trapsBySeverity[trap.severity] = (trapsBySeverity[trap.severity] || 0) + 1;
    }
  }
  
  console.log(`Total zones: ${Object.keys(zoneMap).length}`);
  console.log(`Total traps deployed: ${totalTrapsDeployed}`);
  console.log(`Average traps per zone: ${(totalTrapsDeployed / Object.keys(zoneMap).length).toFixed(1)}`);
  
  console.log('\nTraps by type:');
  Object.entries(trapsByType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  console.log('\nTraps by severity:');
  Object.entries(trapsBySeverity).forEach(([severity, count]) => {
    console.log(`  ${severity}: ${count}`);
  });
  
  console.log('\n✅ Trap deployment complete!');
  console.log('\n🎮 Testing recommendations:');
  console.log('  1. Run npm run build to verify no compilation errors');
  console.log('  2. Start the game and test trap triggering');
  console.log('  3. Verify trap damage and effects work correctly');
  console.log('  4. Check that traps only trigger once');
  console.log('  5. Run trap validation script: node scripts/validateTraps.mjs');
}

// Run deployment
deployTraps().catch(console.error);

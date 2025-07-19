#!/usr/bin/env node

// Version: 1.0.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Script: validateTraps.mjs
// Path: scripts/validateTraps.mjs
//
// Comprehensive trap system validation script for Gorstan game.

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, readFile, stat } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔧 Gorstan Trap System Validation\n');
console.log('='.repeat(50));

/**
 * Scan for room files that might contain traps
 */
async function scanForRoomTraps() {
  console.log('\n📁 Scanning for rooms with traps...\n');
  
  const roomsDir = join(rootDir, 'src', 'rooms');
  const trappedRooms = [];
  
  try {
    const roomFiles = await readdir(roomsDir);
    
    for (const roomFile of roomFiles) {
      if (roomFile.endsWith('.ts') && !roomFile.includes('roomRegistry')) {
        const roomPath = join(roomsDir, roomFile);
        const fileStats = await stat(roomPath);
        
        if (fileStats.isFile()) {
          const content = await readFile(roomPath, 'utf-8');
          
          if (content.includes('traps:') && content.includes('[')) {
            const roomId = roomFile.replace('.ts', '');
            const zone = roomId.split('_')[0]; // Extract zone from filename
            
            // Count traps by looking for trap objects
            const trapMatches = content.match(/traps:\s*\[([\s\S]*?)\]/);
            let trapCount = 0;
            
            if (trapMatches) {
              // Count trap objects by looking for id: properties within the traps array
              const trapsContent = trapMatches[1];
              trapCount = (trapsContent.match(/id:\s*['"]/g) || []).length;
            }
            
            if (trapCount > 0) {
              trappedRooms.push({
                zone,
                roomId,
                file: roomFile,
                trapCount,
                content: content.substring(0, 200) + '...'
              });
              
              console.log(`✅ ${roomId}: ${trapCount} trap(s) found`);
              
              // Extract trap details
              const trapTypes = [];
              if (content.includes("type: 'damage'")) trapTypes.push('damage');
              if (content.includes("type: 'teleport'")) trapTypes.push('teleport');
              if (content.includes("type: 'item_loss'")) trapTypes.push('item_loss');
              if (content.includes("type: 'flag_set'")) trapTypes.push('flag_set');
              
              if (trapTypes.length > 0) {
                console.log(`   Types: ${trapTypes.join(', ')}`);
              }
              
              // Check for damage values
              const damageMatch = content.match(/damage:\s*(\d+)/);
              if (damageMatch) {
                console.log(`   Damage: ${damageMatch[1]}`);
              }
              
              // Check for severity
              const severityMatch = content.match(/severity:\s*['"](\w+)['"]/);
              if (severityMatch) {
                console.log(`   Severity: ${severityMatch[1]}`);
              }
              
              // Check for trigger
              const triggerMatch = content.match(/trigger:\s*['"](\w+)['"]/);
              if (triggerMatch) {
                console.log(`   Trigger: ${triggerMatch[1]}`);
              }
              
              console.log('');
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.log(`❌ Error scanning rooms: ${error.message}`);
    return [];
  }
  
  return trappedRooms;
}

/**
 * Check trap system integration points
 */
async function checkTrapIntegration() {
  console.log('\n🔗 Checking trap system integration...\n');
  
  const checks = [
    {
      name: 'TrapDefinition Interface',
      file: 'src/types/RoomTypes.ts',
      pattern: /interface\s+TrapDefinition/,
      description: 'Type definitions for traps'
    },
    {
      name: 'TRIGGER_TRAP Action',
      file: 'src/state/gameState.tsx',
      pattern: /TRIGGER_TRAP/,
      description: 'Game state trap handling'
    },
    {
      name: 'processTrap Function',
      file: 'src/engine/commandProcessor.ts',
      pattern: /processTrap|function\s+processTrap/,
      description: 'Trap processing logic'
    },
    {
      name: 'RoomRenderer Trap Logic',
      file: 'src/components/RoomRenderer.tsx',
      pattern: /trap|TRIGGER_TRAP/,
      description: 'UI trap triggering'
    },
    {
      name: 'processRoomEntry Function',
      file: 'src/engine/commandProcessor.ts',
      pattern: /processRoomEntry/,
      description: 'Room entry trap checking'
    }
  ];
  
  for (const check of checks) {
    try {
      const filePath = join(rootDir, check.file);
      const content = await readFile(filePath, 'utf-8');
      
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name}: Found in ${check.file}`);
        console.log(`   ${check.description}`);
      } else {
        console.log(`❌ ${check.name}: Not found in ${check.file}`);
        console.log(`   ${check.description}`);
      }
    } catch (error) {
      console.log(`⚠️ ${check.name}: Cannot read ${check.file}`);
    }
  }
}

/**
 * Validate specific trap implementations
 */
async function validateTrapImplementations(trappedRooms) {
  console.log('\n🧪 Validating trap implementations...\n');
  
  if (trappedRooms.length === 0) {
    console.log('⚠️ No rooms with traps found');
    return;
  }
  
  for (const room of trappedRooms) {
    console.log(`🔍 Validating ${room.roomId}:`);
    
    try {
      const roomPath = join(rootDir, 'src', 'rooms', room.file);
      const content = await readFile(roomPath, 'utf-8');
      
      // Check required trap fields
      const hasId = content.includes('id:');
      const hasType = content.includes('type:');
      const hasSeverity = content.includes('severity:');
      const hasDescription = content.includes('description:');
      const hasTrigger = content.includes('trigger:');
      
      console.log(`   ID: ${hasId ? '✅' : '❌'}`);
      console.log(`   Type: ${hasType ? '✅' : '❌'}`);
      console.log(`   Severity: ${hasSeverity ? '✅' : '❌'}`);
      console.log(`   Description: ${hasDescription ? '✅' : '❌'}`);
      console.log(`   Trigger: ${hasTrigger ? '✅' : '❌'}`);
      
      // Check for common issues
      if (content.includes("type: 'damage'") && !content.includes('damage:')) {
        console.log(`   ⚠️ Damage trap missing damage value`);
      }
      
      if (content.includes("type: 'teleport'") && !content.includes('teleportTo:')) {
        console.log(`   ⚠️ Teleport trap missing destination`);
      }
      
      if (content.includes("severity: 'fatal'")) {
        const damageMatch = content.match(/damage:\s*(\d+)/);
        if (damageMatch && parseInt(damageMatch[1]) < 50) {
          console.log(`   ⚠️ Fatal trap has low damage (${damageMatch[1]})`);
        }
      }
      
      // Check for triggered state
      if (content.includes('triggered: false')) {
        console.log(`   ✅ Trap is ready to trigger`);
      } else if (content.includes('triggered: true')) {
        console.log(`   ⚠️ Trap is already triggered`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Error reading room file: ${error.message}\n`);
    }
  }
}

/**
 * Generate comprehensive report
 */
function generateReport(trappedRooms) {
  console.log('\n📊 Trap System Report\n');
  console.log('='.repeat(30));
  
  console.log(`\nTotal rooms with traps: ${trappedRooms.length}`);
  
  if (trappedRooms.length > 0) {
    const totalTraps = trappedRooms.reduce((sum, room) => sum + room.trapCount, 0);
    console.log(`Total traps found: ${totalTraps}`);
    console.log(`Average traps per room: ${(totalTraps / trappedRooms.length).toFixed(1)}`);
    
    console.log('\nRooms by zone:');
    const zoneCount = {};
    trappedRooms.forEach(room => {
      zoneCount[room.zone] = (zoneCount[room.zone] || 0) + 1;
    });
    
    Object.entries(zoneCount).forEach(([zone, count]) => {
      console.log(`  ${zone}: ${count} room(s)`);
    });
  }
  
  console.log('\n🎯 Recommendations:');
  console.log('  1. Test trap triggering by entering trapped rooms');
  console.log('  2. Verify health deduction works correctly');
  console.log('  3. Check trap-triggered flag setting');
  console.log('  4. Ensure traps only trigger once');
  console.log('  5. Test score penalties for trap triggering');
  console.log('  6. Validate teleport destinations exist');
}

/**
 * Main validation function
 */
async function main() {
  try {
    console.log('Starting comprehensive trap system validation...\n');
    
    // 1. Scan for trapped rooms
    const trappedRooms = await scanForRoomTraps();
    
    // 2. Check system integration
    await checkTrapIntegration();
    
    // 3. Validate implementations
    await validateTrapImplementations(trappedRooms);
    
    // 4. Generate report
    generateReport(trappedRooms);
    
    console.log('\n✅ Trap system validation complete!');
    
    if (trappedRooms.length > 0) {
      console.log('\n🎮 To test trap functionality:');
      console.log('  1. Start the game');
      console.log('  2. Navigate to rooms with traps');
      console.log('  3. Verify damage is applied');
      console.log('  4. Check trap triggering messages');
      console.log('  5. Confirm traps don\'t re-trigger');
    }
    
  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the validation
main();

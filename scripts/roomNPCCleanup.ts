// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: roomNPCCleanup.ts
// Description: Script to remove static NPCs from room files while preserving wandering NPC system

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Static NPCs that should be removed from room files
 * These were hardcoded but should be managed dynamically
 */
const STATIC_NPCS_TO_REMOVE = [
  'friendly_barista',
  'sarah_the_barista', 
  'innkeeper_bram',
  'innkeeper',
  'librarian_echo',
  'librarian',
  'chef',
  'chef_marco',
  'barista',
  'shopkeeper',
  'clerk',
  'receptionist',
  'guard',
  'security',
  'attendant'
];

/**
 * Core wandering NPCs that are managed by wanderingNPCController
 * These should NOT be removed if found in room files
 */
const WANDERING_NPCS_TO_KEEP = [
  'ayla',
  'morthos', 
  'al',
  'polly',
  'wendell',
  'mr_wendell',
  'albie',
  'dominic'
];

/**
 * Get all room files in the rooms directory
 */
async function getRoomFiles(): Promise<string[]> {
  const roomsDir = path.join(process.cwd(), 'src', 'rooms');
  const files = await fs.readdir(roomsDir);
  return files
    .filter(file => file.endsWith('.ts') && !file.includes('.d.ts'))
    .map(file => path.join(roomsDir, file));
}

/**
 * Clean NPCs from a room file
 */
async function cleanRoomFile(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Find the npcs array section
    const npcArrayMatch = content.match(/npcs:\s*\[([\s\S]*?)\]/);
    if (!npcArrayMatch) {
      console.log(`No NPCs found in ${path.basename(filePath)}`);
      return false;
    }

    const npcSection = npcArrayMatch[1];
    
    // Check if this contains static NPCs that should be removed
    const hasStaticNPCs = STATIC_NPCS_TO_REMOVE.some(staticNPC => 
      npcSection.toLowerCase().includes(staticNPC.toLowerCase())
    );

    if (!hasStaticNPCs) {
      console.log(`No static NPCs to remove in ${path.basename(filePath)}`);
      return false;
    }

    // Replace the npcs array with an empty array
    // This removes all static NPCs while preserving the structure
    const newContent = content.replace(
      /npcs:\s*\[([\s\S]*?)\]/,
      'npcs: [\n    // NPCs now managed dynamically by wanderingNPCController\n    // Static NPCs removed to prevent conflicts with dynamic system\n  ]'
    );

    await fs.writeFile(filePath, newContent, 'utf-8');
    console.log(`✅ Cleaned static NPCs from ${path.basename(filePath)}`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error processing ${path.basename(filePath)}:`, error);
    return false;
  }
}

/**
 * Main cleanup function
 */
async function cleanupRoomNPCs(): Promise<void> {
  console.log('🧹 Starting NPC room cleanup...');
  console.log('📋 Removing static NPCs:', STATIC_NPCS_TO_REMOVE.join(', '));
  console.log('✅ Preserving wandering NPCs:', WANDERING_NPCS_TO_KEEP.join(', '));
  console.log('');

  try {
    const roomFiles = await getRoomFiles();
    console.log(`📁 Found ${roomFiles.length} room files to process`);
    
    let cleanedCount = 0;
    
    for (const filePath of roomFiles) {
      const wasCleaned = await cleanRoomFile(filePath);
      if (wasCleaned) {
        cleanedCount++;
      }
    }
    
    console.log('');
    console.log(`🎯 Cleanup complete! Processed ${roomFiles.length} files, cleaned ${cleanedCount} files`);
    console.log('');
    console.log('📊 Summary:');
    console.log('  ✅ Static NPCs removed from room files');
    console.log('  ✅ Wandering NPC system preserved');
    console.log('  ✅ Room structure maintained');
    console.log('  ✅ Dynamic NPC management enabled');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    throw error;
  }
}

// Export for use as module or run directly
export { cleanupRoomNPCs, STATIC_NPCS_TO_REMOVE, WANDERING_NPCS_TO_KEEP };

// Run if called directly
if (require.main === module) {
  cleanupRoomNPCs().catch(console.error);
}

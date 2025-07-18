// Module: scripts/generateRoomRegistry.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

import fs from 'fs';
import path from 'path';

/**
 * Interface for room file information
 */
interface RoomFileInfo {
  filename: string;
  roomId: string;
  exportName: string;
  filePath: string;
  zone?: string;
  baseName: string;
}

/**
 * Configuration options for generation
 */
interface GenerationOptions {
  verbose?: boolean;
  dryRun?: boolean;
  validateExports?: boolean;
  sortByZone?: boolean;
  includeMetadata?: boolean;
  backup?: boolean;
}

/**
 * Validation result interface
 */
interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

// Configuration constants

// File patterns to exclude

/**
 * Extract room information from filename with enhanced parsing
 */
function extractRoomInfo(filename: string): RoomFileInfo | null {
  try {
            
    let roomId: string;
    let exportName: string;
    let zone: string | undefined;

    // Handle different naming patterns:
    // 1. zone_roomname.ts -> zone: zone, roomId: roomname
    // 2. zone-roomname.ts -> zone: zone, roomId: roomname  
    // 3. roomname.ts -> roomId: roomname
    if (baseName.includes('_')) {
            if (parts.length >= 2) {
        zone = parts[0];
        roomId = parts.slice(1).join('_'); // Handle multi-part room names
      } else {
        roomId = baseName;
      }
      exportName = roomId;
    } else if (baseName.includes('-')) {
            if (parts.length >= 2) {
        zone = parts[0];
        roomId = parts.slice(1).join('-'); // Handle multi-part room names
      } else {
        roomId = baseName;
      }
      exportName = roomId;
    } else {
      roomId = baseName;
      exportName = baseName;
    }

    // Validate room ID format - allow more flexible naming
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(roomId)) {
      console.warn(`⚠️  Invalid room ID format: ${roomId} (from ${filename})`);
      console.warn(`    Room IDs must start with a letter and contain only letters, numbers, hyphens, and underscores`);
      return null;
    }

    // Validate export name format
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(exportName)) {
      console.warn(`⚠️  Invalid export name format: ${exportName} (from ${filename})`);
      return null;
    }

    return {
      filename,
      roomId,
      exportName,
      filePath,
      zone,
      baseName
    };
  } catch (error) {
    console.error(`❌ Error extracting room info from ${filename}:`, error);
    return null;
  }
}

/**
 * Validate that the file actually exports the expected room constant
 */
function validateRoomExport(roomInfo: RoomFileInfo): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    warnings: [],
    errors: []
  };

  try {
    if (!fs.existsSync(roomInfo.filePath)) {
      result.isValid = false;
      result.errors.push(`File does not exist: ${roomInfo.filePath}`);
      return result;
    }

    // Check for export patterns with more flexible regex
    const exportPatterns = [
      new RegExp(`export\\s+const\\s+${roomInfo.exportName}\\s*[:=]`, 'i'),
      new RegExp(`export\\s*{[^}]*${roomInfo.exportName}[^}]*}`, 'i'),
      new RegExp(`const\\s+${roomInfo.exportName}\\s*[:=][^;]+;\\s*export`, 'i')
    ];

    if (!hasValidExport) {
      result.isValid = false;
      result.errors.push(`File ${roomInfo.filename} does not export const ${roomInfo.exportName}`);
      result.errors.push(`Expected one of: export const ${roomInfo.exportName}, export { ${roomInfo.exportName} }`);
    }

    // Additional validations
    if (!fileContent.includes('Room') && !fileContent.includes('RoomData')) {
      result.warnings.push(`File ${roomInfo.filename} may not contain Room type imports`);
    }

    // Check for common issues
    if (fileContent.includes('export default')) {
      result.warnings.push(`File ${roomInfo.filename} uses export default - ensure named export exists`);
    }

    if (!fileContent.includes('id:') && !fileContent.includes('id =')) {
      result.warnings.push(`File ${roomInfo.filename} may be missing room ID property`);
    }

    return result;
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Error reading file ${roomInfo.filename}: ${error}`);
    return result;
  }
}

/**
 * Create backup of existing RoomRegistry
 */
function createBackup(): boolean {
  try {
    if (fs.existsSync(OUTPUT_FILE)) {
      fs.copyFileSync(OUTPUT_FILE, BACKUP_FILE);
      console.log(`📋 Backup created: RoomRegistry.backup.ts`);
      return true;
    } else {
      console.log(`📋 No existing RoomRegistry.ts to backup`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Failed to create backup:`, error);
    return false;
  }
}

/**
 * Get zone information from room files
 */
function getZoneInfo(roomInfos: RoomFileInfo[]): Record<string, number> {
  const zones: Record<string, number> = {};
  
  roomInfos.forEach(room => {
        zones[zone] = (zones[zone] || 0) + 1;
  });
  
  return zones;
}

/**
 * Generate the RoomRegistry.ts file with enhanced features
 */
function generateRoomRegistry(options: GenerationOptions = {}): boolean {
  const { 
    verbose = false, 
    dryRun = false, 
    validateExports = true,
    sortByZone = false,
    includeMetadata = true,
    backup = true
  } = options;
  
  console.log(`🏗️  Generating RoomRegistry from ${ROOMS_DIR}`);
  
  // Check if rooms directory exists
  if (!fs.existsSync(ROOMS_DIR)) {
    console.error(`❌ Rooms directory not found: ${ROOMS_DIR}`);
    console.error(`    Expected: ${ROOMS_DIR}`);
    console.error(`    Current working directory: ${process.cwd()}`);
    return false;
  }

  // Get all TypeScript files
  let allFiles: string[];
  try {
    allFiles = fs.readdirSync(ROOMS_DIR);
  } catch (error) {
    console.error(`❌ Failed to read rooms directory:`, error);
    return false;
  }

  // Filter room files with enhanced exclusion logic
      
    return !EXCLUDED_PATTERNS.some(pattern => file.includes(pattern));
  });

  if (roomFiles.length === 0) {
    console.warn(`⚠️  No room files found in ${ROOMS_DIR}`);
    console.warn(`    Looking for .ts files excluding: ${EXCLUDED_PATTERNS.join(', ')}`);
    return false;
  }

  console.log(`📁 Found ${roomFiles.length} potential room files`);

  // Extract room information with enhanced error tracking
  const roomInfos: RoomFileInfo[] = [];
      const processingErrors: string[] = [];
  const validationWarnings: string[] = [];

  for (const file of roomFiles) {
    if (verbose) console.log(`   Processing: ${file}`);
    
        if (!roomInfo) {
      processingErrors.push(`Failed to extract room info from ${file}`);
      continue;
    }

    // Check for duplicate room IDs
    if (seenIds.has(roomInfo.roomId)) {
            console.warn(`⚠️  Duplicate room ID '${roomInfo.roomId}' found in files: ${existingFile} and ${file}`);
      duplicateIds.add(roomInfo.roomId);
      processingErrors.push(`Duplicate room ID: ${roomInfo.roomId}`);
      continue;
    }

    // Validate export if requested
    if (validateExports) {
            if (!validation.isValid) {
        processingErrors.push(`Export validation failed for ${file}: ${validation.errors.join(', ')}`);
        continue;
      }
      validationWarnings.push(...validation.warnings);
    }

    seenIds.set(roomInfo.roomId, file);
    roomInfos.push(roomInfo);
  }

  // Report processing results
  if (processingErrors.length > 0) {
    console.log(`\n⚠️  Processing Issues:`);
    processingErrors.forEach(error => console.log(`   • ${error}`));
  }

  if (validationWarnings.length > 0 && verbose) {
    console.log(`\n💡 Validation Warnings:`);
    validationWarnings.forEach(warning => console.log(`   • ${warning}`));
  }

  if (roomInfos.length === 0) {
    console.error(`❌ No valid room files found`);
    console.error(`   Processed ${roomFiles.length} files, ${processingErrors.length} failed`);
    return false;
  }

  // Sort rooms
  if (sortByZone) {
    roomInfos.sort((a, b) => {
            return zoneCompare !== 0 ? zoneCompare : a.roomId.localeCompare(b.roomId);
    });
  } else {
    roomInfos.sort((a, b) => a.roomId.localeCompare(b.roomId));
  }

  console.log(`✅ Processing ${roomInfos.length} valid room files`);

  // Display zone information
    if (Object.keys(zoneInfo).length > 1) {
    console.log(`📍 Zones: ${Object.entries(zoneInfo).map(([zone, count]) => `${zone}(${count})`).join(', ')}`);
  }

  // Generate imports and exports
  const imports: string[] = [];
  const exports: string[] = [];
  const roomIdsList: string[] = [];

  for (const roomInfo of roomInfos) {
        imports.push(`import { ${roomInfo.exportName} } from '${relativePath}';`);
    exports.push(`  ${roomInfo.roomId}: ${roomInfo.exportName},`);
    roomIdsList.push(`  '${roomInfo.roomId}'`);
    
    if (verbose) {
            console.log(`   ✓ ${roomInfo.roomId}${zoneDisplay} <- ${roomInfo.filename}`);
    }
  }

  // Generate file content with enhanced metadata

/**
 * Array of all room IDs for iteration/validation
 */
export const ROOM_IDS: readonly string[] = [
${roomIdsList.join(',\n')}
] as const;

/**
 * Get room by ID with type safety
 */
export function getRoomById(id: string): Room | undefined {
  return RoomRegistry[id];
}

/**
 * Check if room ID exists
 */
export function hasRoom(id: string): boolean {
  return id in RoomRegistry;
}

/**
 * Get all rooms as array
 */
export function getAllRooms(): Room[] {
  return Object.values(RoomRegistry);
}

/**
 * Get rooms by zone
 */
export function getRoomsByZone(zone: string): Room[] {
  return Object.values(RoomRegistry).filter(room => room.zone === zone);
}

/**
 * Get all unique zones
 */
export function getAllZones(): string[] {
  return Array.from(new Set(Object.values(RoomRegistry).map(room => room.zone || 'unknown'))).sort();
}

/**
 * Get room count by zone
 */
export function getRoomCountByZone(): Record<string, number> {
  const counts: Record<string, number> = {};
  Object.values(RoomRegistry).forEach(room => {
        counts[zone] = (counts[zone] || 0) + 1;
  });
  return counts;
}

/**
 * Validate room connections
 */
export function validateRoomConnections(): Array<{ roomId: string; invalidExits: string[] }> {
  const issues: Array<{ roomId: string; invalidExits: string[] }> = [];
  
  Object.values(RoomRegistry).forEach(room => {
    const invalidExits: string[] = [];
    
    if (room.exits) {
      Object.entries(room.exits).forEach(([direction, targetId]) => {
        if (targetId && !hasRoom(targetId)) {
          invalidExits.push(\`\${direction} -> \${targetId}\`);
        }
      });
    }
    
    if (room.hiddenExits) {
      Object.entries(room.hiddenExits).forEach(([direction, targetId]) => {
        if (targetId && !hasRoom(targetId)) {
          invalidExits.push(\`hidden \${direction} -> \${targetId}\`);
        }
      });
    }
    
    if (invalidExits.length > 0) {
      issues.push({ roomId: room.id, invalidExits });
    }
  });
  
  return issues;
}

${includeMetadata ? `/**
 * Registry metadata
 */
export const REGISTRY_METADATA = {
  generated: '${timestamp}',
  roomCount: ${roomInfos.length},
  zoneCount: ${Object.keys(zoneInfo).length},
  zones: ${JSON.stringify(zoneInfo, null, 2)},
  version: '${version}',
  generatorVersion: '${version}'
} as const;` : ''}
`;

  // Write or preview the file
  if (dryRun) {
    console.log('\n📄 Generated content preview:');
    console.log('─'.repeat(60));
        console.log(lines.slice(0, 25).join('\n'));
    if (lines.length > 25) {
      console.log('...');
      console.log(`(${lines.length} total lines)`);
    }
    console.log('─'.repeat(60));
    return true;
  }

  try {
    // Create backup before writing
    if (backup && !createBackup()) {
      console.warn(`⚠️  Could not create backup, continuing anyway...`);
    }

    // Write the new registry
    fs.writeFileSync(OUTPUT_FILE, content, 'utf-8');
    
    console.log(`\n✅ RoomRegistry.ts generated successfully!`);
    console.log(`📊 Generation Statistics:`);
    console.log(`   • ${roomInfos.length} rooms registered`);
    console.log(`   • ${imports.length} imports created`);
    console.log(`   • ${Object.keys(zoneInfo).length} zones found`);
    console.log(`   • Generator version: ${version}`);
    console.log(`   • Output file: ${OUTPUT_FILE}`);
    
    if (duplicateIds.size > 0) {
      console.log(`\n⚠️  Note: ${duplicateIds.size} duplicate room IDs were skipped`);
    }
    
    if (processingErrors.length > 0) {
      console.log(`\n⚠️  Warning: ${processingErrors.length} files had processing errors`);
    }

    return true;

  } catch (error) {
    console.error(`❌ Failed to write RoomRegistry.ts:`, error);
    return false;
  }
}

/**
 * Display help information
 */
function showHelp(): void {
  console.log(`
🏠 Gorstan Room Registry Generator v3.1.0

DESCRIPTION:
  Automatically generates RoomRegistry.ts from TypeScript room files.
  Scans src/rooms/ for .ts files and creates a centralized registry.

USAGE:
  ts-node scripts/generateRoomRegistry.ts [options]

OPTIONS:
  --verbose, -v        Show detailed processing information
  --dry-run, -d        Preview output without writing files  
  --no-validate        Skip export validation (faster)
  --sort-zone          Sort rooms by zone, then by ID
  --no-metadata        Exclude metadata from generated file
  --no-backup          Skip creating backup file
  --help, -h           Show this help message

EXAMPLES:
  ts-node scripts/generateRoomRegistry.ts
  ts-node scripts/generateRoomRegistry.ts --verbose
  ts-node scripts/generateRoomRegistry.ts --dry-run --sort-zone
  ts-node scripts/generateRoomRegistry.ts --no-validate --no-backup

FILE NAMING CONVENTIONS:
  zone_roomname.ts     -> Zone: zone, Room ID: roomname
  zone-roomname.ts     -> Zone: zone, Room ID: roomname  
  roomname.ts          -> Room ID: roomname
  
EXCLUDED FILES:
  RoomRegistry.ts, *.test.ts, *.spec.ts, index.ts, *.d.ts, backup.*
`);
}

/**
 * Main execution function with enhanced argument parsing
 */
function main(): void {
    
  // Parse command line arguments
  const options: GenerationOptions = {
    verbose: args.includes('--verbose') || args.includes('-v'),
    dryRun: args.includes('--dry-run') || args.includes('-d'),
    validateExports: !args.includes('--no-validate'),
    sortByZone: args.includes('--sort-zone'),
    includeMetadata: !args.includes('--no-metadata'),
    backup: !args.includes('--no-backup')
  };

  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // Display startup information
  console.log('🏠 Gorstan Room Registry Generator v3.1.0\n');
  
  if (options.verbose) {
    console.log('📋 Configuration:');
    console.log(`   • Validate exports: ${options.validateExports}`);
    console.log(`   • Sort by zone: ${options.sortByZone}`);
    console.log(`   • Include metadata: ${options.includeMetadata}`);
    console.log(`   • Create backup: ${options.backup}`);
    console.log(`   • Dry run: ${options.dryRun}`);
    console.log('');
  }

  if (!success) {
    console.error('\n❌ Registry generation failed');
    console.error('   Run with --help for usage information');
    process.exit(1);
  }
  
  console.log('\n🎉 Registry generation completed successfully!');
  
  if (!options.dryRun) {
    console.log('\n💡 Next steps:');
    console.log('   • Review the generated RoomRegistry.ts');
    console.log('   • Run validation: npm run validate-rooms');
    console.log('   • Test room connections: npm run test-rooms');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export functions for external use
export { 
  generateRoomRegistry, 
  extractRoomInfo, 
  validateRoomExport,
  createBackup,
  getZoneInfo,
  type RoomFileInfo,
  type GenerationOptions,
  type ValidationResult
};

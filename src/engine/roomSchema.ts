import { Room } from './RoomTypes';



// roomSchema.ts
// Gorstan Game Engine – Room Type Definitions
// (c) 2025 Geoffrey Alan Webster
//
// Canonical Room schema shared across roomEngine, registry, and all .ts room files
// Auto-refactored by Fred on 2025-07-06
// Enhanced for type alignment and performance optimization
// --------------------------------------------------------------

// Version: 6.1.0
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
// Module: roomSchema.ts
// Path: src/engine/roomSchema.ts
//
// roomSchema utility for Gorstan game.
// Defines the JSON schema for validating room objects and provides a validator using Ajv.
// Ensures all room data conforms to expected structure for safe use in the game engine.

// Create an optimized Ajv instance for schema validation

/**
 * Enhanced validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ErrorObject[];
  errorMessage?: string;
  warnings?: string[];
  suggestions?: string[];
}

/**
 * Room validation statistics for debugging
 */
export interface ValidationStats {
  totalValidated: number;
  validRooms: number;
  invalidRooms: number;
  commonErrors: Record<string, number>;
  lastValidated: number;
}

/**
 * Room batch validation result
 */
export interface BatchValidationResult {
  valid: number;
  invalid: number;
  total: number;
  errors: Array<{
    index: number;
    roomId?: string;
    error: string;
    severity: 'error' | 'warning';
  }>;
  stats: ValidationStats;
}

// JSON Schema that aligns with the Room interface from ../types/Room
export
/**
 * Validation statistics tracking
 */
const validationStats: ValidationStats = {
  totalValidated: 0,
  validRooms: 0,
  invalidRooms: 0,
  commonErrors: {},
  lastValidated: 0
};

/**
 * Compiled Ajv validation function for room objects.
 * Optimized for performance with detailed error reporting.
 */
export
/**
 * Enhanced validation function with detailed error reporting and suggestions
 * @param data - The room object to validate
 * @returns Comprehensive validation result
 */
export function validateRoomWithDetails(data: unknown): ValidationResult {
  try {

    // Update statistics
    validationStats.totalValidated++;
    validationStats.lastValidated = endTime;

    if (valid) {
      validationStats.validRooms++;
      return { valid: true };
    }

    validationStats.invalidRooms++;

    if (!validateRoomSchema.errors) {
      return {
        valid: false,
        errorMessage: "Unknown validation error"
      };
    }

        const warnings: string[] = [];
    const suggestions: string[] = [];

    // Track common errors
    errors.forEach(err => {
            validationStats.commonErrors[errorKey] = (validationStats.commonErrors[errorKey] || 0) + 1;
    });

    // Generate helpful error message
            let message = `${path}: ${err.message}`;

        // Add context-specific suggestions
        if (err.keyword === 'required') {
          if (err.params?.missingProperty === 'id') {
            suggestions.push("Every room must have a unique 'id' field");
          }
        } else if (err.keyword === 'pattern') {
          if (path.includes('id')) {
            suggestions.push("Room IDs should contain only lowercase letters, numbers, and underscores");
          }
        } else if (err.keyword === 'enum') {
          if (path.includes('zone')) {
            suggestions.push(`Valid zones are: ${roomSchema.properties.zone.enum.join(', ')}`);
          }
        } else if (err.keyword === 'type') {
          if (path.includes('exits')) {
            suggestions.push("Exits should be an object mapping directions to room IDs");
          }
        }

        return message;
      })
      .join('; ');

    // Add warnings for common issues
    if (data && typeof data === 'object') {

      if (!room.title && !room.name) {
        warnings.push("Room has no title - consider adding one for better user experience");
      }

      if (!room.description) {
        warnings.push("Room has no description - players won't know what they're seeing");
      }

      if (room.exits && Object.keys(room.exits).length === 0) {
        warnings.push("Room has no exits - players might get stuck");
      }

      if (room.items && room.items.length > 10) {
        warnings.push("Room has many items - consider if this is intentional");
      }
    }

    return {
      valid: false,
      errors,
      errorMessage,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  } catch (error) {
    console.error('[RoomSchema] Error during validation:', error);
    return {
      valid: false,
      errorMessage: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Type guard function that validates and narrows type to Room
 * @param data - The data to validate and type narrow
 * @returns True if data is a valid Room
 */
export function isValidRoom(data: unknown): data is Room {
  try {
    return validateRoomSchema(data);
  } catch (error) {
    console.error('[RoomSchema] Error in type guard:', error);
    return false;
  }
}

/**
 * Validates an array of rooms and returns comprehensive results
 * @param rooms - Array of room objects to validate
 * @returns Detailed batch validation results
 */
export function validateRoomArray(rooms: unknown[]): BatchValidationResult {
  try {
    if (!Array.isArray(rooms)) {
      throw new Error('Input must be an array');
    }

    const results: BatchValidationResult = {
      valid: 0,
      invalid: 0,
      total: rooms.length,
      errors: [],
      stats: { ...validationStats }
    };

    rooms.forEach((room, index) => {
            if (validation.valid) {
        results.valid++;
      } else {
        results.invalid++;

        // Add primary error
        results.errors.push({
          index,
          roomId,
          error: validation.errorMessage || 'Validation failed',
          severity: 'error'
        });

        // Add warnings as separate entries
        if (validation.warnings) {
          validation.warnings.forEach(warning => {
            results.errors.push({
              index,
              roomId,
              error: warning,
              severity: 'warning'
            });
          });
        }
      }
    });

    // Update final stats
    results.stats = { ...validationStats };

    return results;
  } catch (error) {
    console.error('[RoomSchema] Error in batch validation:', error);
    return {
      valid: 0,
      invalid: 0,
      total: 0,
      errors: [{
        index: -1,
        error: `Batch validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      }],
      stats: { ...validationStats }
    };
  }
}

/**
 * Enhanced room validation with integration points
 * @param data - Room data to validate
 * @param context - Optional context for validation
 * @returns Validation result with integration-specific checks
 */
export function validateRoomForEngine(
  data: unknown,
  context?: {
    checkExitDestinations?: boolean;
    availableRoomIds?: string[];
    requiredFields?: string[];
  }
): ValidationResult {
  try {
    // First run standard validation
        if (!baseResult.valid) {
      return baseResult;
    }

    // Additional engine-specific validation
        const warnings: string[] = [...(baseResult.warnings || [])];
    const suggestions: string[] = [...(baseResult.suggestions || [])];

    // Check exit destinations if requested
    if (context?.checkExitDestinations && context.availableRoomIds && room.exits) {
      Object.entries(room.exits).forEach(([direction, destination]) => {
        if (!context.availableRoomIds!.includes(destination as string)) {
          warnings.push(`Exit ${direction} leads to unknown room: ${destination}`);
          suggestions.push(`Ensure room '${destination}' exists or remove the exit`);
        }
      });
    }

    // Check required fields if specified
    if (context?.requiredFields) {
      context.requiredFields.forEach(field => {
        if (!(field in room) || (room as any)[field] === undefined) {
          warnings.push(`Required field '${field}' is missing`);
        }
      });
    }

    // Engine-specific validation rules
    if (room.trap && !room.flags?.includes('has_trap')) {
      warnings.push("Room has trap configuration but missing 'has_trap' flag");
      suggestions.push("Add 'has_trap' to the flags array");
    }

    if (room.puzzle && !room.flags?.includes('has_puzzle')) {
      warnings.push("Room has puzzle configuration but missing 'has_puzzle' flag");
      suggestions.push("Add 'has_puzzle' to the flags array");
    }

    if (room.npcs && room.npcs.length > 0 && !room.flags?.includes('has_npcs')) {
      suggestions.push("Consider adding 'has_npcs' flag for rooms with NPCs");
    }

    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    };
  } catch (error) {
    console.error('[RoomSchema] Error in engine validation:', error);
    return {
      valid: false,
      errorMessage: `Engine validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get validation statistics for debugging and monitoring
 * @returns Current validation statistics
 */
export function getValidationStats(): ValidationStats {
  return { ...validationStats };
}

/**
 * Reset validation statistics
 */
export function resetValidationStats(): void {
  validationStats.totalValidated = 0;
  validationStats.validRooms = 0;
  validationStats.invalidRooms = 0;
  validationStats.commonErrors = {};
  validationStats.lastValidated = 0;
}

/**
 * Get the most common validation errors
 * @param limit - Maximum number of errors to return
 * @returns Array of common errors with counts
 */
export function getCommonErrors(limit: number = 10): Array<{ error: string; count: number }> {
  return Object.entries(validationStats.commonErrors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([error, count]) => ({ error, count }));
}

/**
 * Validate room schema compatibility with given Room interface
 * @param room - Room object to check
 * @returns True if compatible with current schema
 */
export function isSchemaCompatible(room: any): boolean {
  try {
    if (!room || typeof room !== 'object') return false;

    // Check required fields
    if (!room.id || typeof room.id !== 'string') return false;

    // Check exits structure (object vs array compatibility)
    if (room.exits) {
      if (Array.isArray(room.exits)) {
        // Legacy array format - warn but don't fail
        console.warn(`[RoomSchema] Room ${room.id} uses legacy array exits format`);
        return true;
      }
      if (typeof room.exits !== 'object') return false;
    }

    return true;
  } catch (error) {
    console.error('[RoomSchema] Error checking schema compatibility:', error);
    return false;
  }
}

/**
 * Convert legacy room formats to current schema
 * @param room - Room in potentially legacy format
 * @returns Converted room object
 */
export function convertLegacyRoom(room: any): Room | null {
  try {
    if (!room || typeof room !== 'object') return null;

    const converted: any = { ...room };

    // Convert array exits to object format
    if (Array.isArray(room.exits)) {
      const exitObject: Record<string, string> = {};
      room.exits.forEach((exit: any) => {
        if (exit.direction && exit.destination) {
          exitObject[exit.direction] = exit.destination;
        }
      });
      converted.exits = exitObject;
    }

    // Convert name to title if title is missing
    if (room.name && !room.title) {
      converted.title = room.name;
      delete converted.name;
    }

    // Ensure arrays are arrays
    if (converted.items && !Array.isArray(converted.items)) {
      converted.items = [];
    }
    if (converted.npcs && !Array.isArray(converted.npcs)) {
      converted.npcs = [];
    }
    if (converted.flags && !Array.isArray(converted.flags)) {
      converted.flags = [];
    }

    return converted;
  } catch (error) {
    console.error('[RoomSchema] Error converting legacy room:', error);
    return null;
  }
}

// Legacy compatibility functions (maintain existing API)
export export
// Type alias for backward compatibility
export type RoomDefinition = Room;

// Export schema for external use and tooling
export { roomSchema as schema };

/**
 * Enhanced schema utilities for external use
 */
export
export default RoomSchema;
/**
 * Validate a room definition against the JSON schema
 */
export function isValidRoomDefinition(data: unknown): data is RoomDefinition {
  return validateRoom(data);
}

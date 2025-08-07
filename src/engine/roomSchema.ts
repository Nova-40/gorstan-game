// src/engine/roomSchema.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Room schema validation and utility functions

import Ajv, { type ErrorObject } from 'ajv';
import type { Room } from '../types/Room';

// JSON Schema definition for room validation
const roomSchema = {
  type: "object",
  required: ["id", "title", "description"],
  properties: {
    id: {
      type: "string",
      pattern: "^[a-z0-9_]+$",
      minLength: 1,
      maxLength: 50
    },
    title: {
      type: "string",
      minLength: 1,
      maxLength: 100
    },
    description: {
      type: "string",
      minLength: 10,
      maxLength: 2000
    },
    zone: {
      type: "string",
      enum: [
        "intro", "gorstan", "london", "newyork", "lattice", "elfhame",
        "glitch", "maze", "stanton", "stantonharcourt", "multiplezones",
        "multi", "offgorstan", "offmultiverse", "internal-reset",
        "reset", "prewelcome", "generic"
      ]
    },
    exits: {
      type: "object",
      patternProperties: {
        "^(north|south|east|west|northeast|northwest|southeast|southwest|up|down|enter|exit|portal|back)$": {
          type: "string",
          pattern: "^[a-z0-9_]+$"
        }
      },
      additionalProperties: false
    },
    items: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          takeable: { type: "boolean" },
          hidden: { type: "boolean" },
          usable: { type: "boolean" }
        }
      }
    },
    npcs: {
      type: "array",
      items: {
        type: "string",
        pattern: "^[a-z0-9_]+$"
      }
    },
    features: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          interactable: { type: "boolean" },
          hidden: { type: "boolean" }
        }
      }
    },
    flags: {
      type: "object",
      patternProperties: {
        "^[a-zA-Z_][a-zA-Z0-9_]*$": {
          type: ["boolean", "string", "number"]
        }
      }
    },
    requiredFlags: {
      type: "object",
      patternProperties: {
        "^[a-zA-Z_][a-zA-Z0-9_]*$": {
          type: ["boolean", "string", "number"]
        }
      }
    },
    image: {
      type: "string",
      pattern: "^[a-zA-Z0-9_\\-\\.]+\\.(png|jpg|jpeg|gif|webp)$"
    },
    audio: {
      type: "string",
      pattern: "^[a-zA-Z0-9_\\-\\.]+\\.(mp3|wav|ogg)$"
    },
    special: {
      type: "object",
      properties: {
        isDeathRoom: { type: "boolean" },
        isStartRoom: { type: "boolean" },
        isEndRoom: { type: "boolean" },
        savePoint: { type: "boolean" },
        noReturn: { type: "boolean" },
        darkRoom: { type: "boolean" },
        ambientSound: { type: "string" }
      }
    }
  },
  additionalProperties: false
};

// Create AJV validator instance
const ajv = new Ajv({ allErrors: true, verbose: true });
const validateRoomSchema = ajv.compile(roomSchema);

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors?: ErrorObject[];
  errorMessage?: string;
  warnings?: string[];
  suggestions?: string[];
}

// Validation context for enhanced checks
export interface ValidationContext {
  checkExitDestinations?: boolean;
  availableRoomIds?: string[];
  requiredFields?: string[];
  allowMissingImages?: boolean;
}

// Validation statistics for debugging and optimization
export const validationStats = {
  totalValidated: 0,
  validRooms: 0,
  invalidRooms: 0,
  lastValidated: 0,
  commonErrors: {} as Record<string, number>
};

/**
 * Validates a room object with detailed error reporting
 */
export function validateRoomWithDetails(data: unknown): ValidationResult {
  try {
    const valid = validateRoomSchema(data);
    
    validationStats.totalValidated++;
    validationStats.lastValidated = Date.now();

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

    const errors = validateRoomSchema.errors;
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Track common errors for debugging
    errors.forEach((err: ErrorObject) => {
      const errorKey = `${err.keyword}:${err.schemaPath}`;
      validationStats.commonErrors[errorKey] = (validationStats.commonErrors[errorKey] || 0) + 1;
    });

    // Generate error message with helpful suggestions
    const errorMessage = errors
      .map((err: ErrorObject) => {
        const path = err.instancePath || 'root';
        let message = `${path}: ${err.message}`;

        // Add specific suggestions based on error type
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

    // Additional validation checks for common issues
    const room = data as any;
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
 * Simple room type guard
 */
export function isValidRoom(data: unknown): data is Room {
  try {
    return validateRoomSchema(data);
  } catch (error) {
    console.error('[RoomSchema] Error in type guard:', error);
    return false;
  }
}

// Export the schema for external use
export { roomSchema };

// Export a RoomDefinition type alias for compatibility
export type RoomDefinition = Room;

// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: roomSchema.js
// Path: src/engine/roomSchema.js


// src/engine/roomSchema.js
// Version: 3.9.9
// (c) 2025 Geoffrey Alan Webster
// Licensed under the MIT License
//
// roomSchema utility for Gorstan game.
// Defines the JSON schema for validating room objects and provides a validator using Ajv.
// Ensures all room data conforms to expected structure for safe use in the game engine.

import Ajv from "ajv";

// Create an Ajv instance for schema validation
const ajv = new Ajv();

/**
 * roomSchema
 * JSON schema definition for Gorstan room objects.
 * Ensures each room has required fields and correct types for all properties.
 * Allows additional properties for future extensibility.
 */
export const roomSchema = {
  type: "object",
  required: ["id", "name", "description", "exits"],
  properties: {
    id: { type: "string" },
    zone: { type: "string" },
    name: { type: "string" },
    description: {
      oneOf: [
        { type: "string" },
        {
          type: "array",
          items: { type: "string" }
        }
      ]
    },
    exits: {
      type: "object",
      additionalProperties: { type: "string" }
    },
    items: {
      type: "array",
      items: { type: "string" }
    },
    npc: {
      type: "array",
      items: { type: "string" }
    },
    traps: {
      type: "array",
      items: { type: "string" }
    }
  },
  additionalProperties: true // Allows for future expansion of room properties
};

/**
 * validateRoom
 * Compiled Ajv validation function for room objects.
 * Returns true if the room object is valid, false otherwise.
 *
 * @type {Function}
 * @param {Object} data - The room object to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
export const validateRoom = ajv.compile(roomSchema);

// Exported as named exports for use in room loading, validation, and debugging logic.
// TODO: Add more granular error reporting or custom error messages if validation fails.
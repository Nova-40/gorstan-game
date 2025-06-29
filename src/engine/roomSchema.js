// roomSchema.js – JSON schema for Gorstan room validation
// MIT License © 2025 Geoff Webster

import Ajv from "ajv";

const ajv = new Ajv();

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
  additionalProperties: true
};

export const validateRoom = ajv.compile(roomSchema);
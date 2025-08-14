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

// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import React, { useState, useCallback, useEffect } from "react";

type NPC = {
  id: string;
  name: string;
  description?: string;
  dialogue?: {
    greeting?: string;
    help?: string;
    farewell?: string;
  };
};

type Room = {
  id: string;
  title: string;
  description: string | string[];
  zone: string;
  image?: string;
  exits: Record<string, string>;
  items?: string[];
  npcs?: NPC[];
  flags?: string[];
  traps?: Trap[];
  events?: RoomEvent[];
  lookDescription?: string;
  entryText?: string;
  visitNarratives?: Record<string, string>;
  special?: Record<string, unknown>;
};

interface RoomData extends Room {}

interface Trap {
  id: string;
  type: "damage" | "teleport" | "item_loss" | "flag_set" | "custom";
  severity: "minor" | "major" | "fatal";
  description: string;
  trigger?: string;
  effect?: Record<string, unknown>;
  disarmable?: boolean;
  hidden?: boolean;
}

interface RoomEvent {
  id: string;
  trigger: "enter" | "exit" | "look" | "command" | "item_use";
  condition?: string;
  action: string;
  parameters?: Record<string, unknown>;
  repeatable?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: "error" | "warning";
  }>;
}

interface RoomEditorProps {
  rooms: Record<string, RoomData>;
  initialRoomId?: string;
  onSave?: (room: RoomData) => void;
  onValidationChange?: (
    isValid: boolean,
    errors: ValidationResult["errors"],
  ) => void;
  availableItems?: string[];
  availableNPCs?: string[];
  availableFlags?: string[];
}

export default function RoomEditor({
  rooms,
  initialRoomId,
  onSave,
  onValidationChange,
  availableItems = [],
  availableNPCs = [],
  availableFlags = [],
}: RoomEditorProps): React.JSX.Element {
  // Variable declaration
  const roomIds = Object.keys(rooms);
  // Variable declaration
  const initialRoom =
    initialRoomId && rooms[initialRoomId]
      ? rooms[initialRoomId]
      : rooms[roomIds[0]];

  // React state declaration
  const [index, setIndex] = useState(() =>
    initialRoomId ? Math.max(0, roomIds.indexOf(initialRoomId)) : 0,
  );
  const [roomData, setRoomData] = useState<RoomData>(() => ({
    ...initialRoom,
    exits: initialRoom.exits || {},
    items: initialRoom.items || [],
    npcs: initialRoom.npcs || [],
    flags: initialRoom.flags || [],
    traps: initialRoom.traps || [],
    events: initialRoom.events || [],
    description: Array.isArray(initialRoom.description)
      ? initialRoom.description
      : initialRoom.description
        ? [initialRoom.description]
        : [],
  }));
  // React state declaration
  const [isDirty, setIsDirty] = useState(false);
  // React state declaration
  const [showTypeScriptOutput, setShowTypeScriptOutput] = useState(false);

  // Variable declaration
  const validateRoom = useCallback(
    (room: RoomData): ValidationResult => {
      const errors: ValidationResult["errors"] = [];
      if (!room.id?.trim()) {
        errors.push({
          field: "id",
          message: "Room ID is required",
          severity: "error",
        });
      } else if (!/^[a-zA-Z0-9_-]+$/.test(room.id)) {
        errors.push({
          field: "id",
          message:
            "Room ID must contain only letters, numbers, hyphens, and underscores",
          severity: "error",
        });
      }
      if (!room.title?.trim()) {
        errors.push({
          field: "title",
          message: "Room title is required",
          severity: "error",
        });
      }
      if (!room.zone?.trim()) {
        errors.push({
          field: "zone",
          message: "Room zone is required",
          severity: "error",
        });
      }
      if (
        !room.description ||
        (Array.isArray(room.description) && room.description.length === 0)
      ) {
        errors.push({
          field: "description",
          message: "Room description is required",
          severity: "error",
        });
      }
      if (room.exits) {
        Object.entries(room.exits).forEach(([dir, target]) => {
          if (target && !roomIds.includes(target)) {
            errors.push({
              field: "exits",
              message: `Exit "${dir}" points to unknown room "${target}"`,
              severity: "error",
            });
          }
        });
      }
      return {
        isValid: errors.filter((e) => e.severity === "error").length === 0,
        errors,
      };
    },
    [roomIds],
  );

  // Variable declaration
  const validation = validateRoom(roomData);

  // React effect hook
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validation.isValid, validation.errors);
    }
  }, [roomData, validateRoom, onValidationChange]);

  // Variable declaration
  const updateRoomData = useCallback((updates: Partial<RoomData>) => {
    setRoomData((prev) => {
      // Variable declaration
      const next = { ...prev, ...updates };
      setIsDirty(true);
      return next;
    });
  }, []);

  // Variable declaration
  const navigate = (direction: "prev" | "next") => {
    let newIndex = index;
    if (direction === "prev") {
      newIndex = (index - 1 + roomIds.length) % roomIds.length;
    } else if (direction === "next") {
      newIndex = (index + 1) % roomIds.length;
    }
    setIndex(newIndex);
    // Variable declaration
    const newRoom = rooms[roomIds[newIndex]];
    setRoomData({
      ...newRoom,
      exits: newRoom.exits || {},
      items: newRoom.items || [],
      npcs: newRoom.npcs || [],
      flags: newRoom.flags || [],
      traps: newRoom.traps || [],
      events: newRoom.events || [],
      description: Array.isArray(newRoom.description)
        ? newRoom.description
        : newRoom.description
          ? [newRoom.description]
          : [],
    });
    setIsDirty(false);
  };

  // Variable declaration
  const handleSave = () => {
    if (onSave && validation.isValid) {
      onSave(roomData);
      setIsDirty(false);
    }
  };

  // Variable declaration
  const generateTypeScriptCode = (room: RoomData): string => {
    // Variable declaration
    const code = `import { Room } from '../types/RoomTypes';

const ${room.id}: Room = ${JSON.stringify(room, null, 2)};

export default ${room.id};
`;
    return code;
  };

  // JSX return block or main return
  return (
    <div className="room-editor">
      <div className="room-editor-container max-w-6xl mx-auto p-4 space-y-6">
        {}
        <div className="room-editor-header">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-gray-800">
              Room Editor: {roomData.title}
              {isDirty && <span className="text-red-500 ml-2">*</span>}
            </h2>
            <div className="flex space-x-2">
              <span className="text-sm text-gray-600">
                {index + 1} of {roomIds.length}
              </span>
            </div>
          </div>
          {}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate("prev")}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded transition-colors"
              disabled={roomIds.length <= 1}
            >
              ← Previous
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowTypeScriptOutput(!showTypeScriptOutput)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
              >
                {showTypeScriptOutput ? "Hide" : "Show"} TS Code
              </button>
              <button
                onClick={handleSave}
                disabled={!validation.isValid}
                className={`px-6 py-2 rounded font-medium transition-colors ${
                  validation.isValid
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                💾 Save Room
              </button>
            </div>
            <button
              onClick={() => navigate("next")}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded transition-colors"
              disabled={roomIds.length <= 1}
            >
              Next →
            </button>
          </div>
        </div>
        {}
        {validation.errors.length > 0 && (
          <ValidationSummary validation={validation} />
        )}
        {}
        {showTypeScriptOutput && (
          <TypeScriptOutput
            room={roomData}
            generateCode={generateTypeScriptCode}
          />
        )}
        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="space-y-6">
            <CoreInfoSection
              room={roomData}
              onUpdate={updateRoomData}
              validation={validation}
            />
            <ImagePreviewSection room={roomData} onUpdate={updateRoomData} />
          </div>
          {}
          <div className="space-y-6">
            <NarrativeSection room={roomData} onUpdate={updateRoomData} />
            <ItemsAndNPCsSection
              room={roomData}
              onUpdate={updateRoomData}
              availableItems={availableItems}
              availableNPCs={availableNPCs}
            />
          </div>
          {}
          <div className="space-y-6">
            <ExitsSection
              room={roomData}
              onUpdate={updateRoomData}
              availableRooms={roomIds}
              validation={validation}
            />
            <TrapsAndEventsSection room={roomData} onUpdate={updateRoomData} />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Function: ValidationSummary ---
function ValidationSummary({ validation }: { validation: ValidationResult }) {
  // Variable declaration
  const errors = validation.errors.filter((e) => e.severity === "error");
  // Variable declaration
  const warnings = validation.errors.filter((e) => e.severity === "warning");
  // JSX return block or main return
  return (
    <div className="validation-summary bg-red-50 border border-red-200 rounded-lg p-4">
      <h3 className="font-semibold text-red-800 mb-2">Validation Issues</h3>
      {errors.length > 0 && (
        <div className="mb-3">
          <h4 className="font-medium text-red-700 mb-1">Errors (must fix):</h4>
          <ul className="list-disc list-inside space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-red-600 text-sm">
                <strong>{error.field}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {warnings.length > 0 && (
        <div>
          <h4 className="font-medium text-yellow-700 mb-1">Warnings:</h4>
          <ul className="list-disc list-inside space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="text-yellow-600 text-sm">
                <strong>{warning.field}:</strong> {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// --- Function: TypeScriptOutput ---
function TypeScriptOutput({
  room,
  generateCode,
}: {
  room: RoomData;
  generateCode: (room: RoomData) => string;
}) {
  // React state declaration
  const [copied, setCopied] = useState(false);
  // Variable declaration
  const code = generateCode(room);

  // Variable declaration
  const copyToClipboard = useCallback(() => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  }, [code]);

  // JSX return block or main return
  return (
    <div className="typescript-output bg-gray-50 border rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">TypeScript Module Code</h3>
        <button
          onClick={copyToClipboard}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            copied
              ? "bg-green-500 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {copied ? "✓ Copied!" : "📋 Copy"}
        </button>
      </div>
      <pre className="bg-white border rounded p-3 text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// --- Function: CoreInfoSection ---
function CoreInfoSection({
  room,
  onUpdate,
  validation,
}: {
  room: RoomData;
  onUpdate: (updates: Partial<RoomData>) => void;
  validation: ValidationResult;
}) {
  // Variable declaration
  const getFieldError = (field: string) =>
    validation.errors.find((e) => e.field === field);

  // JSX return block or main return
  return (
    <div className="core-info-section bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Core Information</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room ID *
          </label>
          <input
            type="text"
            value={room.id}
            onChange={(e) => onUpdate({ id: e.target.value })}
            className={`w-full p-2 border rounded-md ${
              getFieldError("id") ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., control_nexus"
          />
          {getFieldError("id") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("id")!.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={room.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className={`w-full p-2 border rounded-md ${
              getFieldError("title") ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Control Nexus"
          />
          {getFieldError("title") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("title")!.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zone *
          </label>
          <input
            type="text"
            value={room.zone}
            onChange={(e) => onUpdate({ zone: e.target.value })}
            className={`w-full p-2 border rounded-md ${
              getFieldError("zone") ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., control"
          />
          {getFieldError("zone") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("zone")!.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description * (one paragraph per line)
          </label>
          <textarea
            value={
              Array.isArray(room.description)
                ? room.description.join("\n")
                : room.description || ""
            }
            onChange={(e) =>
              onUpdate({
                description: e.target.value
                  .split(/\r?\n/)
                  .filter((line) => line.trim() !== ""),
              })
            }
            className={`w-full p-2 border rounded-md h-24 ${
              getFieldError("description")
                ? "border-red-500"
                : "border-gray-300"
            }`}
            placeholder="Describe what the player sees... (one paragraph per line)"
          />
          {getFieldError("description") && (
            <p className="text-red-500 text-xs mt-1">
              {getFieldError("description")!.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Function: ImagePreviewSection ---
function ImagePreviewSection({
  room,
  onUpdate,
}: {
  room: RoomData;
  onUpdate: (updates: Partial<RoomData>) => void;
}) {
  // React state declaration
  const [imageError, setImageError] = useState(false);

  // JSX return block or main return
  return (
    <div className="image-preview-section bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Image Preview</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image Path
          </label>
          <input
            type="text"
            value={room.image || ""}
            onChange={(e) => {
              onUpdate({ image: e.target.value });
              setImageError(false);
            }}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., /images/zones/control_nexus.png"
          />
        </div>
        <div className="border border-gray-200 rounded-md p-3 bg-gray-50 min-h-48 flex items-center justify-center">
          {room.image ? (
            <img
              src={room.image}
              alt={`Preview of ${room.title}`}
              className={`max-w-full max-h-44 object-contain ${imageError ? "hidden" : ""}`}
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-4xl mb-2">🖼️</div>
              <p>No image selected</p>
            </div>
          )}
          {imageError && (
            <div className="text-red-400 text-center">
              <div className="text-4xl mb-2">❌</div>
              <p>Failed to load image</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Function: NarrativeSection ---
function NarrativeSection({
  room,
  onUpdate,
}: {
  room: RoomData;
  onUpdate: (updates: Partial<RoomData>) => void;
}) {
  // JSX return block or main return
  return (
    <div className="narrative-section bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Narrative Content</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Entry Text
          </label>
          <textarea
            value={room.entryText || ""}
            onChange={(e) => onUpdate({ entryText: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md h-20"
            placeholder="Text shown when player enters..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Look Description
          </label>
          <textarea
            value={room.lookDescription || ""}
            onChange={(e) => onUpdate({ lookDescription: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md h-20"
            placeholder="Additional details when player examines room..."
          />
        </div>
      </div>
    </div>
  );
}

// --- Function: ItemsAndNPCsSection ---
function ItemsAndNPCsSection({
  room,
  onUpdate,
  availableItems,
  availableNPCs,
}: {
  room: RoomData;
  onUpdate: (updates: Partial<RoomData>) => void;
  availableItems: string[];
  availableNPCs: string[];
}) {
  // JSX return block or main return
  return (
    <div className="items-npcs-section bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Content & Characters</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Items (comma-separated)
          </label>
          <input
            type="text"
            value={room.items?.join(", ") || ""}
            onChange={(e) =>
              onUpdate({
                items: e.target.value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="key, scroll, crystal"
          />
          {availableItems.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Available: {availableItems.slice(0, 5).join(", ")}
              {availableItems.length > 5 ? "..." : ""}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NPCs (JSON array, e.g. [{`"id":"polly","name":"Polly"`}])
          </label>
          <textarea
            value={
              room.npcs && room.npcs.length > 0
                ? JSON.stringify(room.npcs, null, 2)
                : ""
            }
            onChange={(e) => {
              try {
                // Variable declaration
                const npcs = JSON.parse(e.target.value);
                if (Array.isArray(npcs)) {
                  onUpdate({ npcs });
                }
              } catch {}
            }}
            className="w-full p-2 border border-gray-300 rounded-md h-24 font-mono"
            placeholder='[{"id":"polly","name":"Polly"}]'
          />
          {availableNPCs.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Available: {availableNPCs.slice(0, 5).join(", ")}
              {availableNPCs.length > 5 ? "..." : ""}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Flags (comma-separated)
          </label>
          <input
            type="text"
            value={room.flags?.join(", ") || ""}
            onChange={(e) =>
              onUpdate({
                flags: e.target.value
                  .split(",")
                  .map((flag) => flag.trim())
                  .filter(Boolean),
              })
            }
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="visited, puzzle_solved, secret_found"
          />
        </div>
      </div>
    </div>
  );
}

// --- Function: ExitsSection ---
function ExitsSection({
  room,
  onUpdate,
  availableRooms,
  validation,
}: {
  room: RoomData;
  onUpdate: (updates: Partial<RoomData>) => void;
  availableRooms: string[];
  validation: ValidationResult;
}) {
  // Variable declaration
  const directions = [
    "north",
    "south",
    "east",
    "west",
    "up",
    "down",
    "in",
    "out",
  ];
  // Variable declaration
  const exitErrors = validation.errors.filter((e) => e.field === "exits");

  // Variable declaration
  const updateExit = (direction: string, targetRoom: string) => {
    // Variable declaration
    const newExits = { ...room.exits };
    if (targetRoom.trim()) {
      newExits[direction] = targetRoom;
    } else {
      delete newExits[direction];
    }
    onUpdate({ exits: newExits });
  };

  // JSX return block or main return
  return (
    <div className="exits-section bg-white border rounded-lg p-4">
      <h3 className="font-semibold text-gray-800 mb-4">
        Room Exits ({Object.keys(room.exits).length})
      </h3>
      {exitErrors.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600 text-sm font-medium">Exit Issues:</p>
          <ul className="text-red-500 text-xs mt-1">
            {exitErrors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="space-y-3">
        {directions.map((direction) => (
          <div key={direction} className="flex items-center space-x-2">
            <label className="w-20 text-sm font-medium text-gray-700 capitalize">
              {direction}:
            </label>
            <select
              value={room.exits[direction] || ""}
              onChange={(e) => updateExit(direction, e.target.value)}
              className="flex-1 p-1 border border-gray-300 rounded text-sm"
            >
              <option value="">-- No exit --</option>
              {availableRooms.map((roomId) => (
                <option key={roomId} value={roomId}>
                  {roomId}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Function: TrapsAndEventsSection ---
function TrapsAndEventsSection({
  room,
  onUpdate,
}: {
  room: RoomData;
  onUpdate: (updates: Partial<RoomData>) => void;
}) {
  // Variable declaration
  const addTrap = () => {
    const newTrap: Trap = {
      id: `trap_${Date.now()}`,
      type: "damage",
      severity: "minor",
      description: "",
      disarmable: false,
      hidden: false,
    };
    onUpdate({ traps: [...(room.traps || []), newTrap] });
  };

  // Variable declaration
  const updateTrap = (index: number, updates: Partial<Trap>) => {
    // Variable declaration
    const newTraps = [...(room.traps || [])];
    newTraps[index] = { ...newTraps[index], ...updates };
    onUpdate({ traps: newTraps });
  };

  // Variable declaration
  const removeTrap = (index: number) => {
    // Variable declaration
    const newTraps = [...(room.traps || [])];
    newTraps.splice(index, 1);
    onUpdate({ traps: newTraps });
  };

  // JSX return block or main return
  return (
    <div className="traps-events-section bg-white border rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">
          Traps & Logic ({(room.traps || []).length})
        </h3>
        <button
          onClick={addTrap}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          + Add Trap
        </button>
      </div>
      <div className="space-y-3">
        {(room.traps || []).map((trap, index) => (
          <div
            key={trap.id}
            className="border border-gray-200 rounded p-3 bg-gray-50"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-sm">Trap {index + 1}</h4>
              <button
                onClick={() => removeTrap(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={trap.type}
                  onChange={(e) =>
                    updateTrap(index, { type: e.target.value as Trap["type"] })
                  }
                  className="p-1 border border-gray-300 rounded text-sm"
                >
                  <option value="damage">Damage</option>
                  <option value="teleport">Teleport</option>
                  <option value="item_loss">Item Loss</option>
                  <option value="flag_set">Flag Set</option>
                  <option value="custom">Custom</option>
                </select>
                <select
                  value={trap.severity}
                  onChange={(e) =>
                    updateTrap(index, {
                      severity: e.target.value as Trap["severity"],
                    })
                  }
                  className="p-1 border border-gray-300 rounded text-sm"
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="fatal">Fatal</option>
                </select>
              </div>
              <textarea
                value={trap.description}
                onChange={(e) =>
                  updateTrap(index, { description: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded text-sm h-16"
                placeholder="Trap description..."
              />
              <div className="flex items-center space-x-4 text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={trap.disarmable || false}
                    onChange={(e) =>
                      updateTrap(index, { disarmable: e.target.checked })
                    }
                    className="mr-1"
                  />
                  Disarmable
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={trap.hidden || false}
                    onChange={(e) =>
                      updateTrap(index, { hidden: e.target.checked })
                    }
                    className="mr-1"
                  />
                  Hidden
                </label>
              </div>
            </div>
          </div>
        ))}
        {(room.traps || []).length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">
            No traps configured
          </p>
        )}
      </div>
    </div>
  );
}

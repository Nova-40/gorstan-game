// Module: src/pages/RoomEditorPage.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

/**
 * Status message interface
 */
interface StatusMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

/**
 * Sanitizes a legacy trap trigger value to a valid trigger type.
 */
function sanitizeTrigger(trigger: unknown): "enter" | "look" | "search" | "item_use" | "command" {
  if (typeof trigger !== "string") {
    console.warn(`Invalid trap trigger type: ${typeof trigger}, defaulting to 'enter'`);
    return "enter";
  }
  
    switch (normalized) {
    case "enter":
    case "onenter":
    case "on_enter":
      return "enter";
    case "look":
    case "onlook":
    case "on_look":
      return "look";
    case "search":
    case "onsearch":
    case "on_search":
      return "search";
    case "item_use":
    case "itemuse":
    case "onitemuse":
    case "on_item_use":
      return "item_use";
    case "command":
    case "oncommand":
    case "on_command":
      return "command";
    default:
      console.warn(`Unknown trap trigger: ${trigger}, defaulting to 'enter'`);
      return "enter";
  }
}

/**
 * Sanitizes a trap type value to ensure it's valid
 */
function sanitizeTrapType(type: unknown): "damage" | "teleport" | "item_loss" | "flag_set" | "custom" {
  if (typeof type !== "string") {
    console.warn(`Invalid trap type: ${typeof type}, defaulting to 'damage'`);
    return "damage";
  }
  
    switch (normalized) {
    case "damage":
      return "damage";
    case "teleport":
      return "teleport";
    case "item_loss":
    case "itemloss":
      return "item_loss";
    case "flag_set":
    case "flagset":
      return "flag_set";
    case "custom":
      return "custom";
    default:
      console.warn(`Unknown trap type: ${type}, defaulting to 'damage'`);
      return "damage";
  }
}

/**
 * Sanitizes a trap severity value to ensure it's valid
 */
function sanitizeTrapSeverity(severity: unknown): "minor" | "major" | "fatal" {
  if (typeof severity !== "string") {
    console.warn(`Invalid trap severity: ${typeof severity}, defaulting to 'minor'`);
    return "minor";
  }
  
    switch (normalized) {
    case "minor":
      return "minor";
    case "major":
      return "major";
    case "fatal":
      return "fatal";
    default:
      console.warn(`Unknown trap severity: ${severity}, defaulting to 'minor'`);
      return "minor";
  }
}

/**
 * Process traps with enhanced safety and performance
 */
function processTraps(room: Room, roomKey: string): TrapDefinition[] {
  const traps: TrapDefinition[] = [];
  
  try {
    // Handle new traps array format
    if (Array.isArray(room.traps)) {
      room.traps.forEach((trap: unknown, idx: number) => {
        if (trap && typeof trap === 'object' && trap !== null) {
                    const processedTrap: TrapDefinition = {
            id: typeof trapObj.id === 'string' ? trapObj.id : `trap_${roomKey}_${idx}`,
            type: sanitizeTrapType(trapObj.type),
            severity: sanitizeTrapSeverity(trapObj.severity),
            description: typeof trapObj.description === 'string' ? trapObj.description : '',
            trigger: sanitizeTrigger(trapObj.trigger),
            effect: trapObj.effect && typeof trapObj.effect === 'object' ? trapObj.effect as Record<string, unknown> : undefined,
            disarmable: typeof trapObj.disarmable === 'boolean' ? trapObj.disarmable : true,
            hidden: typeof trapObj.hidden === 'boolean' ? trapObj.hidden : false,
            disarmSkill: typeof trapObj.disarmSkill === 'string' ? trapObj.disarmSkill : undefined,
            disarmDifficulty: typeof trapObj.disarmDifficulty === 'number' ? trapObj.disarmDifficulty : undefined
          };
          traps.push(processedTrap);
        }
      });
    }
  
    // Handle legacy single trap property
    if ('trap' in room && room.trap && typeof room.trap === 'object' && room.trap !== null && traps.length === 0) {
            const processedLegacyTrap: TrapDefinition = {
        id: `legacy_trap_${roomKey}`,
        type: sanitizeTrapType(legacyTrap.type),
        severity: sanitizeTrapSeverity(legacyTrap.severity),
        description: typeof legacyTrap.description === 'string' ? legacyTrap.description : '',
        trigger: sanitizeTrigger(legacyTrap.trigger),
        effect: legacyTrap.effect && typeof legacyTrap.effect === 'object' ? legacyTrap.effect as Record<string, unknown> : undefined,
        disarmable: typeof legacyTrap.disarmable === 'boolean' ? legacyTrap.disarmable : true,
        hidden: typeof legacyTrap.hidden === 'boolean' ? legacyTrap.hidden : false
      };
      traps.push(processedLegacyTrap);
    }
  } catch (trapError) {
    console.error(`Error processing traps for room ${roomKey}:`, trapError);
  }

  return traps;
}

/**
 * Main Room Editor Page Component - Wrapper for RoomEditor
 */
export default function RoomEditorPage(): JSX.Element {
  // Status messages for the page
  const [statusMessages, setStatusMessages] = useState<StatusMessage[]>([]);
  const [isValidationValid, setIsValidationValid] = useState<boolean>(true);
  
  // Use refs to track timeouts for cleanup
  
  /**
   * Cleanup function for timeouts
   */
      timeoutRefs.current.clear();
  }, []);

  /**
   * Add status message with auto-cleanup and deduplication
   */
      const newMessage: StatusMessage = {
      id: messageId,
      type,
      message,
      timestamp: new Date()
    };

    // Prevent duplicate messages
    setStatusMessages(prev => {
            
      if (isDuplicate) return prev;
      
      return [...prev, newMessage];
    });

    // Auto-remove after 5 seconds with cleanup tracking
          timeoutRefs.current.delete(timeoutId);
    }, 5000);
    
    timeoutRefs.current.add(timeoutId);
  }, []);

  /**
   * Convert RoomRegistry to RoomData format with improved performance
   */
      
    try {
            
      for (const [key, room] of roomEntries) {
        try {
          // Ensure proper type conversion from Room to RoomData
          const roomData: RoomData = {
            // Core identity (required fields)
            id: room.id || key,
            title: room.title || 'Untitled Room',
            zone: room.zone || 'unknown',
            description: room.description || '',
            
            // Navigation - ensure exits is always a proper object
            exits: room.exits
              ? Object.fromEntries(
                  Object.entries(room.exits)
                    .filter(([_, v]) => typeof v === 'string' && v.trim().length > 0)
                ) as Record<string, string>
              : {},
            hiddenExits: room.hiddenExits || {},
            
            // Content arrays (ensure they exist and are valid) - optimized filtering
            items: room.items?.filter(item => typeof item === 'string' && item.trim().length > 0) || [],
            npcs: room.npcs?.filter(npc => typeof npc === 'string' && npc.trim().length > 0) || [],
            flags: room.flags?.filter(flag => typeof flag === 'string' && flag.trim().length > 0) || [],
            furniture: room.furniture?.filter(item => typeof item === 'string' && item.trim().length > 0) || [],
            containers: room.containers?.filter(item => typeof item === 'string' && item.trim().length > 0) || [],
            
            // Visual & Audio
            image: room.image,
            visualEffect: room.visualEffect,
            soundscape: room.soundscape,
            atmosphere: room.atmosphere,
            
            // Narrative
            entryText: room.entryText,
            lookDescription: room.lookDescription,
            searchDescription: room.searchDescription,
            altDescriptions: room.altDescriptions,
            visitNarratives: room.visitNarratives,
            
            // Game state
            requirements: room.requirements,
            
            // Interactive elements - use extracted function for better performance
            traps: processTraps(room, key),
            
            events: room.events || [],
            interactions: room.interactions && typeof room.interactions === 'object' && room.interactions !== null
              ? Object.fromEntries(
                  Object.entries(room.interactions)
                    .filter(([_, v]) => typeof v === 'string')
                ) as Record<string, string>
              : {},
            
            // Atmospheric details
            echoes: room.echoes,
            memoryHooks: room.memoryHooks,
            timeVariations: room.timeVariations && typeof room.timeVariations === 'object' && room.timeVariations !== null
              ? Object.fromEntries(
                  Object.entries(room.timeVariations).filter(
                    ([, v]) => typeof v === 'object' && v !== null
                  ).map(
                    ([k, v]) => [k, v as Partial<Room>]
                  )
                ) as Record<string, Partial<Room>>
              : undefined,
            
            // Quest integration
            microQuestId: room.microQuestId,
            questFlags: room.questFlags,
            questRequirements: room.questRequirements,
            
            // Technical
            special: room.special && typeof room.special === 'object' && room.special !== null 
              ? room.special as Record<string, unknown> 
              : undefined,
            metadata: room.metadata && typeof room.metadata === 'object' && room.metadata !== null 
              ? room.metadata as Record<string, unknown> 
              : undefined
          };
          
          converted[key] = roomData;
        } catch (roomError) {
          console.error(`Error processing room ${key}:`, roomError);
          // Continue processing other rooms instead of failing completely
        }
      }
    } catch (error) {
      console.error('Error converting room registry:', error);
      addStatusMessage('error', 'Failed to load room data from registry');
    }

    return converted;
  }, []); // Remove addStatusMessage dependency to prevent unnecessary recalculations

  /**
   * Handle room save - Fixed signature and improved error handling
   */
        
      for (const field of requiredFields) {
        if (!room[field] || typeof room[field] !== 'string' || (room[field] as string).trim().length === 0) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required and must be a non-empty string`);
        }
      }

      // Validate and sanitize traps if they exist
      if (room.traps && Array.isArray(room.traps)) {
        room.traps = room.traps.map((trap: TrapDefinition, index: number) => {
          if (!trap.id || !trap.description) {
            throw new Error(`Trap ${index + 1} is missing required fields (id or description)`);
          }
          
          // Return sanitized trap
          return {
            ...trap,
            type: sanitizeTrapType(trap.type),
            severity: sanitizeTrapSeverity(trap.severity),
            trigger: sanitizeTrigger(trap.trigger)
          };
        });
      }

      // Show saving status
      addStatusMessage('info', `Saving room "${room.title}"...`);

      // Simulate async save operation with proper Promise
      await new Promise<void>((resolve, reject) => {
                    
            resolve();
          } catch (error) {
            reject(new Error(`Failed to save room data: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        }, 1000);
        
        timeoutRefs.current.add(timeoutId);
      });

      addStatusMessage('success', `Room "${room.title}" saved successfully`);
    } catch (error) {
            addStatusMessage('error', `Failed to save room: ${errorMessage}`);
      console.error('Save error:', error);
      // Re-throw to let RoomEditor know the save failed
      throw error;
    }
  }, [addStatusMessage]);

  /**
   * Handle validation state changes from RoomEditor
   */
  const handleValidationChange = useCallback((
    isValid: boolean, 
    errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }>
  ): void => {
    setIsValidationValid(isValid);
    
    // Show validation summary if there are errors
            
    if (errorCount > 0) {
      addStatusMessage('error', `Validation failed: ${errorCount} error(s), ${warningCount} warning(s)`);
    } else if (warningCount > 0) {
      addStatusMessage('warning', `${warningCount} validation warning(s)`);
    }
  }, [addStatusMessage]);

  // Optimized data extraction with memoization
        for (const room of Object.values(roomsData)) {
        room.items?.forEach(item => {
          if (item?.trim()) items.add(item.trim());
        });
      }
      return Array.from(items).sort();
    } catch (error) {
      console.error('Error generating available items:', error);
      return [];
    }
  }, [roomsData]);

        for (const room of Object.values(roomsData)) {
        room.npcs?.forEach(npc => {
          if (npc?.trim()) npcs.add(npc.trim());
        });
      }
      return Array.from(npcs).sort();
    } catch (error) {
      console.error('Error generating available NPCs:', error);
      return [];
    }
  }, [roomsData]);

        for (const room of Object.values(roomsData)) {
        room.flags?.forEach(flag => {
          if (flag?.trim()) flags.add(flag.trim());
        });
      }
      return Array.from(flags).sort();
    } catch (error) {
      console.error('Error generating available flags:', error);
      return [];
    }
  }, [roomsData]);

      } catch (error) {
      console.error('Error generating available room IDs:', error);
      return [];
    }
  }, [roomsData]);

  // Cleanup timeouts on unmount
  React.useEffect(() => {
    return cleanupTimeouts;
  }, [cleanupTimeouts]);

  // Safety check for empty rooms
  if (Object.keys(roomsData).length === 0) {
    return (
      <div className="room-editor-page min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="room-editor-container max-w-md mx-auto text-center">
          <div className="empty-state bg-white rounded-lg shadow-lg p-8">
            <div className="text-6xl mb-4">🏠</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Rooms Available</h2>
            <p className="text-gray-600 mb-4">
              No rooms found in the registry. Please check your room configuration files.
            </p>
            <div className="text-sm text-gray-500">
              <p>Expected location: src/rooms/RoomRegistry.ts</p>
              <p>Make sure room files are properly exported.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="room-editor-page min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gorstan Room Editor</h1>
              <p className="text-sm text-gray-500">
                {Object.keys(roomsData).length} rooms loaded • 
                {isValidationValid ? ' ✅ Valid' : ' ⚠️ Validation issues'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                TypeScript Mode
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                v6.1.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessages.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {statusMessages.map((message: StatusMessage) => (
            <div
              key={message.id}
              className={`w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden transition-all duration-300 ${
                message.type === 'success' ? 'bg-green-50 border border-green-200' :
                message.type === 'error' ? 'bg-red-50 border border-red-200' :
                message.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {message.type === 'success' && <span className="text-green-400">✅</span>}
                    {message.type === 'error' && <span className="text-red-400">❌</span>}
                    {message.type === 'warning' && <span className="text-yellow-400">⚠️</span>}
                    {message.type === 'info' && <span className="text-blue-400">ℹ️</span>}
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className={`text-sm font-medium ${
                      message.type === 'success' ? 'text-green-800' :
                      message.type === 'error' ? 'text-red-800' :
                      message.type === 'warning' ? 'text-yellow-800' :
                      'text-blue-800'
                    }`}>
                      {message.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setStatusMessages(prev => prev.filter(msg => msg.id !== message.id))}
                    className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Close message"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Room Editor */}
      <div className="flex-1">
        <RoomEditor
          rooms={roomsData}
          onSave={handleRoomSave}
          onValidationChange={handleValidationChange}
          availableItems={availableItems}
          availableNPCs={availableNPCs}
          availableFlags={availableFlags}
          availableRooms={availableRoomIds}
        />
      </div>
    </div>
  );
}

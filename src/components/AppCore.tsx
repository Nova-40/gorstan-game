// src/components/AppCore.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Main game controller UI and logic routing.

import '../styles/GameUI.css';
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';

import CommandInput from './CommandInput';
import DramaticWaitTransition from './animations/DramaticWaitTransition';
import JumpTransition from './animations/JumpTransition';
import MultiverseRebootSequence from './MultiverseRebootSequence';
import PlayerNameCapture from './PlayerNameCapture';
import PlayerStatsPanel from './PlayerStatsPanel';
import PresentNPCsPanel from './PresentNPCsPanel';
import InventoryPanel from './InventoryPanel';
import DebugPanel from './DebugPanel';
import RoomRenderer from './RoomRenderer';
import RoomTransition from './animations/RoomTransition';
import SipTransition from './animations/SipTransition';
import SplashScreen from './SplashScreen';
import TeletypeIntro from './TeletypeIntro';
import TerminalConsole from './TerminalConsole';
import WaitTransition from './animations/WaitTransition';
import WelcomeScreen from './WelcomeScreen';
import TeleportManager from './animations/TeleportManager';
import QuickActionsPanel from './QuickActionsPanel';
import BlueButtonWarningModal from './BlueButtonWarningModal';

import { useFlags } from '../hooks/useFlags';
import { useGameState } from '../state/gameState';
import { useLibrarianLogic } from '../hooks/useLibrarianLogic';
import { useModuleLoader } from '../hooks/useModuleLoader';
import { useOptimizedEffects } from '../hooks/useOptimizedEffects';
import { useRoomTransition } from '../hooks/useRoomTransition';
import { useWendellLogic } from '../hooks/useWendellLogic';

import { initializeAchievementEngine } from '../logic/achievementEngine';
import { initializeWanderingNPCs, handleRoomEntryForWanderingNPCs } from '../engine/wanderingNPCController';
import { getAllRoomsAsObject } from '../utils/roomLoader';

import { UseItemModal } from "./UseItemModal";
import { InventoryModal } from "./InventoryModal";
import ModalOverlay from './ModalOverlay';
import PickUpItemModal from './PickUpItemModal';
import SaveGameModal from './SaveGameModal';
import NPCConsole from './NPCConsole';
import NPCSelectionModal from './NPCSelectionModal';
import { npcReact } from '../engine/npcEngine';
import Modal from './Modal';
import { itemDescriptions } from '../data/itemDescriptions';

import type { Room } from '../types/Room';
import type { NPC, NPCMood } from '../types/NPCTypes';

/**
 * Enhanced type definitions for better type safety
 */
type GameStage = 'splash' | 'welcome' | 'nameCapture' | 'intro' | 'game' | 
  'transition_jump' | 'transition_sip' | 'transition_wait' | 'transition_dramatic_wait';

type OpenModalType = 'inventory' | 'useItem' | 'look' | 'pickUp' | 'saveGame' | 'npcConsole' | 'npcSelection' | null;

type TeleportType = "fractal" | "trek" | null;

/**
 * Interface for intro completion data with proper typing
 */
interface IntroCompletionData {
  route: string;
  targetRoom?: string;
  inventoryBonus?: string[];
}

/**
 * Enhanced item type for better type safety
 */
interface Item {
  name: string;
  [key: string]: any;
}

/**
 * AppCore Component
 * 
 * Core Purpose: Main game controller that orchestrates UI, logic routing,
 * and state management for the Gorstan game.
 * 
 * Fixed Issues:
 * - Removed duplicate function definitions and variable declarations
 * - Fixed syntax errors and malformed code blocks
 * - Corrected component structure and export statement
 * - Maintained all game logic and functionality
 * - Enhanced type safety throughout
 */
const AppCore: React.FC = () => {
  // Enhanced state with proper typing
  const { state, dispatch } = useGameState();
  const { hasFlag } = useFlags();
  const { loadModule } = useModuleLoader();

  // Teleport state with proper typing
  const [teleportType, setTeleportType] = useState<TeleportType>(null);
  const [teleportCallback, setTeleportCallback] = useState<() => void>(() => () => {});

  // Transition state with enhanced typing
  const [transitionType, setTransitionType] = useState<string | null>(null);
  const [readyForTransition, setReadyForTransition] = useState<boolean>(false);
  const [transitionTargetRoom, setTransitionTargetRoom] = useState<string>('controlnexus');
  const [transitionInventory, setTransitionInventory] = useState<string[]>([]);
  const [lastMovementAction, setLastMovementAction] = useState<string>('');
  const [roomTransitionActive, setRoomTransitionActive] = useState<boolean>(false);
  const [previousRoom, setPreviousRoom] = useState<Room | null>(null);

  // Modal state with proper typing
  const [modal, setModal] = useState<OpenModalType>(null);
  const [lookLines, setLookLines] = useState<string[]>([]);
  const lookModalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);

  // Save game state
  const [saveSlots, setSaveSlots] = useState<Array<{
    id: string;
    name: string;
    playerName: string;
    currentRoom: string;
    timestamp: number;
    score: number;
    playTime: number;
  }>>([]);

  // System state with enhanced typing
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [lastShownRoomDescription, setLastShownRoomDescription] = useState<string | null>(null);
  const [roomFallbackAttempted, setRoomFallbackAttempted] = useState<boolean>(false);
  const [roomHistory, setRoomHistory] = useState<string[]>([]);

  const handleRoomChange = (newRoomId: string) => {
    console.log('[AppCore] handleRoomChange called with:', newRoomId);
    if (newRoomId !== currentRoomId) {
      // Store current room in history before moving
      setRoomHistory(prev => [...prev, currentRoomId]);
      // Update previousRoom to current room before changing
      if (room) {
        setPreviousRoom(room);
      }

      // Check if this is a zone change to trigger teleport animation
      const currentZone = room?.zone;
      const newRoom = roomMap[newRoomId];
      const newZone = newRoom?.zone;
      
      if (currentZone && newZone && currentZone !== newZone) {
        console.log('[AppCore] Zone change detected:', currentZone, '→', newZone);
        
        // Determine teleport type based on zones
        const teleportType = newZone === 'glitchZone' ? 'fractal' : 'trek';
        
        // Set up teleport animation with callback to complete the room change
        setTeleportType(teleportType);
        setTeleportCallback(() => () => {
          console.log('[AppCore] Teleport animation complete, changing room');
          dispatch({ type: "MOVE_TO_ROOM", payload: newRoomId });
        });
      } else {
        // Same zone or no zone info - direct room change
        console.log('[AppCore] Same zone movement, direct change');
        dispatch({ type: "MOVE_TO_ROOM", payload: newRoomId });
      }
    }
  };

const handleBackout = useCallback((): void => {
    const count = roomHistory.length;

    if (!roomHistory || count === 0) {
      dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), text: "You can't go back." , type: 'system', timestamp: Date.now() } });
      return;
    }

    const previousRoomId = roomHistory[count - 1];
    setRoomHistory(prev => prev.slice(0, -1));
    dispatch({ type: 'MOVE_TO_ROOM', payload: previousRoomId });

    const sarcasm = count >= 6
      ? "Again? Maybe just stay put."
      : count >= 4
      ? "You're really milking this back button, huh?"
      : count >= 2
      ? "Back we go... again."
      : "You return to the previous room.";

    dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), text: sarcasm , type: 'system', timestamp: Date.now() } });
  }, [roomHistory, dispatch]);
  const playerName: string = useMemo(() => state.player?.name || 'Player', [state.player?.name]);
  const inventory: string[] = useMemo(() => state.player?.inventory || [], [state.player?.inventory]);
  const npcsInRoom: NPC[] = useMemo(() => state.npcsInRoom || [], [state.npcsInRoom]);
  const roomMap: Record<string, Room> = useMemo(() => state.roomMap || {}, [state.roomMap]);
  const currentRoomId: string = state.currentRoomId || 'controlnexus';
  const room: Room | undefined = roomMap[currentRoomId];
  const stage: GameStage = (state.stage as GameStage) || 'splash';

  // Initialize hooks with proper typing
  useOptimizedEffects(state, dispatch, room);
  const { handleWendell } = useWendellLogic(state, dispatch, room, loadModule);
  const { handleLibrarian } = useLibrarianLogic(state, dispatch, room, loadModule);
  
  // Enhanced modal management with proper typing
  const openModal = useCallback((name: OpenModalType): void => setModal(name), []);
  const closeModal = useCallback((): void => setModal(null), []);

  // Save game functions
  const loadSaveSlots = useCallback(() => {
    try {
      const saved = localStorage.getItem('gorstan_save_slots');
      if (saved) {
        setSaveSlots(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load save slots:', error);
    }
  }, []);

  const handleSave = useCallback((slotId: string, slotName: string) => {
    const saveData = {
      id: slotId,
      name: slotName,
      playerName: state.player.name || 'Player',
      currentRoom: state.currentRoomId,
      timestamp: Date.now(),
      score: state.player.score || 0,
      playTime: state.metadata?.playTime || 0,
      gameState: {
        stage: state.stage,
        player: state.player,
        currentRoomId: state.currentRoomId,
        flags: state.flags,
        roomVisitCount: state.roomVisitCount,
        history: state.history.slice(-50), // Keep last 50 messages
        metadata: state.metadata
      }
    };

    try {
      // Save the game data
      localStorage.setItem(`gorstan_save_${slotId}`, JSON.stringify(saveData));
      
      // Update save slots list
      const newSlots = saveSlots.filter(slot => slot.id !== slotId);
      newSlots.push({
        id: slotId,
        name: slotName,
        playerName: saveData.playerName,
        currentRoom: saveData.currentRoom,
        timestamp: saveData.timestamp,
        score: saveData.score,
        playTime: saveData.playTime
      });
      
      setSaveSlots(newSlots);
      localStorage.setItem('gorstan_save_slots', JSON.stringify(newSlots));
      
      dispatch({ 
        type: 'RECORD_MESSAGE', 
        payload: { 
          id: `save-success-${Date.now()}`, 
          text: `Game saved as "${slotName}"`, 
          type: 'system', 
          timestamp: Date.now() 
        } 
      });
      closeModal();
    } catch (error) {
      console.error('Failed to save game:', error);
      dispatch({ 
        type: 'RECORD_MESSAGE', 
        payload: { 
          id: `save-error-${Date.now()}`, 
          text: 'Failed to save game - storage may be full', 
          type: 'error', 
          timestamp: Date.now() 
        } 
      });
    }
  }, [state, saveSlots, dispatch, closeModal]);

  const handleLoad = useCallback((slotId: string) => {
    try {
      const savedData = localStorage.getItem(`gorstan_save_${slotId}`);
      if (savedData) {
        const saveData = JSON.parse(savedData);
        
        // Update the game state with loaded data
        dispatch({ type: 'ADVANCE_STAGE', payload: saveData.gameState.stage });
        dispatch({ type: 'SET_PLAYER_NAME', payload: saveData.gameState.player.name });
        dispatch({ type: 'MOVE_TO_ROOM', payload: saveData.gameState.currentRoomId });
        
        // Restore flags
        Object.entries(saveData.gameState.flags).forEach(([flag, value]) => {
          dispatch({ type: 'SET_FLAG', payload: { flag, value } });
        });
        
        dispatch({ 
          type: 'RECORD_MESSAGE', 
          payload: { 
            id: `load-success-${Date.now()}`, 
            text: `Game loaded: "${saveData.name}"`, 
            type: 'system', 
            timestamp: Date.now() 
          } 
        });
        closeModal();
      }
    } catch (error) {
      console.error('Failed to load game:', error);
      dispatch({ 
        type: 'RECORD_MESSAGE', 
        payload: { 
          id: `load-error-${Date.now()}`, 
          text: 'Failed to load game - save data may be corrupted', 
          type: 'error', 
          timestamp: Date.now() 
        } 
      });
    }
  }, [dispatch, closeModal]);

  const handleDeleteSave = useCallback((slotId: string) => {
    try {
      localStorage.removeItem(`gorstan_save_${slotId}`);
      const newSlots = saveSlots.filter(slot => slot.id !== slotId);
      setSaveSlots(newSlots);
      localStorage.setItem('gorstan_save_slots', JSON.stringify(newSlots));
      
      dispatch({ 
        type: 'RECORD_MESSAGE', 
        payload: { 
          id: `delete-success-${Date.now()}`, 
          text: 'Save deleted successfully', 
          type: 'system', 
          timestamp: Date.now() 
        } 
      });
    } catch (error) {
      console.error('Failed to delete save:', error);
    }
  }, [saveSlots, dispatch]);

  // Load save slots on component mount
  useEffect(() => {
    loadSaveSlots();
  }, [loadSaveSlots]);

  // NPC Console functions
  const handleOpenNPCConsole = useCallback((npc?: NPC) => {
    if (npc) {
      // Specific NPC provided
      setSelectedNPC(npc);
      openModal('npcConsole');
    } else if (npcsInRoom.length === 1) {
      // Single NPC in room
      setSelectedNPC(npcsInRoom[0]);
      openModal('npcConsole');
    } else if (npcsInRoom.length > 1) {
      // Multiple NPCs - show selection modal
      openModal('npcSelection');
    } else {
      // No NPCs present - default to Ayla
      const aylaHelper: NPC = {
        id: 'ayla',
        name: 'Ayla',
        location: 'universal', // Ayla is available universally as a helper
        description: 'Your helpful guide through the game',
        portrait: '/images/Ayla.png',
        mood: 'helpful' as NPCMood,
        memory: {
          interactions: 0,
          lastInteraction: Date.now(),
          playerActions: [],
          relationship: 50,
          knownFacts: []
        }
      };
      setSelectedNPC(aylaHelper);
      openModal('npcConsole');
    }
  }, [npcsInRoom, openModal]);

  const handleNPCMessage = useCallback((message: string, npcId: string) => {
    // Send message to NPC engine
    npcReact(npcId, message, state);
    
    // Note: Conversation logging is handled within NPCConsole to prevent double-echo
    // Only log significant game-affecting interactions to main console
  }, [dispatch, state]);

  // Handle NPC selection from selection modal
  const handleSelectNPC = useCallback((npc: NPC) => {
    setSelectedNPC(npc);
    openModal('npcConsole');
  }, [openModal]);

  // Handle group conversation (future feature)
  const handleGroupConversation = useCallback(() => {
    // Future implementation: Create a special group NPC or conversation system
    dispatch({ 
      type: 'RECORD_MESSAGE', 
      payload: { 
        id: `group-chat-${Date.now()}`, 
        text: 'Group conversations are coming soon! For now, please select an individual NPC.', 
        type: 'info', 
        timestamp: Date.now() 
      } 
    });
    closeModal();
  }, [dispatch, closeModal]);

  // Monitor for NPC console flag
  useEffect(() => {
    if (state.flags?.openNPCConsole) {
      const npcId = state.flags.openNPCConsole;
      const targetNPC = npcsInRoom.find((npc: NPC) => 
        npc.id === npcId || npc.name.toLowerCase() === npcId.toLowerCase()
      );
      
      if (targetNPC) {
        handleOpenNPCConsole(targetNPC);
        // Clear the flag
        dispatch({ type: 'SET_FLAG', payload: { flag: 'openNPCConsole', value: null } });
      }
    }
  }, [state.flags?.openNPCConsole, npcsInRoom, handleOpenNPCConsole, dispatch]);

  // Monitor for teleport test trigger
  useEffect(() => {
    if (state.flags?.triggerTeleport) {
      const teleportType = state.flags.triggerTeleport as TeleportType;
      console.log('[AppCore] Teleport test triggered:', teleportType);
      setTeleportType(teleportType);
      setTeleportCallback(() => () => {
        console.log('[AppCore] Teleport test complete');
      });
      // Clear the flag
      dispatch({ type: 'SET_FLAG', payload: { flag: 'triggerTeleport', value: null } });
    }
  }, [state.flags?.triggerTeleport, dispatch]);

  // Enhanced keyboard handler with proper typing
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && modal) {
        closeModal();
      }
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        openModal('saveGame');
      }
      if (e.key.toLowerCase() === 't' && !modal && stage === 'game') {
        // Talk to NPC shortcut
        if (npcsInRoom.length === 1) {
          handleOpenNPCConsole(npcsInRoom[0]);
        } else if (npcsInRoom.length > 1) {
          // Show list of available NPCs
          dispatch({ 
            type: 'RECORD_MESSAGE', 
            payload: { 
              id: `npc-list-${Date.now()}`, 
              text: `NPCs available: ${npcsInRoom.map(npc => npc.name).join(', ')}. Click on one or use "talk [name]"`, 
              type: 'info', 
              timestamp: Date.now() 
            } 
          });
        } else {
          dispatch({ 
            type: 'RECORD_MESSAGE', 
            payload: { 
              id: `no-npcs-${Date.now()}`, 
              text: 'There is no one here to talk to.', 
              type: 'error', 
              timestamp: Date.now() 
            } 
          });
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal, closeModal, openModal, npcsInRoom, handleOpenNPCConsole, stage, dispatch]);

  // Enhanced cleanup effect with proper typing
  useEffect(() => {
    return () => { 
      if (lookModalTimeoutRef.current) {
        clearTimeout(lookModalTimeoutRef.current);
        lookModalTimeoutRef.current = null;
      }
    };
  }, []);

  // Enhanced look around handler with better type safety
  const handleLookAround = useCallback((): void => {
    if (lookModalTimeoutRef.current) {
      clearTimeout(lookModalTimeoutRef.current);
      lookModalTimeoutRef.current = null;
    }

    // Type guard for room existence
    if (!room) {
      setLookLines(['❌ Unable to look around - room not found.']);
      openModal('look');
      lookModalTimeoutRef.current = setTimeout(closeModal, 3000);
      return;
    }

    // Enhanced room information with proper type handling
    const roomTitle: string = (room as any).title || (room as any).name || "Unknown room";
    const roomDescription: string = Array.isArray(room.description) 
      ? room.description[0] || "No description available."
      : room.description?.split('\n')[0] || "No description available.";
    
    // Enhanced item handling with proper typing
    const itemsList: string = room.items && room.items.length > 0
      ? room.items.map((item: Item | string) => 
          typeof item === 'string' ? item : item.name
        ).join(', ')
      : "None";
    
    // Enhanced NPC handling with proper typing
    const npcsList: string = npcsInRoom.length > 0
      ? npcsInRoom.map((npc: NPC | string) => 
          typeof npc === 'string' ? npc : npc.name
        ).join(', ')
      : "None";
    
    // Enhanced exits handling with proper typing
    const exitsList: string = room.exits && Object.keys(room.exits).length > 0
      ? Object.keys(room.exits).join(', ')
      : "None";

    const lines: string[] = [
      `📍 ${roomTitle}`,
      roomDescription,
      `🧺 Items here: ${itemsList}`,
      `🧑‍🤝‍🧑 NPCs here: ${npcsList}`,
      `🚪 Exits: ${exitsList}`
    ];
    
    setLookLines(lines);
    openModal('look');
    lookModalTimeoutRef.current = setTimeout(closeModal, 6000);
  }, [room, npcsInRoom, openModal, closeModal]);

  // Enhanced command handler with better type safety
  const handleCommand = useCallback((cmd: string): void => {
    const lowerCmd: string = cmd.toLowerCase().trim();

    // Enhanced NPC interaction with proper type handling
    if (lowerCmd.startsWith("talk to ")) {
      const npcName: string = lowerCmd.replace("talk to ", "").trim();
      const match: NPC | string | undefined = npcsInRoom.find((npc: NPC | string) => {
        const name: string = typeof npc === 'object' && 'name' in npc ? npc.name : npc as string;
        return name.toLowerCase() === npcName;
      });
      
      if (match) {
        const npcId: string = typeof match === 'object' && 'id' in match ? match.id : match as string;
        npcReact(npcId, "greet", state);
      } else {
        dispatch({ 
          type: 'ADD_MESSAGE', 
          payload: { 
            id: Date.now().toString(), 
            text: `You don't see anyone named "${npcName}".`, 
            type: 'error', 
            timestamp: Date.now() 
          } 
        });
      }
      return;
    }

    // Enhanced modal shortcuts with proper typing
    const modalCommands: Record<string, OpenModalType> = {
      'inv': 'inventory', 
      'inventory': 'inventory', 
      'show inventory': 'inventory', 
      'show inv': 'inventory',
      'look': 'look', 
      'show look': 'look', 
      'show room': 'look', 
      'examine room': 'look',
      'use': 'useItem', 
      'show use': 'useItem', 
      'use item': 'useItem',
      'pickup': 'pickUp', 
      'pick up': 'pickUp', 
      'get': 'pickUp', 
      'take': 'pickUp'
    };
    
    const modalCommand: OpenModalType = modalCommands[lowerCmd];
    if (modalCommand) {
      modalCommand === 'look' ? handleLookAround() : openModal(modalCommand);
      return;
    }

    // Enhanced item examination with proper type safety
    if (lowerCmd.startsWith('look at ')) {
      const item: string = lowerCmd.replace('look at ', '').trim();
      if (item) {
        if (inventory.includes(item)) {
          const description: string = itemDescriptions[item] || 
            `You look at the ${item}, but it doesn't seem particularly special.`;
          dispatch({ 
            type: 'ADD_MESSAGE', 
            payload: { 
              id: Date.now().toString(), 
              text: description, 
              type: 'system', 
              timestamp: Date.now() 
            } 
          });
        } else {
          dispatch({ 
            type: 'ADD_MESSAGE', 
            payload: { 
              id: Date.now().toString(), 
              text: `You're not carrying a '${item}'.`, 
              type: 'error', 
              timestamp: Date.now() 
            } 
          });
        }
        return;
      }
    }

    // Enhanced movement tracking with proper typing
    const movementCommands: string[] = ["sit", "north", "south", "east", "west", "up", "down"];
    const isMovementCommand: boolean = movementCommands.includes(lowerCmd) || 
      lowerCmd.includes("portal") || 
      lowerCmd.includes("enter") || 
      lowerCmd.includes("step");
    
    if (isMovementCommand) {
      setLastMovementAction(lowerCmd);
      // For movement commands, store current room in history and update previousRoom
      if (room) {
        setRoomHistory(prev => [...prev, currentRoomId]);
        setPreviousRoom(room);
      }
    } else {
      setLastMovementAction("");
      // For non-movement commands, just update previousRoom as before
      if (room) setPreviousRoom(room);
    }

    dispatch({ type: 'COMMAND_INPUT', payload: cmd });
  }, [npcsInRoom, room, inventory, dispatch, handleLookAround, openModal, currentRoomId]);

  // Enhanced pickup handler with proper type safety and Dominic special logic
  const handlePickUpItems = useCallback((selectedItems: string[]): void => {
    selectedItems.forEach((item: string) => {
      if (item === 'Run Bag') {
        dispatch({ type: 'SET_RUNBAG_FLAG', payload: true });
        dispatch({ type: 'INCREASE_INVENTORY_CAPACITY' });
        
        // Score for finding useful items
        try {
          const { applyScoreForEvent } = require('../state/scoreEffects');
          applyScoreForEvent('find.hidden.item');
        } catch (error) {
          console.warn('Failed to apply score for item pickup:', error);
        }
        
      } else if (item === 'dominic' && currentRoomId === 'dalesapartment') {
        // Special Dominic logic - activate confirmation modal
        const confirmDominic = window.confirm(
          "🐟 Dominic is a living goldfish! Are you sure you want to take him out of his tank? This might not be good for him..."
        );
        
        if (confirmDominic) {
          const insistDominic = window.confirm(
            "🐟 Dominic looks distressed! Taking a goldfish from water will hurt him. Do you really insist on this?"
          );
          
          if (insistDominic) {
            // Add dead fish instead of live Dominic
            dispatch({ type: 'ADD_TO_INVENTORY', payload: 'deadfish' });
            dispatch({ 
              type: 'ADD_MESSAGE', 
              payload: { 
                id: Date.now().toString(), 
                text: "💀 You removed Dominic from his tank. The poor goldfish didn't survive out of water. You now carry his lifeless body, feeling terrible about your decision.", 
                type: 'error', 
                timestamp: Date.now() 
              } 
            });
            // Set flag that player took Dominic - triggers negative score
            dispatch({ type: 'SET_FLAG', payload: { flag: 'dominicIsDead', value: true } });
            // Remove Dominic from room items
            dispatch({ type: 'REMOVE_ITEM_FROM_ROOM', payload: { roomId: 'dalesapartment', item: 'dominic' } });
          } else {
            dispatch({ 
              type: 'ADD_MESSAGE', 
              payload: { 
                id: Date.now().toString(), 
                text: "🐟 You wisely decide to leave Dominic in his tank where he belongs. He swims happily, grateful for your compassion.", 
                type: 'system', 
                timestamp: Date.now() 
              } 
            });
            
            // Score for ethical decision
            try {
              const { applyScoreForEvent } = require('../state/scoreEffects');
              applyScoreForEvent('dominic.spared');
            } catch (error) {
              console.warn('Failed to apply score for sparing Dominic:', error);
            }
          }
        } else {
          dispatch({ 
            type: 'ADD_MESSAGE', 
            payload: { 
              id: Date.now().toString(), 
              text: "🐟 You decide not to disturb Dominic. He continues swimming peacefully in his tank.", 
              type: 'system', 
              timestamp: Date.now() 
            } 
          });
        }
      } else {
        dispatch({ type: 'ADD_TO_INVENTORY', payload: item });
      }
    });
    closeModal();
  }, [dispatch, closeModal, currentRoomId]);

  // Enhanced teleport completion handler with proper typing
  const handleTeleportComplete = useCallback((): void => {
    setTeleportType(null);
    if (teleportCallback) {
      teleportCallback();
      setTeleportCallback(() => () => {});
    }
  }, [teleportCallback]);

  // Enhanced system controls with proper error handling and typing
  const toggleFullscreen = useCallback((): void => {
    const elem: HTMLElement = document.documentElement;
    try {
      if (!document.fullscreenElement) {
        elem.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
      console.warn('Fullscreen toggle failed:', errorMessage);
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
          id: Date.now().toString(), 
          text: "Fullscreen toggle failed.", 
          type: "error", 
          timestamp: Date.now() 
        } 
      });
    }
  }, [dispatch]);

  const toggleSound = useCallback((): void => {
    setSoundOn((prev: boolean) => {
      const newSoundState: boolean = !prev;
      try {
        const audioElements: NodeListOf<HTMLAudioElement> = document.querySelectorAll("audio");
        audioElements.forEach((audio: HTMLAudioElement) => { 
          audio.muted = !newSoundState; 
        });
      } catch (error: unknown) {
        const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
        console.warn('Sound toggle failed:', errorMessage);
        dispatch({ 
          type: 'ADD_MESSAGE', 
          payload: { 
            id: Date.now().toString(), 
            text: "Sound toggle failed.", 
            type: "error", 
            timestamp: Date.now() 
          } 
        });
      }
      return newSoundState;
    });
  }, [dispatch]);

  // Enhanced room transition info with proper typing
  const transitionInfo = useRoomTransition(previousRoom, room, lastMovementAction);

  // Enhanced direction state with proper typing and memoization
  const availableDirections = useMemo(() => {
    const directions = {
      north: Boolean(room?.exits?.north),
      south: Boolean(room?.exits?.south),
      east: Boolean(room?.exits?.east),
      west: Boolean(room?.exits?.west),
      jump: Boolean(room?.exits?.jump),
      sit: Boolean(room?.exits?.sit),
      up: Boolean(room?.exits?.up),
      down: Boolean(room?.exits?.down)
    };
    
    // Debug logging to see what's happening
    console.log('[AppCore] Current stage:', stage);
    console.log('[AppCore] Current room:', currentRoomId);
    console.log('[AppCore] Room object:', room);
    console.log('[AppCore] Room exits:', room?.exits);
    console.log('[AppCore] Available directions:', directions);
    
    return directions;
  }, [room?.exits, currentRoomId, stage]);

  
  const directionRoomTitles = useMemo(() => ({
    north: room?.exits?.north ? roomMap[room.exits.north]?.title ?? room.exits.north : "",
    south: room?.exits?.south ? roomMap[room.exits.south]?.title ?? room.exits.south : "",
    east : room?.exits?.east  ? roomMap[room.exits.east ]?.title ?? room.exits.east  : "",
    west : room?.exits?.west  ? roomMap[room.exits.west ]?.title ?? room.exits.west  : "",
    jump : room?.exits?.jump  ? roomMap[room.exits.jump ]?.title ?? room.exits.jump  : "",
    sit  : room?.exits?.sit   ? roomMap[room.exits.sit  ]?.title ?? room.exits.sit   : "",
    up   : room?.exits?.up    ? roomMap[room.exits.up   ]?.title ?? room.exits.up    : "",
    down : room?.exits?.down  ? roomMap[room.exits.down ]?.title ?? room.exits.down  : "",
    back : room?.exits?.back  ? roomMap[room.exits.back ]?.title ?? room.exits.back  : "",
    out  : room?.exits?.out   ? roomMap[room.exits.out  ]?.title ?? room.exits.out   : ""
  }), [room?.exits, roomMap]);


  // Enhanced room validation effect with proper typing
  useEffect(() => {
    if (!room && currentRoomId && !roomFallbackAttempted) {
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
          id: Date.now().toString(), 
          text: `Room transition failed: Room '${currentRoomId}' does not exist. Returning to Control Nexus.`, 
          type: 'error', 
          timestamp: Date.now() 
        } 
      });
      dispatch({ type: 'UPDATE_GAME_STATE', payload: { currentRoomId: 'controlnexus' } });
      setRoomFallbackAttempted(true);
    }
  }, [room, currentRoomId, dispatch, roomFallbackAttempted]);

  // Enhanced room transition effect with proper typing
  useEffect(() => {
    if (room && previousRoom && room.id !== previousRoom.id) {
      setRoomTransitionActive(true);
    }
  }, [room, previousRoom]);

  // Room change tracking effect - maintains previousRoom state for backout functionality
  useEffect(() => {
    if (room && room.id) {
      // If we don't have a previousRoom yet, or if the current room is different from previousRoom
      if (!previousRoom) {
        // First room load - set as previous for future navigation
        setPreviousRoom(room);
      } else if (previousRoom.id !== room.id) {
        // Room has changed - the previous room should remain as it was
        // This allows the backout functionality to work correctly
        // previousRoom is updated in handleCommand before dispatch
      }
    }
  }, [room, previousRoom]);

  // Enhanced game initialization with proper error handling and typing
  useEffect(() => {
    if (!state.roomMap || Object.keys(state.roomMap).length === 0) {
      try {
        const loadedRoomMap: Record<string, Room> = getAllRoomsAsObject();
        dispatch({ type: 'LOAD_ROOM_MAP', payload: loadedRoomMap });
        initializeAchievementEngine(dispatch);
        
        const modulePromises: Promise<any>[] = [
          loadModule('../state/scoreManager')
            .then(({ initializeScoreManager }) => initializeScoreManager(dispatch))
            .catch((error: unknown) => {
              console.warn('Failed to load score manager:', error);
              dispatch({ 
                type: 'ADD_MESSAGE', 
                payload: { 
                  id: Date.now().toString(), 
                  text: "Failed to load score manager.", 
                  type: "error", 
                  timestamp: Date.now() 
                } 
              });
            }),
          loadModule('../logic/codexTracker')
            .then(({ initializeCodexTracker }) => initializeCodexTracker(dispatch))
            .catch((error: unknown) => {
              console.warn('Failed to load codex tracker:', error);
              dispatch({ 
                type: 'ADD_MESSAGE', 
                payload: { 
                  id: Date.now().toString(), 
                  text: "Failed to load codex tracker.", 
                  type: "error", 
                  timestamp: Date.now() 
                } 
              });
            }),
          loadModule('../engine/miniquestInitializer')
            .then(({ initializeMiniquests }) => initializeMiniquests())
            .catch((error: unknown) => {
              console.warn('Failed to load miniquest initializer:', error);
              dispatch({ 
                type: 'ADD_MESSAGE', 
                payload: { 
                  id: Date.now().toString(), 
                  text: "Failed to load miniquest initializer.", 
                  type: "error", 
                  timestamp: Date.now() 
                } 
              });
            })
        ];
        
        Promise.allSettled(modulePromises);
        initializeWanderingNPCs(state, dispatch);
      } catch (error: unknown) {
        console.error('Game initialization failed:', error);
        dispatch({ 
          type: 'ADD_MESSAGE', 
          payload: { 
            id: Date.now().toString(), 
            text: "Game initialization failed.", 
            type: "error", 
            timestamp: Date.now() 
          } 
        });
      }
    }
  }, [state.roomMap, dispatch, loadModule, state]);

  // Enhanced room description effect with proper typing
  useEffect(() => {
    if (room?.description && room.description !== lastShownRoomDescription) {
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
          id: Date.now().toString(), 
          text: room.description, 
          type: 'system', 
          timestamp: Date.now() 
        } 
      });
      setLastShownRoomDescription(Array.isArray(room.description) ? room.description.join(' ') : room.description);
      
      if (room.id) {
        handleRoomEntryForWanderingNPCs(room, state, dispatch);
      }
    }
  }, [room, lastShownRoomDescription, dispatch, state]);

  // Enhanced transition execution effect with proper error handling and typing
  useEffect(() => {
    if (!readyForTransition || !transitionType || Object.keys(roomMap).length === 0) return;
    
    try {
      const target: string = transitionTargetRoom.trim().toLowerCase();
      const foundRoom: Room | undefined = roomMap[target];
      const targetRoomId: string = foundRoom ? target : 'controlnexus';
      
      dispatch({ type: 'MOVE_TO_ROOM', payload: targetRoomId });
      
      transitionInventory.forEach((item: string) => {
        dispatch({ type: 'ADD_TO_INVENTORY', payload: item });
      });
      
      dispatch({ type: 'ADVANCE_STAGE', payload: 'game' });
      setTransitionType(null);
      setReadyForTransition(false);
    } catch (error: unknown) {
      const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
      console.error('Transition execution failed:', errorMessage);
      dispatch({ 
        type: 'ADD_MESSAGE', 
        payload: { 
          id: Date.now().toString(), 
          text: "Transition execution failed.", 
          type: "error", 
          timestamp: Date.now() 
        } 
      });
      setTransitionType(null);
      setReadyForTransition(false);
    }
  }, [readyForTransition, transitionType, roomMap, transitionTargetRoom, transitionInventory, dispatch]);

  // Enhanced guard rails with proper type checking
  if (!state.currentRoomId || !state.roomMap || !state.roomMap[state.currentRoomId]) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Guard rails:', {
        currentRoomId: state.currentRoomId,
        roomMapLoaded: Boolean(state.roomMap),
        roomExists: Boolean(state.roomMap?.[state.currentRoomId])
      });
    }
    return <div className="appcore-loading">Loading game world...</div>;
  }

  // Enhanced teleport rendering with proper typing
  if (teleportType === 'fractal') {
    return <TeleportManager teleportType="fractal" onComplete={handleTeleportComplete} />;
  }
  if (teleportType === 'trek') {
    return <TeleportManager teleportType="trek" onComplete={handleTeleportComplete} />;
  }

  // Enhanced stage-based rendering with proper typing
  if (transitionType === 'jump') {
    return <JumpTransition onComplete={() => setReadyForTransition(true)} />;
  }
  if (transitionType === 'sip') {
    return <SipTransition onComplete={() => setReadyForTransition(true)} />;
  }
  if (transitionType === 'wait') {
    return <WaitTransition onComplete={() => setReadyForTransition(true)} />;
  }
  if (transitionType === 'dramatic_wait') {
    return <DramaticWaitTransition onComplete={() => setReadyForTransition(true)} />;
  }
  if (stage === 'splash') {
    return <SplashScreen onComplete={() => dispatch({ type: 'ADVANCE_STAGE', payload: 'welcome' })} />;
  }
  if (stage === 'welcome') {
    return (
      <WelcomeScreen 
        onBegin={() => dispatch({ type: 'ADVANCE_STAGE', payload: 'nameCapture' })} 
        onLoadGame={() => dispatch({ type: 'LOAD_SAVED_GAME' })} 
      />
    );
  }
  if (stage === 'nameCapture') {
    return (
      <PlayerNameCapture 
        onNameSubmit={(name: string) => { 
          dispatch({ type: 'SET_PLAYER_NAME', payload: name }); 
          dispatch({ type: 'ADVANCE_STAGE', payload: 'intro' }); 
        }} 
      />
    );
  }
  if (stage === 'intro') {
    return (
      <TeletypeIntro 
        playerName={playerName} 
        onComplete={(data: IntroCompletionData) => { 
          if (data.targetRoom) setTransitionTargetRoom(data.targetRoom); 
          if (data.inventoryBonus) setTransitionInventory(data.inventoryBonus); 
          setTimeout(() => dispatch({ 
            type: 'ADVANCE_STAGE', 
            payload: `transition_${data.route}` as GameStage 
          }), 750); 
        }} 
      />
    );
  }

  if (!room) {
    return <div className="appcore-loading">Loading room context...</div>;
  }

  // Enhanced modal content rendering with proper typing
  const renderModalContent = (): React.ReactNode => {
    switch (modal) {
      case 'inventory': 
        return <InventoryModal items={inventory} onClose={closeModal} />;
      case 'useItem': 
        return (
          <UseItemModal 
            inventory={inventory} 
            environmentItems={room.environment || []} 
            onClose={closeModal} 
            onUse={(item: string, target?: string) => { 
              dispatch({ 
                type: target ? 'USE_ITEM_WITH' : 'USE_ITEM', 
                payload: target ? { item, target } : { item } 
              }); 
              closeModal(); 
            }} 
          />
        );
      case 'pickUp': 
        return (
          <PickUpItemModal 
            isOpen={true}
            items={room.items?.map((item: Item | string) => 
              typeof item === 'string' ? item : item.name
            ) || []} 
            onClose={closeModal} 
            onPickUp={handlePickUpItems} 
          />
        );
      case 'saveGame':
        return (
          <SaveGameModal
            isOpen={true}
            onClose={closeModal}
            onSave={handleSave}
            onLoad={handleLoad}
            onDelete={handleDeleteSave}
            saveSlots={saveSlots}
          />
        );
      case 'npcConsole':
        return (
          <NPCConsole
            isOpen={true}
            npc={selectedNPC}
            onClose={closeModal}
            onSendMessage={handleNPCMessage}
            playerName={playerName}
          />
        );
      case 'npcSelection':
        return (
          <NPCSelectionModal
            isOpen={true}
            npcs={npcsInRoom}
            onSelectNPC={handleSelectNPC}
            onClose={closeModal}
            onTalkToAll={handleGroupConversation}
          />
        );
      case 'look': 
        return (
          <Modal visible={true} onClose={closeModal} title="Look Around">
            <div className="look-modal-content">
              {lookLines.map((line: string, idx: number) => (
                <div key={idx} className="look-line">{line}</div>
              ))}
            </div>
          </Modal>
        );
      default: 
        return null;
    }
  };

  return (
    <div className="appcore-grid">
      <MultiverseRebootSequence />
      <RoomTransition 
        isActive={roomTransitionActive && transitionInfo.shouldAnimate} 
        transitionType={transitionInfo.transitionType} 
        fromZone={transitionInfo.fromZone} 
        toZone={transitionInfo.toZone} 
        onComplete={() => { 
          setRoomTransitionActive(false); 
          setLastMovementAction(''); 
        }} 
      />

      <div className="quad quad-1">
        <RoomRenderer />
      </div>
      
      <div className="quad quad-2">
        <TerminalConsole messages={state.history} />
      </div>
      
      <div className="quad quad-3">
        <PlayerStatsPanel />
        <CommandInput onCommand={handleCommand} playerName={playerName} />
        <PresentNPCsPanel npcs={npcsInRoom} onTalkToNPC={handleOpenNPCConsole} />
      </div>
      
      <div className="quad quad-4">
        <QuickActionsPanel
          availableDirections={availableDirections}
          directionRoomTitles={directionRoomTitles}
          onShowInventory={() => openModal('inventory')}
          onUse={() => openModal('useItem')}
          onLookAround={handleLookAround}
          onPickUp={() => openModal('pickUp')}
          onPress={() => {
            if (currentRoomId === 'introreset') {
              dispatch({ type: 'PRESS_BLUE_BUTTON' });
            } else {
              dispatch({ type: 'PRESS_ACTION' });
            }
          }}
          onCoffee={() => dispatch({ type: 'COFFEE_ACTION' })}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onJump={() => {
            const currentRoom = state.roomMap[state.currentRoomId];
            const jumpRoomId = currentRoom?.exits?.jump;
            if (jumpRoomId) {
              handleRoomChange(jumpRoomId);
            } else {
              console.warn("🚫 Jump exit not found from current room:", state.currentRoomId);
            }
          }}
          onMove={(direction: string) => {
            console.log('[AppCore] onMove called with direction:', direction);
            const currentRoom = state.roomMap[state.currentRoomId];
            console.log('[AppCore] Current room from state.roomMap:', currentRoom);
            const nextRoomId = currentRoom?.exits?.[direction];
            console.log('[AppCore] Next room ID:', nextRoomId);
            if (nextRoomId) {
              handleRoomChange(nextRoomId);
            } else {
              console.warn("🚧 Invalid direction or no exit:", direction);
            }
          }}
          onSit={() => {
            console.log('[AppCore] onSit called');
            const currentRoom = state.roomMap[state.currentRoomId];
            console.log('[AppCore] Current room from state.roomMap:', currentRoom);
            const sitRoomId = currentRoom?.exits?.sit;
            console.log('[AppCore] Sit room ID:', sitRoomId);
            if (sitRoomId) {
              handleRoomChange(sitRoomId);
            } else {
              console.warn("🚫 Sit exit not found from current room:", state.currentRoomId);
            }
          }}
          playerName={playerName}
          ctrlClickOnInstructions={hasFlag('ctrlClickOnInstructions')}
          onDebugMenu={() => dispatch({ type: 'OPEN_DEBUG' })}
          onBackout={handleBackout}
          canBackout={Boolean(previousRoom && previousRoom.id !== currentRoomId)}
          currentRoomId={currentRoomId}
          npcsInRoom={npcsInRoom}
          onTalkToNPC={handleOpenNPCConsole}
        />
      </div>

      {hasFlag('showInventory') && (
        <div className="quad quad-4 inventory-container">
          <InventoryPanel />
        </div>
      )}
      
      {hasFlag('showDebugPanel') && <DebugPanel />}

      {/* Enhanced modal overlay with proper typing */}
      <ModalOverlay isOpen={Boolean(modal)} onClose={closeModal}>
        {renderModalContent()}
      </ModalOverlay>

      {/* Blue Button Warning Modal */}
      <BlueButtonWarningModal 
        isOpen={Boolean(state.player.flags?.showBlueButtonWarning)}
        onClose={() => dispatch({ type: 'DISMISS_BLUE_BUTTON_WARNING' })}
      />

      {/* Celebration System Active */}
    </div>
  );
};

export default AppCore;

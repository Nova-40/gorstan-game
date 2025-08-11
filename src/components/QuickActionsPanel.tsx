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
// Game module.
import React, { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  Coffee, MousePointerClick, Backpack, Eye,
  Maximize2, Minimize2, Volume2, VolumeX,
  Grab, Hand, Armchair, Undo, PersonStanding, Bug, Redo, MessageCircle, MessageCircleQuestion, Wrench
} from "lucide-react";
import IconButton from "./IconButton";

/**
 * Props interface for the QuickActionsPanel component
 * Enhanced with comprehensive typing for all game actions and controls
 */
interface QuickActionsPanelProps {
  availableDirections: {
    north: boolean;
    south: boolean;
    east: boolean;
    west: boolean;
    jump: boolean;
    sit: boolean;
    up: boolean;
    down: boolean;
  };
  directionRoomTitles: {
    north: string;
    south: string;
    east: string;
    west: string;
    jump: string;
    sit: string;
    up: string;
    down: string;
  };
  onShowInventory: () => void;
  onUse: () => void;
  onLookAround: () => void;
  onPickUp: () => void;
  onPress: () => void;
  onCoffee: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onJump: () => void;
  onMove: (direction: string) => void;
  onSit: () => void;
  playerName: string;
  ctrlClickOnInstructions: boolean;
  onDebugMenu: () => void;
  onBackout: () => void;
  canBackout: boolean;
  currentRoomId: string; // Add this new prop
  npcsInRoom: any[]; // NPCs currently in the room
  onTalkToNPC: (npc?: any) => void; // Function to handle NPC conversation
  hasActiveTraps: boolean; // Whether current room has active traps
  onDisarmTrap: () => void; // Function to handle trap disarming
}

/**
 * QuickActionsPanel Component
 * 
 * Core Purpose: Provides quick access buttons for game actions with terminal-style UI.
 * 
 * Fixed Issues:
 * - Corrected component function signature syntax
 * - Removed duplicate IconButton elements
 * - Fixed broken JSX structure and missing props
 * - Enhanced error handling and timer management
 * - All buttons correctly wired with proper accessibility
 * - All game logic and functionality preserved
 */
const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  availableDirections,
  directionRoomTitles,
  onMove,
  onLookAround,
  onPickUp,
  onShowInventory,
  onUse,
  onPress,
  onCoffee,
  onFullscreen,
  isFullscreen,
  soundOn,
  onToggleSound,
  onJump,
  onSit,
  onDebugMenu,
  playerName,
  ctrlClickOnInstructions,
  onBackout,
  canBackout,
  currentRoomId,
  npcsInRoom,
  onTalkToNPC,
  hasActiveTraps,
  onDisarmTrap,
}) => {
  // State hooks properly placed inside component
  const [isSitting, setIsSitting] = useState<boolean>(false);
  const backoutSoundRef = useRef<HTMLAudioElement | null>(null);
  const sitTimerRef = useRef<number | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  /**
   * Enhanced backout handler with improved audio error handling
   * Core Logic Preserved: Plays fail sound when backout is not available
   */
  const handleBackout = useCallback((): void => {
    if (canBackout) {
      onBackout();
    } else {
      // Play fail sound when backout is not available
      try {
        if (backoutSoundRef.current) {
          backoutSoundRef.current.currentTime = 0;
          const playPromise = backoutSoundRef.current.play();
          
          // Handle promise-based play() method in modern browsers
          if (playPromise !== undefined) {
            playPromise.catch((error: unknown) => {
              console.warn('[QuickActions] Audio play failed:', error);
            });
          }
        }
      } catch (error: unknown) {
        console.warn('[QuickActions] Audio error:', error);
      }
    }
  }, [canBackout, onBackout]);

  /**
   * Enhanced sit handler with proper timer management and cleanup
   * Core Logic Preserved: 3-second sitting animation with visual feedback
   */
  const handleSit = useCallback((): void => {
    if (isSitting) return; // Prevent multiple sit actions
    
    setIsSitting(true);
    
    // Call the actual sit function after a brief delay for visual feedback
    sitTimerRef.current = window.setTimeout(() => {
      onSit();
      
      // Reset sitting state after action completes
      resetTimerRef.current = window.setTimeout(() => {
        setIsSitting(false);
      }, 2500); // Slightly shorter than original for better UX
    }, 500);
  }, [onSit]); // Removed isSitting from dependency array for better performance

  /**
   * Enhanced talk handler with Ayla fallback
   * Opens NPC console with available NPCs or defaults to Ayla
   */
  const handleTalk = useCallback((): void => {
    if (npcsInRoom.length === 1) {
      // Single NPC - talk directly
      onTalkToNPC(npcsInRoom[0]);
    } else if (npcsInRoom.length > 1) {
      // Multiple NPCs - let user choose (handled by the onTalkToNPC function)
      onTalkToNPC();
    } else {
      // No NPCs present - default to Ayla
      const aylaHelper = {
        id: 'ayla',
        name: 'Ayla',
        description: 'Your helpful guide through the game',
        portrait: '/images/Ayla.png'
      };
      onTalkToNPC(aylaHelper);
    }
  }, [npcsInRoom, onTalkToNPC]);

  /**
   * Enhanced cleanup effect for proper timer management
   * Prevents memory leaks and handles component unmounting
   */
  useEffect(() => {
    return () => {
      // Clean up all timers when component unmounts
      if (sitTimerRef.current !== null) {
        clearTimeout(sitTimerRef.current);
        sitTimerRef.current = null;
      }
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  /**
   * Memoized debug visibility check for performance
   * Core Logic Preserved: Debug menu only shows for Geoff with Ctrl+Click
   */
  // Show debug if Geoff and either ctrlClickOnInstructions or debugMode is set
  const showDebug = useMemo((): boolean => {
    return playerName === "Geoff" && (ctrlClickOnInstructions || (typeof window !== 'undefined' && (window as any).debugMode));
  }, [playerName, ctrlClickOnInstructions]);

  /**
   * Fixed direction buttons with proper conditional rendering and no duplicates
   * Prevents unnecessary re-renders when other props change
   */
  const directionButtons = useMemo(() => {
    // Debug logging to check available directions
    console.log('[QuickActions] Available directions received:', availableDirections);
    console.log('[QuickActions] Direction room titles received:', directionRoomTitles);
    
    return (
    <>
      {availableDirections.north && (
        <IconButton 
          key="north"
          icon={<ArrowUp />}
          title={`North${directionRoomTitles.north ? ` (${directionRoomTitles.north})` : ''}`} 
          onClick={() => {
            console.log('[QuickActions] North button clicked');
            onMove("north");
          }}
          aria-label={`Move north${directionRoomTitles.north ? ` to ${directionRoomTitles.north}` : ''}`}
        />
      )}
      {availableDirections.south && (
        <IconButton 
          key="south"
          icon={<ArrowDown />}
          title={`South${directionRoomTitles.south ? ` (${directionRoomTitles.south})` : ''}`} 
          onClick={() => {
            console.log('[QuickActions] South button clicked');
            onMove("south");
          }}
          aria-label={`Move south${directionRoomTitles.south ? ` to ${directionRoomTitles.south}` : ''}`}
        />
      )}
      {availableDirections.west && (
        <IconButton 
          key="west"
          icon={<ArrowLeft />}
          title={`West${directionRoomTitles.west ? ` (${directionRoomTitles.west})` : ''}`} 
          onClick={() => {
            console.log('[QuickActions] West button clicked');
            onMove("west");
          }}
          aria-label={`Move west${directionRoomTitles.west ? ` to ${directionRoomTitles.west}` : ''}`}
        />
      )}
      {availableDirections.up && (
        <IconButton 
          key="up"
          icon={<ArrowUp />}
          title={`Up${directionRoomTitles.up ? ` (${directionRoomTitles.up})` : ''}`} 
          onClick={() => {
            console.log('[QuickActions] Up button clicked');
            onMove("up");
          }}
          aria-label={`Move up${directionRoomTitles.up ? ` to ${directionRoomTitles.up}` : ''}`}
        />
      )}
      {availableDirections.down && (
        <IconButton 
          key="down"
          icon={<ArrowDown />}
          title={`Down${directionRoomTitles.down ? ` (${directionRoomTitles.down})` : ''}`} 
          onClick={() => {
            console.log('[QuickActions] Down button clicked');
            onMove("down");
          }}
          aria-label={`Move down${directionRoomTitles.down ? ` to ${directionRoomTitles.down}` : ''}`}
        />
      )}
      {availableDirections.east && (
        <IconButton 
          key="east"
          icon={<ArrowRight />}
          title={`East${directionRoomTitles.east ? ` (${directionRoomTitles.east})` : ''}`} 
          onClick={() => {
            console.log('[QuickActions] East button clicked');
            onMove("east");
          }}
          aria-label={`Move east${directionRoomTitles.east ? ` to ${directionRoomTitles.east}` : ''}`}
        />
      )}
      {availableDirections.jump && (
        <IconButton 
          key="jump"
          icon={<Redo />} 
          title={`Jump${directionRoomTitles.jump ? ` (${directionRoomTitles.jump})` : ''}`} 
          onClick={() => {
            console.log('[QuickActions] Jump button clicked');
            onJump();
          }}
          aria-label="Jump to different location"
        />
      )}
      {availableDirections.sit && (
        <IconButton 
          key="sit"
          icon={isSitting ? <PersonStanding /> : <Armchair />} 
          title={`${isSitting ? 'Standing up...' : 'Sit'}${directionRoomTitles.sit ? ` (${directionRoomTitles.sit})` : ''}`} 
          onClick={() => {
            console.log('[QuickActions] Sit button clicked');
            handleSit();
          }}
          disabled={isSitting}
          aria-label={isSitting ? 'Currently sitting, please wait' : 'Sit down'}
        />
      )}
    </>
    );
  }, [availableDirections, directionRoomTitles, onMove, onJump, handleSit, isSitting]);

  /**
   * Fixed core action buttons with missing icon prop
   */
  const coreActionButtons = useMemo(() => (
    <>
      <IconButton 
        key="look"
        icon={<Eye />} 
        title="Look Around" 
        onClick={onLookAround}
        aria-label="Look around the current area"
      />
      <IconButton 
        key="pickup"
        icon={<Grab />} 
        title="Pick Up Item" 
        onClick={onPickUp}
        aria-label="Pick up items in the area"
      />
      <IconButton 
        key="use"
        icon={<MousePointerClick />} 
        title="Use Item" 
        onClick={onUse}
        aria-label="Use or interact with items"
      />
      <IconButton 
        key="inventory"
        icon={<Backpack />} 
        title="Inventory" 
        onClick={onShowInventory}
        aria-label="Open inventory"
      />
      <IconButton 
        key="press"
        icon={<Hand />} 
        title={currentRoomId === 'introreset' ? "🟦 BLUE BUTTON" : "Press"} 
        onClick={onPress}
        aria-label={currentRoomId === 'introreset' ? "Press the mysterious blue button" : "Press buttons or switches"}
      />
      <IconButton 
        key="coffee"
        icon={<Coffee />}
        title="Throw or Drink Coffee (essential game mechanic)" 
        onClick={onCoffee}
        aria-label="Coffee-related actions - because caffeine is life"
      />
      <IconButton 
        key="talk"
        icon={npcsInRoom.length > 0 ? <MessageCircle /> : <MessageCircleQuestion />}
        title={npcsInRoom.length > 0 ? 
          `Talk to ${npcsInRoom.length === 1 ? npcsInRoom[0].name || npcsInRoom[0] : 'NPCs'}` : 
          "Talk to NPC/Help"
        }
        onClick={handleTalk}
        aria-label={npcsInRoom.length > 0 ? "Talk to NPCs in the room" : "Talk to NPCs or get help"}
      />
      {hasActiveTraps && (
        <IconButton 
          key="disarm"
          icon={<img src="/images/Caution.png" alt="Trap Warning" style={{ width: 20, height: 20 }} />}
          title="Manage Traps"
          onClick={onDisarmTrap}
          aria-label="Manage traps in this area"
        />
      )}
    </>
  ), [onLookAround, onPickUp, onUse, onShowInventory, onPress, onCoffee, handleTalk, npcsInRoom, hasActiveTraps, onDisarmTrap]);

  /**
   * Fixed system control buttons with missing closing bracket
   */
  const systemControlButtons = useMemo(() => (
    <>
      <IconButton
        key="sound"
        icon={soundOn ? <Volume2 /> : <VolumeX />}
        title={soundOn ? "Sound On (Click to Mute)" : "Sound Off (Click to Enable)"}
        onClick={onToggleSound}
        aria-label={soundOn ? "Mute audio" : "Enable audio"}
      />
      <IconButton
        key="fullscreen"
        icon={isFullscreen ? <Minimize2 /> : <Maximize2 />}
        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        onClick={onFullscreen}
        aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
      />
      <IconButton 
        key="backout"
        icon={<Undo />} 
        title={canBackout ? "Back to Previous Room" : "Cannot go back (no previous room)"} 
        onClick={handleBackout} 
        disabled={!canBackout}
        aria-label={canBackout ? "Return to previous room" : "No previous room to return to"}
      />
      {showDebug && (
        <IconButton 
          key="debug"
          icon={<Bug />} 
          title="Debug Menu (Developer Access)" 
          onClick={onDebugMenu}
          aria-label="Open debug menu"
        />
      )}
    </>
  ), [soundOn, onToggleSound, isFullscreen, onFullscreen, canBackout, handleBackout, showDebug, onDebugMenu]);

  return (
    <div 
      className="quick-actions-panel flex flex-wrap gap-2 justify-center p-4 bg-black/30 backdrop-blur rounded-xl"
      role="toolbar"
      aria-label="Game Action Controls"
    >
      {/* Movement Controls */}
      <div className="contents" role="group" aria-label="Movement">
        {directionButtons}
      </div>

      {/* Core Game Actions */}
      <div className="contents" role="group" aria-label="Game Actions">
        {coreActionButtons}
      </div>

      {/* System Controls */}
      <div className="contents" role="group" aria-label="System Controls">
        {systemControlButtons}
      </div>

      {/* Audio element for backout fail sound - Core Logic Preserved */}
      <audio 
        ref={backoutSoundRef} 
        src="/audio/fail.wav" 
        preload="auto"
        aria-hidden="true"
      />
    </div>
  );
};

export default QuickActionsPanel;

import '../styles/GameUI.css';

import CommandInput from './CommandInput';

import DirectionIconsPanel from './DirectionIconsPanel';

import DramaticWaitTransitionOverlay from './DramaticWaitTransitionOverlay';

import JumpTransition from './animations/JumpTransition';

import MultiverseRebootSequence from './MultiverseRebootSequence';

import PlayerNameCapture from './PlayerNameCapture';

import PlayerStatsPanel from './PlayerStatsPanel';

import PresentNPCsPanel from './PresentNPCsPanel';

import QuickActionsPanel from './QuickActionsPanel';

import React, { useEffect, useRef, useState } from 'react';

import RoomRenderer from './RoomRenderer';

import RoomTransition from './animations/RoomTransition';

import SipTransition from './animations/SipTransition';

import SplashScreen from './SplashScreen';

import TeletypeIntro from './TeletypeIntro';

import TerminalConsole from './TerminalConsole';

import WaitTransition from './animations/WaitTransition';

import WelcomeScreen from './WelcomeScreen';

import { Achievement, Miniquest } from './GameTypes';

import { FlagMap } from '../state/flagRegistry';

import { getAllRoomsAsObject } from '../utils/roomLoader';

import { initializeAchievementEngine } from '../logic/achievementEngine';

import { initializeWanderingNPCs, handleRoomEntryForWanderingNPCs } from '../engine/wanderingNPCController';

import { NPC } from './NPCTypes';

import { Room } from './RoomTypes';

import { useFlags } from '../hooks/useFlags';

import { useGameState } from '../state/gameState';

import { useLibrarianLogic } from '../hooks/useLibrarianLogic';

import { useModuleLoader } from '../hooks/useModuleLoader';

import { useOptimizedEffects } from '../hooks/useOptimizedEffects';

import { useRoomTransition, getZoneDisplayName } from '../hooks/useRoomTransition';

import { useTimers } from '../hooks/useTimers';

import { useWendellLogic } from '../hooks/useWendellLogic';



// AppCore.tsx — components/AppCore.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: AppCore

// Module: src/components/AppCore.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence


// Import optimized hooks for better performance and code organization

const AppCore: React.FC = () => {
  const { state, dispatch } = useGameState();

  // Use optimized hooks for better performance
  const { hasFlag, setFlag, clearFlag } = useFlags();
  const { loadModule } = useModuleLoader();
  const { setTimer, clearTimer } = useTimers();

  const stage = state.stage || '';
  let room = state.roomMap?.[state.currentRoomId] || null;
  if (!room) {
    console.warn(`[AppCore] Room transition failed: Room '${state.currentRoomId}' does not exist. Falling back to 'controlnexus'.`);
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: `Room transition failed: Room '${state.currentRoomId}' does not exist. Returning to Control Nexus.`,
        type: 'error',
        timestamp: Date.now()
      }
    });
    room = state.roomMap?.['controlnexus'] || null;
    if (room) {
      dispatch({ type: 'UPDATE_GAME_STATE', payload: { currentRoomId: 'controlnexus' } });
    }
  }
  const playerName = state.player?.name || 'Player';

  // Apply additional optimized effects for system commands
  useOptimizedEffects(state, dispatch, room);

  const [transitionType, setTransitionType] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [readyForTransition, setReadyForTransition] = useState(false);
  const [roomMapReady, setRoomMapReady] = useState(false);
  const [transitionTargetRoom, setTransitionTargetRoom] = useState<string>('controlnexus');
  const [transitionInventory, setTransitionInventory] = useState<string[]>([]);

  const [lastMovementAction, setLastMovementAction] = useState<string>('');
  const [roomTransitionActive, setRoomTransitionActive] = useState(false);
  const [previousRoom, setPreviousRoom] = useState<any>(null);
  const hasMounted = useRef(false);

  // Track room changes for transition animations
  const { handleWendell } = useWendellLogic(state, dispatch, room, loadModule);
  const { handleLibrarian } = useLibrarianLogic(state, dispatch, room, loadModule);

useEffect(() => {
    if (room && previousRoom && room.id !== previousRoom.id) {
      setRoomTransitionActive(true);
    }
  }, [room, previousRoom]);

  // Handle wandering NPCs when entering rooms (OPTIMIZED)


// Removed: Wandering NPC evaluation flag (evaluateWanderingNPCs not in FlagMap)

  // Handle debug commands for wandering NPCs (OPTIMIZED)


// Removed: debugSpawnRoom logic (debugSpawnRoom not in FlagMap)

  // Handle debug list NPCs (OPTIMIZED)


useEffect(() => {
    if (hasFlag(FlagMap.debug.debugListNPCs)) {
      loadModule('../engine/wanderingNPCController').then(({ debugListActiveWanderingNPCs }) => {
        debugListActiveWanderingNPCs();
      });
      clearFlag(FlagMap.debug.debugListNPCs);
    }
  }, [hasFlag(FlagMap.debug.debugListNPCs), clearFlag, loadModule]);

  // Handle pending Wendell command
  useEffect(() => {
    if (hasFlag(FlagMap.npc.pendingWendellCommand)) {
      handleWendell();
      clearFlag(FlagMap.npc.pendingWendellCommand);
    }
  }, [hasFlag(FlagMap.npc.pendingWendellCommand), state, dispatch, clearFlag, loadModule]);

  // Handle pending Librarian command
  useEffect(() => {
    if (hasFlag(FlagMap.npc.pendingLibrarianCommand)) {
      handleLibrarian();
      clearFlag(FlagMap.npc.pendingLibrarianCommand);
    }
  }, [hasFlag(FlagMap.npc.pendingLibrarianCommand), state, dispatch, clearFlag, loadModule]);

  // Handle force Mr. Wendell spawn (OPTIMIZED)

useEffect(() => {
    if (hasFlag(FlagMap.npc.forceWendellSpawn) && room) {
      loadModule('../engine/mrWendellController').then((module) => {
        setFlag(FlagMap.npc.wasRudeToNPC, true);
        handleRoomEntryForWanderingNPCs(room, state, dispatch);

        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            id: Date.now().toString(),
            text: 'DEBUG: Mr. Wendell spawn conditions activated.',
            type: 'system',
            timestamp: Date.now()
          }
        });
      });
      clearFlag(FlagMap.npc.forceWendellSpawn);
    }
  }, [hasFlag(FlagMap.npc.forceWendellSpawn), room, state, dispatch, setFlag, clearFlag, loadModule]);

  // Handle Mr. Wendell status check (OPTIMIZED)

useEffect(() => {
    if (hasFlag(FlagMap.npc.checkWendellStatus)) {
      loadModule('../engine/mrWendellController').then(({ isWendellActive, getWendellRoom }) => {
        console.log('[DEBUG] Mr. Wendell Status:');
        console.log('- Active:', isWendellActive());
        console.log('- Current Room:', getWendellRoom());
        console.log('- Player Flags:', {
          wasRudeToNPC: hasFlag(FlagMap.npc.wasRudeToNPC),
          wasRudeRecently: hasFlag(FlagMap.npc.wasRudeRecently),
          wendellSpared: hasFlag(FlagMap.npc.wendellSpared)
        });
        console.log('- Cursed Items:', state.player.inventory.filter((item: any) =>
          ['cursedcoin', 'doomedscroll', 'cursed_artifact'].includes(item.toLowerCase())
        ));
      });
      clearFlag(FlagMap.npc.checkWendellStatus);
    }
  }, [hasFlag(FlagMap.npc.checkWendellStatus), state.player.inventory, hasFlag, clearFlag, loadModule]);

  // Handle force Librarian spawn (OPTIMIZED)

useEffect(() => {
    if (hasFlag(FlagMap.npc.forceLibrarianSpawn) && room) {
      loadModule('../engine/librarianController').then(({ spawnLibrarian }) => {
        // Check if it's a library room
        const isLibrary = room.id?.toLowerCase().includes('library') ||
                         room.title?.toLowerCase().includes('library') ||
                         room.description?.toLowerCase().includes('library');

        if (isLibrary) {
          spawnLibrarian(room, state, dispatch);

          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: 'DEBUG: Librarian forcibly spawned.',
              type: 'system',
              timestamp: Date.now()
            }
          });
        } else {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: 'DEBUG: Cannot spawn Librarian - not in a library room.',
              type: 'error',
              timestamp: Date.now()
            }
          });
        }
      });
      clearFlag(FlagMap.npc.forceLibrarianSpawn);
    }
  }, [hasFlag(FlagMap.npc.forceLibrarianSpawn), room, state, dispatch, clearFlag, loadModule]);

  // Handle Librarian status check (OPTIMIZED)


// Removed: checkLibrarianStatus and hasUnlockedScrolls logic (not in FlagMap)

  // Get transition information
  const transitionInfo = useRoomTransition(previousRoom, room, lastMovementAction);

  // Load room map once on first mount (OPTIMIZED)

useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      console.log('[AppCore] Component mounted.');

      const roomMap = getAllRoomsAsObject();
      console.log('[AppCore] Loaded room map:', Object.keys(roomMap));
      dispatch({ type: 'LOAD_ROOM_MAP', payload: roomMap });

      // Initialize achievement engine with dispatch function
      initializeAchievementEngine(dispatch);
      console.log('[AppCore] Achievement engine initialized.');

      // Initialize systems using optimized module loader
      loadModule('../state/scoreManager').then(({ initializeScoreManager }) => {
        initializeScoreManager(dispatch);
        console.log('[AppCore] Score manager initialized.');
      });

      loadModule('../logic/codexTracker').then(({ initializeCodexTracker }) => {
        initializeCodexTracker(dispatch);
        console.log('[AppCore] Codex tracker initialized.');
      });

      loadModule('../engine/miniquestInitializer').then(({ initializeMiniquests }) => {
        initializeMiniquests();
        console.log('[AppCore] Miniquest system initialized.');
      });

      // Initialize wandering NPC system
      initializeWanderingNPCs(dispatch);
      console.log('[AppCore] Wandering NPC system initialized.');
    }

    if (room && !hasLoaded) {
      setHasLoaded(true);
      console.log('[AppCore] Room loaded:', room.id);
    }
  }, [room, hasLoaded, dispatch, loadModule]);

  // Detect when roomMap is populated

useEffect(() => {
    const keys = Object.keys(state.roomMap || {});
    if (keys.length > 0 && !roomMapReady) {
      console.log('[AppCore] roomMap is ready with', keys.length, 'rooms');
      setRoomMapReady(true);
    }
  }, [state.roomMap, roomMapReady]);

  // Detect stage changes — only after roomMap is ready (OPTIMIZED)

useEffect(() => {
    if (!roomMapReady) return;

    const stageTransitions: Record<string, string> = {
      'transition_jump': 'jump',
      'transition_sip': 'sip',
      'transition_wait': 'wait',
      'transition_dramatic_wait': 'dramatic_wait'
    };

    const transitionType = stageTransitions[stage];
    if (transitionType) {
      setTransitionType(transitionType);

      // Apply intro choice scoring using optimized module loader
      loadModule('../state/scoreEffects').then(({ applyScoreForEvent }) => {
        applyScoreForEvent(`intro.choice.${transitionType === 'dramatic_wait' ? 'dramatic_wait' : transitionType}`);
      });
    }
  }, [stage, roomMapReady, loadModule]);

  // Final guarded transition logic

useEffect(() => {
    const availableRooms = Object.keys(state.roomMap || {});
    if (!readyForTransition || !transitionType || availableRooms.length === 0) {
      if (readyForTransition && availableRooms.length === 0) {
        console.warn('[AppCore] Waiting for roomMap to populate...');
      }
      return;
    }

    const target = (transitionTargetRoom || '').trim().toLowerCase();
    console.log('[AppCore] Transition watcher active. Target:', target);
    console.log('[AppCore] Available roomMap keys:', availableRooms);

    const foundRoom = state.roomMap?.[target];
    const fallback = 'controlnexus';

    if (foundRoom) {
      dispatch({ type: 'MOVE_TO_ROOM', payload: target });
      console.log('[AppCore] Moved to room:', target);
    } else {
      console.warn(`[AppCore] Room ${target} not found. Falling back to ${fallback}`);
      dispatch({ type: 'MOVE_TO_ROOM', payload: fallback });
    }

    if (transitionInventory.length) {
      transitionInventory.forEach(item => {
        console.log('[AppCore] Adding inventory item:', item);
        dispatch({ type: 'ADD_TO_INVENTORY', payload: item });
      });
    }

    dispatch({ type: 'ADVANCE_STAGE', payload: 'game' });
    setTransitionType(null);
    setReadyForTransition(false);
  }, [readyForTransition, transitionType, state.roomMap, transitionTargetRoom, transitionInventory, dispatch]);

  const handleCommand = (cmd: string) => {
    // Extract action for transition detection
    const lowerCmd = cmd.toLowerCase().trim();
    if (lowerCmd === 'sit' || lowerCmd.startsWith('sit ')) {
      setLastMovementAction('sit');
    } else if (['north', 'south', 'east', 'west', 'up', 'down'].includes(lowerCmd)) {
      setLastMovementAction(lowerCmd);
    } else if (lowerCmd.includes('portal') || lowerCmd.includes('enter') || lowerCmd.includes('step')) {
      setLastMovementAction('portal');
    } else {
      setLastMovementAction('');
    }

    // Store current room as previous room before command execution
    if (room) {
      setPreviousRoom(room);
    }

    dispatch({ type: 'COMMAND_INPUT', payload: cmd });
    console.log('[AppCore] Command dispatched:', cmd);
  };

  if (transitionType === 'jump') return <JumpTransition onComplete={() => setReadyForTransition(true)} />;
  if (transitionType === 'sip') return <SipTransition onComplete={() => setReadyForTransition(true)} />;
  if (transitionType === 'wait') return <WaitTransition onComplete={() => setReadyForTransition(true)} />;
  if (transitionType === 'dramatic_wait') return <DramaticWaitTransitionOverlay onComplete={() => setReadyForTransition(true)} />;

  if (stage === 'splash') {
    return (
      <SplashScreen
        onComplete={() => dispatch({ type: 'ADVANCE_STAGE', payload: 'welcome' })}
      />
    );
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
        onComplete={({ route, targetRoom, inventoryBonus }) => {
          if (targetRoom) {
            setTransitionTargetRoom(targetRoom);
          }
          if (inventoryBonus) {
            setTransitionInventory(inventoryBonus);
          }

          console.log('[AppCore] Transition triggered:', route, targetRoom);
          setTimeout(() => {
            dispatch({ type: 'ADVANCE_STAGE', payload: `transition_${route}` });
          }, 750);
        }}
      />
    );
  }

  if (!room) {
    return <div className="appcore-loading">Loading room context...</div>;
  }

console.log("[AppCore] STAGE:", stage);
console.log("[AppCore] CURRENT ROOM ID:", state.currentRoomId);
console.log("[AppCore] ROOM OBJECT:", state.roomMap?.[state.currentRoomId]);

  return (
    <div className="appcore-grid">
      {/* Multiverse Reboot Sequence Overlay */}
      <MultiverseRebootSequence />

      {/* Room transition overlay */}
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
        <PresentNPCsPanel npcs={[]} />
      </div>
      <div className="quad quad-4">
        <DirectionIconsPanel />
        <QuickActionsPanel />
      </div>
    </div>
  );
};

export default AppCore;







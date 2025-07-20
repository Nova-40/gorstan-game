// AppCore.tsx — components/AppCore.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: AppCore

// Module: src/components/AppCore.tsx
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

import React, { useEffect, useRef, useState } from 'react';
import SplashScreen from './SplashScreen';
import WelcomeScreen from './WelcomeScreen';
import PlayerNameCapture from './PlayerNameCapture';
import TeletypeIntro from './TeletypeIntro';
import RoomRenderer from './RoomRenderer';
import TerminalConsole from './TerminalConsole';
import CommandInput from './CommandInput';
import PresentNPCsPanel from './PresentNPCsPanel';
import PlayerStatsPanel from './PlayerStatsPanel';
import DirectionIconsPanel from './DirectionIconsPanel';
import QuickActionsPanel from './QuickActionsPanel';
import MultiverseRebootSequence from './MultiverseRebootSequence';
import { useGameState } from '../state/gameState';
import { initializeAchievementEngine } from '../logic/achievementEngine';
import { initializeWanderingNPCs, handleRoomEntryForWanderingNPCs } from '../engine/wanderingNPCController';
import '../styles/GameUI.css';
import { getAllRoomsAsObject } from '../utils/roomLoader';
import JumpTransition from './animations/JumpTransition';
import SipTransition from './animations/SipTransition';
import WaitTransition from './animations/WaitTransition';
import DramaticWaitTransitionOverlay from './DramaticWaitTransitionOverlay';
import RoomTransition from './animations/RoomTransition';
import { useRoomTransition, getZoneDisplayName } from '../hooks/useRoomTransition';

// Import optimized hooks for better performance and code organization
import { useFlags } from '../hooks/useFlags';
import { useModuleLoader } from '../hooks/useModuleLoader';
import { useTimers } from '../hooks/useTimers';
import { useOptimizedEffects } from '../hooks/useOptimizedEffects';

const AppCore: React.FC = () => {
  const { state, dispatch } = useGameState();
  
  // Use optimized hooks for better performance
  const { hasFlag, setFlag, clearFlag } = useFlags();
  const { loadModule } = useModuleLoader();
  const { setTimer, clearTimer } = useTimers();

  const stage = state.stage || '';
  const room = state.roomMap?.[state.currentRoomId] || null;
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
  useEffect(() => {
    if (room && previousRoom && room.id !== previousRoom.id) {
      setRoomTransitionActive(true);
    }
  }, [room, previousRoom]);

  // Handle wandering NPCs when entering rooms (OPTIMIZED)
  useEffect(() => {
    if (room && hasFlag('evaluateWanderingNPCs')) {
      clearFlag('evaluateWanderingNPCs');
      handleRoomEntryForWanderingNPCs(room, state, dispatch);
    }
  }, [room, hasFlag('evaluateWanderingNPCs'), state, dispatch, clearFlag]);

  // Handle debug commands for wandering NPCs (OPTIMIZED)
  useEffect(() => {
    const debugSpawnNPC = hasFlag('debugSpawnNPC');
    const debugSpawnRoom = hasFlag('debugSpawnRoom');
    
    if (debugSpawnNPC && debugSpawnRoom) {
      loadModule('../engine/wanderingNPCController').then(({ debugSpawnWanderingNPC }) => {
        const success = debugSpawnWanderingNPC(debugSpawnNPC, debugSpawnRoom, dispatch);
        
        dispatch({ 
          type: 'ADD_MESSAGE', 
          payload: {
            text: success 
              ? `DEBUG: Spawned NPC '${debugSpawnNPC}' successfully.`
              : `DEBUG: Failed to spawn NPC '${debugSpawnNPC}'.`,
            type: success ? 'system' : 'error',
            timestamp: Date.now()
          }
        });
      });
      
      clearFlag('debugSpawnNPC');
      clearFlag('debugSpawnRoom');
    }
  }, [hasFlag('debugSpawnNPC'), hasFlag('debugSpawnRoom'), dispatch, clearFlag, loadModule]);

  // Handle debug list NPCs (OPTIMIZED)
  useEffect(() => {
    if (hasFlag('debugListNPCs')) {
      loadModule('../engine/wanderingNPCController').then(({ debugListActiveWanderingNPCs }) => {
        debugListActiveWanderingNPCs();
      });
      clearFlag('debugListNPCs');
    }
  }, [hasFlag('debugListNPCs'), clearFlag, loadModule]);

  // Handle pending Mr. Wendell commands (OPTIMIZED)
  useEffect(() => {
    const pendingCommand = hasFlag('pendingWendellCommand');
    
    if (pendingCommand) {
      loadModule('../engine/mrWendellController').then(({ handleWendellInteraction }) => {
        const result = handleWendellInteraction(pendingCommand, state, dispatch);
        if (!result.handled) {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: "I don't understand that command.",
              type: 'error',
              timestamp: Date.now()
            }
          });
        }
      });
      clearFlag('pendingWendellCommand');
    }
  }, [hasFlag('pendingWendellCommand'), state, dispatch, clearFlag, loadModule]);

  // Handle pending Librarian commands (OPTIMIZED)
  useEffect(() => {
    const pendingCommand = hasFlag('pendingLibrarianCommand');
    
    if (pendingCommand) {
      loadModule('../engine/librarianController').then(({ handleLibrarianInteraction }) => {
        const result = handleLibrarianInteraction(pendingCommand, state, dispatch);
        if (!result.handled) {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: {
              id: Date.now().toString(),
              text: "I don't understand that command.",
              type: 'error',
              timestamp: Date.now()
            }
          });
        }
      });
      clearFlag('pendingLibrarianCommand');
    }
  }, [hasFlag('pendingLibrarianCommand'), state, dispatch, clearFlag, loadModule]);

  // Handle force Mr. Wendell spawn (OPTIMIZED)
  useEffect(() => {
    if (hasFlag('forceWendellSpawn') && room) {
      loadModule('../engine/mrWendellController').then((module) => {
        setFlag('wasRudeToNPC', true);
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
      clearFlag('forceWendellSpawn');
    }
  }, [hasFlag('forceWendellSpawn'), room, state, dispatch, setFlag, clearFlag, loadModule]);

  // Handle Mr. Wendell status check (OPTIMIZED)
  useEffect(() => {
    if (hasFlag('checkWendellStatus')) {
      loadModule('../engine/mrWendellController').then(({ isWendellActive, getWendellRoom }) => {
        console.log('[DEBUG] Mr. Wendell Status:');
        console.log('- Active:', isWendellActive());
        console.log('- Current Room:', getWendellRoom());
        console.log('- Player Flags:', {
          wasRudeToNPC: hasFlag('wasRudeToNPC'),
          wasRudeRecently: hasFlag('wasRudeRecently'),
          wendellSpared: hasFlag('wendellSpared')
        });
        console.log('- Cursed Items:', state.player.inventory.filter((item: any) => 
          ['cursedcoin', 'doomedscroll', 'cursed_artifact'].includes(item.toLowerCase())
        ));
      });
      clearFlag('checkWendellStatus');
    }
  }, [hasFlag('checkWendellStatus'), state.player.inventory, hasFlag, clearFlag, loadModule]);

  // Handle force Librarian spawn (OPTIMIZED)
  useEffect(() => {
    if (hasFlag('forceLibrarianSpawn') && room) {
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
      clearFlag('forceLibrarianSpawn');
    }
  }, [hasFlag('forceLibrarianSpawn'), room, state, dispatch, clearFlag, loadModule]);

  // Handle Librarian status check (OPTIMIZED)
  useEffect(() => {
    if (hasFlag('checkLibrarianStatus')) {
      loadModule('../engine/librarianController').then(({ isLibrarianActive, getLibrarianRoom, getLibrarianDebugInfo }) => {
        console.log('[DEBUG] Librarian Status:');
        console.log('- Active:', isLibrarianActive());
        console.log('- Current Room:', getLibrarianRoom());
        console.log('- Debug Info:', getLibrarianDebugInfo());
        console.log('- Player Flags:', {
          hasUnlockedScrolls: hasFlag('hasUnlockedScrolls'),
          hasSolvedLibraryPuzzle: hasFlag('hasSolvedLibraryPuzzle')
        });
        console.log('- Has Greasy Napkin:', state.player.inventory.some((item: any) => 
          item.toLowerCase().includes('napkin')
        ));
      });
      clearFlag('checkLibrarianStatus');
    }
  }, [hasFlag('checkLibrarianStatus'), state.player.inventory, hasFlag, clearFlag, loadModule]);

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
        <PresentNPCsPanel />
      </div>
      <div className="quad quad-4">
        <DirectionIconsPanel />
        <QuickActionsPanel />
      </div>
    </div>
  ); 
};

export default AppCore;








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

const AppCore: React.FC = () => {
  const { state, dispatch } = useGameState();

  const stage = state.stage || '';
  const room = state.roomMap?.[state.currentRoomId] || null;
  const playerName = state.player?.name || 'Player';

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

  // Handle wandering NPCs when entering rooms
  useEffect(() => {
    if (room && state.flags?.evaluateWanderingNPCs) {
      // Clear the flag
      dispatch({ type: 'SET_FLAG', payload: { key: 'evaluateWanderingNPCs', value: false } });
      
      // Evaluate wandering NPCs for the current room
      handleRoomEntryForWanderingNPCs(room, state, dispatch);
    }
  }, [room, state.flags?.evaluateWanderingNPCs, state, dispatch]);

  // Handle debug commands for wandering NPCs
  useEffect(() => {
    if (state.flags?.debugSpawnNPC && state.flags?.debugSpawnRoom) {
      import('../engine/wanderingNPCController').then(({ debugSpawnWanderingNPC }) => {
        const success = debugSpawnWanderingNPC(
          state.flags.debugSpawnNPC, 
          state.flags.debugSpawnRoom, 
          dispatch
        );
        
        dispatch({ 
          type: 'ADD_MESSAGE', 
          payload: {
            text: success 
              ? `DEBUG: Spawned NPC '${state.flags.debugSpawnNPC}' successfully.`
              : `DEBUG: Failed to spawn NPC '${state.flags.debugSpawnNPC}'.`,
            type: success ? 'system' : 'error',
            timestamp: Date.now()
          }
        });
      });
      
      // Clear the flags
      dispatch({ type: 'SET_FLAG', payload: { key: 'debugSpawnNPC', value: false } });
      dispatch({ type: 'SET_FLAG', payload: { key: 'debugSpawnRoom', value: false } });
    }
  }, [state.flags?.debugSpawnNPC, state.flags?.debugSpawnRoom, dispatch]);

  useEffect(() => {
    if (state.flags?.debugListNPCs) {
      import('../engine/wanderingNPCController').then(({ debugListActiveWanderingNPCs }) => {
        debugListActiveWanderingNPCs();
      });
      
      // Clear the flag
      dispatch({ type: 'SET_FLAG', payload: { key: 'debugListNPCs', value: false } });
    }
  }, [state.flags?.debugListNPCs, dispatch]);

  // Handle pending Mr. Wendell commands
  useEffect(() => {
    if (state.flags?.pendingWendellCommand) {
      import('../engine/mrWendellController').then(({ handleWendellInteraction }) => {
        const result = handleWendellInteraction(state.flags.pendingWendellCommand, state, dispatch);
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
      
      // Clear the flag
      dispatch({ type: 'SET_FLAG', payload: { key: 'pendingWendellCommand', value: false } });
    }
  }, [state.flags?.pendingWendellCommand, state, dispatch]);

  // Handle pending Librarian commands
  useEffect(() => {
    if (state.flags?.pendingLibrarianCommand) {
      import('../engine/librarianController').then(({ handleLibrarianInteraction }) => {
        const result = handleLibrarianInteraction(state.flags.pendingLibrarianCommand, state, dispatch);
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
      
      // Clear the flag
      dispatch({ type: 'SET_FLAG', payload: { key: 'pendingLibrarianCommand', value: false } });
    }
  }, [state.flags?.pendingLibrarianCommand, state, dispatch]);

  // Handle force Mr. Wendell spawn
  useEffect(() => {
    if (state.flags?.forceWendellSpawn && room) {
      import('../engine/mrWendellController').then((module) => {
        // Force spawn by setting triggers
        dispatch({ type: 'SET_FLAG', payload: { key: 'wasRudeToNPC', value: true } });
        
        // Trigger room evaluation to spawn Wendell
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
      
      // Clear the flag
      dispatch({ type: 'SET_FLAG', payload: { key: 'forceWendellSpawn', value: false } });
    }
  }, [state.flags?.forceWendellSpawn, room, state, dispatch]);

  // Handle Mr. Wendell status check
  useEffect(() => {
    if (state.flags?.checkWendellStatus) {
      import('../engine/mrWendellController').then(({ isWendellActive, getWendellRoom }) => {
        console.log('[DEBUG] Mr. Wendell Status:');
        console.log('- Active:', isWendellActive());
        console.log('- Current Room:', getWendellRoom());
        console.log('- Player Flags:', {
          wasRudeToNPC: state.flags?.wasRudeToNPC,
          wasRudeRecently: state.flags?.wasRudeRecently,
          wendellSpared: state.flags?.wendellSpared
        });
        console.log('- Cursed Items:', state.player.inventory.filter((item: any) => 
          ['cursedcoin', 'doomedscroll', 'cursed_artifact'].includes(item.toLowerCase())
        ));
      });
      
      // Clear the flag
      dispatch({ type: 'SET_FLAG', payload: { key: 'checkWendellStatus', value: false } });
    }
  }, [state.flags?.checkWendellStatus, state, dispatch]);

  // Handle force Librarian spawn
  useEffect(() => {
    if (state.flags?.forceLibrarianSpawn && room) {
      import('../engine/librarianController').then(({ spawnLibrarian }) => {
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
      
      // Clear the flag
      dispatch({ type: 'SET_FLAG', payload: { key: 'forceLibrarianSpawn', value: false } });
    }
  }, [state.flags?.forceLibrarianSpawn, room, state, dispatch]);

  // Handle Librarian status check
  useEffect(() => {
    if (state.flags?.checkLibrarianStatus) {
      import('../engine/librarianController').then(({ isLibrarianActive, getLibrarianRoom, getLibrarianDebugInfo }) => {
        console.log('[DEBUG] Librarian Status:');
        console.log('- Active:', isLibrarianActive());
        console.log('- Current Room:', getLibrarianRoom());
        console.log('- Debug Info:', getLibrarianDebugInfo());
        console.log('- Player Flags:', {
          hasUnlockedScrolls: state.flags?.hasUnlockedScrolls,
          hasSolvedLibraryPuzzle: state.flags?.hasSolvedLibraryPuzzle
        });
        console.log('- Has Greasy Napkin:', state.player.inventory.some((item: any) => 
          item.toLowerCase().includes('napkin')
        ));
      });
      
      // Clear the flag
      dispatch({ type: 'SET_FLAG', payload: { key: 'checkLibrarianStatus', value: false } });
    }
  }, [state.flags?.checkLibrarianStatus, state, dispatch]);

  // Get transition information
  const transitionInfo = useRoomTransition(previousRoom, room, lastMovementAction);

  // Load room map once on first mount
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
      
      // Initialize score manager with dispatch function
      import('../state/scoreManager').then(({ initializeScoreManager }) => {
        initializeScoreManager(dispatch);
        console.log('[AppCore] Score manager initialized.');
      });
      
      // Initialize codex tracker with dispatch function
      import('../logic/codexTracker').then(({ initializeCodexTracker }) => {
        initializeCodexTracker(dispatch);
        console.log('[AppCore] Codex tracker initialized.');
      });
      
      // Initialize miniquest system
      import('../engine/miniquestInitializer').then(({ initializeMiniquests }) => {
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
  }, [room, hasLoaded, dispatch]);

  // Detect when roomMap is populated
  useEffect(() => {
    const keys = Object.keys(state.roomMap || {});
    if (keys.length > 0 && !roomMapReady) {
      console.log('[AppCore] roomMap is ready with', keys.length, 'rooms');
      setRoomMapReady(true);
    }
  }, [state.roomMap, roomMapReady]);

  // Detect stage changes — only after roomMap is ready
  useEffect(() => {
    if (!roomMapReady) return;

    if (stage === 'transition_jump') {
      setTransitionType('jump');
      // Apply intro choice scoring
      import('../state/scoreEffects').then(({ applyScoreForEvent }) => {
        applyScoreForEvent('intro.choice.jump');
      });
    }
    else if (stage === 'transition_sip') {
      setTransitionType('sip');
      // Apply intro choice scoring
      import('../state/scoreEffects').then(({ applyScoreForEvent }) => {
        applyScoreForEvent('intro.choice.sip');
      });
    }
    else if (stage === 'transition_wait') {
      setTransitionType('wait');
      // Apply intro choice scoring
      import('../state/scoreEffects').then(({ applyScoreForEvent }) => {
        applyScoreForEvent('intro.choice.wait');
      });
    }
    else if (stage === 'transition_dramatic_wait') {
      setTransitionType('dramatic_wait');
      // Apply special scoring for the dramatic wait
      import('../state/scoreEffects').then(({ applyScoreForEvent }) => {
        applyScoreForEvent('intro.choice.dramatic_wait');
      });
    }
  }, [stage, roomMapReady]);

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








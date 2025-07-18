// librarianController.ts
// The Librarian NPC and Three Doors of Resolution puzzle
// (c) 2025 Geoffrey Alan Webster. MIT License

import { LocalGameState } from '../state/gameState';
import { GameAction } from '../types/GameTypes';
import { Room } from '../types/Room';

interface LibrarianState {
  isActive: boolean;
  currentRoomId?: string;
  hasShownScrolls: boolean;
  puzzleActive: boolean;
  puzzleStage: 'inactive' | 'presented' | 'question_asked' | 'completed' | 'failed';
  guardResponse?: string;
  correctDoor?: string;
  entryAttempts: number;
}

let librarianState: LibrarianState = {
  isActive: false,
  hasShownScrolls: false,
  puzzleActive: false,
  puzzleStage: 'inactive',
  entryAttempts: 0
};

/**
 * Check if a room is a library room
 */
function isLibraryRoom(room: Room): boolean {
  const roomId = room.id?.toLowerCase() || '';
  const roomTitle = room.title?.toLowerCase() || '';
  const roomDescription = room.description?.toLowerCase() || '';
  
  return roomId.includes('library') || 
         roomTitle.includes('library') || 
         roomDescription.includes('library');
}

/**
 * Evaluate if the Librarian should spawn in a library room
 */
export function evaluateLibrarianSpawn(
  room: Room,
  gameState: LocalGameState
): { shouldSpawn: boolean; reason: string } {
  
  if (!isLibraryRoom(room)) {
    return { shouldSpawn: false, reason: 'Not a library room' };
  }
  
  // Don't spawn if already active
  if (librarianState.isActive) {
    return { shouldSpawn: false, reason: 'Already active' };
  }
  
  // 80% chance to spawn
  const shouldSpawn = Math.random() < 0.8;
  
  if (!shouldSpawn) {
    // Increment entry attempts
    librarianState.entryAttempts++;
    return { shouldSpawn: false, reason: 'Random chance failed' };
  }
  
  return { shouldSpawn: true, reason: 'Library room spawn' };
}

/**
 * Spawn the Librarian in a library room
 */
export function spawnLibrarian(
  room: Room,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): void {
  librarianState.isActive = true;
  librarianState.currentRoomId = room.id;
  
  // Check if this is after failed attempts
  if (librarianState.entryAttempts > 1) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'The Librarian materializes from between the shelves, adjusting his spectacles.',
        type: 'narrative',
        timestamp: Date.now()
      }
    });
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: `The Librarian: "Ah. I didn't notice you the first time. Or the second. Hope you're not in a hurry, ${gameState.player.name}."`,
        type: 'narrative',
        timestamp: Date.now()
      }
    });
  } else {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'A scholarly figure emerges from the shadows between towering bookshelves. The Librarian nods in acknowledgment.',
        type: 'narrative',
        timestamp: Date.now()
      }
    });
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'The Librarian: "Welcome to the repository of knowledge. How may I assist your research?"',
        type: 'narrative',
        timestamp: Date.now()
      }
    });
  }
  
  // Reset entry attempts since he's now spawned
  librarianState.entryAttempts = 0;
  
  // Check for greasy napkin immediately
  if (gameState.player.inventory.includes('greasy napkin') || 
      gameState.player.inventory.includes('greasily napkin') ||
      gameState.player.inventory.includes('napkin')) {
    setTimeout(() => {
      handleGreasyNapkin(gameState, dispatch);
    }, 1000);
  }
}

/**
 * Handle the greasy napkin interaction
 */
function handleGreasyNapkin(
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): void {
  
  dispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: Date.now().toString(),
      text: 'The Librarian\'s eyes narrow as he notices something in your possession.',
      type: 'narrative',
      timestamp: Date.now()
    }
  });
  
  dispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: Date.now().toString(),
      text: 'The Librarian: "That\'s not a napkin — it\'s your pass."',
      type: 'narrative',
      timestamp: Date.now()
    }
  });
  
  // Unlock scrolls
  dispatch({ type: 'SET_FLAG', payload: { key: 'hasUnlockedScrolls', value: true } });
  
  // Display scrolls
  setTimeout(() => {
    displayScrolls(dispatch);
  }, 1500);
}

/**
 * Display the ancient scrolls content
 */
function displayScrolls(dispatch: React.Dispatch<GameAction>): void {
  const scrolls = [
    "📜 **Ancient Scroll I - The Nature of Truth**",
    "Truth is not always spoken directly. The wise learn to listen for what lies beneath words.",
    "",
    "📜 **Ancient Scroll II - The Paradox of Inquiry**", 
    "To find truth, sometimes you must ask about lies. To understand light, study shadow.",
    "",
    "📜 **Ancient Scroll III - The Guardian's Dilemma**",
    "Three guards stand watch: Truth, Lie, and Chaos. Only one question reveals all.",
    "",
    "📜 **Ancient Scroll IV - The Path to Resolution**",
    "Ask not what IS, but what WOULD BE SAID. The answer you seek hides in reflection."
  ];
  
  scrolls.forEach((scroll, index) => {
    setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `scroll-${Date.now()}-${index}`,
          text: scroll,
          type: 'lore',
          timestamp: Date.now()
        }
      });
    }, index * 800);
  });
  
  // After all scrolls, present the puzzle
  setTimeout(() => {
    presentThreeDoorsPuzzle(dispatch);
  }, scrolls.length * 800 + 1000);
  
  librarianState.hasShownScrolls = true;
}

/**
 * Present the Three Doors of Resolution puzzle
 */
function presentThreeDoorsPuzzle(dispatch: React.Dispatch<GameAction>): void {
  librarianState.puzzleActive = true;
  librarianState.puzzleStage = 'presented';
  
  dispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: Date.now().toString(),
      text: 'The Librarian: "Only those who understand logic deserve to reach Stanton Harcourt."',
      type: 'narrative',
      timestamp: Date.now()
    }
  });
  
  setTimeout(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: '🧓 The Librarian waves his hand. Three glowing doors appear: red, blue, and green.',
        type: 'lore',
        timestamp: Date.now()
      }
    });
  }, 1000);
  
  setTimeout(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'Standing before each is a silent guard.',
        type: 'lore',
        timestamp: Date.now()
      }
    });
  }, 2000);
  
  setTimeout(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: '"One door leads to Stanton Harcourt. One sends you back. One leads nowhere."',
        type: 'lore',
        timestamp: Date.now()
      }
    });
  }, 3000);
  
  setTimeout(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: '"Each guard knows the correct door. One always tells the truth. One always lies. One is random."',
        type: 'lore',
        timestamp: Date.now()
      }
    });
  }, 4000);
  
  setTimeout(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: '"You may ask **only one question**, to **only one guard**. Then, choose a door."',
        type: 'system',
        timestamp: Date.now()
      }
    });
  }, 5000);
  
  // Set up the puzzle logic
  const doors = ['red', 'blue', 'green'];
  librarianState.correctDoor = doors[Math.floor(Math.random() * doors.length)];
}

/**
 * Handle player asking a guard a question
 */
export function handleGuardQuestion(
  question: string,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): { handled: boolean; success: boolean } {
  
  if (!librarianState.puzzleActive || librarianState.puzzleStage !== 'presented') {
    return { handled: false, success: false };
  }
  
  const lowerQuestion = question.toLowerCase().trim();
  
  // Check for the correct question pattern
  const correctPatterns = [
    'if i asked one of the other guards which door leads to stanton harcourt, what would they say',
    'if i asked another guard which door leads to stanton harcourt, what would they say',
    'what would the other guards say if i asked them which door leads to stanton harcourt',
    'which door would the other guards say leads to stanton harcourt'
  ];
  
  const isCorrectQuestion = correctPatterns.some(pattern => 
    lowerQuestion.includes(pattern) || 
    (lowerQuestion.includes('other guard') && 
     lowerQuestion.includes('stanton harcourt') && 
     lowerQuestion.includes('what would'))
  );
  
  if (!isCorrectQuestion) {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'The Librarian sighs. "That\'s... not going to work. Think recursively."',
        type: 'narrative',
        timestamp: Date.now()
      }
    });
    return { handled: true, success: false };
  }
  
  // Give the incorrect door (player should choose opposite)
  const doors = ['red', 'blue', 'green'];
  const wrongDoors = doors.filter(door => door !== librarianState.correctDoor);
  const guardResponse = wrongDoors[Math.floor(Math.random() * wrongDoors.length)];
  
  librarianState.guardResponse = guardResponse;
  librarianState.puzzleStage = 'question_asked';
  
  dispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: Date.now().toString(),
      text: `The guard replies, "He would point to the ${guardResponse} door."`,
      type: 'narrative',
      timestamp: Date.now()
    }
  });
  
  dispatch({
    type: 'ADD_MESSAGE',
    payload: {
      id: Date.now().toString(),
      text: 'Now choose a door: "enter red door", "enter blue door", or "enter green door"',
      type: 'system',
      timestamp: Date.now()
    }
  });
  
  return { handled: true, success: true };
}

/**
 * Handle player choosing a door
 */
export function handleDoorChoice(
  doorColor: string,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): { handled: boolean; success: boolean; teleport?: string } {
  
  if (!librarianState.puzzleActive) {
    return { handled: false, success: false };
  }
  
  const chosenDoor = doorColor.toLowerCase();
  
  // If they haven't asked the question yet
  if (librarianState.puzzleStage === 'presented') {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'The doors remain sealed. You must ask a guard a question first.',
        type: 'system',
        timestamp: Date.now()
      }
    });
    return { handled: true, success: false };
  }
  
  // Check if they chose correctly (should be the correct door if question was asked properly)
  const isCorrect = (librarianState.puzzleStage === 'question_asked' && 
                    chosenDoor === librarianState.correctDoor);
  
  if (isCorrect) {
    // Success!
    librarianState.puzzleStage = 'completed';
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: `The ${chosenDoor} door opens with a brilliant flash of light.`,
        type: 'lore',
        timestamp: Date.now()
      }
    });
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'The Librarian nods. "Well done. Stanton Harcourt awaits."',
        type: 'narrative',
        timestamp: Date.now()
      }
    });
    
    // Set completion flag and trigger teleport
    dispatch({ type: 'SET_FLAG', payload: { key: 'hasSolvedLibraryPuzzle', value: true } });
    
    // Unlock achievement for solving the puzzle
    import('../logic/achievementEngine').then(({ unlockAchievement }) => {
      unlockAchievement('puzzle_solver');
    });
    
    setTimeout(() => {
      dispatch({
        type: 'MOVE_TO_ROOM',
        payload: 'stantonZone_arrival'
      });
    }, 2000);
    
    return { handled: true, success: true, teleport: 'stantonZone_arrival' };
    
  } else {
    // Failure
    librarianState.puzzleStage = 'failed';
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: `The ${chosenDoor} door crumbles to dust. The other doors vanish.`,
        type: 'error',
        timestamp: Date.now()
      }
    });
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: '🧓 The Librarian: "No. You weren\'t ready."',
        type: 'narrative',
        timestamp: Date.now()
      }
    });
    
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        text: 'You feel yourself being pulled back…',
        type: 'system',
        timestamp: Date.now()
      }
    });
    
    // Reset puzzle and teleport back
    setTimeout(() => {
      resetLibrarianState();
      dispatch({
        type: 'MOVE_TO_ROOM',
        payload: 'controlnexus'
      });
    }, 2000);
    
    return { handled: true, success: false, teleport: 'controlnexus' };
  }
}

/**
 * Handle general librarian interaction
 */
export function handleLibrarianInteraction(
  command: string,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): { handled: boolean } {
  
  if (!librarianState.isActive) {
    return { handled: false };
  }
  
  const lowerCommand = command.toLowerCase().trim();
  
  // Handle asking guard questions
  if (lowerCommand.startsWith('ask guard')) {
    const question = lowerCommand.replace('ask guard:', '').trim();
    const result = handleGuardQuestion(question, gameState, dispatch);
    return { handled: result.handled };
  }
  
  // Handle door choices
  if (lowerCommand.includes('enter') && lowerCommand.includes('door')) {
    let doorColor = '';
    if (lowerCommand.includes('red')) doorColor = 'red';
    else if (lowerCommand.includes('blue')) doorColor = 'blue';
    else if (lowerCommand.includes('green')) doorColor = 'green';
    
    if (doorColor) {
      const result = handleDoorChoice(doorColor, gameState, dispatch);
      return { handled: result.handled };
    }
  }
  
  // Handle talking to librarian
  if (lowerCommand.includes('talk to librarian') || 
      lowerCommand.includes('speak to librarian') ||
      lowerCommand.includes('ask librarian')) {
    
    if (!librarianState.hasShownScrolls && 
        (gameState.player.inventory.includes('greasy napkin') || 
         gameState.player.inventory.includes('napkin'))) {
      handleGreasyNapkin(gameState, dispatch);
    } else {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          text: 'The Librarian: "Knowledge is earned, not given. Bring me proof of your worthiness."',
          type: 'narrative',
          timestamp: Date.now()
        }
      });
    }
    
    return { handled: true };
  }
  
  return { handled: false };
}

/**
 * Check if the Librarian is currently active
 */
export function isLibrarianActive(): boolean {
  return librarianState.isActive;
}

/**
 * Get the Librarian's current room
 */
export function getLibrarianRoom(): string | undefined {
  return librarianState.currentRoomId;
}

/**
 * Reset the Librarian state
 */
export function resetLibrarianState(): void {
  librarianState = {
    isActive: false,
    hasShownScrolls: false,
    puzzleActive: false,
    puzzleStage: 'inactive',
    entryAttempts: 0
  };
}

/**
 * Get current puzzle state for debugging
 */
export function getLibrarianDebugInfo(): LibrarianState {
  return { ...librarianState };
}

// src/engine/librarianController.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Core game engine module.

import { GameAction } from '../types/GameTypes';
import { LocalGameState } from '../state/gameState';
import { NPC } from '../types/NPCTypes';
import { unlockAchievement } from '../logic/achievementEngine';
import type { Room } from '../types/Room';








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



// --- Function: isLibraryRoom ---
function isLibraryRoom(room: Room): boolean {
// Variable declaration
  const roomId = room.id?.toLowerCase() || '';
  // Variable declaration
  const roomTitle = room.title?.toLowerCase() || '';
  // Handle description as either string or string array
  const roomDescription = Array.isArray(room.description) 
    ? room.description.join(' ').toLowerCase()
    : (room.description?.toLowerCase() || '');

  return roomId.includes('library') ||
         roomTitle.includes('library') ||
         roomDescription.includes('library');
}



// --- Function: evaluateLibrarianSpawn ---
export function evaluateLibrarianSpawn(
  room: Room,
  gameState: LocalGameState
): { shouldSpawn: boolean; reason: string } {

  if (!isLibraryRoom(room)) {
    return { shouldSpawn: false, reason: 'Not a library room' };
  }

  
  if (librarianState.isActive) {
    return { shouldSpawn: false, reason: 'Already active' };
  }

  
// Variable declaration
  const shouldSpawn = Math.random() < 0.8;

  if (!shouldSpawn) {
    
    librarianState.entryAttempts++;
    return { shouldSpawn: false, reason: 'Random chance failed' };
  }

  return { shouldSpawn: true, reason: 'Library room spawn' };
}



// --- Function: spawnLibrarian ---
export function spawnLibrarian(
  room: Room,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): void {
  librarianState.isActive = true;
  librarianState.currentRoomId = room.id;

  
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

  
  librarianState.entryAttempts = 0;

  
  if (gameState.player.inventory.includes('greasy napkin') ||
      gameState.player.inventory.includes('greasily napkin') ||
      gameState.player.inventory.includes('napkin')) {
    setTimeout(() => {
      handleGreasyNapkin(gameState, dispatch);
    }, 1000);
  }
}



// --- Function: handleGreasyNapkin ---
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

  
  dispatch({ type: 'SET_FLAG', payload: { key: 'hasUnlockedScrolls', value: true } });

  
  setTimeout(() => {
    displayScrolls(dispatch);
  }, 1500);
}



// --- Function: displayScrolls ---
function displayScrolls(dispatch: React.Dispatch<GameAction>): void {
// Variable declaration
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

  
  setTimeout(() => {
    presentThreeDoorsPuzzle(dispatch);
  }, scrolls.length * 800 + 1000);

  librarianState.hasShownScrolls = true;
}



// --- Function: presentThreeDoorsPuzzle ---
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

  
// Variable declaration
  const doors = ['red', 'blue', 'green'];
  librarianState.correctDoor = doors[Math.floor(Math.random() * doors.length)];
}



// --- Function: handleGuardQuestion ---
export function handleGuardQuestion(
  question: string,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): { handled: boolean; success: boolean } {

  if (!librarianState.puzzleActive || librarianState.puzzleStage !== 'presented') {
    return { handled: false, success: false };
  }

// Variable declaration
  const lowerQuestion = question.toLowerCase().trim();

  
// Variable declaration
  const correctPatterns = [
    'if i asked one of the other guards which door leads to stanton harcourt, what would they say',
    'if i asked another guard which door leads to stanton harcourt, what would they say',
    'what would the other guards say if i asked them which door leads to stanton harcourt',
    'which door would the other guards say leads to stanton harcourt'
  ];

// Variable declaration
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

  
// Variable declaration
  const doors = ['red', 'blue', 'green'];
// Variable declaration
  const wrongDoors = doors.filter(door => door !== librarianState.correctDoor);
// Variable declaration
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



// --- Function: handleDoorChoice ---
export function handleDoorChoice(
  doorColor: string,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): { handled: boolean; success: boolean; teleport?: string } {

  if (!librarianState.puzzleActive) {
    return { handled: false, success: false };
  }

// Variable declaration
  const chosenDoor = doorColor.toLowerCase();

  
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

  
// Variable declaration
  const isCorrect = (librarianState.puzzleStage === 'question_asked' &&
                    chosenDoor === librarianState.correctDoor);

  if (isCorrect) {
    
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

    
    dispatch({ type: 'SET_FLAG', payload: { key: 'hasSolvedLibraryPuzzle', value: true } });

    
    unlockAchievement('puzzle_solver');

    setTimeout(() => {
      dispatch({
        type: 'MOVE_TO_ROOM',
        payload: 'stantonZone_arrival'
      });
    }, 2000);

    return { handled: true, success: true, teleport: 'stantonZone_arrival' };

  } else {
    
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



// --- Function: handleLibrarianInteraction ---
export function handleLibrarianInteraction(
  command: string,
  gameState: LocalGameState,
  dispatch: React.Dispatch<GameAction>
): { handled: boolean } {

  if (!librarianState.isActive) {
    return { handled: false };
  }

// Variable declaration
  const lowerCommand = command.toLowerCase().trim();

  
  if (lowerCommand.startsWith('ask guard')) {
// Variable declaration
    const question = lowerCommand.replace('ask guard:', '').trim();
// Variable declaration
    const result = handleGuardQuestion(question, gameState, dispatch);
    return { handled: result.handled };
  }

  
  if (lowerCommand.includes('enter') && lowerCommand.includes('door')) {
    let doorColor = '';
    if (lowerCommand.includes('red')) doorColor = 'red';
    else if (lowerCommand.includes('blue')) doorColor = 'blue';
    else if (lowerCommand.includes('green')) doorColor = 'green';

    if (doorColor) {
// Variable declaration
      const result = handleDoorChoice(doorColor, gameState, dispatch);
      return { handled: result.handled };
    }
  }

  
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



// --- Function: isLibrarianActive ---
export function isLibrarianActive(): boolean {
  return librarianState.isActive;
}



// --- Function: getLibrarianRoom ---
export function getLibrarianRoom(): string | undefined {
  return librarianState.currentRoomId;
}



// --- Function: resetLibrarianState ---
export function resetLibrarianState(): void {
  librarianState = {
    isActive: false,
    hasShownScrolls: false,
    puzzleActive: false,
    puzzleStage: 'inactive',
    entryAttempts: 0
  };
}



// --- Function: getLibrarianDebugInfo ---
export function getLibrarianDebugInfo(): LibrarianState {
  return { ...librarianState };
}

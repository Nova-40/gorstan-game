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
// Core game engine module.

import { LocalGameState } from "../state/gameState";

import { Puzzle } from "../types/GameTypes";

import { PuzzleData, PuzzleComponent } from "../components/PuzzleInterface";

// Use type-only import for Room to avoid conflicts

export interface PuzzleResult {
  success: boolean;
  feedback: string;
  rewards?: {
    score?: number;
    items?: string[];
    achievements?: string[];
    story?: string[];
    teleport?: string;
  };
  completed?: boolean;
}

export interface PuzzleState {
  [puzzleId: string]: {
    attempts: number;
    solved: boolean;
    hintsUsed: number[];
    timeStarted?: number;
    lastAttempt?: number;
  };
}

export class PuzzleEngine {
  private static instance: PuzzleEngine;
  private puzzles: Map<string, PuzzleData> = new Map();
  private roomPuzzles: Map<string, string[]> = new Map();

  public static getInstance(): PuzzleEngine {
    if (!PuzzleEngine.instance) {
      PuzzleEngine.instance = new PuzzleEngine();
    }
    return PuzzleEngine.instance;
  }

  public initialize(): void {
    this.registerCorePuzzles();
    this.registerMazePuzzles();
    this.registerLogicPuzzles();
    this.registerNavigationPuzzles();
  }

  public registerPuzzle(roomId: string, puzzle: PuzzleData): void {
    this.puzzles.set(puzzle.id, puzzle);

    if (!this.roomPuzzles.has(roomId)) {
      this.roomPuzzles.set(roomId, []);
    }
    this.roomPuzzles.get(roomId)!.push(puzzle.id);
  }

  public getRoomPuzzles(
    roomId: string,
    gameState: LocalGameState,
  ): PuzzleData[] {
    // Variable declaration
    const puzzleIds = this.roomPuzzles.get(roomId) || [];
    // Variable declaration
    const puzzleState = (gameState as any).puzzleState || {};

    return puzzleIds
      .map((id) => this.puzzles.get(id))
      .filter((puzzle): puzzle is PuzzleData => {
        if (!puzzle) {return false;}

        // Variable declaration
        const state = puzzleState[puzzle.id];
        if (state?.solved && !puzzle.type.includes("repeatable")) {
          return false;
        }

        if (puzzle.maxAttempts && state?.attempts >= puzzle.maxAttempts) {
          return false;
        }

        if (puzzle.requiredItems) {
          // Variable declaration
          const hasAllItems = puzzle.requiredItems.every((item: string) =>
            gameState.player.inventory.includes(item),
          );
          if (!hasAllItems) {return false;}
        }

        if (puzzle.requiredTraits) {
          // Variable declaration
          const playerTraits = gameState.player.traits || [];
          // Variable declaration
          const hasAllTraits = puzzle.requiredTraits.every((trait: string) =>
            playerTraits.includes(trait),
          );
          if (!hasAllTraits) {return false;}
        }

        return true;
      });
  }

  public getPuzzle(puzzleId: string): PuzzleData | undefined {
    return this.puzzles.get(puzzleId);
  }

  public async solvePuzzle(
    puzzleId: string,
    solution: any,
    gameState: LocalGameState,
  ): Promise<PuzzleResult> {
    // Variable declaration
    const puzzle = this.puzzles.get(puzzleId);
    if (!puzzle) {
      return {
        success: false,
        feedback: "Puzzle not found.",
      };
    }

    // Variable declaration
    const puzzleState = (gameState as any).puzzleState || {};
    // Variable declaration
    const currentState = puzzleState[puzzleId] || {
      attempts: 0,
      solved: false,
      hintsUsed: [],
    };

    if (puzzle.maxAttempts && currentState.attempts >= puzzle.maxAttempts) {
      return {
        success: false,
        feedback:
          "You have reached the maximum number of attempts for this puzzle.",
      };
    }

    // Variable declaration
    const result = this.validateSolution(puzzle, solution);

    currentState.attempts++;
    currentState.lastAttempt = Date.now();

    if (result.success) {
      currentState.solved = true;

      // Apply score for puzzle solving
      try {
        const { applyScoreForEvent } = require("../state/scoreEffects");

        // Determine puzzle difficulty and apply appropriate score
        const difficultyScores: Record<string, string> = {
          simple: "puzzle.solved",
          moderate: "puzzle.solved",
          hard: "solve.puzzle.hard",
          expert: "solve.puzzle.expert",
          creative: "puzzle.solved.creative",
        };

        const difficulty = puzzle.difficulty || "simple";
        const scoreEvent = difficultyScores[difficulty] || "puzzle.solved";
        applyScoreForEvent(scoreEvent);
      } catch (error) {
        console.warn("Failed to apply puzzle solve score:", error);
      }

      return {
        ...result,
        completed: true,
        rewards: puzzle.rewards,
      };
    }

    return result;
  }

  private validateSolution(puzzle: PuzzleData, solution: any): PuzzleResult {
    if (puzzle.validation) {
      return puzzle.validation(solution);
    }

    switch (puzzle.type) {
      case "logic":
        return this.validateLogicPuzzle(puzzle, solution);
      case "pattern":
        return this.validatePatternPuzzle(puzzle, solution);
      case "navigation":
        return this.validateNavigationPuzzle(puzzle, solution);
      case "sequence":
        return this.validateSequencePuzzle(puzzle, solution);
      default:
        return this.validateGenericPuzzle(puzzle, solution);
    }
  }

  private validateLogicPuzzle(puzzle: PuzzleData, solution: any): PuzzleResult {
    if (puzzle.id === "three_doors_resolution") {
      // Variable declaration
      const chosenDoor = solution.door_choice;

      // Variable declaration
      const correctDoors = ["red", "blue", "green"];
      // Variable declaration
      const actualCorrect =
        correctDoors[Math.floor(Math.random() * correctDoors.length)];

      // Variable declaration
      const askedCorrectQuestion =
        solution.question_asked === "logical_deduction";

      if (!askedCorrectQuestion) {
        return {
          success: false,
          feedback:
            "You must ask the right question to the guards first! Try asking about what another guard would say.",
        };
      }

      // Variable declaration
      const success = chosenDoor === actualCorrect;

      return {
        success,
        feedback: success
          ? "Brilliant! Your logical deduction was correct. The doors part before you, revealing the path to Stanton Harcourt!"
          : "The door crumbles to dust. Your logic was flawed - try thinking about what each type of guard would say about the others.",
      };
    }

    // Use puzzle's validation function if available
    if (puzzle.validation && typeof puzzle.validation === "function") {
      try {
        return puzzle.validation(solution);
      } catch (error) {
        console.error("Error in puzzle validation:", error);
        return {
          success: false,
          feedback: "An error occurred while validating your solution.",
        };
      }
    }

    // Default logic puzzle validation - check if solution is truthy
    return {
      success: Boolean(solution),
      feedback: solution
        ? "Logical approach accepted!"
        : "This logic puzzle needs a valid solution.",
    };
  }

  private validatePatternPuzzle(
    puzzle: PuzzleData,
    solution: any,
  ): PuzzleResult {
    if (puzzle.id.includes("pattern_grid")) {
      // Variable declaration
      const selectedCells = solution.pattern_grid || [];

      // Variable declaration
      const correctPattern = [0, 3, 6, 7, 8];

      // Variable declaration
      const isCorrect =
        selectedCells.length === correctPattern.length &&
        correctPattern.every((cell: number) => selectedCells.includes(cell));

      return {
        success: isCorrect,
        feedback: isCorrect
          ? "Perfect! You identified the correct pattern."
          : "That's not quite right. Look for geometric shapes or symmetries in the pattern.",
      };
    }

    // Use puzzle's validation function if available
    if (puzzle.validation && typeof puzzle.validation === "function") {
      try {
        return puzzle.validation(solution);
      } catch (error) {
        console.error("Error in pattern puzzle validation:", error);
        return {
          success: false,
          feedback: "An error occurred while validating the pattern.",
        };
      }
    }

    return {
      success: false,
      feedback: "This pattern puzzle requires a specific validation method.",
    };
  }

  private validateNavigationPuzzle(
    puzzle: PuzzleData,
    solution: any,
  ): PuzzleResult {
    if (puzzle.id.includes("maze_navigation")) {
      // Variable declaration
      const moves = solution.move_sequence || [];
      // Variable declaration
      const correctSequence = ["north", "east", "south", "east", "north"];

      // Variable declaration
      const isCorrect =
        moves.length === correctSequence.length &&
        moves.every(
          (move: string, index: number) => move === correctSequence[index],
        );

      return {
        success: isCorrect,
        feedback: isCorrect
          ? "Excellent navigation! You found the correct path through the maze."
          : "That path doesn't lead to the destination. Try following the echo sounds or wall markings.",
      };
    }

    // Use puzzle's validation function if available
    if (puzzle.validation && typeof puzzle.validation === "function") {
      try {
        return puzzle.validation(solution);
      } catch (error) {
        console.error("Error in navigation puzzle validation:", error);
        return {
          success: false,
          feedback: "An error occurred while validating the navigation.",
        };
      }
    }

    return {
      success: false,
      feedback: "This navigation puzzle requires a specific route validation.",
    };
  }

  private validateSequencePuzzle(
    puzzle: PuzzleData,
    solution: any,
  ): PuzzleResult {
    if (puzzle.id.includes("tome_sequence")) {
      // Variable declaration
      const sequence = solution.tome_order || [];
      // Variable declaration
      const correctSequence = [
        "tome_of_origins",
        "tome_of_elements",
        "tome_of_balance",
        "tome_of_endings",
      ];

      // Variable declaration
      const isCorrect =
        sequence.length === correctSequence.length &&
        sequence.every(
          (tome: string, index: number) => tome === correctSequence[index],
        );

      return {
        success: isCorrect,
        feedback: isCorrect
          ? "The tomes resonate with power as they are placed in the correct order!"
          : "The tomes reject this arrangement. Consider the natural progression from beginning to end.",
      };
    }

    // Use puzzle's validation function if available
    if (puzzle.validation && typeof puzzle.validation === "function") {
      try {
        return puzzle.validation(solution);
      } catch (error) {
        console.error("Error in sequence puzzle validation:", error);
        return {
          success: false,
          feedback: "An error occurred while validating the sequence.",
        };
      }
    }

    return {
      success: false,
      feedback: "This sequence puzzle requires a specific order validation.",
    };
  }

  private validateGenericPuzzle(
    puzzle: PuzzleData,
    solution: any,
  ): PuzzleResult {
    if (
      puzzle.components?.length === 1 &&
      puzzle.components[0].type === "text_input"
    ) {
      // Variable declaration
      const userAnswer = solution[puzzle.components[0].id]
        ?.toLowerCase()
        .trim();

      const exampleAnswers: { [key: string]: string[] } = {
        riddle_answer: ["mirror", "reflection", "looking glass"],
        password_entry: ["stanton harcourt", "stantonharcourt", "stanton"],
        mathematical_solution: ["42", "forty-two", "forty two"],
      };

      // Variable declaration
      const acceptedAnswers = exampleAnswers[puzzle.id] || [];
      // Variable declaration
      const isCorrect = acceptedAnswers.includes(userAnswer);

      return {
        success: isCorrect,
        feedback: isCorrect
          ? "Correct! Your answer is accepted."
          : "That's not the answer I was looking for. Try thinking about it differently.",
      };
    }

    return {
      success: true,
      feedback: "Solution accepted.",
    };
  }

  private registerCorePuzzles(): void {
    const threeDoorsPuzzle: PuzzleData = {
      id: "three_doors_resolution",
      name: "The Three Doors of Resolution",
      type: "logic",
      difficulty: "hard",
      description:
        "Three doors stand before you: red, blue, and green. Each is guarded by a sentinel. One guard always tells the truth, one always lies, and one answers randomly. Only one door leads to your destination.",
      instructions:
        "You may ask only ONE question to only ONE guard. Then you must choose a door.",
      requiredItems: ["greasy_napkin_with_plans"],
      maxAttempts: 3,
      hints: [
        "Think about what each type of guard would say about the others.",
        "Consider asking about what another guard would tell you.",
        "The logical strategy involves choosing the opposite of what you're told.",
      ],
      components: [
        {
          type: "multiple_choice",
          id: "question_strategy",
          label: "What question will you ask?",
          options: [
            "Which door leads to Stanton Harcourt?",
            "Are you the truthful guard?",
            "If I asked one of the other guards which door leads to Stanton Harcourt, what would they say?",
            "Is the red door the correct one?",
          ],
          required: true,
        },
        {
          type: "door_choice",
          id: "door_choice",
          label: "Choose your door:",
          options: ["Red Door", "Blue Door", "Green Door"],
          required: true,
        },
      ],
      validation: (solution) => {
        // Variable declaration
        const questionStrategy = solution.question_strategy;
        // Variable declaration
        const doorChoice = solution.door_choice;

        // Variable declaration
        const correctQuestion =
          "If I asked one of the other guards which door leads to Stanton Harcourt, what would they say?";
        // Variable declaration
        const askedCorrectQuestion = questionStrategy === correctQuestion;

        if (!askedCorrectQuestion) {
          return {
            success: false,
            feedback:
              "Your question strategy won't give you reliable information. Think about how to get consistent information from inconsistent sources.",
          };
        }

        // Variable declaration
        const wrongDoors = ["Red Door", "Blue Door", "Green Door"].filter(
          (door) => door !== "Green Door",
        );
        // Variable declaration
        const guardResponse =
          wrongDoors[Math.floor(Math.random() * wrongDoors.length)];

        // Variable declaration
        const correctChoice = doorChoice !== guardResponse;

        return {
          success: correctChoice,
          feedback: correctChoice
            ? `The guard says "${guardResponse}" so you choose ${doorChoice}. Brilliant logical deduction! The door opens to reveal the path to Stanton Harcourt!`
            : `The guard says "${guardResponse}" but you chose ${doorChoice}. The door crumbles to dust. Remember: choose the opposite of what they indicate!`,
        };
      },
      rewards: {
        score: 100,
        achievements: ["puzzle_solver", "logical_thinker"],
        story: ["You have proven your logical reasoning to the Librarian."],
      },
    };

    this.registerPuzzle("latticeZone_hiddenlibrary", threeDoorsPuzzle);
    this.registerPuzzle("latticeZone_latticelibrary", threeDoorsPuzzle);
  }

  private registerMazePuzzles(): void {
    const echoNavigationPuzzle: PuzzleData = {
      id: "maze_echo_navigation",
      name: "Echo Chamber Navigation",
      type: "navigation",
      difficulty: "moderate",
      description:
        "The chamber echoes with different sounds from each direction. Follow the correct sequence of echoes to find the hidden passage.",
      instructions:
        "Listen to the echoes and select the path that leads to the familiar sound.",
      components: [
        {
          type: "multiple_choice",
          id: "echo_sequence",
          label: "Which echo pattern do you follow?",
          options: [
            "High-pitched, Low-pitched, Medium-pitched",
            "Low-pitched, High-pitched, Medium-pitched",
            "Medium-pitched, Low-pitched, High-pitched",
            "Low-pitched, Medium-pitched, High-pitched",
          ],
          required: true,
        },
      ],
      hints: [
        "Listen carefully to the echoes as you move through the chamber.",
        "The correct sequence follows a pattern from deep to shallow.",
        "Think about how sound reflects off different surfaces.",
      ],
      rewards: {
        score: 50,
        items: ["echo_stone"],
        story: ["You have mastered the art of echo navigation."],
      },
    };

    this.registerPuzzle("mazeZone_mazeecho", echoNavigationPuzzle);

    const mirrorPatternPuzzle: PuzzleData = {
      id: "mirror_hall_pattern",
      name: "Hall of Mirrors Pattern",
      type: "pattern",
      difficulty: "moderate",
      description:
        "The mirrors show distorted reflections. Mimic the correct pattern to unlock the hidden passage.",
      instructions:
        "Observe the pattern in the distorted reflection and recreate it on the grid.",
      components: [
        {
          type: "pattern_grid",
          id: "mirror_pattern",
          label: "Recreate the mirror pattern:",
          gridSize: { rows: 3, cols: 3 },
          required: true,
        },
      ],
      hints: [
        "The pattern might be reversed or inverted.",
        "Look for symmetrical elements in the reflection.",
        "Sometimes what appears broken is actually the correct pattern.",
      ],
      rewards: {
        score: 60,
        items: ["mirror_shard"],
        story: ["The mirrors acknowledge your pattern recognition skills."],
      },
    };

    this.registerPuzzle("mazeZone_mirrorhall", mirrorPatternPuzzle);
  }

  private registerLogicPuzzles(): void {
    const runeSequencePuzzle: PuzzleData = {
      id: "ancient_rune_sequence",
      name: "Ancient Rune Sequence",
      type: "sequence",
      difficulty: "hard",
      description:
        "Ancient runes cover the wall, telling the story of creation. Arrange them in the correct order to unlock their power.",
      instructions:
        "Place the runes in the order that tells the complete story from beginning to end.",
      components: [
        {
          type: "sequence_selector",
          id: "rune_order",
          label: "Arrange the runes in order:",
          options: [
            "Origin Rune",
            "Element Rune",
            "Life Rune",
            "Balance Rune",
            "Ending Rune",
          ],
          required: true,
        },
      ],
      hints: [
        "Consider the natural progression of existence.",
        "All things have a beginning, middle, and end.",
        "Think about the fundamental forces that shape reality.",
      ],
      rewards: {
        score: 80,
        items: ["runic_knowledge"],
        achievements: ["rune_master"],
        story: ["The ancient knowledge flows through you."],
      },
    };

    this.registerPuzzle("mazeZone_secretmazeentry", runeSequencePuzzle);
  }

  private registerNavigationPuzzles(): void {
    const crossingNavigationPuzzle: PuzzleData = {
      id: "dimensional_crossing_navigation",
      name: "Dimensional Crossing Navigation",
      type: "navigation",
      difficulty: "expert",
      description:
        "The infinite space around you shifts constantly. Use the dimensional compass to find the stable pathway.",
      instructions:
        "Identify the sequence of directions that leads to dimensional stability.",
      requiredItems: ["reality_compass"],
      components: [
        {
          type: "multiple_choice",
          id: "navigation_sequence",
          label: "Which navigation sequence stabilizes reality?",
          options: [
            "North, East, South, West (Cardinal)",
            "Northeast, Southeast, Southwest, Northwest (Diagonal)",
            "Center, North, Center, South (Polar)",
            "Up, Down, Forward, Back (Dimensional)",
          ],
          required: true,
        },
      ],
      hints: [
        "Reality anchors itself to cardinal directions.",
        "The compass needle points to stability.",
        "Sometimes the center is the most stable point.",
      ],
      rewards: {
        score: 120,
        achievements: ["dimensional_navigator"],
        story: ["You have mastered interdimensional navigation."],
      },
    };

    this.registerPuzzle("introZone_crossing", crossingNavigationPuzzle);
  }
}

export default PuzzleEngine;

import { Room } from '../types/RoomTypes';

const moreissues: Room = {
  id: "moreissues",
  zone: "glitchZone",
  title: "More Issues Detected",
  description: [
    "You have entered a sector where errors multiply and diagnostics spiral out of control. The air is thick with static, and the walls are covered in cascading warning messages.",
    "Every surface flickers with unresolved exceptions and recursive error codes. The ground feels unstable, as if the logic holding this place together is on the verge of collapse.",
    "Occasionally, you spot ghostly figures—remnants of failed processes—wandering aimlessly, muttering about lost packets and corrupted stacks.",
    "A central pillar of red light pulses with each new issue detected, sending ripples of instability through the environment."
  ],
  image: "glitchZone_moreissues.png",
  ambientAudio: "error_loop.mp3",

  consoleIntro: [
    ">> SYSTEM ALERT: ERROR CASCADE ESCALATING",
    ">> Issue count: INCREASING",
    ">> Diagnostics: UNSTABLE",
    ">> Recovery: NOT POSSIBLE",
    ">> Recommendation: Isolate and resolve critical failures before proceeding."
  ],

  exits: {
    north: "glitchinguniverse",
    south: "failure",
    east: "datavoid",
    west: "issuesdetected"
  },

  items: [
    "error_patch",
    "recursive_log",
    "unstable_stack",
    "ghost_packet"
  ],

  interactables: {
    "error_pillar": {
      description: "A towering pillar of red light that pulses with every new error detected in the system.",
      actions: ["examine", "analyze", "attempt_stabilize"],
      requires: [],
    },
    "ghost_process": {
      description: "A translucent figure endlessly repeating the same failed operation.",
      actions: ["observe", "debug", "free"],
      requires: [],
    },
    "warning_wall": {
      description: "A wall covered in scrolling warning messages and exception traces.",
      actions: ["read", "trace", "patch"],
      requires: [],
    }
  },

  npcs: [
    {
      id: "ghost_process",
      name: "Ghost Process",
      description: "A spectral remnant of a process that failed to complete, looping through its last operation.",
      dialogue: {
        greeting: "...error... must resolve... can't finish...",
        help: "Find the patch... break the loop... maybe then I can rest...",
        farewell: "...resetting...",
      },
      spawnable: true,
      spawnCondition: "player_attempts_stabilize",
    }
  ],

  events: {
    onEnter: ["triggerErrorCascade", "showWarningMessages"],
    onExit: ["recordErrorEscape"],
    onInteract: {
      error_pillar: ["analyzePillar", "attemptStabilize"],
      ghost_process: ["attemptDebug", "freeProcess"],
      warning_wall: ["traceWarnings", "applyPatch"],
    }
  },

  flags: {
    errorCascadeTriggered: false,
    ghostProcessFreed: false,
    patchApplied: false,
    pillarStabilized: false,
  },

  quests: {
    main: "Survive the Error Cascade",
    optional: [
      "Free the Ghost Process",
      "Stabilize the Error Pillar",
      "Apply a Patch to the Warning Wall",
      "Collect a Ghost Packet"
    ]
  },

  environmental: {
    lighting: "flashing_red_and_yellow",
    temperature: "erratic",
    airQuality: "charged_with_static",
    soundscape: [
      "error_buzz",
      "recursive_beeps",
      "warning_chimes",
      "ghostly_whispers"
    ],
    hazards: ["logic_loops", "error_cascade", "unstable_ground"]
  },

  security: {
    level: "high",
    accessRequirements: [],
    alarmTriggers: ["attempt_stabilize_pillar"],
    surveillanceActive: false,
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "2.0",
    playTested: false,
    difficulty: "hard",
    estimatedPlayTime: "10-15 minutes",
    keyFeatures: [
      "Error cascade hazards",
      "Debugging and patching mechanics",
      "Ghost process NPC",
      "Recursive logic challenges"
    ]
  },

  secrets: {
    hidden_patch: {
      description: "A hidden patch routine buried in the warning wall.",
      requirements: ["trace warning_wall", "apply patch"],
      rewards: ["system_stability", "alternate_exit"],
    },
    ghost_origin: {
      description: "The true cause of the ghost process's failure.",
      requirements: ["debug ghost_process", "free ghost_process"],
      rewards: ["ghost_backstory", "unique_item"],
    }
  },

  customActions: {
    "apply_patch": {
      description: "Apply a patch to a critical error in the system.",
      requirements: ["error_patch"],
      effects: ["reduce_error_cascade", "unlock_exit"],
    },
    "break_loop": {
      description: "Attempt to break a recursive logic loop.",
      requirements: ["recursive_log"],
      effects: ["free_ghost_process", "reduce_hazards"],
    }
  }
};

export default moreissues;

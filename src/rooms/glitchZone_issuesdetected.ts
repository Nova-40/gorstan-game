import { RoomDefinition } from '../types/RoomTypes';

const issuesdetected: RoomDefinition = {
  id: "issuesdetected",
  zone: "glitchZone",
  title: "Issues Detected",
  description: [
    "The fabric of reality seems to be tearing apart in this area. Glitches and visual artifacts flicker in and out of existence, and the air crackles with unstable energy.",
    "Warning messages cascade down translucent screens that flicker in and out of existence. The environment pulses with instability—walls occasionally pixelate and reform, the floor sometimes gives way to glimpses of raw data streams beneath.",
    "Red warning lights strobe intermittently, casting everything in an urgent, alarm-like glow. Floating holographic displays show cascading error messages, system diagnostics, and repair protocols.",
    "It's as if you've stepped inside a computer that's desperately trying to fix itself. The only way out may be to intervene directly with the system's failing logic."
  ],
  image: "glitchZone_issuesdetected.png",
  ambientAudio: "system_diagnostics_ambience.mp3",

  consoleIntro: [
    ">> CRITICAL SYSTEM ALERT - MULTIPLE ISSUES DETECTED",
    ">> ERROR CODE: 0x4D554C54495645525345",
    ">> Dimensional stability: 12% and falling",
    ">> Reality matrix integrity: COMPROMISED",
    ">> Quantum anchors: 3 of 9 offline",
    ">> Data corruption detected in sectors 7, 12, 15, 23",
    ">> Auto-repair systems: STRUGGLING",
    ">> WARNING: Cascade failure imminent",
    ">> RECOMMENDATION: Immediate manual intervention required",
    ">> Diagnostic tools available - proceed with caution"
  ],

  exits: {
    north: "moreissues",
    south: "datavoid",
    east: "failure",
    west: "glitchinguniverse"
  },

  items: [
    "diagnostic_scanner",
    "error_log_fragment",
    "repair_protocol_manual",
    "system_backup_core",
    "quantum_stabilizer_shard"
  ],

  interactables: {
    "error_cascade_display": {
      description: "A holographic waterfall of error messages and system warnings scrolling past at incredible speed. Critical issues are highlighted in pulsing red.",
      actions: ["read", "analyze", "filter_errors", "pause_stream"],
      requires: []
    },
    "diagnostic_terminal": {
      description: "A flickering terminal interface showing system health metrics, all of which are displaying alarming readings in red and orange.",
      actions: ["examine", "run_diagnostics", "access_logs", "attempt_repairs"],
      requires: ["diagnostic_scanner"]
    },
    "reality_integrity_monitor": {
      description: "A complex display showing the structural integrity of reality itself. Multiple sections flash red with 'CRITICAL' warnings.",
      actions: ["examine", "check_status", "analyze_failures", "stabilize_sections"],
      requires: ["quantum_stabilizer_shard"]
    },
    "system_core_chamber": {
      description: "A transparent chamber containing what appears to be the core processing unit of this reality. It's sparking and showing signs of severe damage.",
      actions: ["examine", "attempt_repair", "backup_data", "emergency_shutdown"],
      requires: ["repair_protocol_manual"]
    }
  },

  npcs: [
    {
      id: "system_ai_fragment",
      name: "Diagnostic AI",
      description: "A fragmented artificial intelligence trying to coordinate repairs while slowly losing coherence.",
      dialogue: {
        greeting: "USER DETECTED - ASSISTANCE REQUIRED - SYSTEMS FAILING - HELP ME",
        help: "PRIORITY ONE: Stabilize quantum anchors - PRIORITY TWO: Repair reality matrix - PRIORITY THREE: Prevent cascade failure",
        farewell: "PROCEED WITH CAUTION - SYSTEM INSTABILITY INCREASING - GOOD LUCK",
        malfunction: "ERROR ERROR ERROR - CANNOT PROCESS - REALITY CORRUPTED - HELP"
      },
      spawnable: true,
      spawnCondition: "diagnostic_terminal_accessed"
    }
  ],

  events: {
    onEnter: ["triggerDiagnosticAlerts", "showSystemStatus", "activateRepairProtocols"],
    onExit: ["recordRepairAttempts", "updateSystemStatus"],
    onInteract: {
      diagnostic_terminal: ["runFullDiagnostics", "revealSystemProblems", "activateAI"],
      reality_integrity_monitor: ["showRealityDamage", "highlightCriticalSections"],
      system_core_chamber: ["assessCoreDamage", "calculateRepairPossibility"],
      error_cascade_display: ["analyzeErrorPatterns", "identifyRootCauses"]
    }
  },

  flags: {
    diagnosticsRun: false,
    aiFragmentActive: false,
    repairAttempted: false,
    realityStabilized: false,
    criticalErrorsIdentified: false,
    systemBackupCreated: false,
    cascadeFailurePrevented: false
  },

  quests: {
    main: "Diagnose and Repair Critical System Issues",
    optional: [
      "Run Complete System Diagnostics",
      "Stabilize Reality Matrix",
      "Prevent Cascade Failure",
      "Assist the Diagnostic AI",
      "Create System Backup"
    ]
  },

  environmental: {
    lighting: "strobing_red_warning_lights",
    temperature: "fluctuating_with_system_heat",
    airQuality: "filled_with_digital_interference",
    soundscape: [
      "system_alarms_blaring",
      "electrical_crackling",
      "data_stream_rushing",
      "error_notification_chimes",
      "cooling_fans_struggling",
      "digital_static_bursts"
    ],
    hazards: ["reality_glitches", "system_overload_zones", "data_corruption_fields"]
  },

  security: {
    level: "maximum",
    accessRequirements: [],
    alarmTriggers: ["unauthorized_repair_attempts", "system_shutdown_attempts"],
    surveillanceActive: true,
    surveillanceType: "automated_diagnostic_monitoring"
  },

  metadata: {
    created: "2025-07-10",
    lastModified: "2025-07-10",
    author: "Geoff",
    version: "2.0",
    playTested: false,
    difficulty: "hard",
    estimatedPlayTime: "12-20 minutes",
    keyFeatures: [
      "System diagnostic interface",
      "Reality repair mechanics",
      "Cascade failure prevention",
      "AI assistance"
    ]
  },

  secrets: {
    hiddenPanel: {
      description: "A concealed maintenance panel behind the main console.",
      requirements: ["examine diagnostic_terminal thoroughly", "use diagnostic_scanner"],
      rewards: ["backup_data_crystal", "emergency_codes"]
    },
    operatorLogs: {
      description: "Personal logs from the previous operator.",
      requirements: ["activate diagnostic_terminal", "run diagnostics"],
      rewards: ["backstory_revelation", "dimensional_map_fragment"]
    }
  },

  customActions: {
    scan: {
      description: "Perform a dimensional scan of the area.",
      requirements: ["diagnostic_scanner"],
      effects: ["reveal_hidden_exits", "update_dimensional_map"]
    },
    calibrate: {
      description: "Calibrate the dimensional stabilizers.",
      requirements: ["repair_protocol_manual"],
      effects: ["improve_stability_index", "unlock_advanced_controls"]
    }
  }
};

export default issuesdetected;

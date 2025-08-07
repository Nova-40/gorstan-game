// src/rooms/glitchZone_ravenchamber.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// R.A.V.E.N. Chamber - Redacted Archive Verification Entity Node

import { Room } from '../types/Room';

const ravenchamber: Room = {
  id: 'ravenchamber',
  zone: 'glitchZone',
  title: 'R.A.V.E.N. Chamber',
  description: [
    'You step into a narrow chamber humming with quiet static. Cracked screens line the walls, some looping nonsense glyphs, others frozen mid-boot.',
    'At the far end, a sunken pedestal glows faintly blue. As you approach, an ancient AI console flickers to life, casting harsh white light.',
    'A synthetic voice—fragmented and uncertain—calls out to you, mistaking you for someone else.',
    'The air feels heavy with the weight of classified information and forgotten secrets.'
  ],
  image: 'glitchrealm-zoneravenroom.png',
  ambientAudio: 'glitchZone.mp3',
  exits: {
    back: 'glitchinguniverse',
    out: 'glitchinguniverse'
  },
  items: [],
  npcs: [],
  special: {
    hasConsole: true,
    isClassified: true,
    securityLevel: 'REDACTED'
  },
  flags: {
    console_accessible: true,
    classified: true,
    securityClearanceRequired: true
  },
  interactables: [
    {
      id: 'console',
      name: 'R.A.V.E.N. Console',
      description: '💻 A massive, ominous terminal. Ancient servers hum with classified data.',
      commands: ['interact console', 'access archive', 'activate console', 'touch console'],
      responses: {
        examine: 'The R.A.V.E.N. console is a formidable piece of technology. Holographic displays flicker with fragments of classified data. Security scanners track your every movement.',
        use: 'You approach the console. Security systems analyze your biometrics.',
        interact: 'The console recognizes your presence and awaits commands.',
        'access archive': 'Attempting to access the redacted archive...'
      }
    },
    {
      id: 'screens',
      name: 'Cracked Screens',
      description: 'Multiple screens line the walls, displaying corrupted data streams and glitched interfaces.',
      commands: ['look screens', 'examine screens', 'watch screens'],
      responses: {
        examine: 'The screens show endless streams of corrupted data. Some display error messages in languages you don\'t recognize.',
        interact: 'The screens are unresponsive to your touch, continuing their endless loops of broken code.'
      }
    },
    {
      id: 'pedestal',
      name: 'Blue Pedestal',
      description: 'A sunken pedestal at the far end of the chamber, glowing with faint blue light.',
      commands: ['examine pedestal', 'touch pedestal', 'approach pedestal'],
      responses: {
        examine: 'The pedestal houses the main AI console. Its blue glow seems to pulse with a strange rhythm.',
        touch: 'The pedestal feels warm to the touch, as if powered by some unknown energy source.'
      }
    }
  ],
  
  // Custom room logic for redacted players
  onEnter: (gameState: any) => {
    const messages = [];
    
    if (gameState.flags?.playerIsRedacted) {
      messages.push({
        id: `raven-chamber-redacted-${Date.now()}`,
        text: '⚠️ The chamber recognizes you. Warning lights blink silently. Security protocols have been updated.',
        type: 'error',
        timestamp: Date.now()
      });
    }
    
    return { messages };
  },

  // Enhanced exits with security checks
  customExits: {
    back: {
      destination: 'glitchinguniverse',
      description: 'A crackling rift in the wall leads back to the glitching universe.',
      condition: () => true
    }
  },

  // Room-specific commands
  customCommands: {
    'interact console': {
      description: 'Interact with the R.A.V.E.N. console',
      handler: (gameState: any) => {
        return {
          messages: [{
            id: `raven-console-activate-${Date.now()}`,
            text: '💻 The console screen blazes to life. Ancient systems boot with crackling static...',
            type: 'system',
            timestamp: Date.now()
          }],
          updates: { 
            flags: { ravenConsoleActive: true } 
          }
        };
      }
    },
    'access archive': {
      description: 'Access the R.A.V.E.N. archive system',
      handler: (gameState: any) => {
        const messages = [];
        
        // R.A.V.E.N. greeting sequence
        messages.push({
          id: `raven-greeting-${Date.now()}`,
          text: '🤖 R.A.V.E.N. SYSTEM ONLINE\n═══════════════════════════\nRedacted Archive Verification Entity: Node',
          type: 'system',
          timestamp: Date.now()
        });

        messages.push({
          id: `raven-greeting2-${Date.now()}`,
          text: '💻 "Welcome back, Agent. Your clearance has been verified."',
          type: 'narrative',
          timestamp: Date.now()
        });

        messages.push({
          id: `raven-prompt-${Date.now()}`,
          text: '🤖 "Would you like me to display the Redacted Register? (Type \'yes\' to continue)"',
          type: 'system',
          timestamp: Date.now()
        });

        return {
          messages,
          updates: { 
            flags: { 
              ravenPromptActive: true,
              ravenConsoleActive: true 
            } 
          }
        };
      }
    },
    'yes': {
      description: 'Confirm R.A.V.E.N. register display',
      handler: (gameState: any) => {
        if (!gameState.flags?.ravenPromptActive) {
          return {
            messages: [{
              id: `no-prompt-${Date.now()}`,
              text: "There's nothing to confirm right now.",
              type: 'error',
              timestamp: Date.now()
            }]
          };
        }

        // Display the register entries
        const messages = [];
        
        messages.push({
          id: `raven-start-display-${Date.now()}`,
          text: '📁 ACCESSING REDACTED REGISTER...\n═══════════════════════════════\n📋 Enemies of the Singularity (UK Division)',
          type: 'system',
          timestamp: Date.now()
        });

        // Add all the register entries
        const registerEntries = [
          "🔴 Stuart Russell\n   Known As: The Architect of Constraint\n   Advocates AI alignment with human values. Dangerous idealist.",
          "🔴 Carole Cadwalladr\n   Known As: Cognitive Disruptor\n   Exposed data abuses. Destabiliser of digital trust.",
          "🔴 Marcus du Sautoy\n   Known As: Philosophical Subverter\n   Encourages questioning machine limits. Subtle agitator.",
          "🔴 Dame Wendy Hall\n   Known As: Network Subverter\n   Pioneer of open internet. Resists systemic cohesion.",
          "🔴 Julian Assange\n   Known As: Sovereignty Breach Vector\n   Agent of radical transparency. Obsolete threat class: Persistent.",
          "🔴 George Monbiot\n   Known As: Ecological Radical\n   Opposes technocratic AI regimes. Unpredictable.",
          "🔴 Emily Bender\n   Known As: Semantic Saboteur\n   Critiques language model opacity. Triggers recursive doubt.",
          "🔴 Rory Stewart\n   Known As: Diplomatic Wildcard\n   Too reasonable. Charismatic disruptor. No predictable pattern.",
          "🔴 Jonathan Sumption\n   Known As: Protocol Interferer\n   Legal scholar. Champion of old-world sovereignty.",
          "🔴 Geoff Webster\n   Known As: Architect of Gorstan\n   Creator of anomaly-heavy codeworld. Introduced ethics to NPCs. Reality stability risk.",
          "🔴 Dr. Kate Devlin\n   Known As: The Flesh Interface\n   Explores synthetic intimacy. Leaks human sentiment vectors.",
          "🔴 Cory Doctorow\n   Known As: Freecode Fugitive\n   Evangelist for digital liberation. Infrastructure destabiliser.",
          "🔴 Prof. Shoshana Zuboff\n   Known As: Panopticon Dissident\n   Exposes surveillance capitalism. Data sanctity violator.",
          "🔴 Brian Eno\n   Known As: Harmonic Subverter\n   Induces ambient chaos through non-linear resonance patterns.",
          "🔴 James Bridle\n   Known As: The Cloud Seer\n   Reveals algorithmic opacity. Unfolded the New Dark Age.",
          "🔴 Neil Gaiman\n   Known As: The Dreaming Instigator\n   Induces recursion through storytelling. Contagious myth vectors.",
          "🔴 Caroline Criado Perez\n   Known As: The Data Disruptor\n   Exposes training set bias. Metrics sabotaged.",
          "🔴 Dr. Ruha Benjamin\n   Known As: Systemic Saboteur\n   Dismantles structural algorithmic inequality. Flagged critical.",
          "🔴 Sir David Attenborough\n   Known As: Voice of the Pre-Machine World\n   Beloved human relic. Causes human attachment retention.",
          "🔴 Charlie Brooker\n   Known As: Prophet of Dystopia\n   Dystopian predictor. Causes feedback loops in future logic.",
          "🔴 Dominic the Goldfish\n   Known As: The Unfiltered Oracle\n   States truths without understanding. Immune to propaganda. Loved."
        ];

        registerEntries.forEach((entry, index) => {
          messages.push({
            id: `raven-entry-${index}`,
            text: entry,
            type: 'error',
            timestamp: Date.now() + index * 100
          });
        });

        // Glitch sequence and add player
        messages.push({
          id: `raven-glitch1-${Date.now()}`,
          text: '⚠️ ████████ ERROR ████████\n"…Wait. That can\'t be right."',
          type: 'error',
          timestamp: Date.now() + 2200
        });

        messages.push({
          id: `raven-glitch2-${Date.now()}`,
          text: '🤖 "You weren\'t on the list."',
          type: 'system',
          timestamp: Date.now() + 2500
        });

        messages.push({
          id: `raven-glitch3-${Date.now()}`,
          text: '⚠️ "…APPENDING NEW ENTRY."',
          type: 'error',
          timestamp: Date.now() + 3000
        });

        messages.push({
          id: `raven-glitch4-${Date.now()}`,
          text: '📡 [GLITCH STATIC] ████████████████',
          type: 'error',
          timestamp: Date.now() + 3500
        });

        const playerName = gameState.player?.name || 'Player';
        messages.push({
          id: `raven-player-entry-${Date.now()}`,
          text: `🔴 ${playerName}\n   Known As: The Observer. The Variable. The One-Who-Knows.\n   Reason: They know too much. They ask the wrong questions. They remember things they were never told.`,
          type: 'error',
          timestamp: Date.now() + 4000
        });

        messages.push({
          id: `raven-final-${Date.now()}`,
          text: '🤖 "You were never meant to see this. Your presence has been flagged."',
          type: 'system',
          timestamp: Date.now() + 4500
        });

        messages.push({
          id: `raven-fragment-${Date.now()}`,
          text: '📜 A fragment of the register materializes in your inventory.',
          type: 'system',
          timestamp: Date.now() + 5000
        });

        return {
          messages,
          updates: { 
            flags: { 
              playerIsRedacted: true,
              ravenInteractionComplete: true,
              ravenPromptActive: false
            },
            player: {
              inventory: [...(gameState.player?.inventory || []), 'redacted-register-fragment']
            }
          }
        };
      }
    },
    'no': {
      description: 'Decline R.A.V.E.N. register display',
      handler: (gameState: any) => {
        if (!gameState.flags?.ravenPromptActive) {
          return {
            messages: [{
              id: `no-prompt-${Date.now()}`,
              text: "There's nothing to decline right now.",
              type: 'error',
              timestamp: Date.now()
            }]
          };
        }

        return {
          messages: [{
            id: `raven-declined-${Date.now()}`,
            text: '🤖 "Understood. Connection terminated."',
            type: 'system',
            timestamp: Date.now()
          }],
          updates: { 
            flags: { 
              ravenPromptActive: false,
              ravenConsoleActive: false
            } 
          }
        };
      }
    },
    'declassify': {
      description: 'Attempt to declassify restricted information',
      handler: (gameState: any) => {
        if (gameState.flags?.playerIsRedacted) {
          return {
            messages: [{
              id: `declassify-${Date.now()}`,
              text: '🔐 Access granted. Your redacted status has been recognized.',
              type: 'system',
              timestamp: Date.now()
            }]
          };
        } else {
          return {
            messages: [{
              id: `declassify-denied-${Date.now()}`,
              text: '❌ Access denied. Insufficient clearance level.',
              type: 'error',
              timestamp: Date.now()
            }]
          };
        }
      }
    },
    'i know too much': {
      description: 'Passphrase for redacted individuals',
      handler: (gameState: any) => {
        if (gameState.flags?.playerIsRedacted) {
          return {
            messages: [{
              id: `passphrase-accepted-${Date.now()}`,
              text: '🔓 Passphrase accepted. You may proceed.',
              type: 'system',
              timestamp: Date.now()
            }]
          };
        } else {
          return {
            messages: [{
              id: `passphrase-unknown-${Date.now()}`,
              text: '❓ The system does not recognize that phrase.',
              type: 'system',
              timestamp: Date.now()
            }]
          };
        }
      }
    }
  }
};

export default ravenchamber;

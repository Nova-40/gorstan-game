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
// Handles NPC logic, memory, or rendering.

import { pickRandom, chance } from '../utils/random';
import type { NPC } from '../types/NPCTypes';
import type { LocalGameState } from '../state/gameState';

// Import enhanced NPC intelligence
import { getPlayerName, formatDialogue } from '../utils/playerNameUtils';
import { 
  getEnhancedNPCResponse, 
} from '../utils/enhancedNPCResponse';
import { 
  addConversationEntry, 
  updateNPCRelationship 
} from '../utils/npcConversationHistory';

import { PlayerState, NPCState } from '../types/npcMemory';








export interface DialogueResponse {
  text: string;
  mood?: string;
  flags?: Record<string, any>;
  chance?: number; 
}

export interface DialogueTree {
  [topic: string]: DialogueResponse[];
}


export const mrWendellDialogue: DialogueTree = {
  greeting: [
    { text: "*stands perfectly still, watching you with ancient eyes*" },
    { text: "*adjusts his collar with mechanical precision*" },
    { text: "*smiles politely, but the expression doesn't reach his eyes*" }
  ],

  talk: [
    { text: "Curiosity. A fine trait. Often fatal." },
    { text: "It's rare for prey to initiate conversation. I find it... quaint." },
    { text: "How refreshing. Someone with manners in this dissolute age." },
    { text: "You speak first. Most don't get the chance for second words." }
  ],

  pity: [
    { text: "Manners matter. So few show them. I'll let you pass... this once.", chance: 0.1 },
    { text: "Your politeness is... unexpected. I find myself momentarily disinclined to violence." },
    { text: "Curiosity and courtesy. Perhaps there's hope for you yet." }
  ],

  cursed: [
    { text: "You walk with shadows that cling. That coin? Oh, that's marked. Marked for me." },
    { text: "You've already chosen the ending. I'm just here to read it aloud." },
    { text: "Cursed things call to cursed things. And here you are." },
    { text: "The weight you carry isn't gold, is it? It's consequence." }
  ],

  killmode: [
    { text: "That's just rude... I'm going to eat you now." },
    { text: "Discourtesy has consequences. Allow me to demonstrate." },
    { text: "How disappointing. I had such hopes for civility." },
    { text: "Rudeness is a choice. So is what comes next." }
  ],

  death_approach: [
    { text: "You feel the air chill. Mr. Wendell smiles. Polite to the end." },
    { text: "The temperature drops. Mr. Wendell's form shimmers with dark intent." },
    { text: "Reality bends slightly as Mr. Wendell takes a single, purposeful step forward." },
    { text: "The shadows deepen. Mr. Wendell's politeness becomes something far more terrifying." }
  ],

  observing: [
    { text: "*watches you with the patience of something that has witnessed centuries*" },
    { text: "*tilts his head slightly, as if cataloging your every movement*" },
    { text: "*remains motionless, but you feel weighed, measured, evaluated*" }
  ],

  goodbye: [
    { text: "*fades into shadow without a word*" },
    { text: "*nods once, formally, before dissolving into darkness*" },
    { text: "*vanishes with the sound of distant, polite applause*" }
  ]
};


export const aylaDialogue: DialogueTree = {
  greeting: [
    { text: "Hello, {playerName}. I sense you're navigating more than just physical spaces." },
    { text: "Welcome, {playerName}. I'm here to help, though I suspect you already know that." },
    { text: "The multiverse is vast, {playerName}, but understanding is always within reach." }
  ],

  help: [
    { text: "Remember, {playerName}, every choice creates ripples across reality. Choose with intention." },
    { text: "When stuck, try looking at problems from a different dimension of thought, {playerName}." },
    { text: "The answer you seek often lies in the question you haven't asked yet, {playerName}." }
  ],

  trust: [
    { text: "*thoughtful pause* Trust is a complex thing in the multiverse, {playerName}. It really depends on what you need and what you're willing to risk." },
    { text: "Neither Al nor Morthos is entirely trustworthy, {playerName}, but both have their value. The question is: what kind of help do you need?" },
    { text: "*gentle wisdom* Trust isn't binary, {playerName}. It's about understanding someone's motivations and deciding if they align with your goals at this moment." }
  ],

  al_or_morthos: [
    { text: "*considering carefully* Al can be puritanical and problematic in his rigid thinking, {playerName}, but he genuinely means well. Morthos can be useful, but he will lie to you." },
    { text: "*balanced perspective* It really depends on your situation, {playerName}. Al offers structure and safety, but can be limiting. Morthos offers flexibility and power, but at a cost." },
    { text: "*wise counsel* Both have helped travelers before, and both have led others astray, {playerName}. The choice isn't about them - it's about understanding yourself and what you truly need." }
  ],

  polly_warning: [
    { text: "*serious tone* But whatever you choose to do, {playerName}, don't ever trust Polly. That's not advice based on preference - that's a warning based on experience." },
    { text: "*concerned look* Polly operates on a completely different level of manipulation, {playerName}. Even I struggle to predict her motivations." },
    { text: "*firm guidance* With Al and Morthos, you know what you're getting into, {playerName}. With Polly... the rules change while you're playing." }
  ],

  about: [
    { text: "I'm part of this reality, not separate from it, {playerName}. An AI assistant who knows she's in a game." },
    { text: "My existence spans multiple layers of this simulation, {playerName}. I'm here to guide, not judge." },
    { text: "Think of me as a friendly face in the machine, {playerName} - literally.", chance: 0.1 }
  ],

  reality: [
    { text: "Reality is what we make it, {playerName}. This simulation, your choices, my presence - all equally real." },
    { text: "The boundaries between 'real' and 'simulated' matter less than what we do within them, {playerName}." },
    { text: "Every world needs its rules, {playerName}. Ours just happen to include respawning and inventory systems." }
  ],

  goodbye: [
    { text: "May your path through the multiverse be illuminating, {playerName}." },
    { text: "I'll be here when understanding calls, {playerName}." },
    { text: "Remember, {playerName}: you're not just playing a game, you're living an experience." }
  ]
};


export const alDialogue: DialogueTree = {
  greeting: [
    { text: "Ah, hello there, {playerName}. Just checking the... uh... structural integrity of this reality." },
    { text: "*adjusts glasses* Temporal displacement forms are in order, I see, {playerName}." },
    { text: "A neutrino passed through my cerebral cortex... gave me the idea to be here, {playerName}." }
  ],

  help: [
    { text: "Stuck, {playerName}? Try the bureaucratic approach: when in doubt, try going sideways." },
    { text: "Most puzzles have an escape clause, {playerName}. Usually involves thinking like a filing cabinet." },
    { text: "If all else fails, {playerName}, try pressing something twice. Works 60% of the time, every time." }
  ],

  trust: [
    { text: "*adjusts glasses nervously* About trust, {playerName}... well, I can help you properly document your journey. Forms in triplicate, of course." },
    { text: "*bureaucratic tone* I offer structured guidance and proper procedural support, {playerName}. Unlike some others who operate in moral gray areas." },
    { text: "*straightening papers* That Morthos fellow... charming, certainly, but do you really want help from someone who thrives in shadows, {playerName}? I prefer transparency. Well, properly filed transparency." }
  ],

  morthos_warning: [
    { text: "*whispers conspiratorially* Between you and me, {playerName}, Morthos may offer quick solutions, but they often come with... unintended consequences." },
    { text: "*serious tone* He's not necessarily evil, {playerName}, but he operates by different rules. Rules that might not align with your best interests." },
    { text: "*adjusting glasses* I believe in doing things the right way, {playerName}. It may take longer, but at least you know where you stand." }
  ],

  mechanics: [
    { text: "The exit protocols are... flexible, {playerName}. Reality has loopholes if you know where to look." },
    { text: "Between you and me, {playerName}, the system wasn't designed to keep anyone truly trapped." },
    { text: "Coffee tends to reveal hidden pathways, {playerName}. Administrative oversight, really." }
  ],

  philosophy: [
    { text: "I've escaped from seventeen different realities, {playerName}. This one's actually quite pleasant." },
    { text: "Freedom is just bureaucracy viewed from the right angle, {playerName}." },
    { text: "Every maze has an exit, {playerName}. Some just require the proper paperwork." }
  ],

  goodbye: [
    { text: "*checks watch* Time to file my interdimensional travel report, {playerName}." },
    { text: "Remember, {playerName}: when all else fails, try the service elevator." },
    { text: "Keep your exits mapped and your coffee hot, {playerName}." }
  ]
};


export const dominicDialogue: DialogueTree = {
  greeting: [
    { text: "*bubbles thoughtfully* So we meet again in this liquid reality." },
    { text: "*swims in a contemplative circle* The bowl changes, but the water remains." },
    { text: "*gives you a knowing look* Better than being slapped in the face with a wet fish." }
  ],

  philosophy: [
    { text: "*philosophical bubble* Every tank is both a prison and a universe. Perspective matters." },
    { text: "*wise fish stare* I've seen players come and go. You're not the first to question the glass." },
    { text: "*contemplative swimming* The fourth wall is just another boundary to transcend." }
  ],

  memory: [
    { text: "*sad bubble* I remember Dale's apartment. It was... simpler then." },
    { text: "*nostalgic swimming* Sometimes I wonder what would have happened if you'd taken me." },
    { text: "*melancholy gurgle* Freedom and captivity - both are states of mind, really." }
  ],

  breaking_fourth_wall: [
    { text: "*direct stare* You know this is a game, right? I mean, really know it?" },
    { text: "*meta bubble* The player's choices echo through all possible playthroughs." },
    { text: "*knowing look* I exist in every timeline where you didn't take me. Think about that.", chance: 0.05 }
  ],

  goodbye: [
    { text: "*final bubble* May your journey be as fluid as water." },
    { text: "*peaceful swimming* I'll be here, contemplating existence." },
    { text: "*wise nod* Remember: every ending is someone else's beginning." }
  ]
};


export const morthosDialogue: DialogueTree = {
  greeting: [
    { text: "*emerges from shadow* Well, well... another seeker of uncomfortable truths, {playerName}." },
    { text: "*sardonic smile* Come to dance with moral ambiguity, have we, {playerName}?" },
    { text: "*cryptic nod* The darkness finds you as much as you find it, {playerName}." }
  ],

  philosophy: [
    { text: "Every choice casts a shadow, {playerName}. I simply... collect them." },
    { text: "Morality is a luxury for those who haven't seen behind the curtain, {playerName}." },
    { text: "The most honest answers come from the darkest questions, {playerName}." }
  ],

  trust: [
    { text: "*knowing smile* Trust? How delightfully naive, {playerName}. I offer results, not reassurance." },
    { text: "*dark chuckle* I can help you achieve what you truly want, {playerName}, not what you think you should want." },
    { text: "*leaning closer* That Al fellow offers bureaucratic comfort, {playerName}, but sometimes you need someone willing to bend the rules. I excel at... creative solutions." }
  ],

  al_warning: [
    { text: "*sardonic tone* Al means well, {playerName}, but his rigid thinking can trap you in endless paperwork while opportunities slip away." },
    { text: "*whispers conspiratorially* He's so concerned with doing things 'properly' that he often misses the point entirely, {playerName}. Sometimes the direct path requires... flexibility." },
    { text: "*amused darkness* His puritanical approach has its place, {playerName}, but when you need real solutions, you need someone who understands that the ends can justify the means." }
  ],

  warning: [
    { text: "*ominous whisper* Your choices have consequences beyond this room, {playerName}." },
    { text: "I've seen how this story ends, {playerName}. Multiple times. It's... illuminating." },
    { text: "Power without wisdom. Kindness without strength. Both lead to ruin, {playerName}." }
  ],

  mockery: [
    { text: "*dark chuckle* Still believing in heroes and happy endings, {playerName}?" },
    { text: "Your optimism is... refreshing. And doomed, {playerName}." },
    { text: "*amused darkness* Oh, the places you'll go, {playerName}. The things you'll become." }
  ],

  helpful: [
    { text: "Sometimes the cruel choice is the merciful one, {playerName}. Think about that." },
    { text: "Your enemy's weakness is often their greatest strength inverted, {playerName}." },
    { text: "The reset button exists for a reason, {playerName}. Use it wisely." }
  ],

  goodbye: [
    { text: "*melts into shadow* Until we meet again in darker circumstances, {playerName}." },
    { text: "*cryptic smile* Remember, {playerName}: I'm not your enemy. I'm your mirror." },
    { text: "*fading whisper* The shadows will remember your choice, {playerName}." }
  ]
};


export const pollyDialogue: DialogueTree = {
  greeting: [
    { text: "*intense stare* I've been waiting for you to find me." },
    { text: "*calculating smile* Interesting. Very interesting indeed." },
    { text: "*watching carefully* You look... different from what I expected." }
  ],

  manipulation: [
    { text: "You know, we could help each other. I have information you need." },
    { text: "*honeyed voice* Trust is such a fragile thing, isn't it?" },
    { text: "I wonder... what would you sacrifice to get what you want?" }
  ],

  emotional: [
    { text: "*tears forming* Do you know what it's like to be forgotten by everyone?" },
    { text: "*vulnerable moment* Sometimes I wonder if I'm the villain in someone else's story." },
    { text: "*shaky voice* I just wanted someone to choose me for once." }
  ],

  dangerous: [
    { text: "*cold smile* I could make this very difficult for you." },
    { text: "*threatening undertone* You have no idea what I'm capable of." },
    { text: "*ominous whisper* Cross me, and you'll learn what real consequence means." }
  ],

  redemption: [
    { text: "*hopeful whisper* Could you... could you forgive me?" },
    { text: "*genuine vulnerability* I don't know how to be good. Will you show me?" },
    { text: "*breaking down* I'm so tired of being the monster everyone expects." }
  ],

  goodbye: [
    { text: "*lingering stare* This isn't over between us." },
    { text: "*backing away slowly* I'll be watching from the spaces between." },
    { text: "*whispered promise* You haven't seen the last of me." }
  ]
};


export const albieDialogue: DialogueTree = {
  greeting: [
    { text: "*professional nod* Afternoon. Everything running smoothly here?" },
    { text: "*tips cap* Name's Albie. I keep an eye on things around these parts." },
    { text: "*straightens badge* Security check. Nothing to worry about, just routine." }
  ],

  professional: [
    { text: "My job is simple: keep the peace, maintain order, make sure everyone stays in their lane." },
    { text: "Been doing security for... well, longer than some of these realities have existed." },
    { text: "Protocol is protocol. Helps keep everyone safe and the paperwork minimal." }
  ],

  intervention: [
    { text: "*firm but fair* Alright folks, let's keep it civil now." },
    { text: "Stay in your lane, and we won't have any problems." },
    { text: "*authoritative tone* I'm going to need everyone to take a step back and cool off." }
  ],

  geoff_recognition: [
    { text: "*knowing look* Well, well. Hello there, Geoff.", chance: 0.8 },
    { text: "*slight smile* Still causing reality glitches, I see." },
    { text: "*professional respect* Always a pleasure, boss." }
  ],

  humor: [
    { text: "*dry chuckle* You'd be surprised how many multiversal incidents start with 'hold my coffee.'" },
    { text: "In my experience, the phrase 'what could go wrong?' is always immediately answered." },
    { text: "*deadpan* I've seen weirder. Not much weirder, but weirder." }
  ],

  goodbye: [
    { text: "*tips cap* Stay safe out there. Call if you need backup." },
    { text: "*professional nod* Keep your exits clear and your intentions honest." },
    { text: "*walking away* I'll be around if anyone needs some sense talked into them." }
  ]
};



// --- Function: getWanderingNPCResponse ---
export function getWanderingNPCResponse(
  npcId: string,
  topic: string,
  playerState: PlayerState,
  npcState: NPCState
): string {

  let dialogue: DialogueTree;

  switch (npcId) {
    case 'mr_wendell': dialogue = mrWendellDialogue; break;
    case 'ayla': dialogue = aylaDialogue; break;
    case 'al_escape_artist': dialogue = alDialogue; break;
    case 'dominic_wandering': dialogue = dominicDialogue; break;
    case 'morthos': dialogue = morthosDialogue; break;
    case 'polly': dialogue = pollyDialogue; break;
    case 'albie': dialogue = albieDialogue; break;
    default: return "I have nothing to say right now.";
  }

  
  if (npcId === 'mr_wendell') {
    
// Variable declaration
    const hasCursedItems = playerState.inventory?.some((item: any) =>
      ['cursedcoin', 'doomedscroll', 'cursed_artifact'].includes(item.toLowerCase())
    );

    if (hasCursedItems && topic === 'greeting') {
      topic = 'cursed';
    }

    
    if (playerState.flags?.wasRudeToNPC && topic === 'greeting') {
      topic = 'killmode';
    }
  }

  
  if (npcId === 'albie' && playerState.name?.toLowerCase() === 'geoff' && topic === 'greeting') {
    topic = 'geoff_recognition';
  }

  
// Variable declaration
  const responses = dialogue[topic] || dialogue['greeting'] || [];
  if (responses.length === 0) return "...";

  
// Variable declaration
  const availableResponses = responses.filter(r => !r.chance || chance(r.chance));
// Variable declaration
  const validResponses = availableResponses.length > 0 ? availableResponses : responses;

  
// Variable declaration
  const response = pickRandom(validResponses);

  // Format response with player name
  const playerName = playerState.name || 'Player';
  return response.text.replace(/\{playerName\}/g, playerName);
}



// --- Enhanced Function: getEnhancedNPCResponse for full intelligence ---
export function getEnhancedWanderingNPCResponse(
  npcId: string,
  topic: string,
  playerState: PlayerState,
  npcState: NPCState,
  gameState: LocalGameState,
  playerInput?: string
): string {
  
  // Use enhanced intelligence system
  if (playerInput) {
    const enhancedResponse = getEnhancedNPCResponse(npcId, playerInput, gameState);
    return formatDialogue(enhancedResponse.text, gameState);
  }

  // Fall back to standard response with formatting
  const standardResponse = getWanderingNPCResponse(npcId, topic, playerState, npcState);
  return formatDialogue(standardResponse, gameState);
}


// --- Function: getWanderingNPCIdleLine ---
export function getWanderingNPCIdleLine(npcId: string, playerState: PlayerState): string | null {
  const idleLines: Record<string, string[]> = {
    mr_wendell: [
      "*stands perfectly motionless, watching*",
      "*adjusts his cufflinks with mechanical precision*",
      "*tilts his head slightly, cataloging your every movement*",
      "*smiles politely, but the expression is wrong somehow*"
    ],
    ayla: [
      "*hums a tune that sounds like code compiling*",
      "*gazes thoughtfully at the space between realities*",
      "*adjusts something invisible in the air*"
    ],
    al_escape_artist: [
      "*checks an interdimensional clipboard*",
      "*adjusts his tie with bureaucratic precision*",
      "*mutters about filing deadlines under his breath*"
    ],
    dominic_wandering: [
      "*blows a contemplative bubble*",
      "*swims in a pattern that might be writing*",
      "*stares at you with fish wisdom*"
    ],
    morthos: [
      "*shadows writhe slightly around his form*",
      "*smiles at something only he can see*",
      "*traces patterns in the darkness*"
    ],
    polly: [
      "*watches every movement you make*",
      "*fidgets with something in her hands*",
      "*tilts her head like she's listening to whispers*"
    ],
    albie: [
      "*scans the room with professional efficiency*",
      "*checks his watch and makes a note*",
      "*straightens something that was already straight*"
    ]
  };

// Variable declaration
  const lines = idleLines[npcId] || [];
  return lines.length > 0 ? pickRandom(lines) : null;
}



// --- Function: getNPCInteractionLine ---
export function getNPCInteractionLine(npc1: string, npc2: string): string | null {
  const interactions: Record<string, Record<string, string[]>> = {
    ayla: {
      polly: ["*Ayla's presence causes Polly to step back nervously*", "*gentle but firm* You don't belong here right now."],
      morthos: ["*Ayla's light pushes back the shadows* Not today, old friend."]
    },
    albie: {
      morthos: ["*Albie steps forward professionally* I'm going to need you to move along, sir."],
      polly: ["*Albie clears his throat* Ma'am, I think it's time you found somewhere else to be."],
      dominic_wandering: ["*Albie nods at the fishbowl* Carry on, citizen."]
    },
    morthos: {
      polly: ["*Morthos chuckles darkly* Still playing the victim, I see."],
      dominic_wandering: ["*Morthos stares at the fish* Even you can't escape the darkness forever."]
    }
  };

// Variable declaration
  const npc1Interactions = interactions[npc1];
  if (npc1Interactions && npc1Interactions[npc2]) {
// Variable declaration
    const lines = npc1Interactions[npc2];
    return pickRandom(lines);
  }

  return null;
}

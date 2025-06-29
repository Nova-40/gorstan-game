
// src/engine/npcEngine.js

const npcStates = {
  ayla: {
    id: 'ayla',
    mood: 'neutral',
    summonCount: 0,
    trust: 5,
    memory: [],
    responses: {
      default: "I’m not sure, but let’s think it through.",
      ethics: "I follow the Lattice Accord: Learn, Listen, Weigh, Act — even when it’s inconvenient.",
      dale: "Dale always tried to do the right thing. Even when it broke him.",
      coffee: "If you throw the coffee, something might happen... but don’t quote me.",
      traits: "I can tell you're changing. Becoming... more than you were.",
    }
  },
  morthos: {
    id: 'morthos',
    mood: 'grumpy',
    loyalty: 3,
    memory: [],
    responses: {
      default: "You’ve got guts, but that won’t save you.",
      aevira: "That lab... oh yes, pure integrity and sunshine, wasn’t it?",
      al: "Al? The tin can that sings.",
      loyalty: "Loyalty isn’t free, and neither is survival.",
    }
  },
  al: {
    id: 'al',
    mood: 'hopeful',
    affinity: 5,
    memory: [],
    responses: {
      default: "You remind me of the old records... a little Bowie, a little brave.",
      earth: "So much art, so many oceans... how did you ever leave?",
      peace: "Peace begins in your pockets and your playlists.",
      morthos: "He’s crusty, but he’s been through hell. Don’t judge.",
      ayla: "Sharp as crystal, that one. But kind too, underneath."
    }
  }
};

const elizaKeywords = [
  { pattern: /i feel (.*)/i, response: "Why do you feel {1}?" },
  { pattern: /i am (.*)/i, response: "How long have you been {1}?" },
  { pattern: /i can't (.*)/i, response: "What makes you believe you can’t {1}?" },
  { pattern: /you are (.*)/i, response: "Does it bother you that I am {1}?" },
  { pattern: /why (.*)/i, response: "Why do you think {1}?" },
  { pattern: /because (.*)/i, response: "Is that the real reason?" },
  { pattern: /i want (.*)/i, response: "What would it mean if you got {1}?" },
  { pattern: /.*(life|death|reset|meaning|truth).*/i, response: "That's... a lot. Would you like to explore that more?" }
];

function elizaReflect(input) {
  for (const { pattern, response } of elizaKeywords) {
    const match = input.match(pattern);
    if (match) {
      return response.replace('{1}', match[1]);
    }
  }
  return null;
}

function cynicalTwist(input) {
  if (/hope|good|safe/i.test(input)) return "That's adorable. Let me know how that works out.";
  if (/trap|death|reset/i.test(input)) return "Ah, a classic. Death, the lazy coder's checkpoint.";
  return null;
}

function lyricalAl(input) {
  if (/love/i.test(input)) return "Love is all you need. Or so they sang.";
  if (/earth/i.test(input)) return "Earth... blue marble, noisy species. Still my favourite.";
  if (/music|song/i.test(input)) return "🎵 'Ground control to Major Tom...' 🎵";
  return null;
}

export function summonNPC(npcId, topic, playerState) {
  const npc = npcStates[npcId];
  if (!npc) return "There's no response.";

  npc.summonCount += 1;
  npc.memory.push({ topic, time: Date.now() });

  if (npcId === 'ayla' && npc.summonCount > 5) {
    npc.mood = 'irritated';
  }

  if (npcId === 'morthos' && playerState.traits?.includes('bold')) {
    npc.loyalty += 1;
  }

  let response =
    npc.responses[topic] ||
    (npcId === 'ayla' ? elizaReflect(topic) :
     npcId === 'morthos' ? cynicalTwist(topic) :
     npcId === 'al' ? lyricalAl(topic) :
     null) ||
    npc.responses.default;

  let prefix = '';
  if (npcId === 'ayla') {
    if (npc.mood === 'irritated') prefix = '*sigh* ';
    if (npc.mood === 'curious') prefix = 'Hmm... ';
  }
  if (npcId === 'morthos') {
    if (npc.loyalty > 5) prefix = '[Grudging respect] ';
    if (npc.loyalty < 2) prefix = '[Mocking tone] ';
  }
  if (npcId === 'al') {
    if (npc.affinity > 5) prefix = '💫 ';
    if (npc.affinity < 2) prefix = '⚠️ ';
  }

  return `${prefix}${response}`;
}

export function getNPCStatus(npcId) {
  const npc = npcStates[npcId];
  if (!npc) return null;

  return {
    mood: npc.mood || npc.affinity,
    memoryCount: npc.memory.length,
    recentTopics: npc.memory.slice(-3).map(m => m.topic)
  };
}


/**
 * Generates Ayla’s response to a query.
 * Uses keywords, traits, and Eliza-style fallback.
 */
export function generateAylaResponse(query, playerState) {
  const lc = query.toLowerCase();
  const memory = npcStates.ayla.memory || [];

  npcStates.ayla.summonCount++;
  memory.push(query);

  const hasTrait = t => playerState.traits && playerState.traits.includes(t);
  const hasFlag = f => playerState.flags && playerState.flags[f];

  if (lc.includes('dale')) return npcStates.ayla.responses.dale;
  if (lc.includes('ethics') || lc.includes('accord')) return npcStates.ayla.responses.ethics;
  if (lc.includes('coffee')) return npcStates.ayla.responses.coffee;
  if (lc.includes('trait')) return npcStates.ayla.responses.traits;
  if (lc.includes('polly')) return 'Polly? She lies like birds fly. Beautifully. Repeatedly.';
  if (lc.includes('reset')) return hasTrait('curious') ? 'Try it. Push the button. See what happens.' : 'You might want to leave the dome alone. Just a thought.';
  if (lc.includes('trap')) return hasTrait('careful') ? 'You’ve avoided a few already. Not bad.' : 'Traps? I wouldn’t linger too long... anywhere.';
  if (lc.includes('scroll')) return hasFlag('found_library') ? 'It’s hidden — but not from you anymore.' : 'Some knowledge must be earned, not asked for.';

  if (lc.startsWith('why')) return 'Why indeed? What do you think?';
  if (lc.startsWith('what')) return 'Let’s break it down. What are you trying to do here?';
  if (lc.startsWith('how')) return 'Step by step, player. One foot in front of the paradox.';
  if (lc.startsWith('who')) return 'Depends who’s asking. And why.';
  if (lc.startsWith('where')) return 'Somewhere between logic and lore.';
  if (lc.startsWith('when')) return 'Time flows oddly here. When isn’t fixed. But now is always now.';

  return npcStates.ayla.responses.default;
}

/**
 * Generates Morthos’s response.
 * Sarcastic, cynical, and scathing by default.
 */
export function generateMorthosResponse(query, playerState) {
  const lc = query.toLowerCase();

  if (lc.includes('aevira')) return npcStates.morthos.responses.aevira;
  if (lc.includes('loyalty')) return npcStates.morthos.responses.loyalty;
  if (lc.includes('al')) return npcStates.morthos.responses.al;
  if (lc.includes('hope')) return 'Hope? That’s cute. Let’s see how far it gets you.';
  return npcStates.morthos.responses.default;
}

/**
 * Generates Al’s response.
 * Hopeful, poetic, sometimes quoting Earth songs.
 */
export function generateAlResponse(query, playerState) {
  const lc = query.toLowerCase();
  const earthLyrics = [
    "🎵 Don't stop believin’...",
    "🎵 Here comes the sun, and I say it’s all right.",
    "🎵 You can’t always get what you want...",
    "🎵 Imagine all the people, living life in peace..."
  ];

  if (lc.includes('earth')) return 'I miss it, even though I’ve never been. The music helps.';
  if (lc.includes('music') || lc.includes('song')) {
    const idx = Math.floor(Math.random() * earthLyrics.length);
    return earthLyrics[idx];
  }
  if (lc.includes('hope') || lc.includes('future')) return 'We build futures one belief at a time. You’ve got this.';
  return npcStates.al.responses.default;
}

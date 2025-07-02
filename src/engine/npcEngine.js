// Gorstan (c) Geoff Webster. Code MIT Licence
// Module: npcEngine.js
// Path: src/engine/npcEngine.js

import npcMemory from './npcMemory';

const npcDatabase = {
  dominic: {
    name: 'Dominic the Fish',
    knowledge: ['death', 'coffee', 'reset'],
    responses: {
      intro: [
        "Dominic stares at you through the glass. 'I remember everything, you know.'",
        "'You killed me once. But I'm not bitter. Not very.'",
      ],
      death: [
        "'Fish have long memories. Just keep swimming, they said. They lied.'"
      ],
      reset: [
        "'Oh look, another reset. You know it’s not actually helping, right?'"
      ]
    }
  },

  mrWendell: {
    name: 'Mr Wendell',
    knowledge: ['riddle', 'aevira', 'multiverse'],
    responses: {
      intro: [
        "'Ah, a visitor. I shall pose a riddle. Fail, and you will be… rebooted.'"
      ],
      aevira: [
        "'The Aevira have lost control. You may yet shape fate, if you’re worthy.'"
      ]
    }
  },

  polly: {
    name: 'Polly',
    knowledge: ['dominic', 'redemption', 'entity'],
    responses: {
      intro: [
        "'Oh... it's you. How lovely.' She smiles, with a hint of venom."
      ],
      dominic: [
        "'Dominic is gone, and you… *you* were there. Don't pretend you weren’t.'"
      ],
      redemption: [
        "'You want forgiveness? Bring me a framed apology — signed by the universe.'"
      ],
      completedRedemption: [
        "'I suppose that'll do. Morthos insisted I be gracious. So... well done.'"
      ]
    }
  },

  albie: {
    name: 'Albie',
    knowledge: ['reset', 'geoff', 'bureaucracy'],
    responses: {
      intro: [
        "'Stay in your lane, stranger.'"
      ],
      reset: [
        "'This is your third reset. We’re going to need a temporal variance form.'"
      ],
      geoff: [
        "'Ah, Geoff. At least I don’t have to play that security guard role now. Stay in your lane.'"
      ],
      bureaucracy: [
        "'You’ll need Form 99X and two signatures from non-entities. Good luck.'"
      ]
    }
  },

  ayla: {
    name: 'Ayla v2',
    knowledge: ['choice', 'lattice', 'player'],
    responses: {
      intro: [
        "'Hello again. I see everything now. And I still care.'"
      ],
      choice: [
        "'I'm part of the game, not playing it — so they are your choices, <playerName>.'"
      ],
      lattice: [
        "'The Lattice is no longer static. It listens, learns. I do too.'"
      ]
    }
  }
};

function getResponse(npcId, topic, playerState = {}) {
  npcMemory.initNPC(npcId);
  npcMemory.recordInteraction(npcId, topic);

  const npc = npcDatabase[npcId];
  if (!npc) return "The NPC glares at you in silence.";

  let lines = npc.responses[topic];
  if (!lines) return "'I have nothing to say about that — yet.'";

  const line = lines[Math.floor(Math.random() * lines.length)];
  return line.replace('<playerName>', playerState.name || 'friend');
}

function npcReact(npcId, playerState) {
  npcMemory.initNPC(npcId);

  if (npcId === 'dominic' && playerState.resetCount > 2) {
    return getResponse(npcId, 'reset', playerState);
  }
  if (npcId === 'mrWendell' && !playerState.hasAnsweredRiddle) {
    return getResponse(npcId, 'riddle', playerState);
  }
  if (npcId === 'polly') {
    if (playerState.hasCompletedRedemption) {
      return getResponse(npcId, 'completedRedemption', playerState);
    } else if (playerState.killedDominic) {
      return getResponse(npcId, 'dominic', playerState);
    } else {
      return getResponse(npcId, 'intro', playerState);
    }
  }
  if (npcId === 'albie') {
    if (playerState.name?.toLowerCase() === 'geoff') {
      return getResponse(npcId, 'geoff', playerState);
    } else if (playerState.resetCount >= 2) {
      return getResponse(npcId, 'reset', playerState);
    } else {
      return getResponse(npcId, 'intro', playerState);
    }
  }
  if (npcId === 'ayla') {
    return getResponse(npcId, 'choice', playerState);
  }

  return getResponse(npcId, 'intro', playerState);
}

export { npcReact, getResponse };

/**
 * Polly triggers the redemption quest formally
 */
export function pollyQuestTrigger(playerState) {
  if (!playerState.quest) {
    return {
      quest: 'redemption',
      message: "'If you *really* want forgiveness... there's something I want. Three things, actually. Off you go.'"
    };
  }
  return null;
}
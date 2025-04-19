/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Contains all room definitions and logic.
 */

const asset = (filename) => `${import.meta.env.BASE_URL}images/${filename}`;

const rooms = {
  // Crossing room, with separate graphics for first visit and return
  "crossing": {
    "name": "Crossing",
    "description": "You are in Crossing. The surroundings feel charged with possibility.",
    // use .graphics.initial on first visit, .graphics.returned on subsequent returns
    "graphics": {
      "initial": asset("crossing.png"),
      "returned": asset("crossing2.png")
    },
    "item": null,
    "exits": {
      "north": "controlnexus",      // first‐visit path
      "south": "trentparkearth"     // on return
    }
  },

  "controlnexus": {
    "name": "Control Nexus",
    "description": "You step into the Control Nexus, a swirling hub of glowing panels and shifting corridors.",
    "graphic": asset("controlnexus.png"),
    "item": null,
    "exits": {
      "north": "controlroom",
      "secret:enter portal": "crossing"         // appears when you throw coffee
    }
  },

  "controlroom": {
    "name": "Control Room",
    "description": "Rows of consoles surround you in the Control Room, each flickering with mysterious data.",
    "graphic": asset("controlroom.png"),
    "item": null,
    "exits": {
      "north": "resetroom",
      "south": "controlnexus",
      "secret:enter portal": "crossing"
    }
  },

  "resetroom": {
    "name": "Reset Room",
    "description": "A blank white chamber with a single red button labeled RESET.",
    "graphic": asset("resetroom.png"),
    "item": null,
    "exits": {
      "down": "hiddenlab",
      "south": "controlroom",
      "secret:enter portal": "crossing"
    }
  },

  "hiddenlab": {
    "name": "Hidden Lab",
    "description": "You discover a hidden lab full of strange experiments.",
    "graphic": asset("hiddenlab.png"),
    "item": null,
    "exits": {
      "up": "resetroom"
    }
  },

  // “Overworld” network after first visit
  "trentparkearth": {
    "name": "Trent Park, Earth",
    "description": "You are in Trent Park, Earth. The surroundings feel charged with possibility.",
    "graphic": asset("trentparkearth.png"),
    "item": null,
    "exits": {
      "south": "crossing",
      "west": "stkatherinesdock"
    }
  },

  "dalesapartment": {
    "name": "Dale’s Apartment",
    "description": "You are in Dale's apartment. The surroundings feel charged with possibility.",
    "graphic": asset("dalesapartment.png"),
    "item": null,
    "exits": {
      "north": "crossing",
      "south": "findlaterscornercafe"
    }
  },

  "findlaterscornercafe": {
    "name": "Findlater’s Corner Café",
    "description": "The Corner Café smells of burnt coffee and stale muffins.",
    "graphic": asset("findlaterscornercafe.png"),
    "item": null,
    "exits": {
      "north": "dalesapartment",
      "east": "trentparkearth"
    }
  },

  "stkatherinesdock": {
    "name": "St Katherine’s Dock",
    "description": "You stand on a dock overlooking still waters. A strange portal shimmers nearby.",
    "graphic": asset("stkatherinesdock.png"),
    "item": null,
    "exits": {
      "east": "trentparkearth",
      "secret:jump portal": "centralpark"
    }
  },

  "centralpark": {
    "name": "Central Park",
    "description": "A green oasis amidst the chaos of the multiverse.",
    "graphic": asset("centralpark.png"),
    "item": null,
    "exits": {
      "west": "burgerjoint",
      "east": "aevirawarehouse"
    }
  },

  "burgerjoint": {
    "name": "Burger Joint",
    "description": "Grill smoke drifts from the Burger Joint. You could eat here…",
    "graphic": asset("burgerjoint.png"),
    "item": null,
    "exits": {
      "east": "centralpark"
    }
  },

  "aevirawarehouse": {
    "name": "Aevira Warehouse",
    "description": "Rows of arcane devices line the walls of the Aevira Warehouse.",
    "graphic": asset("aevirawarehouse.png"),
    "item": null,
    "exits": {
      "west": "centralpark"
    }
  },

  // Vault & Arbiter
  "ancientvault": {
    "name": "Ancient Vault",
    "description": "You stand inside the Ancient Vault, the air heavy with the echoes of lost civilizations.",
    "graphic": asset("ancientvault.png"),
    "item": null,
    "exits": {
      "east": "arbitercore"
    }
  },

  "arbitercore": {
    "name": "Arbiter Core",
    "description": "The Arbiter Core pulses with a cold, mechanical heartbeat.",
    "graphic": asset("arbitercore.png"),
    "item": null,
    "exits": {
      "west": "ancientvault",
      "secret:enter hidden library": "hiddenlibrary"
    }
  },

  "hiddenlibrary": {
    "name": "Hidden Library",
    "description": "Rows of dusty tomes stretch into darkness. You feel knowledge ripple in the air.",
    "graphic": asset("hiddenlibrary.png"),
    "item": null,
    "exits": {
      "secret:leave library": "arbitercore",
      "secret:enter tunnel": "secrettunnel"
    }
  },

  // Secret Tunnel, extended to every room once briefcase is solved
  "secrettunnel": {
    "name": "Secret Tunnel",
    "description": "A twisting, echoing corridor that seems to pull you in every direction at once.",
    "graphic": asset("secrettunnel.png"),
    "item": null,
    "exits": {
      /* Core branching: */
      "secret:to maze1": "maze1",
      "secret:to hallucinationroom": "hallucinationroom",
      "secret:to elfhame": "elfhame",
      /* Additional tunnel branches for every other room: */
      "secret:to crossing": "crossing",
      "secret:to controlnexus": "controlnexus",
      "secret:to controlroom": "controlroom",
      "secret:to resetroom": "resetroom",
      "secret:to hiddenlab": "hiddenlab",
      "secret:to trentparkearth": "trentparkearth",
      "secret:to dalesapartment": "dalesapartment",
      "secret:to findlaterscornercafe": "findlaterscornercafe",
      "secret:to stkatherinesdock": "stkatherinesdock",
      "secret:to centralpark": "centralpark",
      "secret:to burgerjoint": "burgerjoint",
      "secret:to aevirawarehouse": "aevirawarehouse",
      "secret:to ancientvault": "ancientvault",
      "secret:to arbitercore": "arbitercore",
      "secret:to hiddenlibrary": "hiddenlibrary",
      "secret:to maze2": "maze2",
      "secret:to maze3": "maze3",
      "secret:to faelake": "faelake",
      "secret:to rhianonschamber": "rhianonschamber",
      "secret:to glitchrealm": "glitchrealm",
      "secret:to glitchroom": "glitchroom",
      "secret:to pollysbay": "pollysbay"
    }
  },

  // Maze network
  "maze1": {
    "name": "Maze Corridor 1",
    "description": "Corridors stretch before you in an impossible tangle.",
    "graphic": asset("maze1.png"),
    "item": null,
    "exits": {
      "north": "maze2",
      "east":  "maze3"
    }
  },

  "maze2": {
    "name": "Maze Corridor 2",
    "description": "The walls here shift and shimmer.",
    "graphic": asset("maze2.png"),
    "item": null,
    "exits": {
      "south": "maze1",
      "east":  "maze3"
    }
  },

  "maze3": {
    "name": "Maze Corridor 3",
    "description": "You can't tell if you're getting closer or farther away.",
    "graphic": asset("maze3.png"),
    "item": null,
    "exits": {
      "west":  "maze2",
      "south": "maze1"
    }
  },

  // Elfhame → Fae Lake → Rhiannon’s Chamber
  "elfhame": {
    "name": "Elfhame",
    "description": "You arrive in Elfhame, where magic breathes through the ancient trees.",
    "graphic": asset("elfhame.png"),
    "item": null,
    "exits": {
      "east": "faelake"
    }
  },

  "faelake": {
    "name": "Fae Lake",
    "description": "Shimmering waters reflect strange constellations.",
    "graphic": asset("faelake.png"),
    "item": null,
    "exits": {
      "north": "rhianonschamber"
    }
  },

  "rhianonschamber": {
    "name": "Rhiannon’s Chamber",
    "description": "This chamber echoes with the music of Rhiannon's song.",
    "graphic": asset("rhianonschamber.png"),
    "item": null,
    "exits": {
      "south": "faelake"
    }
  },

  // Glitch realm network
  "glitchrealm": {
    "name": "Glitch Realm",
    "description": "Reality flickers around you in the Glitch Realm.",
    "graphic": asset("glitchrealm.png"),
    "item": null,
    "exits": {
      "down": "glitchroom"
    }
  },

  "glitchroom": {
    "name": "Glitch Room",
    "description": "Weird geometry lurks here in the Glitch Room.",
    "graphic": asset("glitchroom.png"),
    "item": null,
    "exits": {
      "up":    "glitchrealm",
      "south": "pollysbay"
    }
  },

  "pollysbay": {
    "name": "Polly’s Bay",
    "description": "Waves lap gently at Polly’s Bay, though something feels… off.",
    "graphic": asset("pollysbay.png"),
    "item": null,
    "exits": {
      "north": "glitchroom"
    }
  }
};

export default rooms;



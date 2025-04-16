/*
 * Gorstan (c) Geoff Webster 2025
 * MIT Licence
 * 
 * Description: Contains all room definitions and logic.
 */


const asset = (filename) => `${import.meta.env.BASE_URL}images/${filename}`;

const rooms = {
  "crossing": {
    "onSay": (text, context) => {
      if (text === 'hello') return "Your voice echoes. Nothing answers.";
      return null;
    },
    "onItemUse": (item, context) => {
      return "Nothing happens.";
    },
    "onEnter": ({ visitedRooms }) => {
      if (!visitedRooms?.crossing) {
        return "You hear a hum. The Crossing awakens to your presence. Something stirs beneath the surface.";
      }
      return null;
    },
    "items": ["coffee"],
    "name": "Crossing",
    "description": "You are in crossing. The surroundings feel charged with possibility.",
    "graphic": asset("crossing.png"),
    "exits": {
      "east": "findlaterscornercafe",
      "north": "dalesapartment",
      "south": "trentparkearth"
    }
  },
  "trentparkearth": {
    "name": "Trent Park Earth",
    "description": "You are in Trent Park, Earth. The surroundings feel charged with possibility.",
    "graphic": asset("trentparkearth.png"),
    "item": null,
    "exits": {
      "north": "crossing",
      "east": "dalesapartment",
      "west": "findlaterscornercafe",
      "south": "stkatherinesdock"
    }
  },
  "dalesapartment": {
    "name": "Dales Apartment",
    "description": "You are in Dale's apartment. The surroundings feel charged with possibility.",
    "graphic": asset("dalesapartment.png"),
    "item": null,
    "exits": {
      "south": "crossing"
    }
  }
};

export default rooms;

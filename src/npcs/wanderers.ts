/*
  Gorstan 
  Full licence terms: see EULA.md in the project root.
*/

import { NPC } from "../types/NPCTypes";

export const al: NPC = {
  id: "al",
  name: "Al",
  portrait: "/images/Al.png",
  mood: "neutral",
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: [],
  },
  currentRoom: "controlroom",
  location: "introZone",
};

export const morthos: NPC = {
  id: "morthos",
  name: "Morthos",
  portrait: "/images/Morthos.png",
  mood: "neutral",
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: [],
  },
  currentRoom: "glitchgate",
  location: "glitchZone",
};

export const polly: NPC = {
  id: "polly",
  name: "Polly",
  portrait: "/images/npcs/polly.png",
  mood: "neutral",
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: [],
  },
  currentRoom: "glitchgate",
  location: "glitchZone",
};

export const wendell: NPC = {
  id: "mrwendell",
  name: "Mr. Wendell",
  portrait: "/images/npcs/mrwendell.png",
  mood: "neutral",
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: [],
  },
  currentRoom: "stantonhub",
  location: "stantonZone",
};

export const dominic: NPC = {
  id: "dominic",
  name: "Dominic",
  portrait: "/images/npcs/dominic.png",
  mood: "neutral",
  memory: {
    interactions: 0,
    lastInteraction: 0,
    playerActions: [],
    relationship: 0,
    knownFacts: [],
  },
  currentRoom: "burgerjoint",
  location: "newyorkZone",
};

export const wanderers = [al, morthos, polly, wendell, dominic];

export default wanderers;

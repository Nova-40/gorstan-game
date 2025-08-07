// src/types/Room.d.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { NPC } from '../types/NPCTypes';

import { Room } from 'src/types/Room';


export interface Room {
  id: string;
  title: string;
  description: string | string[];
  image?: string;                   
  exits?: Partial<RoomExits>;       
  flags?: RoomFlags;                
  items?: RoomItem[] | string[];               
  npcs?: RoomNPC[] | string[];                 
  trap?: RoomTrap;                  
  music?: string;                   
  zone?: string;     
  ambientAudio?: string;               
  consoleIntro?: string[];          
  environment?: any[];
  interactables?: Record<string, any>;
  events?: Record<string, any>;
  [key: string]: any; // Allow additional properties
}
export interface GameState {
  currentRoomId: string;
  stage: string;
  player?: {
    name: string;
    
  };
  rooms: { [id: string]: Room }; 
  

  stage: string;
  player?: {
    name: string;
    
  };
  rooms: { [id: string]: Room }; 
  
}


export interface Room {
  id: string;
  
}
export interface RoomExits {
  north?: string;
  south?: string;
  east?: string;
  west?: string;
  up?: string;
  down?: string;
  jump?: string;
  return?: string;
  [custom: string]: string | undefined; 
}

export interface RoomFlags {
  hidden?: boolean;           
  locked?: boolean;           
  noSave?: boolean;           
  cursed?: boolean;           
  [customFlag: string]: boolean | undefined;
}

export interface RoomItem {
  id: string;                 
  name: string;               
  description?: string;       
  isKey?: boolean;            
  cursed?: boolean;           
  oneTimeUse?: boolean;       
}

export interface RoomNPC {
  id: string;                 
  name: string;               
  entryMessage?: string;      
  memoryTags?: string[];      
  hostileOnInsult?: boolean;  
  reactsToItem?: string;      
}

export interface RoomTrap {
  type: 'instant' | 'puzzle' | 'timed';
  effect: string;             
  condition?: string;         
  failureMessage?: string;    
}

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

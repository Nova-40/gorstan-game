// src/hooks/useRoomTransition.ts
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Renders room descriptions and image logic.

import { useEffect, useState } from 'react';













interface RoomLike {
  id: string;
  zone?: string;
  exits?: Record<string, string | undefined>;
}

interface TransitionInfo {
  shouldAnimate: boolean;
  transitionType: 'zone_change' | 'portal' | 'normal' | 'chair_portal';
  fromZone?: string;
  toZone?: string;
}

export const useRoomTransition = (
  fromRoom: RoomLike | null,
  toRoom: RoomLike | null,
  triggerAction?: string
): TransitionInfo => {
  const [transitionInfo, setTransitionInfo] = useState<TransitionInfo>({
    shouldAnimate: false,
    transitionType: 'normal'
  });

// React effect hook
  useEffect(() => {
    if (!fromRoom || !toRoom) {
      setTransitionInfo({
        shouldAnimate: false,
        transitionType: 'normal'
      });
      return;
    }

    
    if (fromRoom.id === toRoom.id) {
      setTransitionInfo({
        shouldAnimate: false,
        transitionType: 'normal'
      });
      return;
    }

    
    if (triggerAction === 'sit' || isChairPortal(fromRoom, toRoom)) {
      setTransitionInfo({
        shouldAnimate: true,
        transitionType: 'chair_portal',
        fromZone: fromRoom.zone,
        toZone: toRoom.zone
      });
      return;
    }

    
    if (isPortalTravel(fromRoom, toRoom)) {
      setTransitionInfo({
        shouldAnimate: true,
        transitionType: 'portal',
        fromZone: fromRoom.zone,
        toZone: toRoom.zone
      });
      return;
    }

    
    if (fromRoom.zone !== toRoom.zone) {
      setTransitionInfo({
        shouldAnimate: true,
        transitionType: 'zone_change',
        fromZone: fromRoom.zone,
        toZone: toRoom.zone
      });
      return;
    }

    
    setTransitionInfo({
      shouldAnimate: true,
      transitionType: 'normal',
      fromZone: fromRoom.zone,
      toZone: toRoom.zone
    });

  }, [fromRoom, toRoom, triggerAction]);

  return transitionInfo;
};


// Variable declaration
const isChairPortal = (fromRoom: RoomLike, toRoom: RoomLike): boolean => {
  
// Variable declaration
  const exits = fromRoom.exits || {};
// Variable declaration
  const chairExits = ['sit', 'chair', 'chair_portal'];

  return chairExits.some(exit => exits[exit] === toRoom.id);
};


// Variable declaration
const isPortalTravel = (fromRoom: RoomLike, toRoom: RoomLike): boolean => {
  
// Variable declaration
  const exits = fromRoom.exits || {};
// Variable declaration
  const portalExits = ['portal', 'gateway', 'dimensional_door', 'step_through'];

  return portalExits.some(exit => exits[exit] === toRoom.id);
};


export const getZoneDisplayName = (zoneId?: string): string => {
  if (!zoneId) return 'Unknown Zone';

  const zoneNames: Record<string, string> = {
    'introZone': 'Dimensional Control',
    'londonZone': 'London Reality',
    'newyorkZone': 'New York Reality',
    'gorstanZone': 'Gorstan Highlands',
    'mazeZone': 'The Labyrinth',
    'elfhameZone': 'Elfhame Realm',
    'latticeZone': 'Quantum Lattice',
    'multiZone': 'Liminal Space',
    'offmultiverseZone': 'Broken Realities',
    'glitchZone': 'Glitch Realm'
  };

  return zoneNames[zoneId] || zoneId.replace('Zone', ' Zone');
};

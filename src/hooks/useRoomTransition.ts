// Module: src/hooks/useRoomTransition.ts
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

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

  useEffect(() => {
    if (!fromRoom || !toRoom) {
      setTransitionInfo({
        shouldAnimate: false,
        transitionType: 'normal'
      });
      return;
    }

    // Skip animation if same room
    if (fromRoom.id === toRoom.id) {
      setTransitionInfo({
        shouldAnimate: false,
        transitionType: 'normal'
      });
      return;
    }

    // Detect chair portal usage
    if (triggerAction === 'sit' || isChairPortal(fromRoom, toRoom)) {
      setTransitionInfo({
        shouldAnimate: true,
        transitionType: 'chair_portal',
        fromZone: fromRoom.zone,
        toZone: toRoom.zone
      });
      return;
    }

    // Detect portal travel
    if (isPortalTravel(fromRoom, toRoom)) {
      setTransitionInfo({
        shouldAnimate: true,
        transitionType: 'portal',
        fromZone: fromRoom.zone,
        toZone: toRoom.zone
      });
      return;
    }

    // Detect zone changes
    if (fromRoom.zone !== toRoom.zone) {
      setTransitionInfo({
        shouldAnimate: true,
        transitionType: 'zone_change',
        fromZone: fromRoom.zone,
        toZone: toRoom.zone
      });
      return;
    }

    // Normal room movement within same zone
    setTransitionInfo({
      shouldAnimate: true,
      transitionType: 'normal',
      fromZone: fromRoom.zone,
      toZone: toRoom.zone
    });

  }, [fromRoom, toRoom, triggerAction]);

  return transitionInfo;
};

// Helper function to detect chair portal travel
const isChairPortal = (fromRoom: RoomLike, toRoom: RoomLike): boolean => {
  // Check if fromRoom has chair-based exits
  const exits = fromRoom.exits || {};
  const chairExits = ['sit', 'chair', 'chair_portal'];
  
  return chairExits.some(exit => exits[exit] === toRoom.id);
};

// Helper function to detect portal travel
const isPortalTravel = (fromRoom: RoomLike, toRoom: RoomLike): boolean => {
  // Check for portal-related exit names
  const exits = fromRoom.exits || {};
  const portalExits = ['portal', 'gateway', 'dimensional_door', 'step_through'];
  
  return portalExits.some(exit => exits[exit] === toRoom.id);
};

// Helper function to get zone display name
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

// Room graph validation results
// Generated during final polish pass

export const validationResults = {
  timestamp: new Date().toISOString(),
  
  // Known working paths
  mainPaths: [
    ['controlnexus', 'controlroom', 'introreset'],
    ['controlnexus', 'hiddenlab'],
    ['crossing', 'controlnexus'],
    ['crossing', 'londonhub'],
    ['crossing', 'dalesapartment']
  ],
  
  // Critical rooms that must be reachable
  criticalRooms: [
    'controlnexus',
    'controlroom', 
    'introreset',
    'hiddenlab',
    'crossing',
    'londonhub'
  ],
  
  // Hub rooms with many connections
  hubRooms: [
    'controlnexus',
    'londonhub',
    'crossing',
    'mazehub',
    'latticehub'
  ],
  
  // Zones and their main entry points
  zoneEntryPoints: {
    'introZone': 'controlnexus',
    'londonZone': 'londonhub', 
    'latticeZone': 'latticehub',
    'mazeZone': 'mazehub',
    'elfhameZone': 'elfhame',
    'glitchZone': 'glitchinguniverse',
    'gorstanZone': 'gorstanhub'
  }
};

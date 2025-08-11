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
// Game module.

import React, { useState } from 'react';

import { Button } from './button';

import { Room } from '../types/Room';














interface TeleportationMenuProps {
  onTeleport: (destination: string) => void;
  onClose: () => void;
  hasRemoteControl: boolean;
  hasNavigationCrystal: boolean;
}

interface Destination {
  id: string;
  name: string;
  zone: string;
  description: string;
}

const allDestinations: Destination[] = [
  
  { id: 'controlnexus', name: 'Control Nexus', zone: 'Intro Zone', description: 'Central command hub with advanced systems' },
  { id: 'latticehub', name: 'Lattice Hub', zone: 'Lattice Zone', description: 'Crystalline network nexus' },
  { id: 'gorstanhub', name: 'Gorstan Hub', zone: 'Gorstan Zone', description: 'Highland realm central hub' },
  { id: 'londonhub', name: 'London Hub', zone: 'London Zone', description: 'Urban dimensional gateway' },
  { id: 'mazehub', name: 'Maze Hub', zone: 'Maze Zone', description: 'Labyrinthine navigation center' },

  
  { id: 'hiddenlab', name: 'Hidden Laboratory', zone: 'Intro Zone', description: 'Secret research facility' },
  { id: 'controlroom', name: 'Control Room', zone: 'Intro Zone', description: 'Emergency command center' },
  { id: 'dalesapartment', name: 'Dale\'s Apartment', zone: 'London Zone', description: 'Cozy shared living space' },
  { id: 'findlaterscornercoffeeshop', name: 'Findlater\'s Corner Coffee Shop', zone: 'London Zone', description: 'Warm neighborhood cafe' },
  { id: 'gorstanvillage', name: 'Gorstan Village', zone: 'Gorstan Zone', description: 'Highland village community' },
  { id: 'lattice', name: 'The Lattice', zone: 'Lattice Zone', description: 'Crystalline information network' },
  { id: 'datavoid', name: 'Data Void', zone: 'Glitch Zone', description: 'Digital realm anomaly' },

  
  { id: 'trentpark', name: 'Trent Park', zone: 'London Zone', description: 'Mystical parkland portal' },
  { id: 'stkatherinesdock', name: 'St Katherine\'s Dock', zone: 'London Zone', description: 'Thames-side portal gateway' },
  { id: 'torridoninn', name: 'Torridon Inn', zone: 'Gorstan Zone', description: 'Highland hospitality hub' },
  { id: 'libraryofnine', name: 'Library of Nine', zone: 'Lattice Zone', description: 'Ancient knowledge repository' },
  { id: 'mazeecho', name: 'Maze Echo', zone: 'Maze Zone', description: 'Reverberating maze chamber' },
  { id: 'elfhame', name: 'Elfhame', zone: 'Elfhame Zone', description: 'Fae realm entrance' },
  { id: 'faepalacemainhall', name: 'Fae Palace', zone: 'Elfhame Zone', description: 'Crystalline court of the Fae' },
];


const crystalDestinations: Destination[] = [
  { id: 'trentpark', name: 'Trent Park', zone: 'London Zone', description: 'Mystical parkland portal' },
  { id: 'findlaterscornercoffeeshop', name: 'Findlater\'s Corner Coffee Shop', zone: 'London Zone', description: 'Warm neighborhood cafe' },
];

const TeleportationMenu: React.FC<TeleportationMenuProps> = ({
  onTeleport,
  onClose,
  hasRemoteControl,
  hasNavigationCrystal
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');

// Variable declaration
  const availableDestinations = hasRemoteControl ? allDestinations : crystalDestinations;

// Variable declaration
  const zones = [...new Set(availableDestinations.map(dest => dest.zone))];

// Variable declaration
  const filteredDestinations = selectedZone === 'all'
    ? availableDestinations
    : availableDestinations.filter(dest => dest.zone === selectedZone);

// Variable declaration
  const handleTeleport = (destinationId: string) => {
    onTeleport(destinationId);
    onClose();
  };

// JSX return block or main return
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-cyan-400 rounded-lg p-6 max-w-4xl max-h-96 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-cyan-300">
            {hasRemoteControl ? '📱 Remote Control Navigation' : '🔮 Navigation Crystal'}
          </h2>
          <Button onClick={onClose} className="text-red-400 hover:text-red-300">
            ✕ Close
          </Button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm mb-2">
            {hasRemoteControl
              ? 'Select any destination across all realities:'
              : 'Navigation crystal offers limited travel options:'
            }
          </p>

          {hasRemoteControl && (
            <div className="flex gap-2 mb-3">
              <Button
                onClick={() => setSelectedZone('all')}
                className={`text-xs ${selectedZone === 'all' ? 'bg-cyan-600' : 'bg-gray-700'}`}
              >
                All Zones
              </Button>
              {zones.map(zone => (
                <Button
                  key={zone}
                  onClick={() => setSelectedZone(zone)}
                  className={`text-xs ${selectedZone === zone ? 'bg-cyan-600' : 'bg-gray-700'}`}
                >
                  {zone}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {filteredDestinations.map(destination => (
            <Button
              key={destination.id}
              onClick={() => handleTeleport(destination.id)}
              className="text-left p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600"
            >
              <div className="text-cyan-300 font-semibold">{destination.name}</div>
              <div className="text-gray-400 text-xs">{destination.zone}</div>
              <div className="text-gray-500 text-xs mt-1">{destination.description}</div>
            </Button>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          {hasRemoteControl && `${availableDestinations.length} destinations available`}
          {hasNavigationCrystal && !hasRemoteControl && 'Limited destinations - find the remote control for full access'}
        </div>
      </div>
    </div>
  );
};

export default TeleportationMenu;

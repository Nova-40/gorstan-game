// TravelMenu.tsx — components/TravelMenu.tsx
// Gorstan Game (Gorstan aspects (c) Geoff Webster 2025)
// Code MIT Licence
// Module: TravelMenu

// TravelMenu.tsx
// Universal travel menu component for various teleportation scenarios
// Gorstan (C) Geoff Webster 2025
// Code MIT Licence

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { GameStateContext } from '../state/gameState';

interface TravelMenuProps {
  destinations: string[];
  title: string;
  subtitle?: string;
  onTeleport: (destination: string) => void;
  onClose: () => void;
  roomsPerPage?: number;
}

interface RoomInfo {
  id: string;
  name: string;
  zone: string;
}

// Room name mappings for better display
const roomDisplayNames: Record<string, RoomInfo> = {
  // London Zone
  'trentpark': { id: 'trentpark', name: 'Trent Park', zone: 'London' },
  'findlaterscornercoffeeshop': { id: 'findlaterscornercoffeeshop', name: 'Findlater\'s Corner Coffee Shop', zone: 'London' },
  'dalesapartment': { id: 'dalesapartment', name: 'Dale\'s Apartment', zone: 'London' },
  'stkatherinesdock': { id: 'stkatherinesdock', name: 'St Katherine\'s Dock', zone: 'London' },
  'londonhub': { id: 'londonhub', name: 'London Hub', zone: 'London' },
  'cafeoffice': { id: 'cafeoffice', name: 'Cafe Office', zone: 'London' },
  
  // Intro Zone
  'crossing': { id: 'crossing', name: 'The Infinite Crossing', zone: 'Intro' },
  'controlnexus': { id: 'controlnexus', name: 'Control Nexus', zone: 'Intro' },
  'controlroom': { id: 'controlroom', name: 'Control Room', zone: 'Intro' },
  'hiddenlab': { id: 'hiddenlab', name: 'Hidden Laboratory', zone: 'Intro' },
  'introreset': { id: 'introreset', name: 'Reset Room', zone: 'Intro' },
  
  // Gorstan Zone
  'gorstanhub': { id: 'gorstanhub', name: 'Gorstan Hub', zone: 'Gorstan' },
  'gorstanvillage': { id: 'gorstanvillage', name: 'Gorstan Village', zone: 'Gorstan' },
  'torridon': { id: 'torridon', name: 'Torridon', zone: 'Gorstan' },
  'torridoninn': { id: 'torridoninn', name: 'Torridon Inn', zone: 'Gorstan' },
  
  // Lattice Zone
  'latticehub': { id: 'latticehub', name: 'Lattice Hub', zone: 'Lattice' },
  'lattice': { id: 'lattice', name: 'The Lattice', zone: 'Lattice' },
  'libraryofnine': { id: 'libraryofnine', name: 'Library of Nine', zone: 'Lattice' },
  
  // Maze Zone
  'mazehub': { id: 'mazehub', name: 'Maze Hub', zone: 'Maze' },
  'mazeecho': { id: 'mazeecho', name: 'Maze Echo', zone: 'Maze' },
  'mazestorage': { id: 'mazestorage', name: 'Maze Storage', zone: 'Maze' },
  
  // New York Zone
  'newyorkhub': { id: 'newyorkhub', name: 'New York Hub', zone: 'New York' },
  'centralpark': { id: 'centralpark', name: 'Central Park', zone: 'New York' },
  'burgerjoint': { id: 'burgerjoint', name: 'Burger Joint', zone: 'New York' },
  
  // Elfhame Zone
  'elfhame': { id: 'elfhame', name: 'Elfhame', zone: 'Elfhame' },
  'faepalacemainhall': { id: 'faepalacemainhall', name: 'Fae Palace Main Hall', zone: 'Elfhame' },
  
  // Glitch Zone
  'datavoid': { id: 'datavoid', name: 'Data Void', zone: 'Glitch' },
};

const TravelMenu: React.FC<TravelMenuProps> = ({
  destinations,
  title,
  subtitle,
  onTeleport,
  onClose,
  roomsPerPage = 6
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const game = React.useContext(GameStateContext);

  const totalPages = Math.ceil(destinations.length / roomsPerPage);
  const startIndex = currentPage * roomsPerPage;
  const endIndex = Math.min(startIndex + roomsPerPage, destinations.length);
  const currentDestinations = destinations.slice(startIndex, endIndex);

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else if (event.key === 'ArrowRight' && currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, totalPages, onClose]);

  const handleTeleport = (destinationId: string) => {
    onTeleport(destinationId);
    onClose();
  };

  const getRoomInfo = (roomId: string): RoomInfo => {
    return roomDisplayNames[roomId] || { id: roomId, name: roomId, zone: 'Unknown' };
  };

  const groupedDestinations = currentDestinations.reduce((groups, dest) => {
    const roomInfo = getRoomInfo(dest);
    if (!groups[roomInfo.zone]) {
      groups[roomInfo.zone] = [];
    }
    groups[roomInfo.zone].push(roomInfo);
    return groups;
  }, {} as Record<string, RoomInfo[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-cyan-400 rounded-lg p-6 max-w-5xl max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-cyan-300">{title}</h2>
            {subtitle && <p className="text-gray-300 text-sm">{subtitle}</p>}
          </div>
          <Button onClick={onClose} className="text-red-400 hover:text-red-300">
            ✕ Close
          </Button>
        </div>

        {/* Page indicator */}
        {totalPages > 1 && (
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm">
              Page {currentPage + 1} of {totalPages} • Use ← → arrow keys to navigate
            </p>
          </div>
        )}

        {/* Destinations grouped by zone */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {Object.entries(groupedDestinations).map(([zone, rooms]) => (
            <div key={zone} className="border border-gray-700 rounded p-3">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">{zone} Zone</h3>
              <div className="grid grid-cols-2 gap-2">
                {rooms.map((room) => (
                  <Button
                    key={room.id}
                    onClick={() => handleTeleport(room.id)}
                    className="text-left p-3 bg-blue-900 hover:bg-blue-800 text-blue-100 hover:text-white transition-all duration-200 rounded"
                  >
                    <div className="font-medium">{room.name}</div>
                    <div className="text-xs opacity-75">{room.id}</div>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
            <Button
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              className="text-sm text-gray-300 hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </Button>
            
            <div className="text-sm text-gray-400">
              {destinations.length} destinations total
            </div>
            
            <Button
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              className="text-sm text-gray-300 hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelMenu;

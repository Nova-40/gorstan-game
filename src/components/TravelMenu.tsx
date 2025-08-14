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

import React, { useState, useEffect } from "react";

import TeleportTransition from "./animations/TeleportTransition";

import { Button } from "./button";

import { GameStateContext } from "../state/gameState";

import { Room } from "../types/Room";

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

const roomDisplayNames: Record<string, RoomInfo> = {
  trentpark: { id: "trentpark", name: "Trent Park", zone: "London" },
  findlaterscornercoffeeshop: {
    id: "findlaterscornercoffeeshop",
    name: "Findlater's Corner Coffee Shop",
    zone: "London",
  },
  dalesapartment: {
    id: "dalesapartment",
    name: "Dale's Apartment",
    zone: "London",
  },
  stkatherinesdock: {
    id: "stkatherinesdock",
    name: "St Katherine's Dock",
    zone: "London",
  },
  londonhub: { id: "londonhub", name: "London Hub", zone: "London" },
  cafeoffice: { id: "cafeoffice", name: "Cafe Office", zone: "London" },

  crossing: { id: "crossing", name: "The Infinite Crossing", zone: "Intro" },
  controlnexus: { id: "controlnexus", name: "Control Nexus", zone: "Intro" },
  controlroom: { id: "controlroom", name: "Control Room", zone: "Intro" },
  hiddenlab: { id: "hiddenlab", name: "Hidden Laboratory", zone: "Intro" },
  introreset: { id: "introreset", name: "Reset Room", zone: "Intro" },

  gorstanhub: { id: "gorstanhub", name: "Gorstan Hub", zone: "Gorstan" },
  gorstanvillage: {
    id: "gorstanvillage",
    name: "Gorstan Village",
    zone: "Gorstan",
  },
  torridon: { id: "torridon", name: "Torridon", zone: "Gorstan" },
  torridoninn: { id: "torridoninn", name: "Torridon Inn", zone: "Gorstan" },

  latticehub: { id: "latticehub", name: "Lattice Hub", zone: "Lattice" },
  lattice: { id: "lattice", name: "The Lattice", zone: "Lattice" },
  libraryofnine: {
    id: "libraryofnine",
    name: "Library of Nine",
    zone: "Lattice",
  },

  mazehub: { id: "mazehub", name: "Maze Hub", zone: "Maze" },
  mazeecho: { id: "mazeecho", name: "Maze Echo", zone: "Maze" },
  mazestorage: { id: "mazestorage", name: "Maze Storage", zone: "Maze" },

  newyorkhub: { id: "newyorkhub", name: "New York Hub", zone: "New York" },
  centralpark: { id: "centralpark", name: "Central Park", zone: "New York" },
  burgerjoint: { id: "burgerjoint", name: "Burger Joint", zone: "New York" },

  elfhame: { id: "elfhame", name: "Elfhame", zone: "Elfhame" },
  faepalacemainhall: {
    id: "faepalacemainhall",
    name: "Fae Palace Main Hall",
    zone: "Elfhame",
  },

  datavoid: { id: "datavoid", name: "Data Void", zone: "Glitch" },
};

const TravelMenu: React.FC<TravelMenuProps> = ({
  destinations,
  title,
  subtitle,
  onTeleport,
  onClose,
  roomsPerPage = 6,
}) => {
  // React state declaration
  const [currentPage, setCurrentPage] = useState(0);
  // React state declaration
  const [isAnimating, setIsAnimating] = useState(false);

  const [selectedDestinationId, setSelectedDestinationId] = useState<
    string | null
  >(null);
  // Variable declaration
  const game = React.useContext(GameStateContext);

  // Variable declaration
  const totalPages = Math.ceil(destinations.length / roomsPerPage);
  // Variable declaration
  const startIndex = currentPage * roomsPerPage;
  // Variable declaration
  const endIndex = Math.min(startIndex + roomsPerPage, destinations.length);

  // Variable declaration
  const currentDestinationsRaw = destinations.slice(startIndex, endIndex);
  // Variable declaration
  const currentDestinations = Array.isArray(currentDestinationsRaw)
    ? currentDestinationsRaw.filter(
        (dest, i, arr) => arr.findIndex((x) => x === dest) === i,
      )
    : currentDestinationsRaw;

  // React effect hook
  useEffect(() => {
    // Variable declaration
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else if (event.key === "ArrowRight" && currentPage < totalPages - 1) {
        setCurrentPage(currentPage + 1);
      } else if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    // JSX return block or main return
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, totalPages, onClose]);

  // Variable declaration
  const handleTeleport = (destinationId: string) => {
    setSelectedDestinationId(destinationId);
    setIsAnimating(true);
  };

  // Variable declaration
  const onAnimationComplete = () => {
    if (selectedDestinationId) {
      onTeleport(selectedDestinationId);
      onClose();
    }
    setIsAnimating(false);
    setSelectedDestinationId(null);
  };

  // Variable declaration
  const getRoomInfo = (roomId: string): RoomInfo => {
    return (
      roomDisplayNames[roomId] || { id: roomId, name: roomId, zone: "Unknown" }
    );
  };

  // Variable declaration
  const groupedDestinations = currentDestinations.reduce(
    (groups, dest) => {
      // Variable declaration
      const roomInfo = getRoomInfo(dest);
      if (!groups[roomInfo.zone]) {
        groups[roomInfo.zone] = [];
      }
      groups[roomInfo.zone].push(roomInfo);
      return groups;
    },
    {} as Record<string, RoomInfo[]>,
  );

  // JSX return block or main return
  return (
    <>
      <TeleportTransition
        isActive={isAnimating}
        destinationName={
          selectedDestinationId
            ? getRoomInfo(selectedDestinationId).name
            : undefined
        }
        onComplete={onAnimationComplete}
      />
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-cyan-400 rounded-lg p-6 max-w-5xl max-h-[80vh] overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-cyan-300">{title}</h2>
              {subtitle && <p className="text-gray-300 text-sm">{subtitle}</p>}
            </div>
            <Button
              onClick={() => {
                console.log("[TravelMenu] Close button clicked");
                onClose();
              }}
              className="text-red-400 hover:text-red-300 bg-red-900 hover:bg-red-800"
            >
              ✕ Close Menu
            </Button>
          </div>

          {}
          {totalPages > 1 && (
            <div className="text-center mb-4">
              <p className="text-gray-400 text-sm">
                Page {currentPage + 1} of {totalPages} • Use ← → arrow keys to
                navigate
              </p>
            </div>
          )}

          {}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(groupedDestinations).map(([zone, rooms]) => (
              <div key={zone} className="border border-gray-700 rounded p-3">
                <h3 className="text-lg font-semibold text-yellow-300 mb-2">
                  {zone} Zone
                </h3>
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

          {}
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
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="text-sm text-gray-300 hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TravelMenu;

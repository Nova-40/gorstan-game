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
// Save game modal component

import React, { useState } from "react";
import { Save, Download, Trash2, Calendar, Clock } from "lucide-react";

interface SaveSlot {
  id: string;
  name: string;
  playerName: string;
  currentRoom: string;
  timestamp: number;
  score: number;
  playTime: number;
}

interface SaveGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slotId: string, slotName: string) => void;
  onLoad: (slotId: string) => void;
  onDelete: (slotId: string) => void;
  saveSlots: SaveSlot[];
}

const SaveGameModal: React.FC<SaveGameModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onLoad,
  onDelete,
  saveSlots,
}) => {
  const [newSaveName, setNewSaveName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  if (!isOpen) {return null;}

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatPlayTime = (playTime: number) => {
    const hours = Math.floor(playTime / 3600);
    const minutes = Math.floor((playTime % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleSave = () => {
    if (newSaveName.trim()) {
      const slotId = `save_${Date.now()}`;
      onSave(slotId, newSaveName.trim());
      setNewSaveName("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newSaveName.trim()) {
      handleSave();
    }
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content save-game-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <Save className="modal-icon" />
            Save & Load Game
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* New Save Section */}
          <div className="save-section">
            <h3>Create New Save</h3>
            <div className="save-input-group">
              <input
                type="text"
                value={newSaveName}
                onChange={(e) => setNewSaveName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter save name..."
                className="save-name-input"
                maxLength={50}
              />
              <button
                onClick={handleSave}
                disabled={!newSaveName.trim()}
                className="save-button"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>

          {/* Existing Saves Section */}
          <div className="saves-section">
            <h3>Saved Games</h3>
            {saveSlots.length === 0 ? (
              <div className="no-saves">
                <p>No saved games found.</p>
              </div>
            ) : (
              <div className="saves-list">
                {saveSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className={`save-slot ${selectedSlot === slot.id ? "selected" : ""}`}
                    onClick={() => setSelectedSlot(slot.id)}
                  >
                    <div className="save-info">
                      <div className="save-name">{slot.name}</div>
                      <div className="save-details">
                        <span className="player-name">{slot.playerName}</span>
                        <span className="current-room">{slot.currentRoom}</span>
                        <span className="score">Score: {slot.score}</span>
                      </div>
                      <div className="save-metadata">
                        <span className="timestamp">
                          <Calendar size={12} />
                          {formatTimestamp(slot.timestamp)}
                        </span>
                        <span className="playtime">
                          <Clock size={12} />
                          {formatPlayTime(slot.playTime)}
                        </span>
                      </div>
                    </div>
                    <div className="save-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoad(slot.id);
                        }}
                        className="load-button"
                        title="Load this save"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete save "${slot.name}"?`)) {
                            onDelete(slot.id);
                          }
                        }}
                        className="delete-button"
                        title="Delete this save"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="save-hint">
            <p>💡 Tip: Use Ctrl+S to quickly open this menu</p>
          </div>
          <button onClick={onClose} className="close-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveGameModal;

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
// Modal for selecting which NPC to talk to when multiple are present

import React from 'react';
import { MessageCircle, Users } from 'lucide-react';
import type { NPC } from '../types/NPCTypes';

interface NPCSelectionModalProps {
  isOpen: boolean;
  npcs: NPC[];
  onSelectNPC: (npc: NPC) => void;
  onClose: () => void;
  onTalkToAll?: () => void; // Future feature for group conversations
  onTalkToAyla?: () => void; // Option to switch to Ayla
}

const NPCSelectionModal: React.FC<NPCSelectionModalProps> = ({
  isOpen,
  npcs,
  onSelectNPC,
  onClose,
  onTalkToAll,
  onTalkToAyla
}) => {
  if (!isOpen) return null;

  // NPC image mapping
  const npcImages: Record<string, string> = {
    'dominic': '/images/Dominic.png',
    'chef': '/images/Chef.png',
    'albie': '/images/Albie.png',
    'polly': '/images/Polly.png',
    'mr wendell': '/images/MrWendell.png',
    'wendell': '/images/MrWendell.png',
    'ayla': '/images/Ayla.png',
    'al': '/images/Al.png',
    'al_escape_artist': '/images/Al.png', // Al's escape artist persona
    'librarian': '/images/Librarian.png',
    'morthos': '/images/Morthos.png'
  };

  const getImagePath = (npc: NPC): string => {
    if (npc.portrait) return npc.portrait;
    return npcImages[npc.id.toLowerCase()] || 
           npcImages[npc.name.toLowerCase()] || 
           '/images/fallback.png';
  };

  return (
    <div className="modal-overlay">
      <div className="npc-selection-modal">
        <div className="modal-header">
          <h2 className="modal-title">
            <Users className="title-icon" />
            Choose Who to Talk To
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>
        
        <div className="npc-selection-grid">
          {npcs.map((npc) => (
            <div 
              key={npc.id}
              className="npc-selection-card"
              onClick={() => onSelectNPC(npc)}
            >
              <div className="npc-image-container">
                <img 
                  src={getImagePath(npc)}
                  alt={npc.name}
                  className="npc-selection-image"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/images/fallback.png';
                  }}
                />
                <div className="npc-mood-indicator" data-mood={npc.mood}>
                  <MessageCircle size={16} />
                </div>
              </div>
              
              <div className="npc-selection-info">
                <h3 className="npc-name">{npc.name}</h3>
                {npc.description && (
                  <p className="npc-description">{npc.description}</p>
                )}
                <div className="npc-status">
                  <span className="mood-badge" data-mood={npc.mood}>
                    {npc.mood}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Group conversation feature */}
        {onTalkToAll && npcs.length > 1 && (
          <div className="group-conversation-section">
            <button 
              className="group-talk-button"
              onClick={onTalkToAll}
              title="Start a group conversation"
            >
              <Users size={20} />
              Talk to Everyone
            </button>
          </div>
        )}

        {/* Ayla Helper Option */}
        {onTalkToAyla && (
          <div className="ayla-helper-section">
            <button 
              className="ayla-talk-button"
              onClick={onTalkToAyla}
              title="Switch to Ayla for help and guidance"
            >
              <MessageCircle size={18} />
              Talk to Ayla (Help)
            </button>
          </div>
        )}

        <div className="modal-footer">
          <p className="selection-hint">
            Click on an NPC to start a conversation, or press Escape to close.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NPCSelectionModal;

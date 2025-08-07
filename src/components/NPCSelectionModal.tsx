// src/components/NPCSelectionModal.tsx
// Gorstan Game Beta 1
// Code Licence MIT
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
}

const NPCSelectionModal: React.FC<NPCSelectionModalProps> = ({
  isOpen,
  npcs,
  onSelectNPC,
  onClose,
  onTalkToAll
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

        {/* Future feature: Group conversation */}
        {onTalkToAll && npcs.length > 1 && (
          <div className="group-conversation-section">
            <button 
              className="group-talk-button"
              onClick={onTalkToAll}
              title="Start a group conversation (experimental)"
            >
              <Users size={20} />
              Talk to Everyone
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

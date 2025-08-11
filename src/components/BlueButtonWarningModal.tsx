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
// Blue button warning modal component.

import React from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';

interface BlueButtonWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BlueButtonWarningModal: React.FC<BlueButtonWarningModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay blue-button-warning">
      <div className="modal-content warning-modal">
        <div className="modal-header warning-header">
          <div className="modal-title">
            <AlertTriangle className="warning-icon" />
            <h2>⚠️ CRITICAL WARNING</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <XCircle size={24} />
          </button>
        </div>

        <div className="modal-body warning-body">
          <div className="warning-display">
            <div className="warning-screen">
              <div className="warning-text-container">
                <div className="warning-line primary">DO NOT PRESS THIS BUTTON AGAIN</div>
                <div className="warning-line secondary">⚠️ MULTIVERSE STABILITY WARNING ⚠️</div>
                <div className="warning-line details">
                  Pressing this button again will trigger a complete reality reset.
                </div>
                <div className="warning-line details">
                  All progress will be lost. All timelines will be affected.
                </div>
                <div className="warning-line final">
                  You have been warned.
                </div>
              </div>
              
              <div className="warning-effects">
                <div className="pulse-effect"></div>
                <div className="scan-line"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer warning-footer">
          <button className="acknowledge-button" onClick={onClose}>
            I Understand The Consequences
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlueButtonWarningModal;

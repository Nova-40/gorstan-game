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

import React from 'react';
import { XCircle, Settings, ArrowLeft, Zap, Wrench } from 'lucide-react';

interface UseItemModalProps {
  inventory: string[];
  environmentItems: string[];
  onClose: () => void;
  onUse: (item: string, target?: string) => void;
}

export const UseItemModal: React.FC<UseItemModalProps> = ({ inventory, environmentItems, onClose, onUse }) => {
  const [selectedItem, setSelectedItem] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<'choose' | 'standalone' | 'withItem' | 'withEnv'>('choose');

  // Variable declaration
  const otherItems = inventory.filter(i => i !== selectedItem);

  // React effect hook
  React.useEffect(() => {
    // Variable declaration
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    // JSX return block or main return
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const resetToChoose = () => {
    setSelectedItem(null);
    setMode('choose');
  };

  // JSX return block or main return
  return (
    <div className="modal-overlay">
      <div className="modal-box use-item-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Settings className="modal-icon" />
            <h3>Use an Item</h3>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <XCircle className="close-icon" />
          </button>
        </div>

        <div className="modal-content">
          {!selectedItem ? (
            <div className="item-selection">
              <p className="instruction-text">Select an item from your inventory to use:</p>
              {inventory.length > 0 ? (
                <div className="item-grid">
                  {inventory.map(item => (
                    <button 
                      key={item} 
                      className="item-button"
                      onClick={() => setSelectedItem(item)}
                    >
                      <div className="item-icon">📦</div>
                      <span className="item-name">{item}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Settings className="empty-icon" />
                  <p>Your inventory is empty.</p>
                  <small>You need to pick up items before you can use them</small>
                </div>
              )}
            </div>
          ) : mode === 'choose' ? (
            <div className="usage-selection">
              <div className="selected-item">
                <div className="item-display">
                  <div className="item-icon">📦</div>
                  <span className="item-name">{selectedItem}</span>
                </div>
                <button className="back-button" onClick={resetToChoose}>
                  <ArrowLeft size={16} />
                  Choose Different Item
                </button>
              </div>
              
              <p className="instruction-text">How would you like to use <strong>{selectedItem}</strong>?</p>
              
              <div className="usage-options">
                <button 
                  className="usage-button standalone"
                  onClick={() => onUse(selectedItem)}
                >
                  <Zap className="option-icon" />
                  <div className="option-content">
                    <span className="option-title">Use by itself</span>
                    <small>Activate or use the item directly</small>
                  </div>
                </button>
                
                <button 
                  className="usage-button with-item"
                  onClick={() => setMode('withItem')}
                  disabled={otherItems.length === 0}
                >
                  <Settings className="option-icon" />
                  <div className="option-content">
                    <span className="option-title">Use with another item</span>
                    <small>{otherItems.length > 0 ? `Combine with one of ${otherItems.length} items` : 'No other items available'}</small>
                  </div>
                </button>
                
                <button 
                  className="usage-button with-env"
                  onClick={() => setMode('withEnv')}
                  disabled={environmentItems.length === 0}
                >
                  <Wrench className="option-icon" />
                  <div className="option-content">
                    <span className="option-title">Use with environment</span>
                    <small>{environmentItems.length > 0 ? `Use with one of ${environmentItems.length} objects` : 'No environmental objects available'}</small>
                  </div>
                </button>
              </div>
            </div>
          ) : mode === 'withItem' ? (
            <div className="target-selection">
              <div className="selected-item">
                <span>Using: <strong>{selectedItem}</strong></span>
                <button className="back-button" onClick={() => setMode('choose')}>
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>
              
              <p className="instruction-text">Choose another item to combine with <strong>{selectedItem}</strong>:</p>
              
              {otherItems.length > 0 ? (
                <div className="target-grid">
                  {otherItems.map(item => (
                    <button 
                      key={item} 
                      className="target-button"
                      onClick={() => onUse(selectedItem, item)}
                    >
                      <div className="item-icon">📦</div>
                      <span className="item-name">{item}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Settings className="empty-icon" />
                  <p>No other items available to combine with.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="target-selection">
              <div className="selected-item">
                <span>Using: <strong>{selectedItem}</strong></span>
                <button className="back-button" onClick={() => setMode('choose')}>
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>
              
              <p className="instruction-text">Choose an environmental object to use <strong>{selectedItem}</strong> with:</p>
              
              {environmentItems.length > 0 ? (
                <div className="target-grid">
                  {environmentItems.map(env => (
                    <button 
                      key={env} 
                      className="target-button environmental"
                      onClick={() => onUse(selectedItem, env)}
                    >
                      <div className="env-icon">🌍</div>
                      <span className="env-name">{env}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Wrench className="empty-icon" />
                  <p>There are no environmental objects you can use this item with.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

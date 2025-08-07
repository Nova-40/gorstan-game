// src/components/PickUpItemModal.tsx
// Gorstan Game Beta 1
// Code Licence MIT
// Gorstan and characters (c) Geoff Webster 2025
// Game module.

import React, { useState } from 'react';
import { XCircle, Package, CheckSquare, Square } from 'lucide-react';
import '../styles/ModalOverlay.css';

interface PickUpItemModalProps {
  isOpen: boolean;
  items: string[];
  onClose: () => void;
  onPickUp: (selectedItems: string[]) => void;
}

const PickUpItemModal: React.FC<PickUpItemModalProps> = ({ isOpen, items, onClose, onPickUp }) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Variable declaration
  const toggleItemSelection = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const selectAll = () => {
    setSelectedItems(items);
  };

  const selectNone = () => {
    setSelectedItems([]);
  };

  // Variable declaration
  const handlePickUp = () => {
    onPickUp(selectedItems);
    setSelectedItems([]);
    onClose();
  };

  if (!isOpen) return null;

  // JSX return block or main return
  return (
    <div className="modal-overlay">
      <div className="modal-content pickup-modal console-theme">
        <div className="modal-header">
          <div className="modal-title">
            <Package className="modal-icon" />
            <h2>Pick Up Items</h2>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <XCircle size={24} />
          </button>
        </div>

        <div className="modal-body">
          <p className="instruction-text">
            Select the items you want to pick up from this room:
          </p>

          {items.length > 1 && (
            <div className="selection-controls">
              <button 
                className="control-button" 
                onClick={selectAll}
                disabled={selectedItems.length === items.length}
              >
                Select All
              </button>
              <button 
                className="control-button" 
                onClick={selectNone}
                disabled={selectedItems.length === 0}
              >
                Clear All
              </button>
            </div>
          )}

          <div className="item-list">
            {items.map((item) => {
              const isSelected = selectedItems.includes(item);
              return (
                <div 
                  key={item} 
                  className={`item-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleItemSelection(item)}
                >
                  <div className="checkbox-container">
                    {isSelected ? (
                      <CheckSquare className="checkbox checked" />
                    ) : (
                      <Square className="checkbox unchecked" />
                    )}
                  </div>
                  <span className="item-name">{item}</span>
                  <div className="item-icon">📦</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <div className="selection-summary">
            {selectedItems.length > 0 ? (
              <span>{selectedItems.length} of {items.length} items selected</span>
            ) : (
              <span>No items selected</span>
            )}
          </div>
          <button 
            className="pickup-button console-button" 
            onClick={handlePickUp} 
            disabled={selectedItems.length === 0}
          >
            Pick Up {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickUpItemModal;

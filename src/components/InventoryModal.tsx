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
import { XCircle, Package, Search } from 'lucide-react';

interface InventoryModalProps {
  items: string[];
  onClose: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ items, onClose }) => {
  const [searchFilter, setSearchFilter] = React.useState('');

  // React effect hook
  React.useEffect(() => {
    // Variable declaration
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    // JSX return block or main return
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filteredItems = items.filter(item => 
    item.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // JSX return block or main return
  return (
    <div className="modal-overlay">
      <div className="modal-box inventory-modal">
        <div className="modal-header">
          <div className="modal-title">
            <Package className="modal-icon" />
            <h3>Inventory ({items.length} items)</h3>
          </div>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <XCircle className="close-icon" />
          </button>
        </div>
        
        {items.length > 0 && (
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="search-input"
            />
          </div>
        )}

        <div className="modal-content">
          {filteredItems.length > 0 ? (
            <div className="inventory-grid">
              {filteredItems.map((item, i) => (
                <div key={i} className="inventory-item" title={`Details about ${item}`}>
                  <div className="item-icon">📦</div>
                  <span className="item-name">{item}</span>
                </div>
              ))}
            </div>
          ) : searchFilter ? (
            <div className="empty-state">
              <Search className="empty-icon" />
              <p>No items match "{searchFilter}"</p>
            </div>
          ) : (
            <div className="empty-state">
              <Package className="empty-icon" />
              <p>Your inventory is empty.</p>
              <small>Items you pick up will appear here</small>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <small className="help-text">
            💡 Use the search box to quickly find items
          </small>
        </div>
      </div>
    </div>
  );
};

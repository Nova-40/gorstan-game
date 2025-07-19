import React, { useState } from 'react';
import { X, Package, Check } from 'lucide-react';
import { getItemById } from '../engine/items';

interface PickupSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableItems: string[];
  onPickupSelected: (selectedItems: string[]) => void;
  roomTitle?: string;
}

const PickupSelectionModal: React.FC<PickupSelectionModalProps> = ({
  isOpen,
  onClose,
  availableItems,
  onPickupSelected,
  roomTitle = 'Current Room'
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(
      selectedItems.length === availableItems.length ? [] : [...availableItems]
    );
  };

  const handleTakeSelected = () => {
    if (selectedItems.length > 0) {
      onPickupSelected(selectedItems);
      setSelectedItems([]);
      onClose();
    }
  };

  const getItemDisplayName = (itemId: string): string => {
    const itemData = getItemById(itemId);
    if (itemData) {
      return itemData.name;
    }
    // Fallback: convert item ID to readable name
    return itemId
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getItemDescription = (itemId: string): string => {
    const itemData = getItemById(itemId);
    return itemData?.description || 'An item you can pick up.';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Package className="text-blue-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Pick Up Items
              </h2>
              <p className="text-sm text-gray-600">{roomTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {availableItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No items available to pick up in this room.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All Toggle */}
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-sm font-medium text-gray-700">
                  {availableItems.length} item{availableItems.length !== 1 ? 's' : ''} available
                </span>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedItems.length === availableItems.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Item List */}
              <div className="space-y-3">
                {availableItems.map((itemId) => {
                  const isSelected = selectedItems.includes(itemId);
                  const displayName = getItemDisplayName(itemId);
                  const description = getItemDescription(itemId);

                  return (
                    <div
                      key={itemId}
                      className={`
                        border rounded-lg p-4 cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={() => handleItemToggle(itemId)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center mt-1 flex-shrink-0
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-gray-300'
                          }
                        `}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`
                            font-medium text-sm
                            ${isSelected ? 'text-blue-900' : 'text-gray-800'}
                          `}>
                            {displayName}
                          </h3>
                          <p className={`
                            text-xs mt-1 leading-relaxed
                            ${isSelected ? 'text-blue-700' : 'text-gray-600'}
                          `}>
                            {description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            ID: {itemId}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedItems.length} of {availableItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleTakeSelected}
              disabled={selectedItems.length === 0}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all duration-200
                ${selectedItems.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Take Selected Items
              {selectedItems.length > 0 && (
                <span className="ml-2 bg-blue-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {selectedItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupSelectionModal;

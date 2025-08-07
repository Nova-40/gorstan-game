
import React from 'react';
import './modalStyles.css';

interface ModalProps {
  children: React.ReactNode;
}

const UnifiedModal: React.FC<ModalProps> = ({ children }) => (
  <div className="modal-overlay">
    <div className="modal-content">
      {children}
    </div>
  </div>
);

export default UnifiedModal;

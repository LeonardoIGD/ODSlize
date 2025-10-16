import React from 'react';
import './Modal.css';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        {title && <h2 className="modal-title">{title}</h2>}
        <div className="modal-content">{children}</div>
        <button className="modal-close" onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

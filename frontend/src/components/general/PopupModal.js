import React from 'react';
import '../../styles/popupmodal.css'; // Create and style your modal CSS here

function PopupModal({ show, message, onClose }) {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <button onClick={onClose} className="modal-close-button">Close</button>
      </div>
    </div>
  );
}

export default PopupModal;

// Notification.js
import React, { useEffect } from 'react';

function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [message, onClose]);
  
  return (
    <div className={`notification ${type}`}>
      <span>{message}</span>
      <button className="close-button" onClick={onClose}>×</button>
    </div>
  );
}

export default Notification;
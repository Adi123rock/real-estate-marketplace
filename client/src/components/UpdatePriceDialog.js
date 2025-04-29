import React, { useState } from 'react';

const UpdatePriceDialog = ({ isOpen, onClose, onConfirm, currentPrice }) => {
  const [price, setPrice] = useState(currentPrice);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!price || isNaN(price) || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    onConfirm(parseFloat(price));
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <h3 className="dialog-title">Update Property Price</h3>
        <div className="dialog-body">
          <div className="form-group">
            <label htmlFor="price">New Price (ETH)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                setError('');
              }}
              placeholder="Enter new price in ETH"
              step="0.01"
              min="0"
              className="form-input"
            />
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
        <div className="dialog-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Update Price
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePriceDialog; 
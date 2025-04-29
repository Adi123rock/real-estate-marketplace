import React, { useState } from 'react';
import PropertyCard from './PropertyCard';

function UserProperties({ properties, onToggleForSale, onUpdatePrice }) {
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  const handleUpdatePrice = (propertyId) => {
    if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
      onUpdatePrice(propertyId, parseFloat(newPrice));
      setEditingPrice(null);
      setNewPrice('');
    }
  };

  if (properties.length === 0) {
    return (
      <div className="no-properties">
        <h2>My Properties</h2>
        <p>You don't own any properties yet</p>
      </div>
    );
  }

  return (
    <div className="user-properties">
      <h2>My Properties</h2>
      <div className="properties-grid">
        {properties.map(property => (
          <div key={property.id} className="property-card-container">
            <PropertyCard
              property={property}
              actionLabel={property.isForSale ? "Remove from Sale" : "Put for Sale"}
              onAction={() => onToggleForSale(property.id)}
              disableAction={false}
            />
            
            <div className="price-controls">
              {editingPrice === property.id ? (
                <div className="edit-price">
                  <input
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="New price in ETH"
                  />
                  <button onClick={() => handleUpdatePrice(property.id)}>Update</button>
                  <button onClick={() => setEditingPrice(null)}>Cancel</button>
                </div>
              ) : (
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setEditingPrice(property.id);
                    setNewPrice(property.price);
                  }}
                >
                  Edit Price
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UserProperties;
import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import UpdatePriceDialog from './UpdatePriceDialog';
import defaultPropertyImage from '../assets/default-property.svg';

const PropertyCard = ({ property, onBuy, onToggleForSale, onUpdatePrice, showOwnerControls }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdatePriceOpen, setIsUpdatePriceOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState({ title: '', message: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(property.price);
  const [imageError, setImageError] = useState(false);

  const handleBuyClick = () => {
    setConfirmData({
      title: 'Confirm Purchase',
      message: `Are you sure you want to buy this property for ${property.price} ETH?`
    });
    setConfirmAction(() => () => onBuy(property.id, property.price));
    setIsConfirmOpen(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleToggleForSaleClick = () => {
    const action = property.isForSale ? 'remove from sale' : 'list for sale';
    setConfirmData({
      title: 'Confirm Status Change',
      message: `Are you sure you want to ${action} this property?`
    });
    setConfirmAction(() => () => onToggleForSale(property.id));
    setIsConfirmOpen(true);
  };

  const handleUpdatePrice = (newPrice) => {
    setConfirmData({
      title: 'Confirm Price Update',
      message: `Are you sure you want to update the price to ${newPrice} ETH?`
    });
    setConfirmAction(() => () => onUpdatePrice(property.id, newPrice));
    setIsConfirmOpen(true);
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    onUpdatePrice(property.id, newPrice);
    setIsEditing(false);
  };

  return (
    <div className="property-card">
      <div className={`property-image ${imageError ? 'no-image' : ''}`}>
        {!imageError ? (
          <img 
            src={property.imageUrl || defaultPropertyImage}
            alt={property.name || 'Property Image'}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="no-image-placeholder">
            <span>🏠</span>
            <span>No Image Available</span>
          </div>
        )}
      </div>

      {property.isForSale && (
        <div className="status-badge">For Sale</div>
      )}

      <div className="property-details">
        <h3 className="property-name">{property.name || 'Unnamed Property'}</h3>
        <p className="property-location">{property.location || 'Location not specified'}</p>
        
        <div className="property-description">
          {property.description || 'No description available'}
        </div>

        <div className="property-stats">
          <div className="stat">
            <span className="stat-label">Size</span>
            <span className="stat-value">{property.size || 0} sqft</span>
          </div>
          <div className="stat">
            <span className="stat-label">Beds</span>
            <span className="stat-value">{property.bedrooms || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Baths</span>
            <span className="stat-value">{property.bathrooms || 0}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Price</span>
            <span className="stat-value">{property.price || 0} ETH</span>
          </div>
        </div>

        <div className="property-actions">
          {showOwnerControls ? (
            <>
              <button
                className={`btn-secondary ${property.isForSale ? 'listed' : ''}`}
                onClick={() => onToggleForSale(property.id)}
              >
                {property.isForSale ? 'Remove Listing' : 'List For Sale'}
              </button>
              
              {!isEditing ? (
                <button
                  className={`btn-secondary ${property.isForSale ? 'listed' : ''}`}
                  onClick={() => setIsEditing(true)}
                >
                  Update Price
                </button>
              ) : (
                <form onSubmit={handlePriceSubmit} className="edit-price">
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                  />
                  <button type="submit" className="btn-primary">Save</button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setNewPrice(property.price);
                    }}
                  >
                    Cancel
                  </button>
                </form>
              )}
            </>
          ) : (
            property.isForSale && (
              <button
                className="btn-primary"
                onClick={handleBuyClick}
              >
                Buy for {property.price} ETH
              </button>
            )
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmAction}
        title={confirmData.title}
        message={confirmData.message}
      />

      <UpdatePriceDialog
        isOpen={isUpdatePriceOpen}
        onClose={() => setIsUpdatePriceOpen(false)}
        onConfirm={handleUpdatePrice}
        currentPrice={property.price}
      />
    </div>
  );
};

export default PropertyCard;
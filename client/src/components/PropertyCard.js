import React from 'react';

const PropertyCard = ({ property, onBuy, onToggleForSale, onUpdatePrice, showOwnerControls }) => {
  const handleBuy = () => {
    if (window.confirm(`Are you sure you want to buy this property for ${property.price} ETH?`)) {
      onBuy(property.id, property.price);
    }
  };

  const handleToggleForSale = () => {
    onToggleForSale(property.id);
  };

  const handleUpdatePrice = () => {
    const newPrice = prompt('Enter new price in ETH:', property.price);
    if (newPrice && !isNaN(newPrice)) {
      onUpdatePrice(property.id, newPrice);
    }
  };

  return (
    <div className="property-card">
      {property.isForSale && (
        <div className="status-badge">For Sale</div>
      )}
      
      <img 
        src={`https://source.unsplash.com/800x600/?house,property&random=${property.id}`}
        alt={`Property at ${property.location}`}
        className="property-image"
      />
      
      <div className="property-details">
        <div className="property-price">{property.price} ETH</div>
        <div className="property-location">{property.location}</div>
        
        <div className="property-stats">
          <div>5 Beds</div>
          <div>3 Baths</div>
          <div>3,200 sqft</div>
          <div>2020</div>
        </div>

        <div className="property-actions">
          <button className="btn btn-secondary">Details</button>
          {property.isForSale && !showOwnerControls && (
            <button className="btn btn-primary" onClick={handleBuy}>
              Buy Property
            </button>
          )}
          {showOwnerControls && (
            <>
              <button className="btn btn-secondary" onClick={handleToggleForSale}>
                {property.isForSale ? 'Remove from Sale' : 'List for Sale'}
              </button>
              <button className="btn btn-secondary" onClick={handleUpdatePrice}>
                Update Price
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
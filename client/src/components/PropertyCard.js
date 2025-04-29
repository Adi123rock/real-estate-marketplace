import React from 'react';

function PropertyCard({ property, actionLabel, onAction, disableAction }) {
  const truncateAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="property-card">
      <div className="property-image">
        {/* Placeholder image - in production, you'd use IPFS for property images */}
        <div className="placeholder-image">Property Image</div>
      </div>
      
      <div className="property-details">
        <h3>{property.location}</h3>
        <p className="price">{property.price} ETH</p>
        <p className="owner">Owner: {truncateAddress(property.owner)}</p>
        <p className="status">
          Status: <span className={property.isForSale ? "for-sale" : "not-for-sale"}>
            {property.isForSale ? "For Sale" : "Not For Sale"}
          </span>
        </p>
      </div>
      
      <div className="property-actions">
        <button 
          className="btn-primary" 
          onClick={onAction} 
          disabled={disableAction}
        >
          {actionLabel}
        </button>
        {disableAction && actionLabel === "Buy Property" && (
          <p className="ownership-note">You own this property</p>
        )}
      </div>
    </div>
  );
}

export default PropertyCard;
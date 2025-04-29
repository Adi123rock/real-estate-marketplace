import React from 'react';
import PropertyCard from './PropertyCard';

function PropertyList({ properties, onBuy }) {
  if (properties.length === 0) {
    return (
      <div className="no-properties">
        <h2>Property Marketplace</h2>
        <p>No properties are currently for sale</p>
      </div>
    );
  }

  return (
    <div className="property-list">
      <h2>Property Marketplace</h2>
      <div className="properties-grid">
        {properties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            actionLabel="Buy Property"
            onAction={() => onBuy(property.id, property.price)}
            disableAction={property.isCurrentUserOwner}
          />
        ))}
      </div>
    </div>
  );
}

export default PropertyList;
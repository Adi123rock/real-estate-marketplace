import React from 'react';
import PropertyCard from './PropertyCard';

const UserProperties = ({ properties, onToggleForSale, onUpdatePrice }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="no-properties">
        <h2>No properties owned</h2>
        <p>You don't own any properties yet. Visit the marketplace to buy one!</p>
      </div>
    );
  }

  return (
    <div className="property-grid">
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          property={property}
          onToggleForSale={onToggleForSale}
          onUpdatePrice={onUpdatePrice}
          showOwnerControls={true}
        />
      ))}
    </div>
  );
};

export default UserProperties;
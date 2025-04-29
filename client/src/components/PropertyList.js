import React from 'react';
import PropertyCard from './PropertyCard';

const PropertyList = ({ properties, onBuy }) => {
  if (!properties || properties.length === 0) {
    return (
      <div className="no-properties">
        <h2>No properties available</h2>
        <p>Be the first to list a property!</p>
      </div>
    );
  }

  return (
    <div className="property-grid">
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          property={property}
          onBuy={onBuy}
          showOwnerControls={false}
        />
      ))}
    </div>
  );
};

export default PropertyList;
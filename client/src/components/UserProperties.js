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
    <div>
      <div className="properties-header">
        <h2 className="section-title">My Properties ({properties.length})</h2>
        <p className="properties-subtitle">You currently own {properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
      </div>
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
    </div>
  );
};

export default UserProperties;
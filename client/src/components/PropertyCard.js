import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import UpdatePriceDialog from './UpdatePriceDialog';

const PropertyCard = ({ property, onBuy, onToggleForSale, onUpdatePrice, showOwnerControls }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isUpdatePriceOpen, setIsUpdatePriceOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState({ title: '', message: '' });

  const handleBuyClick = () => {
    setConfirmData({
      title: 'Confirm Purchase',
      message: `Are you sure you want to buy this property for ${property.price} ETH?`
    });
    setConfirmAction(() => () => onBuy(property.id, property.price));
    setIsConfirmOpen(true);
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

  return (
    <>
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
              <button className="btn btn-primary" onClick={handleBuyClick}>
                Buy Property
              </button>
            )}
            {showOwnerControls && (
              <>
                <button className="btn btn-secondary" onClick={handleToggleForSaleClick}>
                  {property.isForSale ? 'Remove from Sale' : 'List for Sale'}
                </button>
                <button className="btn btn-secondary" onClick={() => setIsUpdatePriceOpen(true)}>
                  Update Price
                </button>
              </>
            )}
          </div>
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
    </>
  );
};

export default PropertyCard;
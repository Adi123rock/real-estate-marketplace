import React, { useState } from 'react';

const PropertyForm = ({ onSubmit }) => {
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!location || !price) {
      setError('Please fill in all fields');
      return;
    }

    if (isNaN(price) || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }

    onSubmit(location, parseFloat(price));
    setLocation('');
    setPrice('');
  };

  return (
    <div className="form-container">
      <h2>List a New Property</h2>
      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-group">
          <label htmlFor="location">Property Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter property location"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Price (ETH)</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter price in ETH"
            step="0.01"
            min="0"
            className="form-input"
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn btn-primary">
          List Property
        </button>
      </form>
    </div>
  );
};

export default PropertyForm;
import React, { useState } from 'react';

function PropertyForm({ onSubmit }) {
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    
    if (!location.trim()) {
      newErrors.location = 'Property location is required';
    }
    
    if (!price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price) || parseFloat(price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(location, parseFloat(price));
      // Reset form
      setLocation('');
      setPrice('');
      setErrors({});
    }
  };

  return (
    <div className="property-form">
      <h2>List a New Property</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Property Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="123 Main St, CryptoCity"
          />
          {errors.location && <span className="error">{errors.location}</span>}
        </div>
        
        <div className="form-group">
          <label>Price (ETH):</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1.0"
          />
          {errors.price && <span className="error">{errors.price}</span>}
        </div>
        
        <button type="submit" className="btn-primary">List Property</button>
      </form>
    </div>
  );
}

export default PropertyForm;
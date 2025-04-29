import React, { useState } from 'react';
import '../styles/PropertyForm.css';

const PropertyForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    price: '',
    size: '',
    bedrooms: '',
    bathrooms: '',
    image: null,
    imagePreview: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPG and PNG files are allowed');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Only JPG and PNG files are allowed');
        return;
      }
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert price to ETH format
      const priceInEth = formData.price;
      
      // For now, we'll just pass the location and price to match the existing contract
      // You might want to store the additional data (description, bedrooms, etc.) in a separate system
      await onSubmit(formData.location, priceInEth);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        location: '',
        description: '',
        price: '',
        size: '',
        bedrooms: '',
        bathrooms: '',
        image: null,
        imagePreview: null
      });
    } catch (error) {
      console.error('Error submitting property:', error);
    }
  };

  return (
    <div className="property-form-container">
      <div className="form-header">
        <h1>List a Property</h1>
        <p>Fill out the form below to list your property on the marketplace.</p>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
        <div className="image-upload-section">
          <label>Property Image</label>
          <div 
            className={`upload-area ${formData.imagePreview ? 'has-image' : ''}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {formData.imagePreview ? (
              <div className="image-preview">
                <img src={formData.imagePreview} alt="Property preview" />
                <button 
                  type="button" 
                  className="remove-image"
                  onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: null }))}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="upload-icon">⬆️</div>
                <div className="upload-text">
                  <p>Upload Property Image</p>
                  <span>Drag and drop or click to upload</span>
                  <span className="file-specs">PNG, JPG up to 5MB</span>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Property Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Luxury Oceanfront Villa"
              required
            />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Malibu, California"
              required
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe your property..."
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (ETH)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Size (sqft)</label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label>Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              placeholder="0"
              min="0"
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-button">
          List Property
        </button>
      </form>
    </div>
  );
};

export default PropertyForm;
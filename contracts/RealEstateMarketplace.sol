// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RealEstateMarketplace
 * @dev Implements a decentralized marketplace for real estate properties
 */
contract RealEstateMarketplace is ReentrancyGuard {
    // Property struct to hold all property details
    struct Property {
        string name;           // Property name
        string location;       // Property location
        string description;    // Property description
        string imageUrl;       // IPFS hash or URL of the property image
        uint256 price;        // Price in wei
        uint256 size;         // Size in square feet
        uint8 bedrooms;       // Number of bedrooms
        uint8 bathrooms;      // Number of bathrooms
        address owner;        // Current owner
        bool isForSale;       // Whether the property is for sale
    }

    // Array to store all properties
    Property[] public properties;
    
    // Mapping from property ID to owner
    mapping(uint256 => address) public propertyOwner;

    // Events
    event PropertyListed(
        uint256 indexed propertyId,
        string name,
        string location,
        uint256 price,
        address owner
    );
    
    event PropertySold(
        uint256 indexed propertyId,
        address oldOwner,
        address newOwner,
        uint256 price
    );
    
    event PropertyUpdated(
        uint256 indexed propertyId,
        uint256 newPrice,
        bool isForSale
    );

    /**
     * @dev List a new property for sale
     * @param _name Name of the property
     * @param _location Location of the property
     * @param _description Description of the property
     * @param _imageUrl IPFS hash or URL of the property image
     * @param _price Price in wei
     * @param _size Size in square feet
     * @param _bedrooms Number of bedrooms
     * @param _bathrooms Number of bathrooms
     */
    function listProperty(
        string memory _name,
        string memory _location,
        string memory _description,
        string memory _imageUrl,
        uint256 _price,
        uint256 _size,
        uint8 _bedrooms,
        uint8 _bathrooms
    ) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(_price > 0, "Price must be greater than zero");
        require(_size > 0, "Size must be greater than zero");
        require(_bedrooms > 0, "Must have at least one bedroom");
        require(_bathrooms > 0, "Must have at least one bathroom");
        
        // Create new property
        Property memory newProperty = Property({
            name: _name,
            location: _location,
            description: _description,
            imageUrl: _imageUrl,
            price: _price,
            size: _size,
            bedrooms: _bedrooms,
            bathrooms: _bathrooms,
            owner: msg.sender,
            isForSale: true
        });
        
        // Add property to array
        properties.push(newProperty);
        uint256 propertyId = properties.length - 1;
        
        // Set ownership
        propertyOwner[propertyId] = msg.sender;
        
        // Emit event
        emit PropertyListed(propertyId, _name, _location, _price, msg.sender);
    }

    /**
     * @dev Buy a property that is for sale
     * @param _propertyId ID of the property to purchase
     */
    function buyProperty(uint256 _propertyId) public payable nonReentrant {
        // Validate the property exists
        require(_propertyId < properties.length, "Property does not exist");
        
        Property storage property = properties[_propertyId];
        
        // Validate the property is for sale
        require(property.isForSale, "Property is not for sale");
        
        // Validate the buyer is not the current owner
        require(property.owner != msg.sender, "Cannot buy your own property");
        
        // Validate the buyer sent enough ETH
        require(msg.value >= property.price, "Not enough ETH sent");
        
        // Store previous owner for the event
        address oldOwner = property.owner;
        uint256 price = property.price;
        
        // Update ownership
        property.owner = msg.sender;
        property.isForSale = false;
        propertyOwner[_propertyId] = msg.sender;
        
        // Transfer exact price to the seller
        (bool sent, ) = payable(oldOwner).call{value: price}("");
        require(sent, "Failed to send ETH to seller");
        
        // Refund excess ETH if any
        uint256 excess = msg.value - price;
        if (excess > 0) {
            (bool refundSent, ) = payable(msg.sender).call{value: excess}("");
            require(refundSent, "Failed to refund excess ETH");
        }
        
        // Emit event
        emit PropertySold(_propertyId, oldOwner, msg.sender, price);
    }

    /**
     * @dev Get total number of properties
     * @return Number of properties in the marketplace
     */
    function getPropertyCount() public view returns (uint256) {
        return properties.length;
    }
    
    /**
     * @dev Get a specific property by ID
     * @param _propertyId ID of the property to retrieve
     * @return name The name of the property
     * @return location The location of the property
     * @return description The description of the property
     * @return imageUrl The URL or IPFS hash of the property image
     * @return price The price of the property in wei
     * @return size The size of the property in square feet
     * @return bedrooms The number of bedrooms
     * @return bathrooms The number of bathrooms
     * @return owner The address of the property owner
     * @return isForSale Whether the property is currently for sale
     */
    function getProperty(uint256 _propertyId) public view returns (
        string memory name,
        string memory location,
        string memory description,
        string memory imageUrl,
        uint256 price,
        uint256 size,
        uint8 bedrooms,
        uint8 bathrooms,
        address owner,
        bool isForSale
    ) {
        require(_propertyId < properties.length, "Property does not exist");
        Property memory property = properties[_propertyId];
        
        return (
            property.name,
            property.location,
            property.description,
            property.imageUrl,
            property.price,
            property.size,
            property.bedrooms,
            property.bathrooms,
            property.owner,
            property.isForSale
        );
    }
    
    /**
     * @dev Check if sender is the owner of a property
     * @param _propertyId ID of the property to check
     * @return true if msg.sender is the owner
     */
    function isOwner(uint256 _propertyId) public view returns (bool) {
        require(_propertyId < properties.length, "Property does not exist");
        return propertyOwner[_propertyId] == msg.sender;
    }
    
    /**
     * @dev Allow owner to update property price
     * @param _propertyId ID of the property to update
     * @param _newPrice New price in wei
     */
    function updatePropertyPrice(uint256 _propertyId, uint256 _newPrice) public {
        require(_propertyId < properties.length, "Property does not exist");
        require(propertyOwner[_propertyId] == msg.sender, "Only owner can update price");
        require(_newPrice > 0, "Price must be greater than zero");
        
        properties[_propertyId].price = _newPrice;
        
        // Emit event for price update
        emit PropertyUpdated(_propertyId, _newPrice, properties[_propertyId].isForSale);
    }
    
    /**
     * @dev Allow owner to toggle property sale status
     * @param _propertyId ID of the property to toggle status
     */
    function toggleForSale(uint256 _propertyId) public {
        require(_propertyId < properties.length, "Property does not exist");
        require(propertyOwner[_propertyId] == msg.sender, "Only owner can change sale status");
        
        properties[_propertyId].isForSale = !properties[_propertyId].isForSale;
        
        // Emit event for sale status update
        emit PropertyUpdated(_propertyId, properties[_propertyId].price, properties[_propertyId].isForSale);
    }

    /**
     * @dev Allow owner to update property image
     * @param _propertyId ID of the property to update
     * @param _newImageUrl New image URL
     */
    function updateImageUrl(uint256 _propertyId, string memory _newImageUrl) public {
        require(_propertyId < properties.length, "Property does not exist");
        require(propertyOwner[_propertyId] == msg.sender, "Only owner can update image");
        require(bytes(_newImageUrl).length > 0, "Image URL cannot be empty");
        
        properties[_propertyId].imageUrl = _newImageUrl;
        
        // Emit event for image update
        emit PropertyUpdated(_propertyId, properties[_propertyId].price, properties[_propertyId].isForSale);
    }

    /**
     * @dev Allow owner to update property details
     * @param _propertyId ID of the property to update
     * @param _price New price in wei
     * @param _description New description
     * @param _imageUrl New image URL
     */
    function updatePropertyDetails(
        uint256 _propertyId,
        uint256 _price,
        string memory _description,
        string memory _imageUrl
    ) public {
        require(_propertyId < properties.length, "Property does not exist");
        require(propertyOwner[_propertyId] == msg.sender, "Only owner can update details");
        require(_price > 0, "Price must be greater than zero");
        
        Property storage property = properties[_propertyId];
        property.price = _price;
        property.description = _description;
        property.imageUrl = _imageUrl;
        
        emit PropertyUpdated(_propertyId, _price, property.isForSale);
    }
}
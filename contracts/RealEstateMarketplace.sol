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
        string location;
        uint256 price;
        address owner;
        bool isForSale;
    }

    // Array to store all properties
    Property[] public properties;
    
    // Mapping from property ID to owner
    mapping(uint256 => address) public propertyOwner;

    // Events
    event PropertyListed(uint256 indexed propertyId, string location, uint256 price, address owner);
    event PropertySold(uint256 indexed propertyId, address oldOwner, address newOwner, uint256 price);
    event PropertyUpdated(uint256 indexed propertyId, uint256 newPrice, bool isForSale);

    /**
     * @dev List a new property for sale
     * @param _location String description of property location
     * @param _price Price in wei
     */
    function listProperty(string memory _location, uint256 _price) public {
        require(bytes(_location).length > 0, "Location cannot be empty");
        require(_price > 0, "Price must be greater than zero");
        
        // Create new property
        Property memory newProperty = Property({
            location: _location,
            price: _price,
            owner: msg.sender,
            isForSale: true
        });
        
        // Add property to array
        properties.push(newProperty);
        uint256 propertyId = properties.length - 1;
        
        // Set ownership
        propertyOwner[propertyId] = msg.sender;
        
        // Emit event
        emit PropertyListed(propertyId, _location, _price, msg.sender);
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
    
    /*
     * @dev Get a specific property by ID
     * @param _propertyId ID of the property to retrieve
     * @return location, price, owner, isForSale
     */
    function getProperty(uint256 _propertyId) public view returns (
        string memory location,
        uint256 price,
        address owner,
        bool isForSale
    ) {
        require(_propertyId < properties.length, "Property does not exist");
        Property memory property = properties[_propertyId];
        
        return (
            property.location,
            property.price,
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
}
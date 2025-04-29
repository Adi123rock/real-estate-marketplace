const RealEstateMarketplace = artifacts.require("RealEstateMarketplace");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

contract("RealEstateMarketplace", accounts => {
  const [owner, buyer, unauthorized] = accounts;
  
  let realEstateMarketplace;
  const propertyLocation = "123 Main St, CryptoCity";
  const propertyPrice = web3.utils.toWei("1", "ether");
  
  beforeEach(async () => {
    realEstateMarketplace = await RealEstateMarketplace.new();
  });
  
  describe("Property Listing", () => {
    it("should allow user to list a property", async () => {
      const tx = await realEstateMarketplace.listProperty(propertyLocation, propertyPrice, { from: owner });
      
      // Check event was emitted
      expectEvent(tx, 'PropertyListed', {
        propertyId: new BN(0),
        location: propertyLocation,
        price: propertyPrice,
        owner: owner
      });
      
      // Check property count
      const count = await realEstateMarketplace.getPropertyCount();
      assert.equal(count, 1, "Property count should be 1");
      
      // Check property details
      const property = await realEstateMarketplace.getProperty(0);
      assert.equal(property.location, propertyLocation, "Property location doesn't match");
      assert.equal(property.price, propertyPrice, "Property price doesn't match");
      assert.equal(property.owner, owner, "Property owner doesn't match");
      assert.equal(property.isForSale, true, "Property should be for sale");
    });
    
    it("should verify ownership correctly", async () => {
      await realEstateMarketplace.listProperty(propertyLocation, propertyPrice, { from: owner });
      
      const isOwner = await realEstateMarketplace.isOwner(0, { from: owner });
      assert.equal(isOwner, true, "Owner should be identified correctly");
      
      const isNotOwner = await realEstateMarketplace.isOwner(0, { from: unauthorized });
      assert.equal(isNotOwner, false, "Non-owner should be identified correctly");
    });
  });
  
  describe("Property Purchase", () => {
    beforeEach(async () => {
      await realEstateMarketplace.listProperty(propertyLocation, propertyPrice, { from: owner });
    });
    
    it("should allow user to buy a property with correct ETH amount", async () => {
      const initialOwnerBalance = new BN(await web3.eth.getBalance(owner));
      
      // Buy property
      const tx = await realEstateMarketplace.buyProperty(0, { 
        from: buyer, 
        value: propertyPrice 
      });
      
      // Check event was emitted
      expectEvent(tx, 'PropertySold', {
        propertyId: new BN(0),
        oldOwner: owner,
        newOwner: buyer,
        price: propertyPrice
      });
      
      // Check new owner
      const property = await realEstateMarketplace.getProperty(0);
      assert.equal(property.owner, buyer, "Property owner should be updated to buyer");
      assert.equal(property.isForSale, false, "Property should not be for sale after purchase");
      
      // Check ETH transfer
      const finalOwnerBalance = new BN(await web3.eth.getBalance(owner));
      const expectedBalance = initialOwnerBalance.add(new BN(propertyPrice));
      assert.equal(finalOwnerBalance.toString(), expectedBalance.toString(), "Seller should receive ETH payment");
    });
    
    it("should reject purchases with insufficient ETH", async () => {
      const insufficientAmount = web3.utils.toWei("0.5", "ether");
      
      await expectRevert(
        realEstateMarketplace.buyProperty(0, { from: buyer, value: insufficientAmount }),
        "Not enough ETH sent"
      );
      
      // Verify ownership hasn't changed
      const property = await realEstateMarketplace.getProperty(0);
      assert.equal(property.owner, owner, "Property owner should not change after failed purchase");
    });
    
    it("should reject purchases for non-existent properties", async () => {
      await expectRevert(
        realEstateMarketplace.buyProperty(999, { from: buyer, value: propertyPrice }),
        "Property does not exist"
      );
    });
  });
  
  describe("Property Management", () => {
    beforeEach(async () => {
      await realEstateMarketplace.listProperty(propertyLocation, propertyPrice, { from: owner });
    });
    
    it("should allow owner to update property price", async () => {
      const newPrice = web3.utils.toWei("2", "ether");
      
      await realEstateMarketplace.updatePropertyPrice(0, newPrice, { from: owner });
      
      const property = await realEstateMarketplace.getProperty(0);
      assert.equal(property.price, newPrice, "Property price should be updated");
    });
    
    it("should reject price updates from non-owners", async () => {
      const newPrice = web3.utils.toWei("2", "ether");
      
      await expectRevert(
        realEstateMarketplace.updatePropertyPrice(0, newPrice, { from: unauthorized }),
        "Only owner can update price"
      );
    });
    
    it("should allow owner to toggle sale status", async () => {
      await realEstateMarketplace.toggleForSale(0, { from: owner });
      
      let property = await realEstateMarketplace.getProperty(0);
      assert.equal(property.isForSale, false, "Property should not be for sale");
      
      await realEstateMarketplace.toggleForSale(0, { from: owner });
      
      property = await realEstateMarketplace.getProperty(0);
      assert.equal(property.isForSale, true, "Property should be for sale again");
    });
  });
});
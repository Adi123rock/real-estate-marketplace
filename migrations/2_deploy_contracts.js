const RealEstateMarketplace = artifacts.require("RealEstateMarketplace");

module.exports = function(deployer) {
  deployer.deploy(RealEstateMarketplace);
};
var AssetManager = artifacts.require("./AssetManager.sol");
var AuctionManager = artifacts.require("./AuctionManager.sol");

module.exports = function(deployer) {
  deployer.deploy(AssetManager);
  deployer.deploy(AuctionManager)
};

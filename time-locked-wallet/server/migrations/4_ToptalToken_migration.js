const ToptalToken = artifacts.require("ToptalToken");

module.exports = function(deployer){
    deployer.deploy(ToptalToken);
};
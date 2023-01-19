const Migrations = artifacts.require("Migrations");
const TimeL = artifacts.require("TimeL");

// const ERC20 = artifacts.require("ERC20");
// const SafeMath = artifacts.require("SafeMath");
// const TimeLock = artifacts.require("TimeLock");
// const TimeLockedWallet = artifacts.require("TimeLockedWallet");
// const TimeLockedWalletFactory = artifacts.require("TimeLockedWalletFactory");
// const ToptalToken = artifacts.require("ToptalToken");


module.exports = function(deployer){
    deployer.deploy(Migrations);

    deployer.deploy(TimeL)

    // deployer.deploy(SafeMath);
    // deployer.deploy(TimeLock);
    // deployer.deploy(TimeLockedWallet);
    // deployer.deploy(TimeLockedWalletFactory);
    // deployer.deploy(ToptalToken);
};
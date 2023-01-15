const Migrations = artifacts.require("Migrations");
const AccountInfo = artifacts.require("AccountInfo");
const TimeLock = artifacts.require("TimeLock");

// const ERC20 = artifacts.require("ERC20");
// const SafeMath = artifacts.require("SafeMath");
// const TimeLock = artifacts.require("TimeLock");
// const TimeLockedWallet = artifacts.require("TimeLockedWallet");
// const TimeLockedWalletFactory = artifacts.require("TimeLockedWalletFactory");
// const ToptalToken = artifacts.require("ToptalToken");


module.exports = function(deployer){
    deployer.deploy(AccountInfo);

    deployer.deploy(Migrations);

    deployer.deploy(TimeLock)

    // deployer.deploy(SafeMath);
    // deployer.deploy(TimeLock);
    // deployer.deploy(TimeLockedWallet);
    // deployer.deploy(TimeLockedWalletFactory);
    // deployer.deploy(ToptalToken);
};
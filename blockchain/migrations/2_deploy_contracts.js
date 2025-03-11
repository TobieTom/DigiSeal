const ProductVerification = artifacts.require("ProductVerification");

module.exports = function (deployer) {
    deployer.deploy(ProductVerification, { gas: 5000000, gasPrice: 180000000000 });
};
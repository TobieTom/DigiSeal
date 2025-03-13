const ProductVerification = artifacts.require("ProductVerification");

module.exports = function (deployer, network) {
    if (network === 'holesky') {
        // Use explicit gas settings for Holesky
        deployer.deploy(ProductVerification, {
            gas: 3000000,
            gasPrice: 900000000 // 0.9 gwei
        });
    } else {
        // Default deployment for other networks
        deployer.deploy(ProductVerification);
    }
};
const path = require('path');
const Web3 = require('web3');
const TruffleContract = require('@truffle/contract');

// Use a reliable path
const contractPath = path.join(__dirname, '../../contracts/ProductVerification.json');
const ProductVerificationJSON = require(contractPath);

// Connect to blockchain
const connectBlockchain = () => {
    // Version 4.x of Web3 handles providers differently
    const providerUrl = process.env.BLOCKCHAIN_URL || 'http://localhost:8545';
    const web3 = new Web3(providerUrl);
    
    // Create truffle contract
    const ProductVerification = TruffleContract(ProductVerificationJSON);
    ProductVerification.setProvider(web3.currentProvider);

    return {
        web3,
        ProductVerification,
    };
};

module.exports = { connectBlockchain };
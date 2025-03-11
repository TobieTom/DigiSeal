const Web3 = require('web3');
const TruffleContract = require('@truffle/contract');
const ProductVerificationJSON = require('../../blockchain/build/contracts/ProductVerification.json');

// Connect to blockchain
const connectBlockchain = () => {
    const web3Provider = new Web3.providers.HttpProvider(process.env.BLOCKCHAIN_URL || 'http://localhost:8545');
    const web3 = new Web3(web3Provider);

    // Create truffle contract
    const ProductVerification = TruffleContract(ProductVerificationJSON);
    ProductVerification.setProvider(web3Provider);

    return {
        web3,
        ProductVerification,
    };
};

module.exports = { connectBlockchain };
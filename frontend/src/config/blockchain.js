// src/config/blockchain.js
const config = {
    contractAddress: '0x2a97A78a93cE426e45b13662F500CE84839d232c', // Replace with your deployed contract address
    networkId: 17000,  // Holesky testnet ID, change to your target network
    rpcUrl: 'https://eth-holesky.g.alchemy.com/v2/9nEKLzpEVGdrmF8yKqsAtIVk80lxtelV', // Update with your API key
    chainName: 'Holesky Testnet', // Update with your target network name
    explorerUrl: 'https://holesky.etherscan.io',  // Update with your network explorer
    
    // For local development
    // networkId: 1337,
    // rpcUrl: 'http://localhost:8545',
    // chainName: 'Local Network', 
    // explorerUrl: '',
};

export default config;
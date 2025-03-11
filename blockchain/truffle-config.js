require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
        },
        amoy: {
            provider: () => new HDWalletProvider({
                mnemonic: { phrase: process.env.MNEMONIC },
                providerOrUrl: `https://polygon-amoy.g.alchemy.com/v2/2eYqb_oflsOCmCTbBvIV8rytueOVVmGg`
            }),
            network_id: 80002, // Amoy's network ID
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true,
            gas: 5000000,
            gasPrice: 5000000000  // 5 gwei
        }
    },
    compilers: {
        solc: {
            version: "0.8.19",
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
};
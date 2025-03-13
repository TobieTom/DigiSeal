require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
    networks: {
        development: {
            host: "127.0.0.1",
            port: 8545,
            network_id: "*",
        },
        holesky: {
            provider: () => new HDWalletProvider({
                mnemonic: { phrase: process.env.MNEMONIC },
                providerOrUrl: `https://eth-holesky.g.alchemy.com/v2/f12PoTH-Bfs1PrGeNy0EGBmsDRHSunvw`
            }),
            network_id: 17000,
            confirmations: 2,
            timeoutBlocks: 200,
            skipDryRun: true,
            gas: 3000000,           // Further reduced
            gasPrice: 900000000,    // 0.9 gwei
            networkCheckTimeout: 120000
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
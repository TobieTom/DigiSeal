import Web3 from 'web3';
import TruffleContract from '@truffle/contract';
import ProductVerificationArtifact from '../../blockchain/build/contracts/ProductVerification.json';
import config from '../config/blockchain';

class BlockchainService {
    constructor() {
        this.web3 = null;
        this.accounts = [];
        this.networkId = null;
        this.productVerification = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return true;

        try {
            // Modern dapp browsers
            if (window.ethereum) {
                this.web3 = new Web3(window.ethereum);
                try {
                    // Request account access
                    await window.ethereum.request({ method: 'eth_requestAccounts' });

                    // Switch to correct network if needed
                    const chainId = await this.web3.eth.getChainId();
                    if (chainId !== config.networkId) {
                        try {
                            await window.ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: this.web3.utils.toHex(config.networkId) }],
                            });
                        } catch (switchError) {
                            // This error code indicates that the chain has not been added to MetaMask
                            if (switchError.code === 4902) {
                                await window.ethereum.request({
                                    method: 'wallet_addEthereumChain',
                                    params: [{
                                        chainId: this.web3.utils.toHex(config.networkId),
                                        chainName: config.chainName,
                                        rpcUrls: [config.rpcUrl],
                                        blockExplorerUrls: [config.explorerUrl],
                                        nativeCurrency: {
                                            name: "Ethereum",
                                            symbol: "ETH",
                                            decimals: 18
                                        }
                                    }],
                                });
                            } else {
                                throw switchError;
                            }
                        }
                    }
                } catch (error) {
                    console.error("User denied account access or network switch");
                    throw new Error("User denied account access or network switch");
                }
            }
            // Legacy dapp browsers
            else if (window.web3) {
                this.web3 = new Web3(window.web3.currentProvider);
            }
            // Fallback to specified RPC URL
            else {
                const provider = new Web3.providers.HttpProvider(config.rpcUrl);
                this.web3 = new Web3(provider);
            }

            this.accounts = await this.web3.eth.getAccounts();
            this.networkId = await this.web3.eth.net.getId();

            // Set up contract
            const ProductVerification = TruffleContract(ProductVerificationArtifact);
            ProductVerification.setProvider(this.web3.currentProvider);

            try {
                // Use deployed contract on the network
                this.productVerification = await ProductVerification.at(config.contractAddress);
            } catch (error) {
                console.error("Error connecting to contract:", error);
                throw new Error("Failed to connect to contract. Make sure you're on the right network.");
            }

            this.initialized = true;
            return true;
        } catch (error) {
            console.error("Initialization error:", error);
            throw error;
        }
    }

    async getCurrentAccount() {
        if (!this.initialized) await this.init();
        this.accounts = await this.web3.eth.getAccounts();
        return this.accounts[0];
    }

    async registerProduct(productId, manufacturerName, productDetails, manufacturingLocation) {
        if (!this.initialized) await this.init();

        try {
            const account = await this.getCurrentAccount();
            return await this.productVerification.registerProduct(
                productId,
                manufacturerName,
                productDetails,
                manufacturingLocation,
                { from: account }
            );
        } catch (error) {
            console.error("Error registering product:", error);
            throw error;
        }
    }

    async verifyProduct(productId, location) {
        if (!this.initialized) await this.init();

        try {
            const account = await this.getCurrentAccount();
            const result = await this.productVerification.verifyProduct(
                productId,
                location || 'Unknown',
                { from: account }
            );

            // Parse result from transaction logs
            const verifiedEvent = result.logs.find(log => log.event === 'ProductVerified');
            return verifiedEvent ? verifiedEvent.args.authentic : false;
        } catch (error) {
            console.error("Error verifying product:", error);
            throw error;
        }
    }

    async getProductDetails(productId) {
        if (!this.initialized) await this.init();

        try {
            const details = await this.productVerification.getProductDetails(productId);

            // Format the response
            return {
                productId: details[0],
                manufacturer: details[1],
                currentOwner: details[2],
                manufactureDate: new Date(details[3].toNumber() * 1000),
                manufacturerName: details[4],
                productDetails: details[5],
                manufacturingLocation: details[6],
                status: ['Created', 'InTransit', 'WithSeller', 'Sold', 'Reported'][details[7].toNumber()],
                isAuthentic: details[8]
            };
        } catch (error) {
            console.error("Error getting product details:", error);
            throw error;
        }
    }

    async transferOwnership(productId, newOwner, transferConditions) {
        if (!this.initialized) await this.init();

        try {
            const account = await this.getCurrentAccount();
            return await this.productVerification.transferOwnership(
                productId,
                newOwner,
                transferConditions || '',
                { from: account }
            );
        } catch (error) {
            console.error("Error transferring ownership:", error);
            throw error;
        }
    }

    async getTransferHistory(productId) {
        if (!this.initialized) await this.init();

        try {
            const history = await this.productVerification.getTransferHistory(productId);

            // Format the response
            return history.map(transfer => ({
                from: transfer.from,
                to: transfer.to,
                timestamp: new Date(transfer.timestamp.toNumber() * 1000),
                transferConditions: transfer.transferConditions
            }));
        } catch (error) {
            console.error("Error getting transfer history:", error);
            throw error;
        }
    }

    async getVerificationHistory(productId) {
        if (!this.initialized) await this.init();

        try {
            const history = await this.productVerification.getVerificationHistory(productId);

            // Format the response
            return history.map(verification => ({
                verifier: verification.verifier,
                timestamp: new Date(verification.timestamp.toNumber() * 1000),
                location: verification.location,
                result: verification.result
            }));
        } catch (error) {
            console.error("Error getting verification history:", error);
            throw error;
        }
    }

    async reportCounterfeit(productId, evidenceHash, description, location) {
        if (!this.initialized) await this.init();

        try {
            const account = await this.getCurrentAccount();
            return await this.productVerification.reportCounterfeit(
                productId,
                evidenceHash || '',
                description || '',
                location || '',
                { from: account }
            );
        } catch (error) {
            console.error("Error reporting counterfeit:", error);
            throw error;
        }
    }

    async registerSeller(sellerAddress) {
        if (!this.initialized) await this.init();

        try {
            const account = await this.getCurrentAccount();
            return await this.productVerification.registerSeller(
                sellerAddress,
                { from: account }
            );
        } catch (error) {
            console.error("Error registering seller:", error);
            throw error;
        }
    }

    async getUserRole(address) {
        if (!this.initialized) await this.init();

        try {
            const account = address || await this.getCurrentAccount();

            // Check roles
            const MANUFACTURER_ROLE = this.web3.utils.soliditySha3("MANUFACTURER_ROLE");
            const SELLER_ROLE = this.web3.utils.soliditySha3("SELLER_ROLE");
            const ADMIN_ROLE = this.web3.utils.soliditySha3("ADMIN_ROLE");

            const isManufacturer = await this.productVerification.hasSpecificRole(MANUFACTURER_ROLE, account);
            const isSeller = await this.productVerification.hasSpecificRole(SELLER_ROLE, account);
            const isAdmin = await this.productVerification.hasSpecificRole(ADMIN_ROLE, account);

            return {
                isManufacturer,
                isSeller,
                isAdmin,
                role: isManufacturer ? 'manufacturer' : (isSeller ? 'seller' : 'consumer')
            };
        } catch (error) {
            console.error("Error checking user role:", error);
            throw error;
        }
    }

    async getProductsOwned(address) {
        if (!this.initialized) await this.init();

        try {
            const account = address || await this.getCurrentAccount();
            const productIds = await this.productVerification.getProductsOwned(account);
            return productIds;
        } catch (error) {
            console.error("Error getting owned products:", error);
            throw error;
        }
    }

    async getProductsManufactured(address) {
        if (!this.initialized) await this.init();

        try {
            const account = address || await this.getCurrentAccount();
            const productIds = await this.productVerification.getProductsManufactured(account);
            return productIds;
        } catch (error) {
            console.error("Error getting manufactured products:", error);
            throw error;
        }
    }
}

// Create a singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;
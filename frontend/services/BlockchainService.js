import Web3 from 'web3';
import TruffleContract from '@truffle/contract';
import ProductVerificationArtifact from '../../blockchain/build/contracts/ProductVerification.json'; // Adjust path as needed

class BlockchainService {
    constructor() {
        this.web3 = null;
        this.accounts = [];
        this.networkId = null;
        this.productVerification = null;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Modern dapp browsers
            if (window.ethereum) {
                this.web3 = new Web3(window.ethereum);
                try {
                    // Request account access
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                } catch (error) {
                    console.error("User denied account access");
                    throw new Error("User denied account access");
                }
            }
            // Legacy dapp browsers
            else if (window.web3) {
                this.web3 = new Web3(window.web3.currentProvider);
            }
            // If no injected web3 instance is detected, fall back to Ganache
            else {
                const provider = new Web3.providers.HttpProvider('http://localhost:8545');
                this.web3 = new Web3(provider);
            }

            this.accounts = await this.web3.eth.getAccounts();
            this.networkId = await this.web3.eth.net.getId();

            // Set up contract
            const ProductVerification = TruffleContract(ProductVerificationArtifact);
            ProductVerification.setProvider(this.web3.currentProvider);

            try {
                this.productVerification = await ProductVerification.deployed();
            } catch (error) {
                console.error("Contract not deployed on this network:", error);
                throw new Error("Contract not deployed on this network");
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
        return this.accounts[0];
    }

    async registerProduct(productId, manufacturerName, productDetails, manufacturingLocation) {
        if (!this.initialized) await this.init();

        try {
            const account = this.accounts[0];
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
            const account = this.accounts[0];
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
            const account = this.accounts[0];
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
            const account = this.accounts[0];
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
            const account = this.accounts[0];
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
            const account = address || this.accounts[0];

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
            const account = address || this.accounts[0];
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
            const account = address || this.accounts[0];
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
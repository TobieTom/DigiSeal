import Web3 from 'web3';

class BlockchainService {
    constructor() {
        this.web3 = null;
        this.accounts = [];
        this.networkId = null;
        this.productVerificationContract = null;
        this.initialized = false;
        this.contractAddress = null; // Will be set from the artifact
    }

    async loadContractArtifact() {
        try {
            const response = await fetch('/contracts/ProductVerification.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch contract artifact: ${response.status} ${response.statusText}`);
            }
            const artifact = await response.json();
            
            // Get the contract ABI and deployment address from the artifact
            this.contractAbi = artifact.abi;
            
            // Get the deployment address from networks object
            // We'll use the first network found in the artifact
            const networkIds = Object.keys(artifact.networks);
            if (networkIds.length === 0) {
                throw new Error("No deployed network found in the contract artifact");
            }
            this.contractAddress = artifact.networks[networkIds[0]].address;
            
            return {
                abi: this.contractAbi,
                address: this.contractAddress
            };
        } catch (error) {
            console.error("Error loading contract artifact:", error);
            throw error;
        }
    }

    async init() {
        if (this.initialized) return true;

        try {
            // Load contract artifact first
            const contractInfo = await this.loadContractArtifact();

            // Initialize Web3
            if (window.ethereum) {
                this.web3 = new Web3(window.ethereum);
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                } catch (error) {
                    console.error("User denied account access");
                    throw new Error("User denied account access");
                }
            } else if (window.web3) {
                this.web3 = new Web3(window.web3.currentProvider);
            } else {
                const provider = new Web3.providers.HttpProvider('http://localhost:8545');
                this.web3 = new Web3(provider);
            }

            this.accounts = await this.web3.eth.getAccounts();
            this.networkId = await this.web3.eth.net.getId();

            // Create contract instance directly with web3
            this.productVerificationContract = new this.web3.eth.Contract(
                contractInfo.abi,
                contractInfo.address
            );

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
            return await this.productVerificationContract.methods.registerProduct(
                productId,
                manufacturerName,
                productDetails,
                manufacturingLocation
            ).send({ from: account });
        } catch (error) {
            console.error("Error registering product:", error);
            throw error;
        }
    }

    async verifyProduct(productId, location) {
        if (!this.initialized) await this.init();

        try {
            const account = await this.getCurrentAccount();
            const result = await this.productVerificationContract.methods.verifyProduct(
                productId,
                location || 'Unknown'
            ).send({ from: account });

            // Parse result to get authentication status
            const events = result.events;
            if (events && events.ProductVerified) {
                return events.ProductVerified.returnValues.authentic;
            }
            return false;
        } catch (error) {
            console.error("Error verifying product:", error);
            throw error;
        }
    }

    async getProductDetails(productId) {
        if (!this.initialized) await this.init();

        try {
            const details = await this.productVerificationContract.methods.getProductDetails(productId).call();

            // Format the response
            return {
                productId: details[0],
                manufacturer: details[1],
                currentOwner: details[2],
                manufactureDate: new Date(parseInt(details[3]) * 1000),
                manufacturerName: details[4],
                productDetails: details[5],
                manufacturingLocation: details[6],
                status: ['Created', 'InTransit', 'WithSeller', 'Sold', 'Reported'][parseInt(details[7])],
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
            return await this.productVerificationContract.methods.transferOwnership(
                productId,
                newOwner,
                transferConditions || ''
            ).send({ from: account });
        } catch (error) {
            console.error("Error transferring ownership:", error);
            throw error;
        }
    }

    async getTransferHistory(productId) {
        if (!this.initialized) await this.init();

        try {
            const history = await this.productVerificationContract.methods.getTransferHistory(productId).call();

            // Format the response
            return history.map(transfer => ({
                from: transfer.from,
                to: transfer.to,
                timestamp: new Date(parseInt(transfer.timestamp) * 1000),
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
            const history = await this.productVerificationContract.methods.getVerificationHistory(productId).call();

            // Format the response
            return history.map(verification => ({
                verifier: verification.verifier,
                timestamp: new Date(parseInt(verification.timestamp) * 1000),
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
            return await this.productVerificationContract.methods.reportCounterfeit(
                productId,
                evidenceHash || '',
                description || '',
                location || ''
            ).send({ from: account });
        } catch (error) {
            console.error("Error reporting counterfeit:", error);
            throw error;
        }
    }

    async registerSeller(sellerAddress) {
        if (!this.initialized) await this.init();

        try {
            const account = await this.getCurrentAccount();
            return await this.productVerificationContract.methods.registerSeller(
                sellerAddress
            ).send({ from: account });
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

            const isManufacturer = await this.productVerificationContract.methods.hasSpecificRole(MANUFACTURER_ROLE, account).call();
            const isSeller = await this.productVerificationContract.methods.hasSpecificRole(SELLER_ROLE, account).call();
            const isAdmin = await this.productVerificationContract.methods.hasSpecificRole(ADMIN_ROLE, account).call();

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
            return await this.productVerificationContract.methods.getProductsOwned(account).call();
        } catch (error) {
            console.error("Error getting owned products:", error);
            throw error;
        }
    }

    async getProductsManufactured(address) {
        if (!this.initialized) await this.init();

        try {
            const account = address || await this.getCurrentAccount();
            return await this.productVerificationContract.methods.getProductsManufactured(account).call();
        } catch (error) {
            console.error("Error getting manufactured products:", error);
            throw error;
        }
    }
}

// Create a singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;
// src/services/BlockchainService.js
import Web3 from 'web3';
import config from '../config/blockchain';

/**
 * Service for interacting with the Ethereum blockchain
 */
class BlockchainService {
    constructor() {
        this.web3 = null;
        this.accounts = [];
        this.networkId = null;
        this.productVerificationContract = null;
        this.initialized = false;
        this.contractAddress = config.contractAddress;
        this.contractAbi = null;
    }

    /**
     * Load contract ABI from the provided JSON
     * @private
     * @returns {Promise<{abi: Array, address: string}>} Contract ABI and address
     */
    async _loadContractAbi() {
        try {
            // Import the contract ABI from a static JSON file
            const response = await fetch('/contracts/ProductVerification.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch contract artifact: ${response.status} ${response.statusText}`);
            }
            
            const artifact = await response.json();
            this.contractAbi = artifact.abi;
            
            return {
                abi: this.contractAbi,
                address: this.contractAddress
            };
        } catch (error) {
            console.error("Error loading contract ABI:", error);
            
            // Fallback to using a hardcoded ABI if fetch fails
            console.warn("Using fallback ABI");
            // This is a minimal ABI with only the methods we need
            this.contractAbi = [
                // Product registration
                {
                    "inputs": [
                        { "name": "productId", "type": "string" },
                        { "name": "manufacturerName", "type": "string" },
                        { "name": "productDetails", "type": "string" },
                        { "name": "manufacturingLocation", "type": "string" }
                    ],
                    "name": "registerProduct",
                    "outputs": [{ "name": "", "type": "bool" }],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                // Product verification
                {
                    "inputs": [
                        { "name": "productId", "type": "string" },
                        { "name": "location", "type": "string" }
                    ],
                    "name": "verifyProduct",
                    "outputs": [{ "name": "", "type": "bool" }],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                // Get product details
                {
                    "inputs": [{ "name": "productId", "type": "string" }],
                    "name": "getProductDetails",
                    "outputs": [
                        { "name": "", "type": "string" },
                        { "name": "", "type": "address" },
                        { "name": "", "type": "address" },
                        { "name": "", "type": "uint256" },
                        { "name": "", "type": "string" },
                        { "name": "", "type": "string" },
                        { "name": "", "type": "string" },
                        { "name": "", "type": "uint8" },
                        { "name": "", "type": "bool" }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                // Transfer ownership
                {
                    "inputs": [
                        { "name": "productId", "type": "string" },
                        { "name": "newOwner", "type": "address" },
                        { "name": "transferConditions", "type": "string" }
                    ],
                    "name": "transferOwnership",
                    "outputs": [{ "name": "", "type": "bool" }],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                // Get transfer history
                {
                    "inputs": [{ "name": "productId", "type": "string" }],
                    "name": "getTransferHistory",
                    "outputs": [
                        {
                            "components": [
                                { "name": "from", "type": "address" },
                                { "name": "to", "type": "address" },
                                { "name": "timestamp", "type": "uint256" },
                                { "name": "transferConditions", "type": "string" }
                            ],
                            "name": "",
                            "type": "tuple[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                // Get verification history
                {
                    "inputs": [{ "name": "productId", "type": "string" }],
                    "name": "getVerificationHistory",
                    "outputs": [
                        {
                            "components": [
                                { "name": "verifier", "type": "address" },
                                { "name": "timestamp", "type": "uint256" },
                                { "name": "location", "type": "string" },
                                { "name": "result", "type": "bool" }
                            ],
                            "name": "",
                            "type": "tuple[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                // Report counterfeit
                {
                    "inputs": [
                        { "name": "productId", "type": "string" },
                        { "name": "evidenceHash", "type": "string" },
                        { "name": "description", "type": "string" },
                        { "name": "location", "type": "string" }
                    ],
                    "name": "reportCounterfeit",
                    "outputs": [{ "name": "", "type": "bool" }],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                // Events
                {
                    "anonymous": false,
                    "inputs": [
                        { "indexed": false, "name": "productId", "type": "string" },
                        { "indexed": false, "name": "verifier", "type": "address" },
                        { "indexed": false, "name": "authentic", "type": "bool" }
                    ],
                    "name": "ProductVerified",
                    "type": "event"
                }
            ];
            
            return {
                abi: this.contractAbi,
                address: this.contractAddress
            };
        }
    }

    /**
     * Initialize the blockchain service with MetaMask
     * @returns {Promise<boolean>} Initialization status
     */
    async init() {
        if (this.initialized) return true;

        try {
            // Load contract ABI first
            const contractInfo = await this._loadContractAbi();

            // Initialize Web3 with MetaMask
            if (window.ethereum) {
                this.web3 = new Web3(window.ethereum);
                try {
                    // Request account access if needed
                    console.log("Requesting account access from MetaMask...");
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    console.log("Account access granted");
                } catch (error) {
                    console.error("User denied account access or MetaMask is locked");
                    throw new Error("Please unlock MetaMask and authorize access to continue");
                }
            } else if (window.web3) {
                // Legacy web3 provider
                console.log("Using legacy web3 provider");
                this.web3 = new Web3(window.web3.currentProvider);
            } else {
                // Fallback - local provider (only for development)
                console.log("No web3 provider detected, using fallback");
                const provider = new Web3.providers.HttpProvider(config.rpcUrl || 'http://localhost:8545');
                this.web3 = new Web3(provider);
            }

            // Get accounts and network
            this.accounts = await this.web3.eth.getAccounts();
            this.networkId = await this.web3.eth.net.getId();

            console.log("Connected accounts:", this.accounts);
            console.log("Connected to network ID:", this.networkId);

            // Create contract instance
            this.productVerificationContract = new this.web3.eth.Contract(
                contractInfo.abi,
                contractInfo.address
            );

            console.log("Contract instance created at address:", contractInfo.address);

            this.initialized = true;
            return true;
        } catch (error) {
            console.error("Blockchain initialization error:", error);
            throw error;
        }
    }

    /**
     * Get the current account address from MetaMask
     * @returns {Promise<string>} Current account address
     */
    async getCurrentAccount() {
        if (!this.initialized) await this.init();
        
        // Make sure we get the latest accounts in case they've changed in MetaMask
        try {
            this.accounts = await this.web3.eth.getAccounts();
            if (this.accounts.length === 0) {
                // Try to request accounts again
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.accounts = await this.web3.eth.getAccounts();
            }
        } catch (error) {
            console.error("Error getting accounts:", error);
            throw new Error("Cannot access accounts. Please make sure MetaMask is unlocked and authorized.");
        }
        
        return this.accounts[0];
    }

    /**
     * Register a new product on the blockchain
     * @param {string} productId - Product ID
     * @param {string} manufacturerName - Manufacturer name
     * @param {string} productDetails - Product details or JSON string
     * @param {string} manufacturingLocation - Manufacturing location
     * @returns {Promise<object>} Transaction receipt
     */
    async registerProduct(productId, manufacturerName, productDetails, manufacturingLocation) {
        if (!this.initialized) await this.init();

        try {
            const account = await this.getCurrentAccount();
            
            console.log("Registering product with parameters:", {
                productId,
                manufacturerName,
                detailsLength: productDetails ? productDetails.length : 0,
                manufacturingLocation,
                from: account
            });
            
            // Call the contract method to register the product
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

    /**
     * Verify a product on the blockchain
     * @param {string} productId - Product ID
     * @param {string} location - Verification location
     * @returns {Promise<boolean>} Verification result
     */
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

    /**
     * Get product details from the blockchain
     * @param {string} productId - Product ID
     * @returns {Promise<object>} Product details
     */
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

    /**
     * Transfer product ownership
     * @param {string} productId - Product ID
     * @param {string} newOwner - New owner address
     * @param {string} transferConditions - Transfer conditions
     * @returns {Promise<object>} Transaction receipt
     */
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

    /**
     * Get product transfer history
     * @param {string} productId - Product ID
     * @returns {Promise<Array>} Transfer history
     */
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

    /**
     * Get product verification history
     * @param {string} productId - Product ID
     * @returns {Promise<Array>} Verification history
     */
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

    /**
     * Report a counterfeit product
     * @param {string} productId - Product ID
     * @param {string} evidenceHash - IPFS hash of evidence
     * @param {string} description - Description of counterfeit issue
     * @param {string} location - Location where counterfeit was found
     * @returns {Promise<object>} Transaction receipt
     */
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

    /**
     * Get user role information
     * @param {string} address - User address
     * @returns {Promise<object>} Role information
     */
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

            let role = 'consumer';
            if (isManufacturer) role = 'manufacturer';
            else if (isSeller) role = 'seller';
            else if (isAdmin) role = 'admin';

            return {
                isManufacturer,
                isSeller,
                isAdmin,
                role
            };
        } catch (error) {
            console.error("Error checking user role:", error);
            throw error;
        }
    }

    /**
     * Get products owned by an address
     * @param {string} address - Owner address
     * @returns {Promise<Array>} List of product IDs
     */
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

    /**
     * Get products manufactured by an address
     * @param {string} address - Manufacturer address
     * @returns {Promise<Array>} List of product IDs
     */
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
const express = require('express');
const router = express.Router();
const { connectBlockchain } = require('../utils/blockchain');

// Register a new seller
router.post('/register-seller', async (req, res) => {
    try {
        const { sellerAddress } = req.body;

        // Validate input
        if (!sellerAddress) {
            return res.status(400).json({ success: false, message: 'Seller address is required' });
        }

        const { ProductVerification, web3 } = connectBlockchain();
        const accounts = await web3.eth.getAccounts();
        const instance = await ProductVerification.deployed();

        // Register the seller
        await instance.registerSeller(
            sellerAddress,
            { from: accounts[0] }
        );

        res.json({
            success: true,
            message: 'Seller registered successfully',
            sellerAddress
        });
    } catch (error) {
        console.error('Error registering seller:', error);
        res.status(500).json({ success: false, message: 'Error registering seller' });
    }
});

// Get products owned by user
router.get('/:address/products', async (req, res) => {
    try {
        const { ProductVerification } = connectBlockchain();
        const instance = await ProductVerification.deployed();

        // Get products owned by the address
        const productIds = await instance.getProductsOwned(req.params.address);

        // Format response
        res.json({
            success: true,
            productIds
        });
    } catch (error) {
        console.error('Error fetching owned products:', error);
        res.status(500).json({ success: false, message: 'Error fetching owned products' });
    }
});

// Get products manufactured by user
router.get('/:address/manufactured', async (req, res) => {
    try {
        const { ProductVerification } = connectBlockchain();
        const instance = await ProductVerification.deployed();

        // Get products manufactured by the address
        const productIds = await instance.getProductsManufactured(req.params.address);

        // Format response
        res.json({
            success: true,
            productIds
        });
    } catch (error) {
        console.error('Error fetching manufactured products:', error);
        res.status(500).json({ success: false, message: 'Error fetching manufactured products' });
    }
});

// Check user role
router.get('/:address/role', async (req, res) => {
    try {
        const { ProductVerification, web3 } = connectBlockchain();
        const instance = await ProductVerification.deployed();

        // Check roles
        const MANUFACTURER_ROLE = web3.utils.soliditySha3("MANUFACTURER_ROLE");
        const SELLER_ROLE = web3.utils.soliditySha3("SELLER_ROLE");
        const ADMIN_ROLE = web3.utils.soliditySha3("ADMIN_ROLE");

        const isManufacturer = await instance.hasSpecificRole(MANUFACTURER_ROLE, req.params.address);
        const isSeller = await instance.hasSpecificRole(SELLER_ROLE, req.params.address);
        const isAdmin = await instance.hasSpecificRole(ADMIN_ROLE, req.params.address);

        // Format response
        res.json({
            success: true,
            roles: {
                isManufacturer,
                isSeller,
                isAdmin
            }
        });
    } catch (error) {
        console.error('Error checking user role:', error);
        res.status(500).json({ success: false, message: 'Error checking user role' });
    }
});

module.exports = router;
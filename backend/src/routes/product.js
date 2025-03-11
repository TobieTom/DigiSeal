const express = require('express');
const router = express.Router();
const { connectBlockchain } = require('../utils/blockchain');

// Get product details
router.get('/:productId', async (req, res) => {
    try {
        const { ProductVerification } = connectBlockchain();
        const instance = await ProductVerification.deployed();

        const productDetails = await instance.getProductDetails(req.params.productId);

        // Format the response
        const product = {
            productId: productDetails[0],
            manufacturer: productDetails[1],
            currentOwner: productDetails[2],
            manufactureDate: new Date(productDetails[3].toNumber() * 1000).toISOString(),
            manufacturerName: productDetails[4],
            productDetails: productDetails[5],
            manufacturingLocation: productDetails[6],
            status: ['Created', 'InTransit', 'WithSeller', 'Sold', 'Reported'][productDetails[7].toNumber()],
            isAuthentic: productDetails[8]
        };

        res.json({ success: true, product });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(404).json({ success: false, message: 'Product not found or does not exist' });
    }
});

// Verify a product
router.post('/verify', async (req, res) => {
    try {
        const { productId, location } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const { ProductVerification, web3 } = connectBlockchain();
        const accounts = await web3.eth.getAccounts();
        const instance = await ProductVerification.deployed();

        const result = await instance.verifyProduct(
            productId,
            location || 'Unknown',
            { from: accounts[0] }
        );

        // Check verification result
        const isAuthentic = result.logs[0].args.authentic;

        res.json({
            success: true,
            isAuthentic,
            message: isAuthentic ? 'Product verified as authentic' : 'Product verification failed'
        });
    } catch (error) {
        console.error('Error verifying product:', error);
        res.status(500).json({ success: false, message: 'Error verifying product' });
    }
});

// Register a new product
router.post('/register', async (req, res) => {
    try {
        const {
            productId,
            manufacturerName,
            productDetails,
            manufacturingLocation
        } = req.body;

        // Validate input
        if (!productId || !manufacturerName) {
            return res.status(400).json({ success: false, message: 'Required fields missing' });
        }

        const { ProductVerification, web3 } = connectBlockchain();
        const accounts = await web3.eth.getAccounts();
        const instance = await ProductVerification.deployed();

        // Register the product
        await instance.registerProduct(
            productId,
            manufacturerName,
            productDetails || '',
            manufacturingLocation || '',
            { from: accounts[0] }
        );

        res.json({
            success: true,
            message: 'Product registered successfully',
            productId
        });
    } catch (error) {
        console.error('Error registering product:', error);
        res.status(500).json({ success: false, message: 'Error registering product' });
    }
});

// Transfer ownership
router.post('/transfer', async (req, res) => {
    try {
        const { productId, newOwner, transferConditions } = req.body;

        // Validate input
        if (!productId || !newOwner) {
            return res.status(400).json({ success: false, message: 'Product ID and new owner address are required' });
        }

        const { ProductVerification, web3 } = connectBlockchain();
        const accounts = await web3.eth.getAccounts();
        const instance = await ProductVerification.deployed();

        // Transfer ownership
        await instance.transferOwnership(
            productId,
            newOwner,
            transferConditions || '',
            { from: accounts[0] }
        );

        res.json({
            success: true,
            message: 'Ownership transferred successfully',
            productId,
            newOwner
        });
    } catch (error) {
        console.error('Error transferring ownership:', error);
        res.status(500).json({ success: false, message: 'Error transferring ownership' });
    }
});

// Get product history
router.get('/:productId/history', async (req, res) => {
    try {
        const { ProductVerification } = connectBlockchain();
        const instance = await ProductVerification.deployed();

        // Get transfer history
        const transferHistory = await instance.getTransferHistory(req.params.productId);

        // Get verification history
        const verificationHistory = await instance.getVerificationHistory(req.params.productId);

        // Format transfer history
        const transfers = transferHistory.map(transfer => ({
            from: transfer.from,
            to: transfer.to,
            timestamp: new Date(transfer.timestamp.toNumber() * 1000).toISOString(),
            transferConditions: transfer.transferConditions
        }));

        // Format verification history
        const verifications = verificationHistory.map(verification => ({
            verifier: verification.verifier,
            timestamp: new Date(verification.timestamp.toNumber() * 1000).toISOString(),
            location: verification.location,
            result: verification.result
        }));

        res.json({
            success: true,
            transferHistory: transfers,
            verificationHistory: verifications
        });
    } catch (error) {
        console.error('Error fetching product history:', error);
        res.status(500).json({ success: false, message: 'Error fetching product history' });
    }
});

// Report counterfeit product
router.post('/report', async (req, res) => {
    try {
        const { productId, evidenceHash, description, location } = req.body;

        // Validate input
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const { ProductVerification, web3 } = connectBlockchain();
        const accounts = await web3.eth.getAccounts();
        const instance = await ProductVerification.deployed();

        // Report counterfeit
        await instance.reportCounterfeit(
            productId,
            evidenceHash || '',
            description || '',
            location || '',
            { from: accounts[0] }
        );

        res.json({
            success: true,
            message: 'Counterfeit report submitted successfully',
            productId
        });
    } catch (error) {
        console.error('Error reporting counterfeit:', error);
        res.status(500).json({ success: false, message: 'Error reporting counterfeit' });
    }
});

module.exports = router;
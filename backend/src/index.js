// // src/store/atoms/index.js
// import { atom } from 'recoil';

// // Authentication state
// export const loginState = atom({
//     key: 'loginState',
//     default: false,
// });

// // User role state
// export const userRoleState = atom({
//     key: 'userRoleState',
//     default: localStorage.getItem('userRole') || 'consumer',
// });

// // Toast notifications
// export const toastState = atom({
//     key: 'toastState',
//     default: '',
// });

// // Product related states
// export const buyerAddressState = atom({
//     key: 'buyerAddressState',
//     default: '',
// });

// export const productIdState = atom({
//     key: 'productIdState',
//     default: '',
// });

// export const productIdHomeState = atom({
//     key: 'productIdHomeState',
//     default: '',
// });

// export const secretIdState = atom({
//     key: 'secretIdState',
//     default: '',
// });

// export const newOwnerState = atom({
//     key: 'newOwnerState',
//     default: '',
// });

// // Fallback state for QR scanning
// export const fallbackState = atom({
//     key: 'fallbackState',
//     default: '',
// });
// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'DigiSeal API Server',
        version: '1.0.0',
        endpoints: {
            products: '/api/products',
            users: '/api/users',
            health: '/health'
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Blockchain URL: ${process.env.BLOCKCHAIN_URL}`);
    console.log(`Contract Address: ${process.env.CONTRACT_ADDRESS}`);
});
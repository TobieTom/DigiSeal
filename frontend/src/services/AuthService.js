// src/services/AuthService.js
import blockchainService from './BlockchainService';

/**
 * Service for handling authentication and user management
 */
class AuthService {
    /**
     * Log in with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<object>} - Authentication result with user info
     */
    static async login(email, password) {
        try {
            console.log("Login attempt with:", email);

            // In a production app, we would verify credentials with a backend
            // Since we're using blockchain for authorization, we'll create a mock user
            // with the email/password and then rely on blockchain for roles

            const user = {
                name: email.split('@')[0],
                email: email,
                walletAddress: '',
                role: 'consumer' // Default role
            };

            // Store auth data in localStorage for persistence
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', user.name);
            localStorage.setItem('user_email', email);

            return {
                success: true,
                user
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Authentication failed'
            };
        }
    }

    /**
     * Register a new user
     * @param {object} userData - User data for registration
     * @returns {Promise<object>} - Registration result
     */
    static async register(userData) {
        try {
            console.log("Register attempt with:", userData);

            // In a production app, we would store user data in a database
            // For this demo, we'll just store basic info in localStorage

            const user = {
                name: userData.name,
                email: userData.email,
                walletAddress: '',
                role: userData.role || 'consumer'
            };

            // Store auth data in localStorage for persistence
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userRole', user.role);
            localStorage.setItem('user_email', user.email);

            return {
                success: true,
                user
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message || 'Registration failed'
            };
        }
    }

    /**
     * Log in with a blockchain wallet
     * @param {string} address - Wallet address
     * @returns {Promise<object>} - Authentication result
     */
    static async walletLogin(address) {
        try {
            console.log("Wallet login attempt with:", address);

            // For wallet login, we check the blockchain for the user's role
            await blockchainService.init();
            const roleData = await blockchainService.getUserRole(address);

            const user = {
                name: `User ${address.substring(0, 6)}`,
                email: '',
                walletAddress: address,
                role: roleData.role || 'consumer'
            };

            // Store auth data in localStorage for persistence
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', user.name);
            localStorage.setItem('userAddress', address);
            localStorage.setItem('userRole', user.role);

            return {
                success: true,
                user
            };
        } catch (error) {
            console.error('Wallet login error:', error);
            return {
                success: false,
                error: error.message || 'Wallet authentication failed'
            };
        }
    }

    /**
     * Log out the current user
     * @returns {void}
     */
    static logout() {
        // Clear all authentication data from localStorage
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userAddress');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('user_email');
    }

    /**
     * Get the current authenticated user
     * @returns {Promise<object|null>} - Current user or null if not authenticated
     */
    static async getCurrentUser() {
        try {
            // Check if user is logged in
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (!isLoggedIn) {
                return null;
            }

            // Return user data from localStorage
            return {
                name: localStorage.getItem('userName') || 'User',
                walletAddress: localStorage.getItem('userAddress') || '',
                role: localStorage.getItem('userRole') || 'consumer',
                email: localStorage.getItem('user_email') || ''
            };
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Link a wallet address to the current user
     * @param {string} walletAddress - Wallet address to link
     * @returns {Promise<object>} - Link result
     */
    static async linkWallet(walletAddress) {
        try {
            console.log("Linking wallet:", walletAddress);

            // In a production app, we would update the user's record in a database
            // For this demo, we'll just update localStorage

            localStorage.setItem('userAddress', walletAddress);

            return {
                success: true,
                message: 'Wallet linked successfully'
            };
        } catch (error) {
            console.error('Error linking wallet:', error);
            return {
                success: false,
                error: error.message || 'Failed to link wallet'
            };
        }
    }
}

export default AuthService;
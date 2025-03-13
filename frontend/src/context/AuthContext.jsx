// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import blockchainService from '../services/BlockchainService'

// Create context
const AuthContext = createContext(null)

// Context provider component
export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userAddress, setUserAddress] = useState('')
    const [userRole, setUserRole] = useState('consumer')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    // Login function (connect to blockchain wallet)
    // In src/context/AuthContext.jsx, update the login function:

    const login = async (address = null) => {
        try {
            setLoading(true);
            setError(null);

            // Initialize blockchain service
            await blockchainService.init();

            // Get connected account
            const account = address || await blockchainService.getCurrentAccount();

            if (!account) {
                throw new Error('No account found. Please make sure your wallet is connected.');
            }

            // Check if on correct network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const networkId = parseInt(chainId, 16);

            if (networkId !== config.networkId) {
                setToast(`Please switch to ${config.chainName} to use this application`);

                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: Web3.utils.toHex(config.networkId) }],
                    });
                } catch (switchError) {
                    // This error code indicates that the chain has not been added to MetaMask
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: Web3.utils.toHex(config.networkId),
                                chainName: config.chainName,
                                rpcUrls: [config.rpcUrl],
                                blockExplorerUrls: [config.explorerUrl]
                            }],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }

            // Get user role
            const roleData = await blockchainService.getUserRole(account);

            // Successful connection
            setIsLoggedIn(true);
            setUserAddress(account);
            setUserRole(roleData.role);

            // Save to localStorage for persistence
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userAddress', account);
            localStorage.setItem('userRole', roleData.role);

            return {
                success: true,
                address: account,
                role: roleData.role,
                isAuthenticated: true
            };
        } catch (error) {
            setError(error.message);
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };
    // Logout function
    const logout = async () => {
        try {
            setLoading(true)
            setError(null)

            // Clear state
            setIsLoggedIn(false)
            setUserAddress('')
            setUserRole('consumer')

            // Clear localStorage
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('userAddress')
            localStorage.removeItem('userRole')

            return {
                success: true,
                message: 'Logged out successfully'
            }
        } catch (error) {
            setError(error.message)
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    // Check if user is logged in on component mount
    useEffect(() => {
        const checkLoginStatus = async () => {
            const savedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
            const savedUserAddress = localStorage.getItem('userAddress')
            const savedUserRole = localStorage.getItem('userRole')

            if (savedIsLoggedIn && savedUserAddress) {
                try {
                    // Verify connection to blockchain
                    await blockchainService.init()
                    const accounts = await blockchainService.web3.eth.getAccounts()

                    // Check if saved address matches any of the current accounts
                    if (accounts.includes(savedUserAddress)) {
                        setIsLoggedIn(true)
                        setUserAddress(savedUserAddress)
                        setUserRole(savedUserRole || 'consumer')
                    } else {
                        // Address has changed, log out
                        logout()
                    }
                } catch (error) {
                    console.error('Error checking login status:', error)
                    // If blockchain connection fails, clear login state
                    logout()
                }
            }
        }

        checkLoginStatus()
    }, [])

    // Context value
    const value = {
        isLoggedIn,
        userAddress,
        userRole,
        loading,
        error,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook for using auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
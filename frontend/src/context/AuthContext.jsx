// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import blockchainService from '../services/BlockchainService'
import { useSetRecoilState } from 'recoil'
import { toastState } from '../store/atoms'
import config from '../config/blockchain'
import Web3 from 'web3'

// Create context
const AuthContext = createContext(null)

// Context provider component
export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userAddress, setUserAddress] = useState('')
    const [userRole, setUserRole] = useState('consumer')
    const [userName, setUserName] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const setToast = useSetRecoilState(toastState)

    // Traditional email/password login
    const loginWithCredentials = async (email, password) => {
        try {
            setLoading(true)
            setError(null)

            const result = await AuthService.login(email, password)

            if (result.success) {
                const { user } = result
                
                // Update state
                setIsLoggedIn(true)
                setUserAddress(user.walletAddress || '')
                setUserRole(user.role || 'consumer')
                setUserName(user.name || '')
                setUserEmail(user.email || '')

                // Save to localStorage for persistence
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('userAddress', user.walletAddress || '')
                localStorage.setItem('userRole', user.role || 'consumer')
                localStorage.setItem('userName', user.name || '')

                return {
                    success: true,
                    user
                }
            }
            
            return { success: false, error: 'Login failed' }
        } catch (error) {
            setError(error.message || 'Failed to login')
            return { success: false, error: error.message || 'Failed to login' }
        } finally {
            setLoading(false)
        }
    }

    // Register new user
    const register = async (userData) => {
        try {
            setLoading(true)
            setError(null)

            const result = await AuthService.register(userData)

            if (result.success) {
                const { user } = result
                
                // Update state
                setIsLoggedIn(true)
                setUserAddress(user.walletAddress || '')
                setUserRole(user.role || 'consumer')
                setUserName(user.name || '')
                setUserEmail(user.email || '')

                // Save to localStorage for persistence
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('userAddress', user.walletAddress || '')
                localStorage.setItem('userRole', user.role || 'consumer')
                localStorage.setItem('userName', user.name || '')

                return {
                    success: true,
                    user
                }
            }
            
            return { success: false, error: 'Registration failed' }
        } catch (error) {
            setError(error.message || 'Failed to register')
            return { success: false, error: error.message || 'Failed to register' }
        } finally {
            setLoading(false)
        }
    }

    // Login with blockchain wallet
    const login = async (address = null) => {
        try {
            setLoading(true)
            setError(null)

            // Initialize blockchain service
            await blockchainService.init()

            // Get connected account
            const account = address || await blockchainService.getCurrentAccount()

            if (!account) {
                throw new Error('No account found. Please make sure your wallet is connected.')
            }

            // Check if on correct network
            const chainId = await window.ethereum.request({ method: 'eth_chainId' })
            const networkId = parseInt(chainId, 16)

            if (networkId !== config.networkId) {
                setToast(`Please switch to ${config.chainName} to use this application`)

                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: Web3.utils.toHex(config.networkId) }],
                    })
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
                        })
                    } else {
                        throw switchError
                    }
                }
            }

            // Get user role
            const roleData = await blockchainService.getUserRole(account)

            // Attempt to login with wallet address
            const loginResult = await AuthService.walletLogin(account)

            if (loginResult.success) {
                const { user } = loginResult
                
                // Update state
                setIsLoggedIn(true)
                setUserAddress(account)
                // Use role from backend if available, otherwise use blockchain role
                setUserRole(user.role || roleData.role)
                setUserName(user.name || '')
                setUserEmail(user.email || '')

                // Save to localStorage for persistence
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('userAddress', account)
                localStorage.setItem('userRole', user.role || roleData.role)
                localStorage.setItem('userName', user.name || '')

                return {
                    success: true,
                    address: account,
                    role: user.role || roleData.role,
                    isAuthenticated: true
                }
            }

            return { success: false, error: 'Failed to authenticate with wallet' }
        } catch (error) {
            setError(error.message)
            return { success: false, error: error.message }
        } finally {
            setLoading(false)
        }
    }

    // Logout function
    const logout = async () => {
        try {
            setLoading(true)
            setError(null)

            // Clear authentication data
            AuthService.logout()

            // Clear state
            setIsLoggedIn(false)
            setUserAddress('')
            setUserRole('consumer')
            setUserName('')
            setUserEmail('')

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

    // Link wallet to account
    const linkWallet = async (walletAddress) => {
        try {
            setLoading(true)
            setError(null)

            const result = await AuthService.linkWallet(walletAddress)

            if (result.success) {
                // Update user address
                setUserAddress(walletAddress)
                localStorage.setItem('userAddress', walletAddress)
                
                return {
                    success: true,
                    message: 'Wallet linked successfully'
                }
            }
            
            return { success: false, error: 'Failed to link wallet' }
        } catch (error) {
            setError(error.message || 'Failed to link wallet')
            return { success: false, error: error.message || 'Failed to link wallet' }
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
            const savedUserName = localStorage.getItem('userName')

            // If there's a saved login status, try to verify it
            if (savedIsLoggedIn) {
                try {
                    // Verify with backend if token is valid
                    const userData = await AuthService.getCurrentUser()
                    
                    if (userData) {
                        setIsLoggedIn(true)
                        setUserAddress(userData.walletAddress || savedUserAddress || '')
                        setUserRole(userData.role || savedUserRole || 'consumer')
                        setUserName(userData.name || savedUserName || '')
                        setUserEmail(userData.email || '')
                    } else {
                        // Token invalid, clear login state
                        logout()
                    }
                } catch (error) {
                    console.error('Error checking login status:', error)
                    // If error, clear login state
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
        userName,
        userEmail,
        loading,
        error,
        login,
        loginWithCredentials,
        register,
        logout,
        linkWallet
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
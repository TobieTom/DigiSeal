// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'

// Create context
const AuthContext = createContext(null)

// Context provider component
export function AuthProvider({ children }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userAddress, setUserAddress] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    // Login function
    const login = async (address = null) => {
        try {
            setLoading(true)
            setError(null)

            // This is a placeholder for actual login logic
            // Simulate API call with timeout
            const result = await new Promise(resolve => {
                setTimeout(() => {
                    // Generate a mock address if none provided
                    const mockAddress = address || '0x' + Math.random().toString(16).substr(2, 40)
                    resolve({
                        success: true,
                        address: mockAddress,
                        isAuthenticated: true
                    })
                }, 1000)
            })

            if (result.success) {
                setIsLoggedIn(true)
                setUserAddress(result.address)

                // Save to localStorage for persistence
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('userAddress', result.address)

                return result
            } else {
                throw new Error('Login failed')
            }
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

            // This is a placeholder for actual logout logic
            // Simulate API call with timeout
            const result = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        message: 'Logged out successfully'
                    })
                }, 500)
            })

            if (result.success) {
                setIsLoggedIn(false)
                setUserAddress('')

                // Clear localStorage
                localStorage.removeItem('isLoggedIn')
                localStorage.removeItem('userAddress')
                localStorage.removeItem('userRole')

                return result
            } else {
                throw new Error('Logout failed')
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
        const checkLoginStatus = () => {
            const savedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
            const savedUserAddress = localStorage.getItem('userAddress')

            if (savedIsLoggedIn && savedUserAddress) {
                setIsLoggedIn(true)
                setUserAddress(savedUserAddress)
            }
        }

        checkLoginStatus()
    }, [])

    // Context value
    const value = {
        isLoggedIn,
        userAddress,
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
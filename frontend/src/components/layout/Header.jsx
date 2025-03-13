// src/components/layout/Header.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { loginState, userRoleState, toastState } from '../../store/atoms'
import { useAuth } from '../../context/AuthContext'
import Loader from '../common/Loader'
import NetworkIndicator from '../common/NetworkIndicator'
import '../../styles/header.css'
import '../../styles/hamburger.css'

// Import logo
import logo from '../../assets/images/logo-svg.svg'

function Header() {
    const [menuOpen, setMenuOpen] = useState(false)
    const setToast = useSetRecoilState(toastState)
    const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState)
    const [userRole, setUserRole] = useRecoilState(userRoleState)
    const [isLoading, setIsLoading] = useState(true)
    const { logout, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Function to toggle the hamburger menu
    const toggleMenu = () => {
        const navItems = document.querySelector('.nav-items')
        if (navItems) {
            if (!menuOpen) {
                navItems.style.display = 'flex'
                navItems.classList.add('open')
            } else {
                navItems.style.display = 'none'
                navItems.classList.remove('open')
            }
        }

        const hamburger = document.querySelector('.hamburger')
        if (hamburger) {
            hamburger.classList.toggle('is-active')
        }

        setMenuOpen(!menuOpen)
    }

    // Close menu when changing routes
    useEffect(() => {
        if (menuOpen) {
            toggleMenu()
        }
    }, [location.pathname])

    // Handle logout
    const handleLogout = async () => {
        try {
            const result = await logout()
            
            if (result.success) {
                setIsLoggedIn(false)
                setUserRole('consumer')
                setToast('Logged out successfully')
                navigate('/')
            } else {
                setToast('Failed to log out: ' + (result.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Logout error:', error)
            setToast('Failed to log out')
        }
    }

    // Handle login
    const handleLogin = async () => {
        navigate('/login')
    }

    // Check if user is logged in on component mount
    useEffect(() => {
        const checkLoginStatus = () => {
            const savedLoginStatus = localStorage.getItem('isLoggedIn') === 'true'
            const savedUserRole = localStorage.getItem('userRole') || 'consumer'

            setIsLoggedIn(savedLoginStatus)
            setUserRole(savedUserRole)
            setIsLoading(false)
        }

        checkLoginStatus()
    }, [])

    return (
        <header className="main-header">
            <nav className="navbar">
                <div className="navbar-brand">
                    <div className="logo">
                        <Link to={isLoggedIn ? "/dashboard" : "/"}>
                            <img src={logo} className="logo-img" alt="BlockVerify" />
                        </Link>
                    </div>

                    <div className="verification-container">
                        <Link to="/scan" className="scan-button-header">
                            <i className="bi bi-qr-code-scan"></i>
                            <span>Scan QR</span>
                        </Link>
                        <NetworkIndicator />
                    </div>
                </div>

                <div className="nav-items">
                    {/* Always visible links */}
                    <div className="nav-link">
                        <Link to={isLoggedIn ? "/dashboard" : "/"} className={location.pathname === '/' || location.pathname === '/dashboard' ? 'active' : ''}>
                            <span>
                                <i className="bi bi-house"></i>
                                <h5>{isLoggedIn ? 'Dashboard' : 'Home'}</h5>
                            </span>
                        </Link>
                    </div>

                    {isLoggedIn && (
                        <>
                            {/* All user types can verify products */}
                            <div className="nav-link">
                                <Link to="/buy" className={location.pathname === '/buy' ? 'active' : ''}>
                                    <span>
                                        <i className="bi bi-shield-check"></i>
                                        <h5>Verify Product</h5>
                                    </span>
                                </Link>
                            </div>

                            {/* Manufacturer/Seller specific links */}
                            {(userRole === 'manufacturer' || userRole === 'seller') && (
                                <>
                                    <div className="nav-link">
                                        <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>
                                            <span>
                                                <i className="bi bi-box-seam"></i>
                                                <h5>My Products</h5>
                                            </span>
                                        </Link>
                                    </div>

                                    <div className="nav-link">
                                        <Link to="/addowner" className={location.pathname === '/addowner' ? 'active' : ''}>
                                            <span>
                                                <i className="bi bi-arrow-left-right"></i>
                                                <h5>Transfer</h5>
                                            </span>
                                        </Link>
                                    </div>
                                    
                                    <div className="nav-link">
                                        <Link to="/sell" className={location.pathname === '/sell' ? 'active' : ''}>
                                            <span>
                                                <i className="bi bi-cart-check"></i>
                                                <h5>Sell</h5>
                                            </span>
                                        </Link>
                                    </div>
                                </>
                            )}

                            {/* Manufacturer specific links */}
                            {userRole === 'manufacturer' && (
                                <div className="nav-link">
                                    <Link to="/add" className={location.pathname === '/add' ? 'active' : ''}>
                                        <span>
                                            <i className="bi bi-plus-circle"></i>
                                            <h5>Add Product</h5>
                                        </span>
                                    </Link>
                                </div>
                            )}

                            {/* Account/Profile link */}
                            <div className="nav-link">
                                <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                                    <span>
                                        <i className="bi bi-person-circle"></i>
                                        <h5>Profile</h5>
                                    </span>
                                </Link>
                            </div>
                        </>
                    )}

                    <div className="nav-link auth-link">
                        {isLoading || authLoading ? (
                            <Loader size="fix" />
                        ) : isLoggedIn ? (
                            <button onClick={handleLogout} className="auth-button">
                                <span>
                                    <i className="bi bi-box-arrow-right"></i>
                                    <h5>Logout</h5>
                                </span>
                            </button>
                        ) : (
                            <button onClick={handleLogin} className="auth-button">
                                <span>
                                    <i className="bi bi-box-arrow-in-right"></i>
                                    <h5>Login</h5>
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="hamburger-menu" onClick={toggleMenu}>
                    <button className="hamburger hamburger--spin" type="button">
                        <span className="hamburger-box">
                            <span className="hamburger-inner"></span>
                        </span>
                    </button>
                </div>
            </nav>
        </header>
    )
}

export default Header
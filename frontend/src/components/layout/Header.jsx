// src/components/layout/Header.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { loginState, userRoleState, toastState } from '../../store/atoms'
import Loader from '../common/Loader'
import '../../styles/header.css'
import '../../styles/hamburger.css'

// Import images
import logo from '../../assets/images/logo-svg.svg'
import homeIcon from '../../assets/images/home-icon.svg'
import userIcon from '../../assets/images/user-icon.svg'
import vendorIcon from '../../assets/images/vendor-icon.svg'
// Fixed imports for react-icons
import { BiScan, BiBox, BiTransfer, BiStore, BiUser, BiBuildings } from 'react-icons/bi'

function Header() {
    const [menuOpen, setMenuOpen] = useState(false)
    const setToast = useSetRecoilState(toastState)
    const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState)
    const [userRole, setUserRole] = useRecoilState(userRoleState)
    const [isLoading, setIsLoading] = useState(true)
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
            // This will be replaced with actual blockchain wallet disconnection
            localStorage.removeItem('isLoggedIn')
            localStorage.removeItem('userRole')
            setIsLoggedIn(false)
            setUserRole('consumer')
            setToast('Logged out successfully')
            navigate('/')
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
                        <Link to="/">
                            <img src={logo} className="logo-img" alt="BlockVerify" />
                        </Link>
                    </div>

                    <div className="verification-container">
                        <Link to="/scan" className="scan-button-header">
                            <BiScan size={20} />
                            <span>Scan QR</span>
                        </Link>
                    </div>
                </div>

                <div className="nav-items">
                    <div className="nav-link">
                        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                            <span>
                                <img src={homeIcon} alt="Home" />
                                <h5>Home</h5>
                            </span>
                        </Link>
                    </div>

                    {isLoggedIn && (
                        <>
                            {/* Consumer links */}
                            <div className="nav-link">
                                <Link to="/buy" className={location.pathname === '/buy' ? 'active' : ''}>
                                    <span>
                                        <BiStore size={20} />
                                        <h5>Verify</h5>
                                    </span>
                                </Link>
                            </div>

                            {/* Manufacturer/Seller specific links */}
                            {(userRole === 'manufacturer' || userRole === 'seller') && (
                                <>
                                    <div className="nav-link">
                                        <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>
                                            <span>
                                                <BiBox size={20} />
                                                <h5>My Products</h5>
                                            </span>
                                        </Link>
                                    </div>

                                    <div className="nav-link">
                                        <Link to="/addowner" className={location.pathname === '/addowner' ? 'active' : ''}>
                                            <span>
                                                <BiTransfer size={20} />
                                                <h5>Transfer</h5>
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
                                            <BiBox size={20} />
                                            <h5>Add Product</h5>
                                        </span>
                                    </Link>
                                </div>
                            )}

                            {/* Account/Profile link */}
                            <div className="nav-link">
                                <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
                                    <span>
                                        <BiUser size={20} />
                                        <h5>Profile</h5>
                                    </span>
                                </Link>
                            </div>
                        </>
                    )}

                    <div className="nav-link auth-link">
                        {isLoading ? (
                            <Loader size="fix" />
                        ) : isLoggedIn ? (
                            <button onClick={handleLogout} className="auth-button">
                                <span>
                                    <img src={vendorIcon} alt="Logout" />
                                    <h5>Logout</h5>
                                </span>
                            </button>
                        ) : (
                            <button onClick={handleLogin} className="auth-button">
                                <span>
                                    <img src={userIcon} alt="Login" />
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
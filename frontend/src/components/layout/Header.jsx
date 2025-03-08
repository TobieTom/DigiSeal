import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { loginState, toastState } from '../../store/atoms'
import Loader from '../common/Loader'
import '../../styles/header.css'
import '../../styles/hamburger.css'

// Import images
import logo from '../../assets/images/logo.png'
import homeIcon from '../../assets/images/home-icon.svg'
import locationIcon from '../../assets/images/location-icon.svg'
import userIcon from '../../assets/images/user-icon.svg'
import vendorIcon from '../../assets/images/vendor-icon.svg'

function Header() {
const [menuOpen, setMenuOpen] = useState(false)
const setToast = useSetRecoilState(toastState)
const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState)
const [isLoading, setIsLoading] = useState(true)
const navigate = useNavigate()

  // Function to toggle the hamburger menu
const toggleMenu = () => {
    const navItems = document.querySelector('.nav-items')
    const hamburger = document.querySelector('.hamburger')
    
    hamburger.classList.toggle('is-active')
    
    if (!menuOpen) {
    navItems.style.display = 'flex'
    } else {
    navItems.style.display = 'none'
    }
    
    setMenuOpen(!menuOpen)
}

  // Placeholder functions for login/logout
  // These will connect to blockchain later
const handleLogout = async () => {
    try {
      // Mock logout functionality for now
    setToast('Logged out successfully')
    setIsLoggedIn(false)
    navigate('/')
    } catch (error) {
    console.error('Logout error:', error)
    setToast('Failed to log out')
    }
}

const handleLogin = async () => {
    try {
      // Mock login for now - this will be replaced with real authentication
    setToast('Redirecting to login...')
    navigate('/login')
    } catch (error) {
    console.error('Login error:', error)
    setToast('Failed to initiate login')
    }
}

  // Check if user is logged in on component mount
useEffect(() => {
    // This will be replaced with real authentication check
    const checkLoginStatus = () => {
      // Mock check - just for UI development
    const savedLoginStatus = localStorage.getItem('isLoggedIn') === 'true'
    setIsLoggedIn(savedLoginStatus)
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
            <img src={logo} className="logo-img" alt="Product Verification System" />
            </Link>
        </div>

        <div className="verification-container">
            <div className="location-icon">
            <img src={locationIcon} alt="Verification" />
            </div>
            <div className="verification-text">
            <Link to="/buy">
                <h6>Enter secret key here!</h6>
            </Link>
            </div>
        </div>
        </div>

        <div className="nav-items">
        <div className="nav-link">
            <Link to="/">
            <span>
                <img src={homeIcon} alt="Home" />
                <h5>Home</h5>
            </span>
            </Link>
        </div>
        
        <div className="nav-link">
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
                <h5>Login/Signup</h5>
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
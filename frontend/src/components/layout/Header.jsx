// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { loginState, userRoleState, toastState } from '../../store/atoms';
import { useAuth } from '../../context/AuthContext';
import Loader from '../common/Loader';
import NetworkIndicator from '../common/NetworkIndicator';
import '../../styles/header.css';

// Import logo
import logo from '../../assets/images/logo-svg.svg';

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const setToast = useSetRecoilState(toastState);
    const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState);
    const [userRole, setUserRole] = useRecoilState(userRoleState);
    const [isLoading, setIsLoading] = useState(true);
    const { logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Function to toggle the hamburger menu
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    // Close menu when changing routes
    useEffect(() => {
        if (menuOpen) {
            setMenuOpen(false);
        }
    }, [location.pathname]);

    // Handle logout
    const handleLogout = async () => {
        try {
            const result = await logout();
            
            if (result.success) {
                setIsLoggedIn(false);
                setUserRole('consumer');
                setToast('Logged out successfully');
                navigate('/');
            } else {
                setToast('Failed to log out: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Logout error:', error);
            setToast('Failed to log out');
        }
    };

    // Handle login
    const handleLogin = async () => {
        navigate('/login');
    };

    // Check if user is logged in on component mount
    useEffect(() => {
        const checkLoginStatus = () => {
            const savedLoginStatus = localStorage.getItem('isLoggedIn') === 'true';
            const savedUserRole = localStorage.getItem('userRole') || 'consumer';

            setIsLoggedIn(savedLoginStatus);
            setUserRole(savedUserRole);
            setIsLoading(false);
        };

        checkLoginStatus();
    }, []);

    // Manufacturer Links
    const manufacturerLinks = [
        { path: '/dashboard', icon: 'bi-house', label: 'Dashboard' },
        { path: '/add', icon: 'bi-plus-circle', label: 'Add Product' },
        { path: '/products', icon: 'bi-box-seam', label: 'My Products' },
        { path: '/addowner', icon: 'bi-arrow-left-right', label: 'Transfer' },
        { path: '/registerSeller', icon: 'bi-person-plus', label: 'Register Seller' },
        { path: '/buy', icon: 'bi-shield-check', label: 'Verify Product' },
    ];

    // Seller Links
    const sellerLinks = [
        { path: '/dashboard', icon: 'bi-house', label: 'Dashboard' },
        { path: '/sell', icon: 'bi-cart-check', label: 'Sell Product' },
        { path: '/products', icon: 'bi-box-seam', label: 'Inventory' },
        { path: '/addowner', icon: 'bi-arrow-left-right', label: 'Transfer' },
        { path: '/buy', icon: 'bi-shield-check', label: 'Verify Product' },
    ];

    // Consumer Links
    const consumerLinks = [
        { path: '/dashboard', icon: 'bi-house', label: 'Dashboard' },
        { path: '/buy', icon: 'bi-shield-check', label: 'Verify Product' },
        { path: '/products', icon: 'bi-collection', label: 'My Products' },
    ];

    // Get the appropriate links based on user role
    const getLinks = () => {
        if (userRole === 'manufacturer') {
            return manufacturerLinks;
        } else if (userRole === 'seller') {
            return sellerLinks;
        } else {
            return consumerLinks;
        }
    };

    return (
        <header className="main-header">
            <div className="navbar">
                <div className="navbar-brand">
                    <Link to={isLoggedIn ? "/dashboard" : "/"} className="logo">
                        <img src={logo} alt="DigiSeal" className="logo-img" />
                        <span className="logo-text">DigiSeal</span>
                    </Link>

                    <div className="verification-container">
                        <Link to="/scan" className="scan-button-header">
                            <i className="bi bi-qr-code-scan"></i>
                            <span>Scan QR</span>
                        </Link>
                        <NetworkIndicator />
                    </div>
                </div>

                <button 
                    className={`menu-toggle ${menuOpen ? 'active' : ''}`} 
                    onClick={toggleMenu}
                    aria-label="Toggle navigation menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav className={`main-nav ${menuOpen ? 'active' : ''}`}>
                    <ul className="nav-list">
                        {isLoggedIn ? (
                            <>
                                {getLinks().map((link, index) => (
                                    <li key={index} className="nav-item">
                                        <Link 
                                            to={link.path} 
                                            className={location.pathname === link.path ? 'active' : ''}
                                        >
                                            <i className={`bi ${link.icon}`}></i>
                                            <span>{link.label}</span>
                                        </Link>
                                    </li>
                                ))}
                                <li className="nav-item">
                                    <Link 
                                        to="/profile" 
                                        className={location.pathname === '/profile' ? 'active' : ''}
                                    >
                                        <i className="bi bi-person-circle"></i>
                                        <span>Profile</span>
                                    </Link>
                                </li>
                                <li className="nav-item logout-item">
                                    <button onClick={handleLogout} className="logout-button">
                                        <i className="bi bi-box-arrow-right"></i>
                                        <span>Logout</span>
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link 
                                        to="/" 
                                        className={location.pathname === '/' ? 'active' : ''}
                                    >
                                        <i className="bi bi-house"></i>
                                        <span>Home</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link 
                                        to="/buy" 
                                        className={location.pathname === '/buy' ? 'active' : ''}
                                    >
                                        <i className="bi bi-shield-check"></i>
                                        <span>Verify Product</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <button onClick={handleLogin} className="login-button">
                                        <i className="bi bi-box-arrow-in-right"></i>
                                        <span>Login</span>
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Header;
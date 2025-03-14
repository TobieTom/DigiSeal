// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { loginState, userRoleState } from '../../store/atoms';
import '../../styles/footer.css';

// Import logo if you have one
import logo from '../../assets/images/logo-svg.svg';

function Footer() {
    const isLoggedIn = useRecoilValue(loginState);
    const userRole = useRecoilValue(userRoleState);
    const currentYear = new Date().getFullYear();

    // Get appropriate footer links based on role
    const getLinks = () => {
        const commonLinks = [
            { label: 'Home', path: isLoggedIn ? '/dashboard' : '/' },
            { label: 'Verify Product', path: '/buy' },
            { label: 'Scan QR Code', path: '/scan' },
        ];

        const consumerLinks = [
            { label: 'My Products', path: '/products' },
            { label: 'My Profile', path: '/profile' },
        ];

        const sellerLinks = [
            { label: 'My Inventory', path: '/products' },
            { label: 'Sell Products', path: '/sell' },
            { label: 'Transfer Ownership', path: '/addowner' },
        ];

        const manufacturerLinks = [
            { label: 'Add New Product', path: '/add' },
            { label: 'My Products', path: '/products' },
            { label: 'Register Seller', path: '/registerSeller' },
            { label: 'Transfer Ownership', path: '/addowner' },
        ];

        if (userRole === 'manufacturer') {
            return { common: commonLinks, role: manufacturerLinks };
        } else if (userRole === 'seller') {
            return { common: commonLinks, role: sellerLinks };
        } else {
            return { common: commonLinks, role: consumerLinks };
        }
    };

    const links = getLinks();

    return (
        <footer className="site-footer">
            <div className="footer-main">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-logo">
                            <Link to={isLoggedIn ? '/dashboard' : '/'} className="footer-brand">
                                <img src={logo} alt="DigiSeal" className="footer-logo-img" />
                                <span className="footer-logo-text">DigiSeal</span>
                            </Link>
                            <p className="footer-tagline">
                                Authenticating products with blockchain technology
                            </p>
                        </div>

                        <div className="footer-links-section">
                            <div className="footer-links-column">
                                <h3>Navigation</h3>
                                <ul className="footer-links">
                                    {links.common.map((link, index) => (
                                        <li key={index}>
                                            <Link to={link.path}>{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="footer-links-column">
                                <h3>{userRole === 'consumer' ? 'For Users' : userRole === 'seller' ? 'For Sellers' : 'For Manufacturers'}</h3>
                                <ul className="footer-links">
                                    {links.role.map((link, index) => (
                                        <li key={index}>
                                            <Link to={link.path}>{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="footer-links-column">
                                <h3>About</h3>
                                <ul className="footer-links">
                                    <li><Link to="/about">About DigiSeal</Link></li>
                                    <li><Link to="/how-it-works">How It Works</Link></li>
                                    <li><Link to="/contact">Contact Us</Link></li>
                                    <li><Link to="/help">Help & Support</Link></li>
                                </ul>
                            </div>

                            <div className="footer-links-column">
                                <h3>Connect</h3>
                                <div className="social-links">
                                    <a href="#" className="social-link" aria-label="Twitter">
                                        <i className="bi bi-twitter"></i>
                                    </a>
                                    <a href="#" className="social-link" aria-label="Facebook">
                                        <i className="bi bi-facebook"></i>
                                    </a>
                                    <a href="#" className="social-link" aria-label="LinkedIn">
                                        <i className="bi bi-linkedin"></i>
                                    </a>
                                    <a href="#" className="social-link" aria-label="GitHub">
                                        <i className="bi bi-github"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-content">
                        <p className="copyright">
                            &copy; {currentYear} DigiSeal. All rights reserved.
                        </p>
                        <div className="footer-legal-links">
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
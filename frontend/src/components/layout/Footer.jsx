// src/components/layout/Footer.jsx - Enhanced version
import { Link } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { loginState, userRoleState } from '../../store/atoms';
import '../../styles/footer.css';

// Import logo
import logo from '../../assets/images/logo-svg.svg';

function Footer() {
    const isLoggedIn = useRecoilValue(loginState);
    const userRole = useRecoilValue(userRoleState);
    const currentYear = new Date().getFullYear();

    // Get role-specific links and information
    const getRoleSpecificContent = () => {
        // Common links for all users
        const commonLinks = [
            { label: 'Home', path: isLoggedIn ? '/dashboard' : '/' },
            { label: 'Verify Product', path: '/buy' },
            { label: 'Scan QR Code', path: '/scan' },
        ];

        // Consumer links
        const consumerLinks = [
            { label: 'My Products', path: '/products' },
            { label: 'My Profile', path: '/profile' },
        ];

        // Seller links
        const sellerLinks = [
            { label: 'My Inventory', path: '/products' },
            { label: 'Sell Products', path: '/sell' },
            { label: 'Transfer Ownership', path: '/addowner' },
        ];

        // Manufacturer links
        const manufacturerLinks = [
            { label: 'Add New Product', path: '/add' },
            { label: 'My Products', path: '/products' },
            { label: 'Register Seller', path: '/registerSeller' },
            { label: 'Transfer Ownership', path: '/addowner' },
        ];

        // Role-specific content
        const roleContent = {
            'manufacturer': {
                title: 'For Manufacturers',
                description: 'Register products on the blockchain and track their authenticity throughout the supply chain.',
                links: manufacturerLinks,
                icon: 'bi-building'
            },
            'seller': {
                title: 'For Sellers',
                description: 'Sell authentic products and manage your inventory with blockchain verification.',
                links: sellerLinks,
                icon: 'bi-shop'
            },
            'consumer': {
                title: 'For Consumers',
                description: 'Verify product authenticity and track ownership history.',
                links: consumerLinks,
                icon: 'bi-person'
            }
        };

        return {
            common: commonLinks,
            role: roleContent[userRole] || roleContent['consumer']
        };
    };

    const { common, role } = getRoleSpecificContent();

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
                            
                            <div className="footer-role-badge">
                                <i className={`bi ${role.icon}`}></i>
                                <span>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</span>
                            </div>
                        </div>

                        <div className="footer-links-section">
                            <div className="footer-links-column">
                                <h3>Navigation</h3>
                                <ul className="footer-links">
                                    {common.map((link, index) => (
                                        <li key={index}>
                                            <Link to={link.path}>{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="footer-links-column">
                                <h3>{role.title}</h3>
                                <p className="footer-column-desc">{role.description}</p>
                                <ul className="footer-links">
                                    {role.links.map((link, index) => (
                                        <li key={index}>
                                            <Link to={link.path}>{link.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="footer-links-column">
                                <h3>Resources</h3>
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
                                
                                <div className="footer-newsletter">
                                    <h4>Stay Updated</h4>
                                    <p>Get the latest news on product authentication technology</p>
                                    <div className="newsletter-form">
                                        <input type="email" placeholder="Your email address" />
                                        <button type="button">
                                            <i className="bi bi-arrow-right"></i>
                                        </button>
                                    </div>
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
                            <Link to="/security">Security</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
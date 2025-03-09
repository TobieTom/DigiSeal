// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { loginState } from '../../store/atoms'
import '../../styles/footer.css'
import logo from '../../assets/images/logo-svg.svg'

function Footer() {
    const isLoggedIn = useRecoilValue(loginState)
    const dashboardLink = isLoggedIn ? '/dashboard' : '/'

    return (
        <footer className="footer-section">
            <div className="container-fluid">
                <div className="row">
                    <div className="col-lg-2 offset-lg-2 col-sm-4 offset-sm-2">
                        <div className="logo-container">
                            <img src={logo} alt="Logo" className="img-fluid footer-logo" />
                        </div>
                    </div>

                    <div className="col-lg-2 offset-lg-0 col-sm-4 offset-sm-0 footer-list">
                        <h2>Quick Links</h2>
                        <ul>
                            <li>
                                <Link to={dashboardLink}>Dashboard</Link>
                            </li>
                            <li>
                                <Link to='/buy'>Verify Product</Link>
                            </li>
                            <li>
                                <Link to='/scan'>Scan QR Code</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-lg-2 offset-lg-0 col-sm-4 offset-sm-2 footer-list">
                        <h2>Manufacturer</h2>
                        <ul>
                            <li>
                                <Link to="/add">Add Product</Link>
                            </li>
                            <li>
                                <Link to="/addowner">Transfer Owner</Link>
                            </li>
                            <li>
                                <Link to="/products">View Products</Link>
                            </li>
                            <li>
                                <Link to="/registerSeller">Register Seller</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-lg-2 offset-lg-0 col-sm-4 offset-sm-0 footer-list">
                        <h2>Seller</h2>
                        <ul>
                            <li>
                                <Link to="/sell">Sell Products</Link>
                            </li>
                            <li>
                                <Link to="/products">View Inventory</Link>
                            </li>
                            <li>
                                <Link to="/profile">My Account</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="copyright">
                <Link to="/">©{new Date().getFullYear()} Blockchain Product Verification</Link>
            </div>
        </footer>
    )
}

export default Footer
// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import { userRoleState, toastState } from '../store/atoms';
import { Card, Row, Col, Container, Button, Alert } from 'react-bootstrap';
import BlockchainStatus from '../components/common/BlockchainStatus';
import blockchainService from '../services/BlockchainService';
import Loader from '../components/common/Loader';
import '../styles/dashboard.css';

function Dashboard() {
    const userRole = useRecoilValue(userRoleState);
    const setToast = useSetRecoilState(toastState);
    const [stats, setStats] = useState({
        productsVerified: 0,
        productsOwned: 0,
        productsManufactured: 0,
        pendingTransfers: 0,
        lastActivity: 'Never'
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [recentProducts, setRecentProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blockchainConnected, setBlockchainConnected] = useState(false);
    const [userAddress, setUserAddress] = useState('');

    useEffect(() => {
        // Initialize blockchain service
        const initBlockchain = async () => {
            try {
                await blockchainService.init();
                const account = await blockchainService.getCurrentAccount();
                setUserAddress(account);
                setBlockchainConnected(true);
            } catch (error) {
                console.error('Error initializing blockchain:', error);
                setToast('Failed to connect to blockchain. Please check your wallet connection.');
                setBlockchainConnected(false);
            }
        };

        initBlockchain();
    }, [setToast]);

    useEffect(() => {
        // Fetch dashboard data
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                if (blockchainConnected && userAddress) {
                    try {
                        // Get owned products
                        const ownedProducts = await blockchainService.getProductsOwned(userAddress);
                        
                        // Initialize counts and arrays for products
                        let manufacturedProducts = [];
                        let verifiedProducts = 0;
                        let pendingTransfersCount = 0;
                        let productsList = [];

                        // Get manufactured products if user is manufacturer
                        if (userRole === 'manufacturer') {
                            manufacturedProducts = await blockchainService.getProductsManufactured(userAddress);
                            
                            // Get details for a few recent products to display
                            const maxProducts = Math.min(manufacturedProducts.length, 5);
                            for (let i = 0; i < maxProducts; i++) {
                                try {
                                    const productId = manufacturedProducts[i];
                                    const productDetails = await blockchainService.getProductDetails(productId);
                                    
                                    // Get verification history for this product
                                    const verifications = await blockchainService.getVerificationHistory(productId);
                                    
                                    productsList.push({
                                        id: productId,
                                        name: productDetails.manufacturerName,
                                        status: productDetails.status,
                                        isAuthentic: productDetails.isAuthentic,
                                        verifications: verifications.length
                                    });
                                    
                                    // Count total verifications
                                    verifiedProducts += verifications.length;
                                } catch (error) {
                                    console.error(`Error getting details for product ${manufacturedProducts[i]}:`, error);
                                }
                            }
                        } else {
                            // For non-manufacturers, count verifications from owned products
                            const maxProducts = Math.min(ownedProducts.length, 5);
                            for (let i = 0; i < maxProducts; i++) {
                                try {
                                    const productId = ownedProducts[i];
                                    const productDetails = await blockchainService.getProductDetails(productId);
                                    
                                    // Get verification history for this product
                                    const verifications = await blockchainService.getVerificationHistory(productId);
                                    
                                    productsList.push({
                                        id: productId,
                                        name: productDetails.manufacturerName,
                                        status: productDetails.status,
                                        isAuthentic: productDetails.isAuthentic,
                                        verifications: verifications.length
                                    });
                                    
                                    // Count total verifications
                                    verifiedProducts += verifications.length;
                                } catch (error) {
                                    console.error(`Error getting details for product ${ownedProducts[i]}:`, error);
                                }
                            }
                        }

                        // Set products for display
                        setRecentProducts(productsList);

                        // Update stats with real data
                        setStats(prevStats => ({
                            ...prevStats,
                            productsOwned: ownedProducts.length,
                            productsManufactured: manufacturedProducts.length,
                            productsVerified: verifiedProducts,
                            pendingTransfers: pendingTransfersCount,
                            lastActivity: new Date().toLocaleDateString()
                        }));

                        // Generate activity data from real data
                        let activities = [];
                        
                        // Add activity for products
                        productsList.forEach((product, index) => {
                            if (product.verifications > 0) {
                                activities.push({
                                    id: `verification-${index}`,
                                    type: 'verification',
                                    icon: 'bi-shield-check',
                                    title: 'Product Verified',
                                    description: `Product ID: ${product.id}`,
                                    timestamp: new Date().toLocaleTimeString(),
                                    date: 'Today'
                                });
                            }
                        });
                        
                        // Add role-specific activities
                        if (userRole === 'manufacturer' && productsList.length > 0) {
                            activities.unshift({
                                id: 'manufacture',
                                type: 'added',
                                icon: 'bi-box-seam',
                                title: 'Product Added',
                                description: `Added ${productsList[0].id} to the blockchain`,
                                timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
                                date: 'Today'
                            });
                        }
                        
                        if (userRole === 'seller' && productsList.length > 0) {
                            activities.unshift({
                                id: 'sale',
                                type: 'sale',
                                icon: 'bi-bag-check',
                                title: 'Product Sale',
                                description: `Sold ${productsList[0].id} to customer`,
                                timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(),
                                date: 'Today'
                            });
                        }
                        
                        // Always add login activity
                        activities.push({
                            id: 'login',
                            type: 'account',
                            icon: 'bi-person-check',
                            title: 'Account Login',
                            description: 'Successfully logged in to your account',
                            timestamp: new Date(Date.now() - 1800000).toLocaleTimeString(),
                            date: 'Today'
                        });
                        
                        setRecentActivity(activities);
                    } catch (error) {
                        console.error('Error fetching blockchain data:', error);
                        setMockData();
                    }
                } else {
                    // Use mock data if blockchain is not initialized
                    setMockData();
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setToast('Failed to load dashboard data');
                setLoading(false);
            }
        };

        const setMockData = () => {
            // Simulate API call with timeout
            setTimeout(() => {
                // Generate random stats based on user role
                setStats({
                    productsVerified: Math.floor(Math.random() * 25) + 5,
                    productsOwned: userRole === 'consumer' ? Math.floor(Math.random() * 5) : Math.floor(Math.random() * 20) + 5,
                    productsManufactured: userRole === 'manufacturer' ? Math.floor(Math.random() * 30) + 10 : 0,
                    pendingTransfers: Math.floor(Math.random() * 3),
                    lastActivity: new Date().toLocaleDateString()
                });

                // Generate mock product data
                const mockProducts = [];
                const count = userRole === 'manufacturer' ? 5 : (userRole === 'seller' ? 4 : 2);
                
                for (let i = 0; i < count; i++) {
                    mockProducts.push({
                        id: `PROD-${1000 + i}`,
                        name: `Product ${i + 1}`,
                        status: ['Created', 'InTransit', 'WithSeller', 'Sold'][Math.floor(Math.random() * 4)],
                        isAuthentic: true,
                        verifications: Math.floor(Math.random() * 10) + 1
                    });
                }
                
                setRecentProducts(mockProducts);

                // Generate mock activity data
                const mockActivities = [
                    {
                        id: 1,
                        type: 'verification',
                        icon: 'bi-shield-check',
                        title: 'Product Verified',
                        description: `Product ID: PROD-${Math.floor(1000 + Math.random() * 9000)}`,
                        timestamp: new Date().toLocaleTimeString(),
                        date: 'Today'
                    },
                    {
                        id: 2,
                        type: userRole === 'manufacturer' ? 'added' : 'purchase',
                        icon: userRole === 'manufacturer' ? 'bi-box-seam' : 'bi-cart-check',
                        title: userRole === 'manufacturer' ? 'Product Added' : 'Product Purchased',
                        description: userRole === 'manufacturer' 
                            ? 'Added new product to the blockchain'
                            : 'Purchased a verified authentic product',
                        timestamp: '2:30 PM',
                        date: 'Yesterday'
                    },
                    {
                        id: 3,
                        type: 'account',
                        icon: 'bi-person-check',
                        title: 'Account Login',
                        description: 'Successfully logged in to your account',
                        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
                        date: 'Today'
                    }
                ];

                // Add role-specific activities
                if (userRole === 'manufacturer') {
                    mockActivities.splice(1, 0, {
                        id: 4,
                        type: 'registration',
                        icon: 'bi-card-checklist',
                        title: 'Seller Registered',
                        description: 'Registered new authorized seller',
                        timestamp: '10:15 AM',
                        date: 'Today'
                    });
                }

                if (userRole === 'seller') {
                    mockActivities.splice(1, 0, {
                        id: 5,
                        type: 'sale',
                        icon: 'bi-bag-check',
                        title: 'Product Sold',
                        description: 'Completed sale and transferred ownership',
                        timestamp: '11:45 AM',
                        date: 'Today'
                    });
                }

                setRecentActivity(mockActivities);
                setLoading(false);
            }, 1200);
        };

        if (userRole) {
            fetchDashboardData();
        }
    }, [userRole, setToast, blockchainConnected, userAddress]);

    const getWelcomeMessage = () => {
        const currentHour = new Date().getHours();
        let greeting = "Welcome to your Dashboard";
        
        if (currentHour < 12) {
            greeting = "Good Morning";
        } else if (currentHour < 18) {
            greeting = "Good Afternoon";
        } else {
            greeting = "Good Evening";
        }
        
        return greeting;
    };

    // Get the role display name
    const getRoleName = () => {
        switch (userRole) {
            case 'manufacturer':
                return 'Manufacturer';
            case 'seller':
                return 'Authorized Seller';
            default:
                return 'Consumer';
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="dashboard-container">
            <Container>
                <div className="dashboard-header">
                    <div className="role-badge">{getRoleName()}</div>
                    <h1>{getWelcomeMessage()}</h1>
                    <p>
                        {userRole === 'manufacturer'
                            ? 'Manage your products and monitor authenticity'
                            : userRole === 'seller'
                                ? 'Track your inventory and handle sales'
                                : 'Verify and track authentic products'}
                    </p>
                    {userAddress && (
                        <div className="wallet-address mt-2">
                            <small>Connected Account: {userAddress.substring(0, 6)}...{userAddress.substring(38)}</small>
                        </div>
                    )}
                </div>

                {!blockchainConnected && (
                    <Alert variant="warning" className="blockchain-alert mb-4">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                            <div>
                                <h5 className="mb-1">Blockchain Connection Issue</h5>
                                <p className="mb-0">
                                    Unable to connect to blockchain network. Some features may be limited.
                                    Please make sure your wallet is connected.
                                </p>
                            </div>
                        </div>
                        <div className="mt-3">
                            <Button 
                                variant="outline-dark" 
                                size="sm"
                                onClick={() => window.location.reload()}
                            >
                                <i className="bi bi-arrow-clockwise me-2"></i>
                                Refresh Connection
                            </Button>
                        </div>
                    </Alert>
                )}

                {/* Stats Section */}
                <div className="dashboard-section">
                    <h2>Overview</h2>
                    <Row className="stats-row">
                        <Col lg={3} md={6} sm={6} xs={12}>
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon">
                                        <i className="bi bi-shield-check"></i>
                                    </div>
                                    <h3>{stats.productsVerified}</h3>
                                    <p>Products Verified</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={3} md={6} sm={6} xs={12}>
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon">
                                        <i className="bi bi-box-seam"></i>
                                    </div>
                                    <h3>{stats.productsOwned}</h3>
                                    <p>Products Owned</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        {userRole === 'manufacturer' && (
                            <Col lg={3} md={6} sm={6} xs={12}>
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <i className="bi bi-gear-wide-connected"></i>
                                        </div>
                                        <h3>{stats.productsManufactured}</h3>
                                        <p>Products Manufactured</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}

                        {userRole !== 'manufacturer' && (
                            <Col lg={3} md={6} sm={6} xs={12}>
                                <Card className="stat-card">
                                    <Card.Body>
                                        <div className="stat-icon">
                                            <i className="bi bi-arrow-left-right"></i>
                                        </div>
                                        <h3>{stats.pendingTransfers}</h3>
                                        <p>Pending Transfers</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}

                        <Col lg={3} md={6} sm={6} xs={12}>
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon">
                                        <i className="bi bi-calendar-check"></i>
                                    </div>
                                    <h3>{stats.lastActivity}</h3>
                                    <p>Last Activity</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-section">
                    <h2>Quick Actions</h2>
                    <div className="quick-actions">
                        {userRole === 'manufacturer' && (
                            <Link to="/add" className="quick-action-card manufacturer">
                                <div className="quick-action-icon"><i className="bi bi-plus-circle"></i></div>
                                <h3>Add New Product</h3>
                                <p>Register a new product on the blockchain</p>
                            </Link>
                        )}
                        
                        {userRole === 'seller' && (
                            <Link to="/sell" className="quick-action-card seller">
                                <div className="quick-action-icon"><i className="bi bi-cart-check"></i></div>
                                <h3>Sell Product</h3>
                                <p>Process a new sale and transfer ownership</p>
                            </Link>
                        )}
                        
                        <Link to="/buy" className="quick-action-card verify">
                            <div className="quick-action-icon"><i className="bi bi-shield-check"></i></div>
                            <h3>Verify Product</h3>
                            <p>Check authenticity of a product</p>
                        </Link>
                        
                        <Link to="/scan" className="quick-action-card scan">
                            <div className="quick-action-icon"><i className="bi bi-qr-code-scan"></i></div>
                            <h3>Scan QR Code</h3>
                            <p>Quickly scan a product QR code</p>
                        </Link>
                        
                        <Link to="/products" className="quick-action-card products">
                            <div className="quick-action-icon"><i className="bi bi-box-seam"></i></div>
                            <h3>My Products</h3>
                            <p>View and manage your products</p>
                        </Link>
                        
                        {userRole !== 'consumer' && (
                            <Link to="/addowner" className="quick-action-card transfer">
                                <div className="quick-action-icon"><i className="bi bi-arrow-left-right"></i></div>
                                <h3>Transfer Ownership</h3>
                                <p>Transfer a product to another user</p>
                            </Link>
                        )}
                        
                        {userRole === 'manufacturer' && (
                            <Link to="/registerSeller" className="quick-action-card register">
                                <div className="quick-action-icon"><i className="bi bi-person-plus"></i></div>
                                <h3>Register Seller</h3>
                                <p>Authorize a new seller</p>
                            </Link>
                        )}
                    </div>
                </div>

                <Row>
                    {/* Recent Products */}
                    <Col lg={7} md={12}>
                        <div className="dashboard-section">
                            <div className="section-header-with-action">
                                <h2>Recent Products</h2>
                                <Button as={Link} to="/products" variant="outline-primary" size="sm">View All</Button>
                            </div>
                            
                            {recentProducts.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon"><i className="bi bi-box"></i></div>
                                    <h4>No Products Yet</h4>
                                    <p>
                                        {userRole === 'manufacturer' 
                                            ? 'Start by adding your first product' 
                                            : 'No products found in your account yet'}
                                    </p>
                                    {userRole === 'manufacturer' && (
                                        <Button as={Link} to="/add" variant="primary" size="sm">
                                            Add Product
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="products-list">
                                    {recentProducts.map((product, index) => (
                                        <Link 
                                            key={index} 
                                            to={`/product/${product.id}`} 
                                            className="product-item"
                                        >
                                            <div className="product-info">
                                                <div className="product-name">
                                                    <h4>{product.name}</h4>
                                                    <span className="product-id">{product.id}</span>
                                                </div>
                                                <div className="product-stats">
                                                    <span className={`product-status ${product.status.toLowerCase()}`}>
                                                        {product.status}
                                                    </span>
                                                    <span className="verification-count">
                                                        <i className="bi bi-shield-check"></i>
                                                        {product.verifications}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="product-action">
                                                <i className="bi bi-chevron-right"></i>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Col>
                    
                    {/* Recent Activity */}
                    <Col lg={5} md={12}>
                        <div className="dashboard-section">
                            <div className="section-header-with-action">
                                <h2>Recent Activity</h2>
                                <Button variant="outline-primary" size="sm">View All</Button>
                            </div>
                            
                            <div className="activity-feed">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="activity-item">
                                        <div className={`activity-icon ${activity.type}`}>
                                            <i className={`bi ${activity.icon}`}></i>
                                        </div>
                                        <div className="activity-content">
                                            <h4>{activity.title}</h4>
                                            <p>{activity.description}</p>
                                            <span className="activity-time">
                                                {activity.date}, {activity.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Blockchain Status */}
                <div className="dashboard-section">
                    <h2>Blockchain Connection</h2>
                    <BlockchainStatus />
                </div>
            </Container>
        </div>
    );
}

export default Dashboard;
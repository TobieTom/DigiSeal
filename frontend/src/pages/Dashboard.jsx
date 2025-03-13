// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import { userRoleState, toastState } from '../store/atoms';
import { Card, Row, Col, Container, Button } from 'react-bootstrap';
import BlockchainStatus from '../components/common/BlockchainStatus';
import blockchainService from '../services/BlockchainService';
import '../styles/dashboard.css';

function Dashboard() {
    const userRole = useRecoilValue(userRoleState);
    const setToast = useSetRecoilState(toastState);
    const [stats, setStats] = useState({
        productsVerified: 0,
        productsOwned: 0,
        pendingTransfers: 0,
        lastActivity: 'Never'
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userAddress, setUserAddress] = useState('');
    const [blockchainInitialized, setBlockchainInitialized] = useState(false);

    useEffect(() => {
        // Initialize blockchain service
        const initBlockchain = async () => {
            try {
                await blockchainService.init();
                const account = await blockchainService.getCurrentAccount();
                setUserAddress(account);
                setBlockchainInitialized(true);
            } catch (error) {
                console.error('Error initializing blockchain:', error);
                setToast('Failed to connect to blockchain. Please check your wallet connection.');
            }
        };

        initBlockchain();
    }, [setToast]);

    useEffect(() => {
        // Mock data fetching from backend
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // If blockchain is initialized, try to get real data
                if (blockchainInitialized && userAddress) {
                    try {
                        // Get owned products
                        const ownedProducts = await blockchainService.getProductsOwned(userAddress);
                        
                        // Get manufactured products if user is manufacturer
                        let manufacturedProducts = [];
                        if (userRole === 'manufacturer') {
                            manufacturedProducts = await blockchainService.getProductsManufactured(userAddress);
                        }
                        
                        // Update stats with real data
                        setStats(prevStats => ({
                            ...prevStats,
                            productsOwned: ownedProducts.length,
                            productsManufactured: manufacturedProducts.length,
                            lastActivity: new Date().toLocaleDateString()
                        }));
                    } catch (error) {
                        console.error('Error fetching blockchain data:', error);
                        // Fall back to mock data if blockchain query fails
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
                    pendingTransfers: Math.floor(Math.random() * 3),
                    lastActivity: new Date().toLocaleDateString()
                });

                // Generate mock activity data
                const mockActivities = [
                    {
                        id: 1,
                        type: 'verification',
                        icon: 'bi-shield-check',
                        title: 'Product Verified',
                        description: `You verified product ID: PRD-${Math.floor(1000 + Math.random() * 9000)}`,
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
    }, [userRole, setToast, blockchainInitialized, userAddress]);

    // Quick action cards based on user role
    const getQuickActions = () => {
        const commonActions = [
            {
                title: 'Verify Product',
                description: 'Scan or enter a product ID to verify its authenticity',
                icon: 'bi bi-shield-check',
                link: '/buy',
                color: '#4361ee'
            },
            {
                title: 'Scan QR Code',
                description: 'Quickly scan a product QR code for verification',
                icon: 'bi bi-qr-code-scan',
                link: '/scan',
                color: '#560bad'
            }
        ];

        if (userRole === 'manufacturer') {
            return [
                {
                    title: 'Add New Product',
                    description: 'Register a new product on the blockchain',
                    icon: 'bi bi-plus-circle',
                    link: '/add',
                    color: '#7209b7'
                },
                ...commonActions,
                {
                    title: 'My Products',
                    description: 'View and manage your registered products',
                    icon: 'bi bi-archive',
                    link: '/products',
                    color: '#f72585'
                },
                {
                    title: 'Transfer Ownership',
                    description: 'Transfer product ownership to another user',
                    icon: 'bi bi-arrow-left-right',
                    link: '/addowner',
                    color: '#3a0ca3'
                },
                {
                    title: 'Register Seller', 
                    description: 'Authorize new sellers for your products',
                    icon: 'bi bi-person-plus',
                    link: '/registerSeller',
                    color: '#4cc9f0'
                }
            ];
        } else if (userRole === 'seller') {
            return [
                {
                    title: 'Sell Products',
                    description: 'Transfer ownership of products to buyers',
                    icon: 'bi bi-cart-check',
                    link: '/sell',
                    color: '#4cc9f0'
                },
                ...commonActions,
                {
                    title: 'My Inventory',
                    description: 'View and manage your product inventory',
                    icon: 'bi bi-archive',
                    link: '/products',
                    color: '#4895ef'
                },
                {
                    title: 'Transfer Ownership',
                    description: 'Transfer product ownership to another user',
                    icon: 'bi bi-arrow-left-right',
                    link: '/addowner',
                    color: '#3a0ca3'
                }
            ];
        } else {
            // Consumer role
            return [
                ...commonActions,
                {
                    title: 'My Products',
                    description: 'View your verified authentic products',
                    icon: 'bi bi-collection',
                    link: '/products',
                    color: '#f72585'
                },
                {
                    title: 'My Profile',
                    description: 'View and edit your profile information',
                    icon: 'bi bi-person-circle',
                    link: '/profile',
                    color: '#3a0ca3'
                }
            ];
        }
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

    return (
        <div className="dashboard-container">
            <Container>
                <div className="dashboard-header">
                    <div className="role-badge">{getRoleName()}</div>
                    <h1>Welcome to your Dashboard</h1>
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

                {/* Add Blockchain Status */}
                <Row className="mb-4">
                    <Col>
                        <BlockchainStatus />
                    </Col>
                </Row>

                <div className="dashboard-stats">
                    <Row>
                        <Col lg={3} md={6} sm={6} xs={12}>
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon">
                                        <i className="bi bi-shield-check"></i>
                                    </div>
                                    <h3>{loading ? '...' : stats.productsVerified}</h3>
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
                                    <h3>{loading ? '...' : stats.productsOwned}</h3>
                                    <p>Products Owned</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={3} md={6} sm={6} xs={12}>
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon">
                                        <i className="bi bi-arrow-left-right"></i>
                                    </div>
                                    <h3>{loading ? '...' : stats.pendingTransfers}</h3>
                                    <p>Pending Transfers</p>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={3} md={6} sm={6} xs={12}>
                            <Card className="stat-card">
                                <Card.Body>
                                    <div className="stat-icon">
                                        <i className="bi bi-calendar-check"></i>
                                    </div>
                                    <h3>{loading ? '...' : stats.lastActivity}</h3>
                                    <p>Last Activity</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>

                <div className="dashboard-section">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                    {getQuickActions().map((action, index) => (
                            <Link key={index} to={action.link} className="action-card" style={{ backgroundColor: action.color }}>
                                <div className="action-icon">
                                    <i className={action.icon}></i>
                                </div>
                                <h3>{action.title}</h3>
                                <p>{action.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                {userRole === 'manufacturer' && (
                    <div className="dashboard-section">
                        <h2>Manufacturing Insights</h2>
                        <div className="insights-container">
                            <div className="insight-card">
                                <div className="insight-header">
                                    <h3>Verification Rate</h3>
                                    <span className="insight-value">94%</span>
                                </div>
                                <div className="insight-content">
                                    <p>Percentage of your products that have been verified by consumers</p>
                                </div>
                                <div className="insight-footer">
                                    <span className="trend positive">
                                        <i className="bi bi-arrow-up"></i> 3.2%
                                    </span>
                                    <span className="trend-label">vs last month</span>
                                </div>
                            </div>

                            <div className="insight-card">
                                <div className="insight-header">
                                    <h3>Transfer Time</h3>
                                    <span className="insight-value">2.4 days</span>
                                </div>
                                <div className="insight-content">
                                    <p>Average time for products to transfer between ownership levels</p>
                                </div>
                                <div className="insight-footer">
                                    <span className="trend negative">
                                        <i className="bi bi-arrow-up"></i> 0.5 days
                                    </span>
                                    <span className="trend-label">vs last month</span>
                                </div>
                            </div>

                            <div className="insight-card">
                                <div className="insight-header">
                                    <h3>Seller Count</h3>
                                    <span className="insight-value">18</span>
                                </div>
                                <div className="insight-content">
                                    <p>Number of authorized sellers distributing your products</p>
                                </div>
                                <div className="insight-footer">
                                    <span className="trend positive">
                                        <i className="bi bi-arrow-up"></i> 2
                                    </span>
                                    <span className="trend-label">vs last month</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {userRole === 'seller' && (
                    <div className="dashboard-section">
                        <h2>Seller Insights</h2>
                        <div className="insights-container">
                            <div className="insight-card">
                                <div className="insight-header">
                                    <h3>Sales Conversion</h3>
                                    <span className="insight-value">84%</span>
                                </div>
                                <div className="insight-content">
                                    <p>Percentage of verifications that lead to purchase</p>
                                </div>
                                <div className="insight-footer">
                                    <span className="trend positive">
                                        <i className="bi bi-arrow-up"></i> 5.1%
                                    </span>
                                    <span className="trend-label">vs last month</span>
                                </div>
                            </div>

                            <div className="insight-card">
                                <div className="insight-header">
                                    <h3>Inventory Age</h3>
                                    <span className="insight-value">18 days</span>
                                </div>
                                <div className="insight-content">
                                    <p>Average time products remain in your inventory</p>
                                </div>
                                <div className="insight-footer">
                                    <span className="trend positive">
                                        <i className="bi bi-arrow-down"></i> 3 days
                                    </span>
                                    <span className="trend-label">vs last month</span>
                                </div>
                            </div>

                            <div className="insight-card">
                                <div className="insight-header">
                                    <h3>Verification Rate</h3>
                                    <span className="insight-value">96%</span>
                                </div>
                                <div className="insight-content">
                                    <p>Percentage of your products that pass verification</p>
                                </div>
                                <div className="insight-footer">
                                    <span className="trend neutral">
                                        <i className="bi bi-dash"></i> 0%
                                    </span>
                                    <span className="trend-label">vs last month</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {userRole === 'consumer' && (
                    <div className="dashboard-section">
                        <h2>Your Authenticity Insights</h2>
                        <div className="insights-container">
                            <div className="insight-card">
                                <div className="insight-header">
                                    <h3>Authentic Rate</h3>
                                    <span className="insight-value">100%</span>
                                </div>
                                <div className="insight-content">
                                    <p>Percentage of your verified products that are authentic</p>
                                </div>
                                <div className="insight-footer">
                                    <span className="trend positive">
                                        <i className="bi bi-check-circle"></i> All Authentic
                                    </span>
                                </div>
                            </div>

                            <div className="insight-card">
                                <div className="insight-header">
                                    <h3>Avg. Value</h3>
                                    <span className="insight-value">$580</span>
                                </div>
                                <div className="insight-content">
                                    <p>Average value of your verified authentic products</p>
                                </div>
                                <div className="insight-footer">
                                    <span className="trend-label">Based on market data</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="dashboard-section">
                    <div className="section-header-with-action">
                        <h2>Recent Activity</h2>
                        <Button variant="outline-primary" size="sm">View All</Button>
                    </div>
                    
                    {loading ? (
                        <div className="loading-indicator">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p>Loading activity data...</p>
                        </div>
                    ) : (
                        <div className="activity-list">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="activity-item">
                                    <div className="activity-icon">
                                        <i className={`bi ${activity.icon}`}></i>
                                    </div>
                                    <div className="activity-details">
                                        <h4>{activity.title}</h4>
                                        <p>{activity.description}</p>
                                        <span className="activity-time">{activity.date}, {activity.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}

export default Dashboard;
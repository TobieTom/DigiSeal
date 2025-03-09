// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Link } from 'react-router-dom';
import { userRoleState, toastState } from '../store/atoms';
import { Card, Row, Col, Container } from 'react-bootstrap';
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // This would fetch data from backend in a real app
        const fetchDashboardData = async () => {
            try {
                // Simulate API call
                setTimeout(() => {
                    setStats({
                        productsVerified: Math.floor(Math.random() * 10) + 1,
                        productsOwned: userRole === 'consumer' ? 0 : Math.floor(Math.random() * 5) + 1,
                        pendingTransfers: Math.floor(Math.random() * 3),
                        lastActivity: new Date().toLocaleDateString()
                    });
                    setLoading(false);
                }, 1200);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setToast('Failed to load dashboard data');
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [userRole, setToast]);

    // Quick action cards based on user role
    const getQuickActions = () => {
        const commonActions = [
            {
                title: 'Verify Product',
                description: 'Scan or enter a product ID to verify its authenticity',
                icon: 'bi bi-shield-check',
                link: '/buy', // This now links directly to the verify product page
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
                    title: 'Sell Products', 
                    description: 'Sell products to buyers',
                    icon: 'bi bi-cart-check',
                    link: '/sell',
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
                    title: 'My Profile',
                    description: 'View and edit your profile information',
                    icon: 'bi bi-person-circle',
                    link: '/profile',
                    color: '#3a0ca3'
                }
            ];
        }
    };

    return (
        <div className="dashboard-container">
            <Container>
                <div className="dashboard-header">
                    <h1>Welcome to your Dashboard</h1>
                    <p>
                        {userRole === 'manufacturer'
                            ? 'Manage your products and monitor authenticity'
                            : userRole === 'seller'
                                ? 'Track your inventory and handle sales'
                                : 'Verify and track authentic products'}
                    </p>
                </div>

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

                <div className="dashboard-section">
                    <h2>Recent Activity</h2>
                    {loading ? (
                        <div className="loading-indicator">Loading activity data...</div>
                    ) : (
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="bi bi-shield-check"></i>
                                </div>
                                <div className="activity-details">
                                    <h4>Product Verified</h4>
                                    <p>You verified product ID: PRD-{Math.floor(1000 + Math.random() * 9000)}</p>
                                    <span className="activity-time">Today, {new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>

                            {userRole !== 'consumer' && (
                                <div className="activity-item">
                                    <div className="activity-icon">
                                        <i className="bi bi-box-seam"></i>
                                    </div>
                                    <div className="activity-details">
                                        <h4>Product Added</h4>
                                        <p>Added new product to the blockchain</p>
                                        <span className="activity-time">Yesterday, 2:30 PM</span>
                                    </div>
                                </div>
                            )}

                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="bi bi-person-check"></i>
                                </div>
                                <div className="activity-details">
                                    <h4>Account Login</h4>
                                    <p>Successfully logged in to your account</p>
                                    <span className="activity-time">Today, {new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}

export default Dashboard;
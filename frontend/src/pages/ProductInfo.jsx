// src/pages/ProductInfo.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { toastState } from '../store/atoms';
import blockchainService from '../services/BlockchainService';
import ipfsService from '../services/IPFSService';
import Loader from '../components/common/Loader';
import QRCode from 'react-qr-code';
import { Button, Badge, Card, Row, Col, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import '../styles/product-info.css';

function ProductInfo() {
    const [productInfo, setProductInfo] = useState(null);
    const [extendedInfo, setExtendedInfo] = useState(null);
    const [transferHistory, setTransferHistory] = useState([]);
    const [verificationHistory, setVerificationHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [activeTab, setActiveTab] = useState('details');
    const setToast = useSetRecoilState(toastState);
    const navigate = useNavigate();
    const { id: productId } = useParams();

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true);

                // Initialize blockchain service
                await blockchainService.init();

                // Fetch product details from blockchain
                const productDetails = await blockchainService.getProductDetails(productId);
                console.log("Raw product details from blockchain:", productDetails);
                setProductInfo(productDetails);

                // Fetch extended details from product details JSON string if available
                if (productDetails.productDetails) {
                    try {
                        // Log the raw product details string
                        console.log("Product details string:", productDetails.productDetails);
                        
                        const parsedDetails = JSON.parse(productDetails.productDetails);
                        console.log("Parsed product details:", parsedDetails);
                        setExtendedInfo(parsedDetails);
                    } catch (error) {
                        console.error('Error parsing product details JSON:', error);
                    }
                }

                // Fetch transfer history
                const history = await blockchainService.getTransferHistory(productId);
                setTransferHistory(history);

                // Fetch verification history
                const verifications = await blockchainService.getVerificationHistory(productId);
                setVerificationHistory(verifications);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching product info:', error);
                setToast('Failed to fetch product information: ' + error.message);
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductDetails();
        }
    }, [productId, setToast]);

    const handleVerifyClick = async () => {
        try {
            setVerifying(true);
            setToast('Verification process started');

            // Verify on blockchain
            const isAuthentic = await blockchainService.verifyProduct(productId, 'Product Info Page');

            // Update product info with latest verification result
            setProductInfo(prevInfo => ({
                ...prevInfo,
                isAuthentic
            }));

            // Refresh verification history
            const updatedVerifications = await blockchainService.getVerificationHistory(productId);
            setVerificationHistory(updatedVerifications);

            setToast(isAuthentic ? 'Product verified successfully!' : 'Warning: Product verification failed!');
            setVerifying(false);
        } catch (error) {
            console.error('Error verifying product:', error);
            setToast('Verification failed: ' + error.message);
            setVerifying(false);
        }
    };

    const handleReportClick = () => {
        navigate(`/report/${productId}`);
    };

    if (loading) {
        return <Loader />;
    }

    if (!productInfo) {
        return (
            <div className="error-container">
                <h2>Product Not Found</h2>
                <p>The product you're looking for doesn't exist or has been removed.</p>
                <Link to="/buy" className="btn btn-primary mt-3">
                    Try Another Product
                </Link>
            </div>
        );
    }

    return (
        <div className="product-info-container">
            <div className="product-details-header">
                <h1>{extendedInfo?.name || productInfo.manufacturerName}</h1>
                <div className="product-subtitle">
                    <Badge bg={productInfo.isAuthentic ? 'success' : 'danger'} className="me-2 authentication-badge">
                        {productInfo.isAuthentic ? 'Authentic' : 'Verification Failed'}
                    </Badge>
                    <Badge bg="primary" className="status-badge">
                        {productInfo.status}
                    </Badge>
                </div>
            </div>

            <div className="container">
                <Row className="info-panels">
                    <Col lg={8} md={7}>
                        <Card className="mb-4">
                            <Card.Body className="p-0">
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={(k) => setActiveTab(k)}
                                    className="mb-3 product-tabs"
                                    fill
                                >
                                    <Tab eventKey="details" title="Product Details">
                                        <div className="tab-content-container">
                                            <Row>
                                                <Col md={6}>
                                                    <div className="info-section">
                                                        <h3>Basic Information</h3>
                                                        <div className="info-item">
                                                            <span className="info-label">ID:</span>
                                                            <span className="info-value">{productId}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="info-label">Name:</span>
                                                            <span className="info-value">{extendedInfo?.name || productInfo.manufacturerName}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="info-label">Price:</span>
                                                            <span className="info-value">${extendedInfo?.price || 'N/A'}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="info-label">Manufacturer:</span>
                                                            <span className="info-value">{productInfo.manufacturerName}</span>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="info-section">
                                                        <h3>Manufacturing Info</h3>
                                                        <div className="info-item">
                                                            <span className="info-label">Production Date:</span>
                                                            <span className="info-value">{new Date(productInfo.manufactureDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="info-label">Location:</span>
                                                            <span className="info-value">{productInfo.manufacturingLocation}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="info-label">Current Owner:</span>
                                                            <span className="info-value address-value">{productInfo.currentOwner}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <span className="info-label">Status:</span>
                                                            <span className="info-value">{productInfo.status}</span>
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>
                                            
                                            {extendedInfo?.description && (
                                                <div className="info-section mt-4">
                                                    <h3>Description</h3>
                                                    <p className="product-description">{extendedInfo.description}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Tab>
                                    
                                    <Tab eventKey="history" title="Transfer History">
                                        <div className="tab-content-container">
                                            <div className="chain-of-custody">
                                                <h3>Ownership History</h3>
                                                {transferHistory.length === 0 ? (
                                                    <p>No transfer history available. This product has not changed ownership.</p>
                                                ) : (
                                                    <div className="custody-timeline">
                                                        {transferHistory.map((event, index) => (
                                                            <div key={index} className="custody-event">
                                                                <div className="event-date">{new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}</div>
                                                                <div className="event-title">Ownership Transfer</div>
                                                                <div className="event-details">
                                                                    <p><span>From:</span> <span className="address-text">{event.from}</span></p>
                                                                    <p><span>To:</span> <span className="address-text">{event.to}</span></p>
                                                                    {event.transferConditions && (
                                                                        <p><span>Conditions:</span> {event.transferConditions}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Tab>
                                    
                                    <Tab eventKey="verification" title="Verification History">
                                        <div className="tab-content-container">
                                            <div className="verification-history">
                                                <h3>Verification Events</h3>
                                                {verificationHistory.length === 0 ? (
                                                    <p>No verification history available. This product has not been verified yet.</p>
                                                ) : (
                                                    <div className="verification-list">
                                                        {verificationHistory.map((verification, index) => (
                                                            <div key={index} className="verification-event">
                                                                <div className="verification-icon">
                                                                    <i className={`bi ${verification.result ? 'bi-shield-check' : 'bi-shield-x'}`}></i>
                                                                </div>
                                                                <div className="verification-details">
                                                                    <div className="verification-date">
                                                                        {new Date(verification.timestamp).toLocaleDateString()} {new Date(verification.timestamp).toLocaleTimeString()}
                                                                    </div>
                                                                    <div className="verification-status">
                                                                        <Badge
                                                                            bg={verification.result ? 'success' : 'danger'}
                                                                        >
                                                                            {verification.result ? 'Authentic' : 'Failed'}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="verification-address">
                                                                        Address: <span className="address-text">{verification.verifier}</span>
                                                                    </div>
                                                                    <div className="verification-location">
                                                                        Location: {verification.location}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>

                        <div className={`verification-result ${productInfo.isAuthentic ? 'authentic' : 'counterfeit'}`}>
                            <h3>
                                <i className={`bi ${productInfo.isAuthentic ? 'bi-shield-check' : 'bi-shield-x'}`}></i>
                                {productInfo.isAuthentic ? 'Product Verified' : 'Verification Failed'}
                            </h3>
                            <p>
                                {productInfo.isAuthentic
                                    ? 'This product has been verified as authentic on the blockchain.'
                                    : 'Warning: This product could not be verified as authentic. It may be counterfeit.'}
                            </p>
                            {verificationHistory.length > 0 && (
                                <p>Last verification: {new Date(verificationHistory[0].timestamp).toLocaleString()}</p>
                            )}
                        </div>
                    </Col>
                    
                    <Col lg={4} md={5}>
                        <Card className="mb-4">
                            <Card.Body className="text-center p-4">
                                <h4 className="mb-3">Verification QR Code</h4>
                                <div className="qr-code-container">
                                    <QRCode value={productId} size={200} />
                                    <p className="qr-instruction mt-3">Scan to verify product authenticity</p>
                                </div>
                                
                                <div className="d-grid gap-2 mt-4">
                                    <Button
                                        variant="primary"
                                        className="verify-button"
                                        onClick={handleVerifyClick}
                                        disabled={verifying}
                                    >
                                        {verifying ? (
                                            <>
                                                <Spinner animation="border" size="sm" role="status" className="me-2" />
                                                Verifying...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-shield-check me-2"></i>
                                                Verify Now
                                            </>
                                        )}
                                    </Button>
                                    
                                    {!productInfo.isAuthentic && (
                                        <Button
                                            variant="danger"
                                            onClick={handleReportClick}
                                        >
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            Report Counterfeit
                                        </Button>
                                    )}
                                    
                                    <Button variant="outline-secondary" onClick={() => window.print()}>
                                        <i className="bi bi-printer me-2"></i>
                                        Print Certificate
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                        
                        <Card className="mb-4">
                            <Card.Header>Blockchain Information</Card.Header>
                            <Card.Body>
                                <p className="mb-2">
                                    <strong>Product ID:</strong>
                                    <span className="blockchain-value d-block">{productId}</span>
                                </p>
                                <p className="mb-2">
                                    <strong>Manufacturer Address:</strong>
                                    <span className="blockchain-value d-block text-truncate" title={productInfo.manufacturer}>
                                        {productInfo.manufacturer}
                                    </span>
                                </p>
                                <p className="mb-2">
                                    <strong>Current Owner:</strong>
                                    <span className="blockchain-value d-block text-truncate" title={productInfo.currentOwner}>
                                        {productInfo.currentOwner}
                                    </span>
                                </p>
                                <p className="mb-0">
                                    <strong>Verification Count:</strong>
                                    <span className="blockchain-value d-block">
                                        {verificationHistory.length}
                                    </span>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>

            <div className="product-actions">
                <Button variant="secondary" as={Link} to="/dashboard">
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                </Button>
                
                <Button variant="primary" as={Link} to="/buy">
                    <i className="bi bi-shield-check me-2"></i>
                    Verify Another Product
                </Button>
            </div>
        </div>
    );
}

export default ProductInfo;
// src/pages/ProductInfo.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { toastState } from '../store/atoms'
import Loader from '../components/common/Loader'
import QRCode from 'react-qr-code'
import { Button, Badge } from 'react-bootstrap'
import '../styles/product-info.css'

function ProductInfo() {
    const [productInfo, setProductInfo] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showQRModal, setShowQRModal] = useState(false)
    const setToast = useSetRecoilState(toastState)
    const { id: productId } = useParams()

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true)

                // This is a placeholder for actual blockchain data fetching
                // We'll simulate fetching product data
                setTimeout(() => {
                    // Mock product data
                    setProductInfo({
                        name: 'Luxury Watch Model X123',
                        price: '1999.99',
                        isSold: false,
                        manufacturer: 'Premium Timepieces Ltd.',
                        manufacturerAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                        productionDate: '2023-06-15',
                        specifications: 'Swiss movement, sapphire crystal, water resistant to 100m',
                        serialNumber: 'SN-' + Math.random().toString(16).slice(2, 10).toUpperCase(),
                        warranty: {
                            period: '2 years',
                            expiryDate: '2025-06-15',
                            terms: 'Limited warranty against manufacturing defects'
                        },
                        materials: ['316L Stainless Steel', 'Sapphire Crystal', 'Leather Strap'],
                        verifications: [
                            {
                                date: new Date().toISOString(),
                                address: '0x' + Math.random().toString(16).slice(2, 42),
                                location: 'New York, USA',
                                result: 'authentic'
                            },
                            {
                                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                                address: '0x' + Math.random().toString(16).slice(2, 42),
                                location: 'Los Angeles, USA',
                                result: 'authentic'
                            }
                        ],
                        transferHistory: [
                            {
                                date: '2023-06-15',
                                event: 'Manufactured',
                                from: 'Premium Timepieces Ltd.',
                                to: 'Premium Timepieces Ltd.',
                                transactionHash: '0x' + Math.random().toString(16).slice(2, 42)
                            },
                            {
                                date: '2023-06-30',
                                event: 'Transferred to Distributor',
                                from: 'Premium Timepieces Ltd.',
                                to: 'Luxury Goods Distribution Inc.',
                                transactionHash: '0x' + Math.random().toString(16).slice(2, 42)
                            },
                            {
                                date: '2023-07-15',
                                event: 'Received by Retailer',
                                from: 'Luxury Goods Distribution Inc.',
                                to: 'Elite Watch Boutique',
                                transactionHash: '0x' + Math.random().toString(16).slice(2, 42)
                            }
                        ]
                    })

                    setLoading(false)
                }, 1500)
            } catch (error) {
                console.error('Error fetching product info:', error)
                setToast('Failed to fetch product information')
                setLoading(false)
            }
        }

        if (productId) {
            fetchProductDetails()
        }
    }, [productId, setToast])

    const handleVerifyClick = () => {
        setToast('Verification process started')
        // Here we would initiate a new verification
        setTimeout(() => {
            // Update verification history with new verification
            if (productInfo) {
                const updatedProduct = { 
                    ...productInfo,
                    verifications: [
                        {
                            date: new Date().toISOString(),
                            address: '0x' + Math.random().toString(16).slice(2, 42),
                            location: 'Current Location',
                            result: 'authentic'
                        },
                        ...productInfo.verifications
                    ]
                }
                setProductInfo(updatedProduct)
                setToast('Product verified successfully!')
            }
        }, 1000)
    }

    if (loading) {
        return <Loader />
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
        )
    }

    return (
        <div className="product-info-container">
            <div className="product-details-header">
                <h1>{productInfo.name}</h1>
                <div className="product-status">
                    <Badge bg={productInfo.isSold ? 'danger' : 'success'} className="status-badge">
                        {productInfo.isSold ? 'Sold' : 'Available'}
                    </Badge>
                </div>
            </div>

            <div className="auth-ribbon">
                <div className="ribbon-content">
                    <i className="bi bi-shield-check"></i>
                    <span>Blockchain Verified Authentic</span>
                </div>
            </div>

            <div className="info-panels">
                <div className="info-panel product-panel">
                    <h2>Product Details</h2>
                    <div className="info-content">
                        <p>
                            <span className="info-label">ID:</span>
                            <span className="info-value">{productId}</span>
                        </p>
                        <p>
                            <span className="info-label">Price:</span>
                            <span className="info-value">${productInfo.price}</span>
                        </p>
                        <p>
                            <span className="info-label">Manufacturer:</span>
                            <span className="info-value">{productInfo.manufacturer}</span>
                        </p>
                        <p>
                            <span className="info-label">Production Date:</span>
                            <span className="info-value">{productInfo.productionDate}</span>
                        </p>
                        <p>
                            <span className="info-label">Serial Number:</span>
                            <span className="info-value">{productInfo.serialNumber}</span>
                        </p>
                        <p>
                            <span className="info-label">Warranty:</span>
                            <span className="info-value">{productInfo.warranty.period}</span>
                        </p>
                        <p>
                            <span className="info-label">Materials:</span>
                            <span className="info-value">{productInfo.materials.join(', ')}</span>
                        </p>
                        <p>
                            <span className="info-label">Specifications:</span>
                            <span className="info-value">{productInfo.specifications}</span>
                        </p>
                    </div>
                </div>

                <div className="info-panel qr-panel">
                    <h2>Verification QR Code</h2>
                    <div className="qr-code-container">
                        <QRCode value={productId} size={200} />
                        <p className="qr-instruction">Scan to verify product authenticity</p>
                        
                        <Button 
                            variant="primary" 
                            className="mt-3 verify-button"
                            onClick={handleVerifyClick}
                        >
                            <i className="bi bi-shield-check me-2"></i>
                            Verify Now
                        </Button>
                    </div>
                </div>
            </div>

            <div className="verification-result authentic">
                <h3><i className="bi bi-shield-check"></i> Product Verified</h3>
                <p>This product has been verified as authentic on the blockchain.</p>
                <p>Last verification: {new Date(productInfo.verifications[0].date).toLocaleString()}</p>
            </div>

            <div className="verification-history">
                <h3>Verification History</h3>
                <div className="verification-list">
                    {productInfo.verifications.map((verification, index) => (
                        <div key={index} className="verification-event">
                            <div className="verification-icon">
                                <i className={`bi bi-${verification.result === 'authentic' ? 'shield-check' : 'shield-x'}`}></i>
                            </div>
                            <div className="verification-details">
                                <div className="verification-date">
                                    {new Date(verification.date).toLocaleString()}
                                </div>
                                <div className="verification-status">
                                    <Badge 
                                        bg={verification.result === 'authentic' ? 'success' : 'danger'}
                                    >
                                        {verification.result === 'authentic' ? 'Authentic' : 'Fake'}
                                    </Badge>
                                </div>
                                <div className="verification-address">
                                    Address: <span className="monospace">{verification.address}</span>
                                </div>
                                <div className="verification-location">
                                    Location: {verification.location}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chain-of-custody">
                <h3>Ownership History</h3>
                <div className="custody-timeline">
                    {productInfo.transferHistory.map((event, index) => (
                        <div key={index} className="custody-event">
                            <div className="event-date">{event.date}</div>
                            <div className="event-title">{event.event}</div>
                            <div className="event-details">
                                <p><span>From:</span> {event.from}</p>
                                <p><span>To:</span> {event.to}</p>
                                <p className="transaction-hash">
                                    <span>TX:</span> <span className="monospace">{event.transactionHash}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="product-actions">
                <Button variant="outline-light" as={Link} to="/dashboard">
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Dashboard
                </Button>
                <Button variant="primary" onClick={() => window.print()}>
                    <i className="bi bi-printer me-2"></i>
                    Print Certificate
                </Button>
            </div>

            {/* QR Code Modal would be implemented here with a bootstrap modal component */}
        </div>
    )
}

export default ProductInfo
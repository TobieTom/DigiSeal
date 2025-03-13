// src/pages/ProductInfo.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { toastState } from '../store/atoms'
import blockchainService from '../services/BlockchainService'
import ipfsService from '../services/IPFSService'
import Loader from '../components/common/Loader'
import QRCode from 'react-qr-code'
import { Button, Badge } from 'react-bootstrap'
import '../styles/product-info.css'

function ProductInfo() {
    const [productInfo, setProductInfo] = useState(null)
    const [extendedInfo, setExtendedInfo] = useState(null)
    const [transferHistory, setTransferHistory] = useState([])
    const [verificationHistory, setVerificationHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const setToast = useSetRecoilState(toastState)
    const { id: productId } = useParams()

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                setLoading(true)

                // Initialize blockchain service
                await blockchainService.init()

                // Fetch product details from blockchain
                const productDetails = await blockchainService.getProductDetails(productId)
                setProductInfo(productDetails)

                // Fetch extended details from IPFS if available
                // Fetch extended details from IPFS if available
                if (productDetails.productDetails && productDetails.productDetails.startsWith('Qm')) {
                    try {
                        const ipfsData = await ipfsService.getJSON(productDetails.productDetails)
                        setExtendedInfo(ipfsData)
                    } catch (error) {
                        console.error('Error fetching IPFS details:', error)
                    }
                }

                // Fetch transfer history
                const history = await blockchainService.getTransferHistory(productId)
                setTransferHistory(history)

                // Fetch verification history
                const verifications = await blockchainService.getVerificationHistory(productId)
                setVerificationHistory(verifications)

                setLoading(false)
            } catch (error) {
                console.error('Error fetching product info:', error)
                setToast('Failed to fetch product information: ' + error.message)
                setLoading(false)
            }
        }

        if (productId) {
            fetchProductDetails()
        }
    }, [productId, setToast])

    const handleVerifyClick = async () => {
        try {
            setToast('Verification process started')

            // Verify on blockchain
            const isAuthentic = await blockchainService.verifyProduct(productId, 'Product Info Page')

            // Refresh verification history
            const updatedVerifications = await blockchainService.getVerificationHistory(productId)
            setVerificationHistory(updatedVerifications)

            setToast(isAuthentic ? 'Product verified successfully!' : 'Warning: Product verification failed!')
        } catch (error) {
            console.error('Error verifying product:', error)
            setToast('Verification failed: ' + error.message)
        }
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
                <h1>{extendedInfo?.name || productInfo.manufacturerName}</h1>
                <div className="product-status">
                    <Badge bg={productInfo.status === 'Sold' ? 'danger' : 'success'} className="status-badge">
                        {productInfo.status}
                    </Badge>
                </div>
            </div>

            <div className="auth-ribbon">
                <div className="ribbon-content">
                    <i className="bi bi-shield-check"></i>
                    <span>{productInfo.isAuthentic ? 'Blockchain Verified Authentic' : 'Verification Status: Failed'}</span>
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
                            <span className="info-value">${extendedInfo?.price || 'N/A'}</span>
                        </p>
                        <p>
                            <span className="info-label">Manufacturer:</span>
                            <span className="info-value">{productInfo.manufacturerName}</span>
                        </p>
                        <p>
                            <span className="info-label">Production Date:</span>
                            <span className="info-value">{new Date(productInfo.manufactureDate).toLocaleDateString()}</span>
                        </p>
                        <p>
                            <span className="info-label">Manufacturing Location:</span>
                            <span className="info-value">{productInfo.manufacturingLocation}</span>
                        </p>
                        {extendedInfo?.specifications && (
                            <p>
                                <span className="info-label">Specifications:</span>
                                <span className="info-value">{extendedInfo.specifications}</span>
                            </p>
                        )}
                        {extendedInfo?.description && (
                            <p>
                                <span className="info-label">Description:</span>
                                <span className="info-value">{extendedInfo.description}</span>
                            </p>
                        )}
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

            <div className={`verification-result ${productInfo.isAuthentic ? 'authentic' : 'counterfeit'}`}>
                <h3>
                    <i className={`bi ${productInfo.isAuthentic ? 'bi-shield-check' : 'bi-shield-x'}`}></i>
                    {productInfo.isAuthentic ? 'Product Verified' : 'Verification Failed'}
                </h3>
                <p>
                    {productInfo.isAuthentic
                        ? 'This product has been verified as authentic on the blockchain.'
                        : 'Warning: This product could not be verified as authentic.'}
                </p>
                {verificationHistory.length > 0 && (
                    <p>Last verification: {new Date(verificationHistory[0].timestamp).toLocaleString()}</p>
                )}
            </div>

            <div className="verification-history">
                <h3>Verification History</h3>
                <div className="verification-list">
                    {verificationHistory.length === 0 ? (
                        <p>No verification history available.</p>
                    ) : (
                        verificationHistory.map((verification, index) => (
                            <div key={index} className="verification-event">
                                <div className="verification-icon">
                                    <i className={`bi ${verification.result ? 'bi-shield-check' : 'bi-shield-x'}`}></i>
                                </div>
                                <div className="verification-details">
                                    <div className="verification-date">
                                        {new Date(verification.timestamp).toLocaleString()}
                                    </div>
                                    <div className="verification-status">
                                        <Badge
                                            bg={verification.result ? 'success' : 'danger'}
                                        >
                                            {verification.result ? 'Authentic' : 'Failed'}
                                        </Badge>
                                    </div>
                                    <div className="verification-address">
                                        Address: <span className="monospace">{verification.verifier}</span>
                                    </div>
                                    <div className="verification-location">
                                        Location: {verification.location}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="chain-of-custody">
                <h3>Ownership History</h3>
                <div className="custody-timeline">
                    {transferHistory.length === 0 ? (
                        <p>No transfer history available.</p>
                    ) : (
                        transferHistory.map((event, index) => (
                            <div key={index} className="custody-event">
                                <div className="event-date">{new Date(event.timestamp).toLocaleDateString()}</div>
                                <div className="event-title">Ownership Transfer</div>
                                <div className="event-details">
                                    <p><span>From:</span> {event.from}</p>
                                    <p><span>To:</span> {event.to}</p>
                                    {event.transferConditions && (
                                        <p><span>Conditions:</span> {event.transferConditions}</p>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
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
        </div>
    )
}

export default ProductInfo
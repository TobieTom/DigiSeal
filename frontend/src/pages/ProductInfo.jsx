import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSetRecoilState } from 'recoil'
import { toastState } from '../store/atoms'
import Loader from '../components/common/Loader'
import QRCode from 'react-qr-code'
import '../styles/product-info.css'

function ProductInfo() {
    const [productInfo, setProductInfo] = useState(null)
    const [loading, setLoading] = useState(true)
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
                        productionDate: '2023-06-15',
                        specifications: 'Swiss movement, sapphire crystal, water resistant to 100m'
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
    }, [productId])

    if (loading) {
        return <Loader />
    }

    if (!productInfo) {
        return (
            <div className="error-container">
                <h2>Product Not Found</h2>
                <p>The product you're looking for doesn't exist or has been removed.</p>
            </div>
        )
    }

    return (
        <div className="product-info-container">
            <div className="product-details-header">
                <h1>{productInfo.name}</h1>
                <div className="product-status">
                    <span className={`status-badge ${productInfo.isSold ? 'sold' : 'available'}`}>
                        {productInfo.isSold ? 'Sold' : 'Available'}
                    </span>
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
                    </div>
                </div>
            </div>

            <div className="verification-result authentic">
                <h3>✓ Product Verified</h3>
                <p>This product has been verified as authentic on the blockchain.</p>
                <p>Last verification: Today at {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="chain-of-custody">
                <h3>Ownership History</h3>
                <div className="custody-timeline">
                    <div className="custody-event">
                        <div className="event-date">June 15, 2023</div>
                        <div className="event-title">Product Manufactured</div>
                        <div className="event-details">
                            Created by Premium Timepieces Ltd. and registered on blockchain.
                        </div>
                    </div>

                    <div className="custody-event">
                        <div className="event-date">June 30, 2023</div>
                        <div className="event-title">Transferred to Distributor</div>
                        <div className="event-details">
                            Ownership transferred to Luxury Goods Distribution Inc.
                        </div>
                    </div>

                    <div className="custody-event">
                        <div className="event-date">July 15, 2023</div>
                        <div className="event-title">Received by Retailer</div>
                        <div className="event-details">
                            Transferred to Elite Watch Boutique for retail sale.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductInfo
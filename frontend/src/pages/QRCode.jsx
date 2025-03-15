// src/pages/QRCode.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCodeComponent from 'react-qr-code';
import { Card, Button, Row, Col, Alert } from 'react-bootstrap';
import blockchainService from '../services/BlockchainService';
import Loader from '../components/common/Loader';
import '../styles/qrcode.css';

function QRCode() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [productInfo, setProductInfo] = useState(null);
    const [extendedInfo, setExtendedInfo] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!id) return;

            try {
                setLoading(true);
                setError('');

                // Initialize blockchain service
                await blockchainService.init();

                // Fetch product details from blockchain
                const productDetails = await blockchainService.getProductDetails(id);
                setProductInfo(productDetails);

                // Parse extended details from JSON string if available
                if (productDetails.productDetails) {
                    try {
                        const parsedDetails = JSON.parse(productDetails.productDetails);
                        setExtendedInfo(parsedDetails);
                    } catch (error) {
                        console.error('Error parsing product details:', error);
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching product details:', error);
                setError('Failed to fetch product information. The product may not exist.');
                setLoading(false);
            }
        };

        fetchProductDetails();
    }, [id]);

    const handleDownloadQR = () => {
        // Create a canvas element from the QR code
        const svg = document.getElementById('product-qrcode');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = 300;
        canvas.height = 300;
        
        // Draw white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Convert SVG to image
        const img = new Image();
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
            // Draw the QR code
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Add product info as text
            ctx.font = 'bold 14px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText(`Product: ${extendedInfo?.name || productInfo.manufacturerName}`, canvas.width/2, canvas.height + 20);
            ctx.font = '12px Arial';
            ctx.fillText(`ID: ${id}`, canvas.width/2, canvas.height + 40);
            
            // Create download link
            const downloadLink = document.createElement('a');
            downloadLink.download = `product-${id}.png`;
            downloadLink.href = canvas.toDataURL('image/png');
            downloadLink.click();
            
            // Clean up
            URL.revokeObjectURL(url);
        };
        
        img.src = url;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleGoToProduct = () => {
        navigate(`/product/${id}`);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="qrcode-page">
            <div className="container">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="qrcode-card">
                            <Card.Body className="text-center">
                                <div className="success-banner mb-4">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <h2>PRODUCT ADDED SUCCESSFULLY!</h2>
                                </div>

                                {error ? (
                                    <Alert variant="danger">
                                        {error}
                                    </Alert>
                                ) : (
                                    <>
                                        <div className="qrcode-container">
                                            <QRCodeComponent 
                                                id="product-qrcode"
                                                value={id || ''} 
                                                size={256}
                                                level="H"
                                                className="product-qrcode"
                                            />
                                        </div>

                                        <div className="qrcode-info">
                                            <h3>PRODUCT QR CODE</h3>
                                            <p>Scan this QR code to verify product authenticity.</p>
                                            <div className="product-id-display">
                                                <p className="product-id">Product ID: <span>{id}</span></p>
                                                {extendedInfo && (
                                                    <p className="product-name">Name: <span>{extendedInfo.name}</span></p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="qrcode-actions">
                                            <Button 
                                                variant="success" 
                                                onClick={handleDownloadQR}
                                                className="action-button"
                                            >
                                                <i className="bi bi-download me-2"></i>
                                                Download QR Code
                                            </Button>
                                            
                                            <Button 
                                                variant="outline-primary" 
                                                onClick={handlePrint}
                                                className="action-button"
                                            >
                                                <i className="bi bi-printer me-2"></i>
                                                Print
                                            </Button>
                                            
                                            <Button 
                                                variant="primary" 
                                                onClick={handleGoToProduct}
                                                className="action-button mt-3"
                                            >
                                                <i className="bi bi-info-circle me-2"></i>
                                                View Product Details
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Card.Body>
                        </Card>
                        
                        <div className="text-center mt-4">
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => navigate('/dashboard')}
                            >
                                <i className="bi bi-arrow-left me-2"></i>
                                Back to Dashboard
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default QRCode;
// src/pages/BuyProduct.jsx
import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Form as BootstrapForm, Row, Col, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { secretIdState, toastState } from '../store/atoms';
import blockchainService from '../services/BlockchainService';
import ipfsService from '../services/IPFSService';
import Loader from '../components/common/Loader';
import '../styles/forms.css';

function BuyProduct() {
    const [secretId, setSecretId] = useRecoilState(secretIdState);
    const setToast = useSetRecoilState(toastState);
    const [loading, setLoading] = useState(false);
    const [verificationSuccess, setVerificationSuccess] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [verificationHistory, setVerificationHistory] = useState([]);
    const navigate = useNavigate();

    // Load previous verification if available
    useEffect(() => {
        const loadPreviousResult = async () => {
            if (secretId && !verificationResult) {
                try {
                    setLoading(true);
                    
                    // Get product details from blockchain
                    const productDetails = await blockchainService.getProductDetails(secretId);
                    
                    // Get verification history
                    const history = await blockchainService.getVerificationHistory(secretId);
                    setVerificationHistory(history);
                    
                    // Get extended details from IPFS if available
                    let extendedDetails = {};
                    if (productDetails.productDetails && productDetails.productDetails.startsWith('Qm')) {
                        try {
                            extendedDetails = await ipfsService.getJSON(productDetails.productDetails);
                        } catch (error) {
                            console.error('Error fetching IPFS details:', error);
                        }
                    }
                    
                    // Create verification result
                    setVerificationResult({
                        productName: extendedDetails.name || productDetails.manufacturerName,
                        manufacturer: productDetails.manufacturerName,
                        manufacturingDate: new Date(productDetails.manufactureDate).toLocaleDateString(),
                        verificationTime: new Date().toLocaleString(),
                        isAuthentic: productDetails.isAuthentic
                    });
                    
                    setVerificationSuccess(true);
                    setLoading(false);
                } catch (error) {
                    console.error('Error loading previous verification:', error);
                    setLoading(false);
                }
            }
        };
        
        loadPreviousResult();
    }, [secretId, verificationResult]);

    // Validation schema
    const validationSchema = Yup.object({
        secretId: Yup.string()
            .required('Product ID is required')
            .max(50, 'Product ID must be less than 50 characters'),
    });

    // Initial form values
    const initialValues = {
        secretId: secretId || '',
    };

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setLoading(true);

            // Verify product on blockchain
            const isAuthentic = await blockchainService.verifyProduct(
                values.secretId,
                'Web Application' // Location
            );

            // Get product details
            const productDetails = await blockchainService.getProductDetails(values.secretId);

            // Get additional details from IPFS if available
            let extendedDetails = {};
            if (productDetails.productDetails && productDetails.productDetails.startsWith('Qm')) {
                try {
                    extendedDetails = await ipfsService.getJSON(productDetails.productDetails);
                } catch (error) {
                    console.error('Error fetching IPFS details:', error);
                }
            }

            // Get verification history
            const history = await blockchainService.getVerificationHistory(values.secretId);
            setVerificationHistory(history);

            // Create verification result
            setVerificationResult({
                productName: extendedDetails.name || productDetails.manufacturerName,
                manufacturer: productDetails.manufacturerName,
                manufacturingDate: new Date(productDetails.manufactureDate).toLocaleDateString(),
                verificationTime: new Date().toLocaleString(),
                isAuthentic: isAuthentic,
                productId: values.secretId
            });

            setVerificationSuccess(true);
            setToast(isAuthentic ? 'Product verified as authentic!' : 'Warning: Product verification failed!');

            setLoading(false);
            setSubmitting(false);
        } catch (error) {
            console.error('Error verifying product:', error);
            setToast('Failed to verify product: ' + error.message);
            setLoading(false);
            setSubmitting(false);
        }
    };

    // Reset verification state
    const handleReset = () => {
        setVerificationSuccess(false);
        setVerificationResult(null);
        setSecretId('');
    };

    // View product details
    const handleViewDetails = () => {
        navigate(`/product/${verificationResult.productId}`);
    };

    // Report counterfeit
    const handleReportCounterfeit = () => {
        navigate(`/report/${verificationResult.productId}`);
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <section className="form-section">
            <div className="form-container">
                <div className="form-frame">
                    <div className="form-header">
                        <h2>Verify Product</h2>
                        {!verificationSuccess && (
                            <p>Enter a product ID or scan a QR code to verify authenticity</p>
                        )}
                    </div>

                    {!verificationSuccess ? (
                        <div className="form-body">
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="product-form">
                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Product ID</BootstrapForm.Label>
                                                <div className="d-flex">
                                                    <Field
                                                        type="text"
                                                        name="secretId"
                                                        placeholder="Enter the product ID"
                                                        className="form-control"
                                                    />
                                                    <Link
                                                        to="/scan"
                                                        state={{ returnTo: '/buy', stateKey: 'secretIdState' }}
                                                        className="scan-button"
                                                    >
                                                        <i className="bi bi-qr-code-scan"></i>
                                                    </Link>
                                                </div>
                                                <ErrorMessage name="secretId" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Button
                                            type="submit"
                                            className="submit-button"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-shield-check me-2"></i>
                                                    Verify Product
                                                </>
                                            )}
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    ) : (
                        <div className="form-body">
                            <Alert
                                variant={verificationResult.isAuthentic ? "success" : "danger"}
                                className="text-center mb-4 verification-alert"
                            >
                                <i className={`bi ${verificationResult.isAuthentic ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} style={{ fontSize: '3rem', display: 'block', margin: '0 auto 1rem' }}></i>
                                <h4>
                                    {verificationResult.isAuthentic
                                        ? 'Product Verified Successfully!'
                                        : 'Verification Failed - Potential Counterfeit!'}
                                </h4>
                                <p>
                                    {verificationResult.isAuthentic
                                        ? 'This product has been verified as authentic on the blockchain.'
                                        : 'Warning: This product could not be verified as authentic. It may be counterfeit.'}
                                </p>
                            </Alert>

                            {verificationResult && (
                                <div className="product-details p-3 mb-4">
                                    <h5 className="mb-3">Product Information</h5>
                                    <p><strong>Product Name:</strong> {verificationResult.productName}</p>
                                    <p><strong>Manufacturer:</strong> {verificationResult.manufacturer}</p>
                                    <p><strong>Manufacturing Date:</strong> {verificationResult.manufacturingDate}</p>
                                    <p><strong>Verification Time:</strong> {verificationResult.verificationTime}</p>
                                    
                                    {verificationHistory.length > 0 && (
                                        <div className="verification-count mt-3">
                                            <p className="mb-0"><strong>Verification History:</strong> {verificationHistory.length} {verificationHistory.length === 1 ? 'time' : 'times'}</p>
                                            <p className="text-muted small mb-0">Last verification: {new Date(verificationHistory[0].timestamp).toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="d-grid gap-3">
                                <Button
                                    variant="primary"
                                    onClick={handleViewDetails}
                                    className="action-button"
                                >
                                    <i className="bi bi-info-circle me-2"></i>
                                    View Complete Details
                                </Button>
                                
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleReset}
                                    className="action-button"
                                >
                                    <i className="bi bi-arrow-repeat me-2"></i>
                                    Verify Another Product
                                </Button>

                                {!verificationResult.isAuthentic && (
                                    <Button
                                        variant="danger"
                                        onClick={handleReportCounterfeit}
                                        className="action-button mt-2"
                                    >
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        Report Counterfeit
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default BuyProduct;
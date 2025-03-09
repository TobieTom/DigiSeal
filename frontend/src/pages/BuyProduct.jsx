// src/pages/BuyProduct.jsx
import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { secretIdState, toastState } from '../store/atoms'
import Loader from '../components/common/Loader'
import '../styles/forms.css'

function BuyProduct() {
    const [secretId, setSecretId] = useRecoilState(secretIdState)
    const setToast = useSetRecoilState(toastState)
    const [loading, setLoading] = useState(false)
    const [verificationSuccess, setVerificationSuccess] = useState(false)
    const [verificationResult, setVerificationResult] = useState(null)

    // Validation schema
    const validationSchema = Yup.object({
        secretId: Yup.string()
            .required('Product ID is required')
            .max(30, 'Product ID must be less than 30 characters'),
    })

    // Initial form values
    const initialValues = {
        secretId: secretId || '',
    }

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setLoading(true)

            // Simulate product verification
            setTimeout(() => {
                // Simulate success
                setVerificationSuccess(true)
                setVerificationResult({
                    productName: 'Luxury Watch Model X123',
                    manufacturer: 'Premium Timepieces Ltd.',
                    manufacturingDate: '2023-06-15',
                    verificationTime: new Date().toLocaleString()
                })
                
                // Show success message
                setToast('Product verified successfully!')

                setLoading(false)
                setSubmitting(false)
            }, 1500)
        } catch (error) {
            console.error('Error verifying product:', error)
            setToast('Failed to verify product. Verification failed.')
            setLoading(false)
            setSubmitting(false)
        }
    }

    // Reset verification state
    const handleReset = () => {
        setVerificationSuccess(false)
        setVerificationResult(null)
        setSecretId('')
    }

    return (
        <section className="form-section">
            <div className="form-container">
                <div className="form-frame">
                    {loading ? (
                        <Loader size="normal" />
                    ) : (
                        <>
                            <div className="form-header">
                                <h2>Verify Product</h2>
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
                                                    {isSubmitting ? 'Verifying...' : 'Verify Product'}
                                                </Button>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            ) : (
                                <div className="form-body">
                                    <Alert variant="success" className="text-center mb-4">
                                        <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem', display: 'block', margin: '0 auto 1rem' }}></i>
                                        <h4>Product Verified Successfully!</h4>
                                    </Alert>
                                    
                                    {verificationResult && (
                                        <div className="product-details p-3 mb-4" style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                            <p><strong>Product Name:</strong> {verificationResult.productName}</p>
                                            <p><strong>Manufacturer:</strong> {verificationResult.manufacturer}</p>
                                            <p><strong>Manufacturing Date:</strong> {verificationResult.manufacturingDate}</p>
                                            <p className="mb-0"><strong>Verification Time:</strong> {verificationResult.verificationTime}</p>
                                        </div>
                                    )}
                                    
                                    <div className="d-grid">
                                        <Button 
                                            variant="outline-light" 
                                            onClick={handleReset}
                                        >
                                            Verify Another Product
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export default BuyProduct
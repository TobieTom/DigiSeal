// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button, Container } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { productIdHomeState, toastState } from '../store/atoms'
import '../styles/home.css'

function Home() {
    const navigate = useNavigate()
    const productId = useRecoilValue(productIdHomeState)
    const setToast = useSetRecoilState(toastState)

    // Validation schema
    const validationSchema = Yup.object({
        productId: Yup.string()
            .required('Product ID is required')
            .max(30, 'Product ID must be at most 30 characters'),
    })

    // Form initial values
    const initialValues = {
        productId: productId || '',
    }

    // Handle form submission
    const handleSubmit = (values) => {
        try {
            navigate(`/product/${values.productId}`)
        } catch (error) {
            console.error('Error:', error)
            setToast('Failed to verify product. Please try again.')
        }
    }

    return (
        <>
            <section className="hero-section">
                <Container>
                    <div className="hero-content">
                        <h1>Authenticate Products with Blockchain</h1>
                        <p>
                            Our blockchain-based verification system ensures product authenticity,
                            tracks ownership history, and protects against counterfeits.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/scan" className="hero-button primary">
                                <i className="bi bi-qr-code-scan"></i> Scan QR Code
                            </Link>
                            <Link to="/login" className="hero-button secondary">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="verify-section">
                <Container>
                    <div className="section-header">
                        <h2>Verify Your Product</h2>
                        <p>Enter a product ID or scan a QR code to check authenticity</p>
                    </div>

                    <div className="verify-form-container">
                        <div className="verify-form-frame">
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="verify-form">
                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <div className="input-with-button">
                                                    <Field
                                                        type="text"
                                                        name="productId"
                                                        placeholder="Enter product ID"
                                                        className="form-control"
                                                    />
                                                    <Link
                                                        to="/scan"
                                                        state={{ returnTo: '/', stateKey: 'productIdHomeState' }}
                                                        className="scan-button-input"
                                                    >
                                                        <i className="bi bi-qr-code-scan"></i>
                                                    </Link>
                                                </div>
                                                <ErrorMessage name="productId" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Button
                                            type="submit"
                                            className="verify-button"
                                            disabled={isSubmitting}
                                        >
                                            Verify Product
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="features-section">
                <Container>
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <p>Blockchain technology ensures secure and transparent product verification</p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="bi bi-shield-check" style={{fontSize: "48px"}}></i>
                            </div>
                            <h3>Verify Authenticity</h3>
                            <p>Instantly verify if a product is authentic using our blockchain technology.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="bi bi-patch-check" style={{fontSize: "48px"}}></i>
                            </div>
                            <h3>Check History</h3>
                            <p>View complete product information, manufacturing details, and ownership history.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="bi bi-shop" style={{fontSize: "48px"}}></i>
                            </div>
                            <h3>Secure Purchases</h3>
                            <p>Buy with confidence knowing your products are verified and authentic.</p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <i className="bi bi-box-seam" style={{fontSize: "48px"}}></i>
                            </div>
                            <h3>Track Products</h3>
                            <p>Manufacturers can register products and track their full lifecycle.</p>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="benefits-section">
                <Container>
                    <div className="benefits-container">
                        <div className="benefits-content">
                            <h2>Benefits of Blockchain Verification</h2>
                            <ul className="benefits-list">
                                <li>
                                    <span className="check-icon">✓</span>
                                    <span>Immutable records that cannot be tampered with</span>
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    <span>Complete transparency in the supply chain</span>
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    <span>Reduced counterfeit products in the market</span>
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    <span>Enhanced consumer trust and confidence</span>
                                </li>
                                <li>
                                    <span className="check-icon">✓</span>
                                    <span>Secure and verifiable transfer of ownership</span>
                                </li>
                            </ul>
                            <Link to="/login" className="benefits-button">
                                Get Started Now
                            </Link>
                        </div>
                        <div className="benefits-image">
                            <div className="blockchain-graphic">
                                <div className="block block-1">
                                    <div className="block-header">Block #1</div>
                                    <div className="block-content">
                                        <div className="hash">Hash: 0x3f7...</div>
                                        <div className="data">Product Data</div>
                                    </div>
                                </div>
                                <div className="block-connector"></div>
                                <div className="block block-2">
                                    <div className="block-header">Block #2</div>
                                    <div className="block-content">
                                        <div className="hash">Hash: 0x9d2...</div>
                                        <div className="data">Owner Data</div>
                                    </div>
                                </div>
                                <div className="block-connector"></div>
                                <div className="block block-3">
                                    <div className="block-header">Block #3</div>
                                    <div className="block-content">
                                        <div className="hash">Hash: 0xe1a...</div>
                                        <div className="data">Transfer Data</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    )
}

export default Home
// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Form as BootstrapForm, Row, Col, Button, Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { productIdHomeState, toastState } from '../store/atoms';
import '../styles/home.css';

function Home() {
    const navigate = useNavigate();
    const productId = useRecoilValue(productIdHomeState);
    const setToast = useSetRecoilState(toastState);

    // Validation schema
    const validationSchema = Yup.object({
        productId: Yup.string()
            .required('Product ID is required')
            .max(50, 'Product ID must be at most 50 characters'),
    });

    // Form initial values
    const initialValues = {
        productId: productId || '',
    };

    // Handle form submission
    const handleSubmit = (values) => {
        try {
            navigate(`/product/${values.productId}`);
        } catch (error) {
            console.error('Error:', error);
            setToast('Failed to verify product. Please try again.');
        }
    };

    return (
        <>
            <section className="hero-section">
                <Container>
                    <div className="hero-content">
                        <h1>Authenticate Products with Blockchain</h1>
                        <p>
                            DigiSeal uses blockchain technology to verify product authenticity,
                            track ownership history, and protect consumers from counterfeits.
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
                        <h2>Verify Product Authenticity</h2>
                        <p>Enter a product ID or scan a QR code to check if a product is genuine</p>
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
                                            <i className="bi bi-shield-check me-2"></i>
                                            Verify Product
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="how-it-works-section">
                <Container>
                    <div className="section-header">
                        <h2>How DigiSeal Works</h2>
                        <p>Combining blockchain technology with easy-to-use verification tools</p>
                    </div>

                    <div className="process-steps">
                        <div className="process-step">
                            <div className="step-number">1</div>
                            <div className="step-icon">
                                <i className="bi bi-box-seam"></i>
                            </div>
                            <div className="step-content">
                                <h3>Manufacturer Registers Product</h3>
                                <p>Products are registered on the blockchain with unique identifiers and detailed specifications</p>
                            </div>
                        </div>
                        
                        <div className="step-connector"></div>
                        
                        <div className="process-step">
                            <div className="step-number">2</div>
                            <div className="step-icon">
                                <i className="bi bi-arrow-left-right"></i>
                            </div>
                            <div className="step-content">
                                <h3>Secure Transfer of Ownership</h3>
                                <p>Each transfer in the supply chain is recorded on the immutable blockchain</p>
                            </div>
                        </div>
                        
                        <div className="step-connector"></div>
                        
                        <div className="process-step">
                            <div className="step-number">3</div>
                            <div className="step-icon">
                                <i className="bi bi-qr-code"></i>
                            </div>
                            <div className="step-content">
                                <h3>QR Code Generation</h3>
                                <p>Unique QR codes are generated for easy scanning and verification</p>
                            </div>
                        </div>
                        
                        <div className="step-connector"></div>
                        
                        <div className="process-step">
                            <div className="step-number">4</div>
                            <div className="step-icon">
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <div className="step-content">
                                <h3>Consumer Verification</h3>
                                <p>Customers can easily verify product authenticity and view full history</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="features-section">
                <Container>
                    <div className="section-header">
                        <h2>Key Features</h2>
                        <p>DigiSeal offers powerful tools to combat counterfeiting</p>
                    </div>

                    <div className="features-grid">
                        <Card className="feature-card">
                            <Card.Body>
                                <div className="feature-icon">
                                    <i className="bi bi-shield-check"></i>
                                </div>
                                <h3>Verify Authenticity</h3>
                                <p>Instantly verify if a product is authentic using secure blockchain technology.</p>
                            </Card.Body>
                        </Card>

                        <Card className="feature-card">
                            <Card.Body>
                                <div className="feature-icon">
                                    <i className="bi bi-patch-check"></i>
                                </div>
                                <h3>Complete History</h3>
                                <p>View complete product information, manufacturing details, and ownership history.</p>
                            </Card.Body>
                        </Card>

                        <Card className="feature-card">
                            <Card.Body>
                                <div className="feature-icon">
                                    <i className="bi bi-shop"></i>
                                </div>
                                <h3>Secure Purchases</h3>
                                <p>Buy with confidence knowing your products are verified and authentic.</p>
                            </Card.Body>
                        </Card>

                        <Card className="feature-card">
                            <Card.Body>
                                <div className="feature-icon">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <h3>Lifecycle Tracking</h3>
                                <p>Manufacturers can register products and track their full lifecycle.</p>
                            </Card.Body>
                        </Card>
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
                                        <div className="data">Product Registration</div>
                                    </div>
                                </div>
                                <div className="block-connector"></div>
                                <div className="block block-2">
                                    <div className="block-header">Block #2</div>
                                    <div className="block-content">
                                        <div className="hash">Hash: 0x9d2...</div>
                                        <div className="data">Ownership Transfer</div>
                                    </div>
                                </div>
                                <div className="block-connector"></div>
                                <div className="block block-3">
                                    <div className="block-header">Block #3</div>
                                    <div className="block-content">
                                        <div className="hash">Hash: 0xe1a...</div>
                                        <div className="data">Verification Event</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <section className="cta-section">
                <Container>
                    <div className="cta-content">
                        <h2>Ready to Combat Counterfeiting?</h2>
                        <p>Join DigiSeal today and protect your products and customers</p>
                        <div className="cta-buttons">
                            <Link to="/login" className="cta-button primary">
                                Create Account
                            </Link>
                            <Link to="/scan" className="cta-button secondary">
                                Try Product Verification
                            </Link>
                        </div>
                    </div>
                </Container>
            </section>
        </>
    );
}

export default Home;
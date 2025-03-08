import { useNavigate } from 'react-router-dom'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button } from 'react-bootstrap'
import { BiScan } from 'react-icons/bi'
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
        <div className="container home-container">
            <section className="verify-section">
                <div className="verify-form-container">
                    <div className="verify-form-frame">
                        <div className="form-header">
                            <h2>Enter Product ID</h2>
                        </div>
                        <div className="form-body">
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="verify-form">
                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Product ID</BootstrapForm.Label>
                                                <div className="d-flex">
                                                    <Field
                                                        type="text"
                                                        name="productId"
                                                        placeholder="Enter product ID"
                                                        className="form-control"
                                                    />
                                                    <Link
                                                        to="/scan"
                                                        state={{ returnTo: '/', stateKey: 'productIdHomeState' }}
                                                        className="scan-button"
                                                    >
                                                        <BiScan size={24} />
                                                    </Link>
                                                </div>
                                                <ErrorMessage name="productId" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Button
                                            type="submit"
                                            className="submit-button"
                                            disabled={isSubmitting}
                                        >
                                            Verify Product
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </section>

            <section className="info-section">
                <div className="info-container">
                    <h2>How it Works</h2>
                    <div className="info-cards">
                        <div className="info-card">
                            <div className="card-icon">
                                <BiScan size={48} />
                            </div>
                            <h3>Scan QR Code</h3>
                            <p>Use the scanner to read product QR codes or enter the product ID manually.</p>
                        </div>

                        <div className="info-card">
                            <div className="card-icon">
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <h3>Verify Authenticity</h3>
                            <p>Our blockchain technology instantly verifies if the product is genuine.</p>
                        </div>

                        <div className="info-card">
                            <div className="card-icon">
                                <i className="bi bi-info-circle"></i>
                            </div>
                            <h3>View Details</h3>
                            <p>See complete product information, manufacturing details, and ownership history.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
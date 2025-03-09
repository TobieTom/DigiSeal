// src/pages/BuyProduct.jsx
import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { secretIdState, toastState } from '../store/atoms'
import Loader from '../components/common/Loader'
import '../styles/forms.css'

function BuyProduct() {
    const [secretId, setSecretId] = useRecoilState(secretIdState)
    const setToast = useSetRecoilState(toastState)
    const [loading, setLoading] = useState(false)

    // Validation schema
    const validationSchema = Yup.object({
        secretId: Yup.string()
            .required('Secret ID is required')
            .max(30, 'Secret ID must be less than 30 characters'),
    })

    // Initial form values
    const initialValues = {
        secretId: secretId || '',
    }

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setLoading(true)

            // This is a placeholder for actual verification
            // We'll simulate a successful verification for now
            setTimeout(() => {
                // Reset the form and secret ID state
                setSecretId('')
                resetForm()

                // Show success message
                setToast('Product verified successfully!')

                setLoading(false)
                setSubmitting(false)
            }, 2000)
        } catch (error) {
            console.error('Error verifying product:', error)
            setToast('Failed to verify product. Verification failed.')
            setLoading(false)
            setSubmitting(false)
        }
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
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export default BuyProduct
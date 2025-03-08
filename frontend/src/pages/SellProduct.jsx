import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button } from 'react-bootstrap'
import { BiScan } from 'react-icons/bi'
import { Link } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { buyerAddressState, productIdState, toastState } from '../store/atoms'
import Loader from '../components/common/Loader'
import '../styles/forms.css'

function SellProduct() {
    const [buyerAddress, setBuyerAddress] = useRecoilState(buyerAddressState)
    const [productId, setProductId] = useRecoilState(productIdState)
    const setToast = useSetRecoilState(toastState)
    const [loading, setLoading] = useState(false)

    // Validation schema
    const validationSchema = Yup.object({
        productId: Yup.string()
            .required('Product ID is required')
            .max(30, 'Product ID must be less than 30 characters'),
        address: Yup.string()
            .required('Buyer address is required')
            .max(50, 'Enter a valid wallet address')
            .min(16, 'Address is too short'),
    })

    // Initial form values
    const initialValues = {
        productId: productId || '',
        address: buyerAddress || '',
    }

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setLoading(true)

            // This is a placeholder for actual blockchain transaction
            // Will be replaced with real blockchain interaction
            console.log('Selling product:', values)

            setTimeout(() => {
                // Reset form and state
                setBuyerAddress('')
                setProductId('')
                resetForm()

                // Show success message
                setToast('Product sold successfully!')

                setLoading(false)
                setSubmitting(false)
            }, 2000)
        } catch (error) {
            console.error('Error selling product:', error)
            setToast('Failed to sell product. Please try again.')
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
                                <h2>Sell To Other Sellers</h2>
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
                                                    <BootstrapForm.Label>Address of buyer</BootstrapForm.Label>
                                                    <div className="d-flex">
                                                        <Field
                                                            type="text"
                                                            name="address"
                                                            placeholder="Buyer's wallet address"
                                                            className="form-control"
                                                        />
                                                        <Link
                                                            to="/scan"
                                                            state={{ returnTo: '/sell', stateKey: 'buyerAddressState' }}
                                                            className="scan-button"
                                                        >
                                                            <BiScan size={24} />
                                                        </Link>
                                                    </div>
                                                    <ErrorMessage name="address" component="div" className="error-message" />
                                                </BootstrapForm.Group>
                                            </Row>

                                            <Row className="mb-3">
                                                <BootstrapForm.Group as={Col}>
                                                    <BootstrapForm.Label>Product ID</BootstrapForm.Label>
                                                    <div className="d-flex">
                                                        <Field
                                                            type="text"
                                                            name="productId"
                                                            placeholder="Product ID"
                                                            className="form-control"
                                                        />
                                                        <Link
                                                            to="/scan"
                                                            state={{ returnTo: '/sell', stateKey: 'productIdState' }}
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
                                                {isSubmitting ? 'Processing...' : 'Sell Product'}
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

export default SellProduct
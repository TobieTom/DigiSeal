import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button } from 'react-bootstrap'
import { useSetRecoilState } from 'recoil'
import { toastState } from '../store/atoms'
import blockchainService from '../services/BlockchainService'
import Loader from '../components/common/Loader'
import '../styles/forms.css'

function RegisterSeller() {
    const [loading, setLoading] = useState(false)
    const setToast = useSetRecoilState(toastState)
    const navigate = useNavigate()

    // Validation schema
    const validationSchema = Yup.object({
        address: Yup.string()
            .required('Seller address is required')
            .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
        name: Yup.string()
            .required('Business name is required')
            .max(50, 'Name should be less than 50 characters'),
        details: Yup.string()
            .required('Business details are required')
            .max(160, 'Details should be less than 160 characters'),
    })

    // Initial form values
    const initialValues = {
        address: '',
        name: '',
        details: ''
    }

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setLoading(true)

            // Register seller on blockchain
            await blockchainService.registerSeller(values.address)

            setToast('Registered as seller successfully!')
            setLoading(false)
            setSubmitting(false)
            navigate('/dashboard')
        } catch (error) {
            console.error('Error registering seller:', error)
            setToast('Failed to register as seller: ' + error.message)
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
                                <h2>Register Seller</h2>
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
                                                    <BootstrapForm.Label>Seller Address</BootstrapForm.Label>
                                                    <Field
                                                        type="text"
                                                        name="address"
                                                        placeholder="0x..."
                                                        className="form-control"
                                                    />
                                                    <ErrorMessage name="address" component="div" className="error-message" />
                                                </BootstrapForm.Group>
                                            </Row>

                                            <Row className="mb-3">
                                                <BootstrapForm.Group as={Col}>
                                                    <BootstrapForm.Label>Business Name</BootstrapForm.Label>
                                                    <Field
                                                        type="text"
                                                        name="name"
                                                        placeholder="Company name"
                                                        className="form-control"
                                                    />
                                                    <ErrorMessage name="name" component="div" className="error-message" />
                                                </BootstrapForm.Group>
                                            </Row>

                                            <Row className="mb-3">
                                                <BootstrapForm.Group as={Col}>
                                                    <BootstrapForm.Label>Business Details</BootstrapForm.Label>
                                                    <Field
                                                        as="textarea"
                                                        rows="4"
                                                        name="details"
                                                        placeholder="Shop Address/Business Details"
                                                        className="form-control"
                                                    />
                                                    <ErrorMessage name="details" component="div" className="error-message" />
                                                </BootstrapForm.Group>
                                            </Row>

                                            <Button
                                                type="submit"
                                                className="submit-button"
                                                disabled={isSubmitting || loading}
                                            >
                                                {isSubmitting || loading ? 'Registering...' : 'Register Seller'}
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

export default RegisterSeller
// src/pages/AddOwner.jsx
import { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { newOwnerState, toastState } from '../store/atoms'
import Loader from '../components/common/Loader'
import '../styles/forms.css'

function AddOwner() {
    const [newOwner, setNewOwner] = useRecoilState(newOwnerState)
    const setToast = useSetRecoilState(toastState)
    const [loading, setLoading] = useState(false)

    // Validation schema
    const validationSchema = Yup.object({
        address: Yup.string()
            .required('Owner address is required')
            .max(60, 'Address is too long'),
    })

    // Initial form values
    const initialValues = {
        address: newOwner || '',
    }

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setLoading(true)

            // This is a placeholder for actual transfer
            console.log('Transferring ownership to:', values.address)

            // Simulate transaction
            setTimeout(() => {
                // Reset form and state
                setNewOwner('')
                resetForm()

                // Show success message
                setToast('Ownership transferred successfully!')

                setLoading(false)
                setSubmitting(false)
            }, 2000)
        } catch (error) {
            console.error('Error transferring ownership:', error)
            setToast('Failed to transfer ownership. Please try again.')
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
                                <h2>Transfer Ownership</h2>
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
                                                    <BootstrapForm.Label>New Owner's Address</BootstrapForm.Label>
                                                    <div className="d-flex">
                                                        <Field
                                                            type="text"
                                                            name="address"
                                                            placeholder="New owner's address"
                                                            className="form-control"
                                                        />
                                                        <Link
                                                            to="/scan"
                                                            state={{ returnTo: '/addowner', stateKey: 'newOwnerState' }}
                                                            className="scan-button"
                                                        >
                                                            <i className="bi bi-qr-code-scan"></i>
                                                        </Link>
                                                    </div>
                                                    <ErrorMessage name="address" component="div" className="error-message" />
                                                </BootstrapForm.Group>
                                            </Row>

                                            <Button
                                                type="submit"
                                                className="submit-button"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Processing...' : 'Transfer Ownership'}
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

export default AddOwner
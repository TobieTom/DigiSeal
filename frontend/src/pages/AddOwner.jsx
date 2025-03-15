// src/pages/AddOwner.jsx
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Form as BootstrapForm, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { newOwnerState, productIdState, toastState } from '../store/atoms';
import blockchainService from '../services/BlockchainService';
import Loader from '../components/common/Loader';
import '../styles/forms.css';

function AddOwner() {
    const [newOwner, setNewOwner] = useRecoilState(newOwnerState);
    const [productId, setProductId] = useRecoilState(productIdState);
    const setToast = useSetRecoilState(toastState);
    const [loading, setLoading] = useState(false);

    // Validation schema
    const validationSchema = Yup.object({
        address: Yup.string()
            .required('Owner address is required')
            .matches(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format'),
        productId: Yup.string()
            .required('Product ID is required'),
        transferConditions: Yup.string()
    });

    // Initial form values
    const initialValues = {
        address: newOwner || '',
        productId: productId || '',
        transferConditions: ''
    };

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setLoading(true);

            console.log("Transferring ownership:", values);

            // Initialize blockchain service
            await blockchainService.init();

            // Transfer ownership on blockchain
            const result = await blockchainService.transferOwnership(
                values.productId,
                values.address,
                values.transferConditions
            );

            console.log("Transfer result:", result);

            // Reset form and state
            setNewOwner('');
            setProductId('');
            resetForm();

            // Show success message
            setToast('Ownership transferred successfully!');

            setLoading(false);
            setSubmitting(false);
        } catch (error) {
            console.error('Error transferring ownership:', error);
            setToast('Failed to transfer ownership: ' + error.message);
            setLoading(false);
            setSubmitting(false);
        }
    };

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
                                                            state={{ returnTo: '/addowner', stateKey: 'productIdState' }}
                                                            className="scan-button"
                                                        >
                                                            <i className="bi bi-qr-code-scan"></i>
                                                        </Link>
                                                    </div>
                                                    <ErrorMessage name="productId" component="div" className="error-message" />
                                                </BootstrapForm.Group>
                                            </Row>

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

                                            <Row className="mb-3">
                                                <BootstrapForm.Group as={Col}>
                                                    <BootstrapForm.Label>Transfer Conditions (Optional)</BootstrapForm.Label>
                                                    <Field
                                                        as="textarea"
                                                        name="transferConditions"
                                                        placeholder="E.g., Shipped via secure courier, temperature controlled"
                                                        className="form-control"
                                                        rows="3"
                                                    />
                                                    <ErrorMessage name="transferConditions" component="div" className="error-message" />
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
    );
}

export default AddOwner;
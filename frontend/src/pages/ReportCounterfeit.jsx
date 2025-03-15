// src/pages/ReportCounterfeit.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Form as BootstrapForm, Row, Col, Button, Alert, Card } from 'react-bootstrap';
import { useSetRecoilState } from 'recoil';
import { toastState } from '../store/atoms';
import blockchainService from '../services/BlockchainService';
import Loader from '../components/common/Loader';
import '../styles/forms.css';

function ReportCounterfeit() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const { id: productId } = useParams();
    const setToast = useSetRecoilState(toastState);
    const navigate = useNavigate();

    // Validation schema
    const validationSchema = Yup.object({
        productId: Yup.string().required('Product ID is required'),
        description: Yup.string().required('Please describe why you believe this product is counterfeit'),
        location: Yup.string().required('Please provide where you found this product')
    });

    // Initial form values
    const initialValues = {
        productId: productId || '',
        description: '',
        location: '',
        evidenceHash: '' // This would be used if we implemented file uploads
    };

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setLoading(true);

            // Initialize blockchain service
            await blockchainService.init();

            // Call blockchain service to report counterfeit
            const result = await blockchainService.reportCounterfeit(
                values.productId,
                values.evidenceHash || '',
                values.description,
                values.location
            );

            console.log('Counterfeit report result:', result);

            // Set success state and show toast
            setSuccess(true);
            setToast('Counterfeit report submitted successfully');

            // Redirect after a brief delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 3000);

        } catch (error) {
            console.error('Error reporting counterfeit:', error);
            setToast('Failed to submit report: ' + error.message);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    return (
        <section className="form-section">
            <div className="container">
                <Row className="justify-content-center">
                    <Col lg={8} md={10}>
                        <Card className="form-card">
                            <Card.Header className="form-card-header">
                                <h2>Report Counterfeit Product</h2>
                                <p>Submit information about a suspected counterfeit product</p>
                            </Card.Header>

                            <Card.Body>
                                {loading ? (
                                    <Loader size="normal" />
                                ) : success ? (
                                    <Alert variant="success">
                                        <Alert.Heading>Report Submitted Successfully</Alert.Heading>
                                        <p>
                                            Thank you for your report. Our team will investigate this case and take appropriate action.
                                            You will be redirected to the dashboard shortly.
                                        </p>
                                    </Alert>
                                ) : (
                                    <Formik
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={handleSubmit}
                                    >
                                        {({ isSubmitting }) => (
                                            <Form>
                                                <Row className="mb-3">
                                                    <BootstrapForm.Group as={Col}>
                                                        <BootstrapForm.Label>Product ID</BootstrapForm.Label>
                                                        <Field
                                                            type="text"
                                                            name="productId"
                                                            className="form-control"
                                                            disabled={productId ? true : false}
                                                        />
                                                        <ErrorMessage name="productId" component="div" className="error-message" />
                                                    </BootstrapForm.Group>
                                                </Row>

                                                <Row className="mb-3">
                                                    <BootstrapForm.Group as={Col}>
                                                        <BootstrapForm.Label>Description of Issue</BootstrapForm.Label>
                                                        <Field
                                                            as="textarea"
                                                            name="description"
                                                            className="form-control"
                                                            rows="4"
                                                            placeholder="Please describe why you believe this product is counterfeit"
                                                        />
                                                        <ErrorMessage name="description" component="div" className="error-message" />
                                                    </BootstrapForm.Group>
                                                </Row>

                                                <Row className="mb-3">
                                                    <BootstrapForm.Group as={Col}>
                                                        <BootstrapForm.Label>Location</BootstrapForm.Label>
                                                        <Field
                                                            type="text"
                                                            name="location"
                                                            className="form-control"
                                                            placeholder="Where did you find or purchase this product?"
                                                        />
                                                        <ErrorMessage name="location" component="div" className="error-message" />
                                                    </BootstrapForm.Group>
                                                </Row>

                                                <div className="d-flex justify-content-between mt-4">
                                                    <Button
                                                        variant="outline-secondary"
                                                        onClick={() => navigate(-1)}
                                                    >
                                                        Cancel
                                                    </Button>

                                                    <Button
                                                        type="submit"
                                                        variant="danger"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Submitting...' : 'Report Counterfeit'}
                                                    </Button>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        </section>
    );
}

export default ReportCounterfeit;
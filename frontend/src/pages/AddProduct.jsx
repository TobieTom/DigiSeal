// src/pages/AddProduct.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useSetRecoilState } from 'recoil';
import { toastState } from '../store/atoms';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/BlockchainService';
import '../styles/forms.css';

function AddProduct() {
    const [productId, setProductId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const setToast = useSetRecoilState(toastState);
    const navigate = useNavigate();
    const { userAddress } = useAuth();

    // Validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Product name is required')
            .max(250, 'Product name should be less than 250 characters'),
        price: Yup.string()
            .required('Price is required')
            .matches(/^\d+(\.\d{1,2})?$/, 'Price must be a valid number'),
        productId: Yup.string()
            .required('Product ID is required')
            .max(50, 'Product ID should be less than 50 characters')
            .matches(/^[a-zA-Z0-9-_]+$/, 'Product ID can only contain letters, numbers, hyphens, and underscores'),
        manufacturingLocation: Yup.string()
            .required('Manufacturing location is required'),
        description: Yup.string()
            .required('Product description is required')
            .min(10, 'Description should be at least 10 characters'),
        specifications: Yup.string()
    });

    // Initial form values
    const initialValues = {
        name: '',
        price: '',
        productId: '',
        manufacturingLocation: '',
        description: '',
        specifications: ''
    };

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        try {
            setLoading(true);
            setError('');
            setSuccess(false);

            // Store product details in an object
            const productDetails = {
                name: values.name,
                price: values.price,
                description: values.description,
                specifications: values.specifications || '',
                dateAdded: new Date().toISOString(),
                addedBy: userAddress
            };

            // Convert to JSON string
            const productDetailsString = JSON.stringify(productDetails);

            // Register product on blockchain
            const result = await blockchainService.registerProduct(
                values.productId,
                values.name, // Use name as manufacturer name
                productDetailsString, // Pass the stringified details directly
                values.manufacturingLocation
            );

            console.log('Product registered on blockchain:', result);
            setProductId(values.productId);
            setToast('Product added successfully');
            setSuccess(true);
            resetForm();
            
            // Navigate to QR code page after successful registration
            setTimeout(() => {
                navigate(`/qrcode/${values.productId}`);
            }, 5000);
        } catch (error) {
            console.error('Error adding product:', error);
            setError(error.message || 'Failed to add product. Please try again.');
            setToast('Failed to add product: ' + error.message);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    // Generate a random product ID for user convenience
    const generateRandomId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'PROD-';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    return (
        <section className="form-section">
            <div className="form-container">
                <div className="form-frame">
                    <div className="form-header">
                        <h2>Add New Product</h2>
                        <p>Register a new product on the blockchain</p>
                    </div>

                    <div className="form-body">
                        {error && (
                            <Alert variant="danger" className="mb-4">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                {error}
                            </Alert>
                        )}

                        {success && (
                            <Alert variant="success" className="mb-4">
                                <i className="bi bi-check-circle-fill me-2"></i>
                                Product <strong>{productId}</strong> has been successfully registered on the blockchain!
                                <div className="mt-2">
                                    Redirecting to QR code page...
                                </div>
                            </Alert>
                        )}

                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting, setFieldValue, values }) => (
                                <FormikForm className="product-form">
                                    <Row className="mb-3">
                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Product Name</Form.Label>
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Enter product name"
                                                className="form-control"
                                            />
                                            <ErrorMessage name="name" component="div" className="error-message" />
                                        </Form.Group>

                                        <Form.Group as={Col} md={6}>
                                            <Form.Label>Price</Form.Label>
                                            <Field
                                                type="text"
                                                name="price"
                                                placeholder="Enter price (e.g., 99.99)"
                                                className="form-control"
                                            />
                                            <ErrorMessage name="price" component="div" className="error-message" />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Product ID</Form.Label>
                                            <div className="d-flex">
                                                <Field
                                                    type="text"
                                                    name="productId"
                                                    placeholder="Enter unique product ID"
                                                    className="form-control"
                                                />
                                                <Button 
                                                    variant="outline-secondary"
                                                    onClick={() => setFieldValue('productId', generateRandomId())}
                                                    className="ms-2"
                                                >
                                                    Generate
                                                </Button>
                                            </div>
                                            <ErrorMessage name="productId" component="div" className="error-message" />
                                            <small className="form-text text-muted">
                                                Create a unique identifier for this product
                                            </small>
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Manufacturing Location</Form.Label>
                                            <Field
                                                type="text"
                                                name="manufacturingLocation"
                                                placeholder="City, Country"
                                                className="form-control"
                                            />
                                            <ErrorMessage name="manufacturingLocation" component="div" className="error-message" />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Description</Form.Label>
                                            <Field
                                                as="textarea"
                                                name="description"
                                                placeholder="Detailed product description"
                                                className="form-control"
                                                rows="4"
                                            />
                                            <ErrorMessage name="description" component="div" className="error-message" />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Specifications (Optional)</Form.Label>
                                            <Field
                                                as="textarea"
                                                name="specifications"
                                                placeholder="Technical specifications, materials, dimensions, etc."
                                                className="form-control"
                                                rows="3"
                                            />
                                            <ErrorMessage name="specifications" component="div" className="error-message" />
                                        </Form.Group>
                                    </Row>

                                    <div className="d-flex justify-content-between mt-4">
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => navigate('/dashboard')}
                                        >
                                            Cancel
                                        </Button>
                                        
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={isSubmitting || loading}
                                        >
                                            {isSubmitting || loading ? (
                                                <>
                                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                                    Registering Product...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-plus-circle me-2"></i>
                                                    Register Product
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </FormikForm>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AddProduct;
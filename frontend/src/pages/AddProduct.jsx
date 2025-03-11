import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useSetRecoilState } from 'recoil'
import { toastState } from '../store/atoms'
import { useAuth } from '../context/AuthContext'
import blockchainService from '../services/BlockchainService'
import ipfsService from '../services/IPFSService'
import '../styles/forms.css'

function AddProduct() {
    const [productId, setProductId] = useState('')
    const [loading, setLoading] = useState(false)
    const setToast = useSetRecoilState(toastState)
    const navigate = useNavigate()
    const { userAddress } = useAuth()

    // Validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Product name is required')
            .max(250, 'Product name should be less than 250 characters'),
        price: Yup.string()
            .required('Price is required'),
        productId: Yup.string()
            .required('Product ID is required')
            .max(50, 'Product ID should be less than 50 characters'),
        manufacturingLocation: Yup.string()
            .required('Manufacturing location is required'),
        description: Yup.string()
            .required('Product description is required')
    })

    // Initial form values
    const initialValues = {
        name: '',
        price: '',
        productId: '',
        manufacturingLocation: '',
        description: ''
    }

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setLoading(true)

            // Store detailed product information in IPFS
            const productDetails = {
                name: values.name,
                price: values.price,
                description: values.description,
                specifications: values.specifications || '',
                dateAdded: new Date().toISOString(),
                addedBy: userAddress
            }

            // Upload to IPFS
            const ipfsHash = await ipfsService.addJSON(productDetails)

            // Register product on blockchain
            await blockchainService.registerProduct(
                values.productId,
                values.name, // Use name as manufacturer name for simplicity
                ipfsHash, // Store IPFS hash as product details
                values.manufacturingLocation
            )

            setProductId(values.productId)
            setToast('Product added successfully')
            setLoading(false)
            setSubmitting(false)

            // Navigate to QR code page
            navigate(`/qrcode/${values.productId}`)
        } catch (error) {
            console.error('Error adding product:', error)
            setToast('Failed to add product: ' + error.message)
            setLoading(false)
            setSubmitting(false)
        }
    }

    return (
        <section className="form-section">
            <div className="form-container">
                <div className="form-frame">
                    <div className="form-header">
                        <h2>Add Product</h2>
                    </div>

                    <div className="form-body">
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                        >
                            {({ isSubmitting }) => (
                                <FormikForm className="product-form">
                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Name</Form.Label>
                                            <Field
                                                type="text"
                                                name="name"
                                                placeholder="Product Name"
                                                className="form-control"
                                            />
                                            <ErrorMessage name="name" component="div" className="error-message" />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Price</Form.Label>
                                            <Field
                                                type="text"
                                                name="price"
                                                placeholder="Product Price"
                                                className="form-control"
                                            />
                                            <ErrorMessage name="price" component="div" className="error-message" />
                                        </Form.Group>
                                    </Row>

                                    <Row className="mb-3">
                                        <Form.Group as={Col}>
                                            <Form.Label>Product ID</Form.Label>
                                            <Field
                                                type="text"
                                                name="productId"
                                                placeholder="Unique Product ID"
                                                className="form-control"
                                            />
                                            <ErrorMessage name="productId" component="div" className="error-message" />
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
                                                placeholder="Product Description"
                                                className="form-control"
                                                rows="4"
                                            />
                                            <ErrorMessage name="description" component="div" className="error-message" />
                                        </Form.Group>
                                    </Row>

                                    <Button
                                        type="submit"
                                        className="submit-button"
                                        disabled={isSubmitting || loading}
                                    >
                                        {isSubmitting || loading ? 'Adding Product...' : 'Add Product'}
                                    </Button>
                                </FormikForm>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default AddProduct
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Row, Col, Button } from 'react-bootstrap'
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { useSetRecoilState } from 'recoil'
import { toastState } from '../store/atoms'
import '../styles/forms.css'

function AddProduct() {
    const [productId, setProductId] = useState('')
    const setToast = useSetRecoilState(toastState)
    const navigate = useNavigate()

    // Validation schema
    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Product name is required')
            .max(250, 'Product name should be less than 250 characters')
            .test('no-numbers', 'Numbers are not allowed in product name',
                value => value && !/\d/.test(value))
            .test('has-letters', 'Product name must contain letters',
                value => value && /[a-zA-Z]/.test(value)),
        price: Yup.string()
            .required('Price is required'),
        productId: Yup.string()
            .required('Product ID is required')
            .max(50, 'Product ID should be less than 50 characters'),
    })

    // Initial form values
    const initialValues = {
        name: '',
        price: '',
        productId: '',
    }

    // Handle form submission
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            // This is a placeholder - will be replaced with actual blockchain interaction
            console.log('Adding product:', values)

            // For now, just simulate success
            setTimeout(() => {
                setProductId(values.productId)
                setToast('Product added successfully')
                setSubmitting(false)
            }, 1000)
        } catch (error) {
            console.error('Error adding product:', error)
            setToast('Failed to add product')
            setSubmitting(false)
        }
    }

    // Redirect to QR code page after successful submission
    if (productId) {
        return navigate(`/qrcode/${productId}`)
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
                                                placeholder="Product ID"
                                                className="form-control"
                                            />
                                            <ErrorMessage name="productId" component="div" className="error-message" />
                                        </Form.Group>
                                    </Row>

                                    <Button
                                        type="submit"
                                        className="submit-button"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Adding Product...' : 'Add Product'}
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
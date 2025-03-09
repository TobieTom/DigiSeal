// src/pages/Login.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { loginState, userRoleState, toastState } from '../store/atoms'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext'
import '../styles/auth.css'

function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState)
    const [userRole, setUserRole] = useRecoilState(userRoleState)
    const setToast = useSetRecoilState(toastState)
    const [showSignup, setShowSignup] = useState(false)
    const { login, loading, error } = useAuth()

    // Get the page the user was trying to access before being redirected to login
    const from = location.state?.from?.pathname || '/dashboard'

    // Check if user is already logged in
    useEffect(() => {
        if (isLoggedIn) {
            setToast('Already logged in!')
            navigate('/dashboard')
        }
    }, [isLoggedIn, navigate, setToast])

    // Login validation schema
    const loginSchema = Yup.object({
        address: Yup.string().required('Address is required')
    })

    // Signup validation schema
    const signupSchema = Yup.object({
        address: Yup.string().required('Address is required'),
        name: Yup.string().required('Name is required'),
        role: Yup.string().required('Please select a role')
    })

    // Handle login submit
    const handleLoginSubmit = async (values, { setSubmitting }) => {
        try {
            // Connect using the auth context
            const result = await login(values.address)
            
            if (result.success) {
                setIsLoggedIn(true)
                // Default to 'consumer' role
                setUserRole('consumer')

                // Save to localStorage for persistence
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('userRole', 'consumer')

                setToast('Logged in successfully')
                navigate('/dashboard')
            } else {
                setToast('Login failed: ' + (result.error || 'Unknown error'))
            }
            setSubmitting(false)
        } catch (err) {
            console.error('Login error:', err)
            setToast('Login failed. Please try again.')
            setSubmitting(false)
        }
    }

    // Handle signup submit
    const handleSignupSubmit = async (values, { setSubmitting }) => {
        try {
            // Connect using the auth context
            const result = await login(values.address)
            
            if (result.success) {
                setIsLoggedIn(true)
                setUserRole(values.role)

                // Save to localStorage for persistence
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('userRole', values.role)
                localStorage.setItem('userName', values.name)

                setToast('Account created successfully')
                navigate('/dashboard')
            } else {
                setToast('Account creation failed: ' + (result.error || 'Unknown error'))
            }
            setSubmitting(false)
        } catch (err) {
            console.error('Signup error:', err)
            setToast('Registration failed. Please try again.')
            setSubmitting(false)
        }
    }

    return (
        <section className="auth-section">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h2>{showSignup ? 'Create an account' : 'Login'}</h2>
                        <p>{showSignup
                            ? 'Register your account and start verifying products'
                            : 'Connect to access the product verification system'}
                        </p>
                    </div>

                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${!showSignup ? 'active' : ''}`}
                            onClick={() => setShowSignup(false)}
                        >
                            Login
                        </button>
                        <button
                            className={`auth-tab ${showSignup ? 'active' : ''}`}
                            onClick={() => setShowSignup(true)}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="auth-error">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="auth-body">
                        {!showSignup ? (
                            // Login Form
                            <Formik
                                initialValues={{ address: '' }}
                                validationSchema={loginSchema}
                                onSubmit={handleLoginSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="auth-form">
                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Address</BootstrapForm.Label>
                                                <Field
                                                    type="text"
                                                    name="address"
                                                    placeholder="Enter your address"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="address" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Button
                                            type="submit"
                                            className="auth-submit-button"
                                            disabled={isSubmitting || loading}
                                        >
                                            {loading ? 'Connecting...' : 'Connect'}
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        ) : (
                            // Signup Form
                            <Formik
                                initialValues={{ address: '', name: '', role: 'consumer' }}
                                validationSchema={signupSchema}
                                onSubmit={handleSignupSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="auth-form">
                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Address</BootstrapForm.Label>
                                                <Field
                                                    type="text"
                                                    name="address"
                                                    placeholder="Enter your address"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="address" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Full Name</BootstrapForm.Label>
                                                <Field
                                                    type="text"
                                                    name="name"
                                                    placeholder="Enter your name"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="name" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Account Type</BootstrapForm.Label>
                                                <Field
                                                    as="select"
                                                    name="role"
                                                    className="form-control"
                                                >
                                                    <option value="consumer">Consumer</option>
                                                    <option value="seller">Seller</option>
                                                    <option value="manufacturer">Manufacturer</option>
                                                </Field>
                                                <ErrorMessage name="role" component="div" className="error-message" />
                                                <small className="form-text text-muted">
                                                    Manufacturer: Can create new products<br />
                                                    Seller: Can sell verified products<br />
                                                    Consumer: Can verify product authenticity
                                                </small>
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Button
                                            type="submit"
                                            className="auth-submit-button"
                                            disabled={isSubmitting || loading}
                                        >
                                            {loading ? 'Creating Account...' : 'Create Account'}
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login
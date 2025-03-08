// src/pages/Login.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { loginState, userRoleState, toastState } from '../store/atoms'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button } from 'react-bootstrap'
import '../styles/auth.css'

function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const [isLoggedIn, setIsLoggedIn] = useRecoilState(loginState)
    const [userRole, setUserRole] = useRecoilState(userRoleState)
    const setToast = useSetRecoilState(toastState)
    const [showSignup, setShowSignup] = useState(false)
    const [loading, setLoading] = useState(false)

    // Get the page the user was trying to access before being redirected to login
    const from = location.state?.from?.pathname || '/'

    // Check if user is already logged in
    useEffect(() => {
        if (isLoggedIn) {
            setToast('Already logged in!')
            navigate(from)
        }
    }, [isLoggedIn, navigate, from, setToast])

    // Login validation schema
    const loginSchema = Yup.object({
        walletAddress: Yup.string().required('Wallet address is required')
    })

    // Signup validation schema
    const signupSchema = Yup.object({
        walletAddress: Yup.string().required('Wallet address is required'),
        name: Yup.string().required('Name is required'),
        role: Yup.string().required('Please select a role')
    })

    // Handle login submit
    const handleLoginSubmit = async (values, { setSubmitting }) => {
        try {
            setLoading(true)
            // This is a placeholder for actual blockchain authentication
            console.log('Connecting wallet:', values.walletAddress)

            // Simulate successful login
            setTimeout(() => {
                setIsLoggedIn(true)
                // Default to 'consumer' role
                setUserRole('consumer')

                // Save to localStorage for persistence
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('userRole', 'consumer')

                setToast('Logged in successfully')
                setLoading(false)
                setSubmitting(false)
                navigate(from)
            }, 1500)
        } catch (error) {
            console.error('Login error:', error)
            setToast('Login failed. Please try again.')
            setLoading(false)
            setSubmitting(false)
        }
    }

    // Handle signup submit
    const handleSignupSubmit = async (values, { setSubmitting }) => {
        try {
            setLoading(true)
            // This is a placeholder for actual blockchain signup/registration
            console.log('Registering wallet:', values)

            // Simulate successful signup
            setTimeout(() => {
                setIsLoggedIn(true)
                setUserRole(values.role)

                // Save to localStorage for persistence
                localStorage.setItem('isLoggedIn', 'true')
                localStorage.setItem('userRole', values.role)

                setToast('Account created successfully')
                setLoading(false)
                setSubmitting(false)
                navigate(from)
            }, 1500)
        } catch (error) {
            console.error('Signup error:', error)
            setToast('Registration failed. Please try again.')
            setLoading(false)
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
                            ? 'Register your wallet and start verifying products'
                            : 'Connect your wallet to access the blockchain verification system'}
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

                    <div className="auth-body">
                        {!showSignup ? (
                            // Login Form
                            <Formik
                                initialValues={{ walletAddress: '' }}
                                validationSchema={loginSchema}
                                onSubmit={handleLoginSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="auth-form">
                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Wallet Address</BootstrapForm.Label>
                                                <Field
                                                    type="text"
                                                    name="walletAddress"
                                                    placeholder="Enter your wallet address"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="walletAddress" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Button
                                            type="submit"
                                            className="auth-submit-button"
                                            disabled={isSubmitting || loading}
                                        >
                                            {loading ? 'Connecting...' : 'Connect Wallet'}
                                        </Button>
                                    </Form>
                                )}
                            </Formik>
                        ) : (
                            // Signup Form
                            <Formik
                                initialValues={{ walletAddress: '', name: '', role: 'consumer' }}
                                validationSchema={signupSchema}
                                onSubmit={handleSignupSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="auth-form">
                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Wallet Address</BootstrapForm.Label>
                                                <Field
                                                    type="text"
                                                    name="walletAddress"
                                                    placeholder="Enter your wallet address"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="walletAddress" component="div" className="error-message" />
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
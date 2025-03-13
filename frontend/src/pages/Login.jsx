// src/pages/Login.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { loginState, userRoleState, toastState } from '../store/atoms'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button, Alert, Tabs, Tab } from 'react-bootstrap'
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
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().required('Password is required')
    })

    // Signup validation schema
    const signupSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email format').required('Email is required'),
        password: Yup.string().required('Password is required'),
        role: Yup.string().required('Please select a role')
    })

    // Handle traditional login
    const handleCredentialLogin = async (values, { setSubmitting }) => {
        try {
            // Store credentials in localStorage
            localStorage.setItem('user_email', values.email)
            localStorage.setItem('userName', values.name || 'User')
            
            // Set login state
            setIsLoggedIn(true)
            
            // For credential login, we'll use the selected role or default to consumer
            const role = 'consumer'
            setUserRole(role)
            localStorage.setItem('userRole', role)
            localStorage.setItem('isLoggedIn', 'true')
            
            setToast('Logged in successfully')
            navigate(from)
            
            setSubmitting(false)
        } catch (err) {
            console.error('Login error:', err)
            setToast('Login failed. Please try again.')
            setSubmitting(false)
        }
    }

    // Handle signup
    const handleSignup = async (values, { setSubmitting }) => {
        try {
            // Store credentials in localStorage
            localStorage.setItem('user_email', values.email)
            localStorage.setItem('userName', values.name)
            localStorage.setItem('userRole', values.role)
            localStorage.setItem('isLoggedIn', 'true')
            
            // Set login state
            setIsLoggedIn(true)
            setUserRole(values.role)
            
            setToast('Account created successfully')
            navigate('/dashboard')
            
            setSubmitting(false)
        } catch (err) {
            console.error('Signup error:', err)
            setToast('Registration failed. Please try again.')
            setSubmitting(false)
        }
    }

    // Handle wallet login
    const handleWalletLogin = async () => {
        try {
            // Connect using the auth context (existing functionality)
            const result = await login()
            
            if (result.success) {
                setIsLoggedIn(true)
                setUserRole(result.role || 'consumer')
                
                setToast('Connected successfully')
                navigate(from)
            } else {
                setToast('Connection failed: ' + (result.error || 'Unknown error'))
            }
        } catch (err) {
            console.error('Wallet login error:', err)
            setToast('Connection failed. Please try again.')
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
                            : 'Sign in to access the product verification system'}
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
                            // Login Section
                            <div>
                                <Tabs 
                                    defaultActiveKey="wallet" 
                                    className="mb-4 auth-method-tabs"
                                >
                                    <Tab eventKey="credentials" title="Email & Password">
                                        <Formik
                                            initialValues={{ email: '', password: '' }}
                                            validationSchema={loginSchema}
                                            onSubmit={handleCredentialLogin}
                                        >
                                            {({ isSubmitting }) => (
                                                <Form className="auth-form">
                                                    <Row className="mb-3">
                                                        <BootstrapForm.Group as={Col}>
                                                            <BootstrapForm.Label>Email</BootstrapForm.Label>
                                                            <Field
                                                                type="email"
                                                                name="email"
                                                                placeholder="Enter your email"
                                                                className="form-control"
                                                            />
                                                            <ErrorMessage name="email" component="div" className="error-message" />
                                                        </BootstrapForm.Group>
                                                    </Row>

                                                    <Row className="mb-3">
                                                        <BootstrapForm.Group as={Col}>
                                                            <BootstrapForm.Label>Password</BootstrapForm.Label>
                                                            <Field
                                                                type="password"
                                                                name="password"
                                                                placeholder="Enter your password"
                                                                className="form-control"
                                                            />
                                                            <ErrorMessage name="password" component="div" className="error-message" />
                                                        </BootstrapForm.Group>
                                                    </Row>

                                                    <Button
                                                        type="submit"
                                                        className="auth-submit-button"
                                                        disabled={isSubmitting || loading}
                                                    >
                                                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                                                    </Button>
                                                </Form>
                                            )}
                                        </Formik>
                                    </Tab>
                                    <Tab eventKey="wallet" title="Wallet Connect">
                                        <div className="wallet-login-container">
                                            <p className="text-center mb-4">
                                                Connect your blockchain wallet to access the system
                                            </p>
                                            <div className="d-grid gap-2">
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    onClick={handleWalletLogin}
                                                    disabled={loading}
                                                    className="wallet-connect-btn"
                                                >
                                                    <i className="bi bi-wallet2 me-2"></i>
                                                    {loading ? 'Connecting Wallet...' : 'Connect Wallet'}
                                                </Button>
                                            </div>
                                            <p className="wallet-note mt-3">
                                                <i className="bi bi-info-circle me-2"></i>
                                                You'll be prompted to connect your MetaMask or other Ethereum wallet
                                            </p>
                                        </div>
                                    </Tab>
                                </Tabs>
                            </div>
                        ) : (
                            // Signup Form
                            <Formik
                                initialValues={{ 
                                    name: '',
                                    email: '',
                                    password: '',
                                    role: 'consumer'
                                }}
                                validationSchema={signupSchema}
                                onSubmit={handleSignup}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="auth-form">
                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Full Name</BootstrapForm.Label>
                                                <Field
                                                    type="text"
                                                    name="name"
                                                    placeholder="Enter your full name"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="name" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Email</BootstrapForm.Label>
                                                <Field
                                                    type="email"
                                                    name="email"
                                                    placeholder="Enter your email"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="email" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Password</BootstrapForm.Label>
                                                <Field
                                                    type="password"
                                                    name="password"
                                                    placeholder="Create a password"
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="password" component="div" className="error-message" />
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
                                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
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
// src/pages/Profile.jsx
import { useState, useEffect } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { userRoleState, toastState } from '../store/atoms'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Form as BootstrapForm, Row, Col, Button, Card } from 'react-bootstrap'
// Import correct icons
import { BiUser, BiStore, BiBuildings, BiWallet, BiEdit, BiX } from 'react-icons/bi'
import Loader from '../components/common/Loader'
import '../styles/profile.css'

function Profile() {
    const [userRole, setUserRole] = useRecoilState(userRoleState)
    const setToast = useSetRecoilState(toastState)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        walletAddress: '',
        role: userRole
    })

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // This is a placeholder for actual blockchain data fetching
                // For now, we're using mock data
                setTimeout(() => {
                    setUserData({
                        name: 'John Doe',
                        email: 'john.doe@example.com',
                        walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
                        role: userRole
                    })
                    setLoading(false)
                }, 1000)
            } catch (error) {
                console.error('Error fetching user data:', error)
                setToast('Failed to load profile information')
                setLoading(false)
            }
        }

        fetchUserData()
    }, [userRole, setToast])

    // Validation schema for profile updates
    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required')
    })

    // Handle profile update
    const handleUpdateProfile = async (values, { setSubmitting }) => {
        try {
            setLoading(true)

            // This is a placeholder for actual profile update logic
            console.log('Updating profile:', values)

            // Simulate successful update
            setTimeout(() => {
                setUserData({
                    ...userData,
                    name: values.name,
                    email: values.email
                })

                setToast('Profile updated successfully')
                setLoading(false)
                setSubmitting(false)
                setIsEditing(false)
            }, 1500)
        } catch (error) {
            console.error('Error updating profile:', error)
            setToast('Failed to update profile')
            setLoading(false)
            setSubmitting(false)
        }
    }

    // Handle role change request
    const handleRoleChange = async (newRole) => {
        try {
            setLoading(true)

            // This is a placeholder for actual role change logic
            console.log('Changing role to:', newRole)

            // Simulate successful role change
            setTimeout(() => {
                setUserRole(newRole)
                setUserData({
                    ...userData,
                    role: newRole
                })

                // Save to localStorage
                localStorage.setItem('userRole', newRole)

                setToast(`Role changed to ${newRole} successfully`)
                setLoading(false)
            }, 1500)
        } catch (error) {
            console.error('Error changing role:', error)
            setToast('Failed to change role')
            setLoading(false)
        }
    }

    // Get role icon based on user role
    const getRoleIcon = (role) => {
        switch (role) {
            case 'manufacturer':
                return <BiBuildings size={24} />
            case 'seller':
                return <BiStore size={24} />
            default:
                return <BiUser size={24} />
        }
    }

    // Get role display name
    const getRoleName = (role) => {
        switch (role) {
            case 'manufacturer':
                return 'Manufacturer'
            case 'seller':
                return 'Seller'
            default:
                return 'Consumer'
        }
    }

    if (loading) {
        return <Loader />
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>My Profile</h1>
            </div>

            <div className="profile-content">
                <div className="profile-card">
                    <div className="profile-card-header">
                        <div className="profile-avatar">
                            {userData.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="profile-role">
                            <span className="role-badge">
                                {getRoleIcon(userData.role)}
                                {getRoleName(userData.role)}
                            </span>
                        </div>
                    </div>

                    {isEditing ? (
                        <div className="profile-edit">
                            <Formik
                                initialValues={{
                                    name: userData.name,
                                    email: userData.email
                                }}
                                validationSchema={validationSchema}
                                onSubmit={handleUpdateProfile}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="profile-form">
                                        <div className="form-header">
                                            <h3>Edit Profile</h3>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="close-button"
                                            >
                                                <BiX size={24} />
                                            </button>
                                        </div>

                                        <Row className="mb-3">
                                            <BootstrapForm.Group as={Col}>
                                                <BootstrapForm.Label>Full Name</BootstrapForm.Label>
                                                <Field
                                                    type="text"
                                                    name="name"
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
                                                    className="form-control"
                                                />
                                                <ErrorMessage name="email" component="div" className="error-message" />
                                            </BootstrapForm.Group>
                                        </Row>

                                        <div className="form-actions">
                                            <Button
                                                type="button"
                                                variant="outline-secondary"
                                                onClick={() => setIsEditing(false)}
                                                className="cancel-button"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                disabled={isSubmitting || loading}
                                                className="submit-button"
                                            >
                                                {isSubmitting || loading ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    ) : (
                        <>
                            <div className="profile-details">
                                <div className="profile-info">
                                    <div className="info-item">
                                        <label>Full Name</label>
                                        <p>{userData.name}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Email</label>
                                        <p>{userData.email}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Wallet Address</label>
                                        <p className="wallet-address">
                                            <BiWallet size={20} />
                                            {userData.walletAddress}
                                        </p>
                                    </div>
                                    <div className="profile-actions">
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => setIsEditing(true)}
                                            className="edit-button"
                                        >
                                            <BiEdit size={18} /> Edit Profile
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-roles">
                                <h3>Switch Role</h3>
                                <div className="roles-grid">
                                    <Card
                                        className={`role-card ${userData.role === 'consumer' ? 'active' : ''}`}
                                        onClick={() => handleRoleChange('consumer')}
                                    >
                                        <Card.Body>
                                            <div className="role-icon">
                                                <BiUser size={32} />
                                            </div>
                                            <Card.Title>Consumer</Card.Title>
                                            <Card.Text>
                                                Verify product authenticity and track ownership
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>

                                    <Card
                                        className={`role-card ${userData.role === 'seller' ? 'active' : ''}`}
                                        onClick={() => handleRoleChange('seller')}
                                    >
                                        <Card.Body>
                                            <div className="role-icon">
                                                <BiStore size={32} />
                                            </div>
                                            <Card.Title>Seller</Card.Title>
                                            <Card.Text>
                                                Sell, transfer ownership, and manage inventory
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>

                                    <Card
                                        className={`role-card ${userData.role === 'manufacturer' ? 'active' : ''}`}
                                        onClick={() => handleRoleChange('manufacturer')}
                                    >
                                        <Card.Body>
                                            <div className="role-icon">
                                                <BiBuildings size={32} />
                                            </div>
                                            <Card.Title>Manufacturer</Card.Title>
                                            <Card.Text>
                                                Register new products and track product lifecycle
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Profile
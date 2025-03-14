// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { userRoleState, toastState } from '../store/atoms';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Form as BootstrapForm, Row, Col, Button, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import blockchainService from '../services/BlockchainService';
import AuthService from '../services/AuthService'; // Added the import
import '../styles/profile.css';

function Profile() {
    const [userRole, setUserRole] = useRecoilState(userRoleState);
    const setToast = useSetRecoilState(toastState);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        walletAddress: '',
        role: userRole
    });
    const { logout, linkWallet } = useAuth();

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Get user data from the AuthService
                const user = await AuthService.getCurrentUser();
                
                if (user) {
                    setUserData({
                        name: user.name || '',
                        email: user.email || '',
                        walletAddress: user.walletAddress || '',
                        role: user.role || userRole
                    });
                } else {
                    // Fallback to local storage if API fails
                    setUserData({
                        name: localStorage.getItem('userName') || 'User',
                        email: localStorage.getItem('user_email') || '',
                        walletAddress: localStorage.getItem('userAddress') || '',
                        role: userRole
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data:', error);
                // Fallback to local storage on error
                setUserData({
                    name: localStorage.getItem('userName') || 'User',
                    email: localStorage.getItem('user_email') || '',
                    walletAddress: localStorage.getItem('userAddress') || '',
                    role: userRole
                });
                setToast('Failed to load profile information');
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userRole, setToast]);

    // Validation schema for profile updates
    const validationSchema = Yup.object({
        name: Yup.string().required('Name is required'),
        email: Yup.string().email('Invalid email').required('Email is required')
    });

    // Handle profile update
    const handleUpdateProfile = async (values, { setSubmitting }) => {
        try {
            setLoading(true);

            // This is a placeholder for actual profile update logic
            // In a real app, you would call an API endpoint to update the user profile
            console.log('Updating profile:', values);

            // Simulate successful update
            setTimeout(() => {
                setUserData({
                    ...userData,
                    name: values.name,
                    email: values.email
                });

                // Update local storage
                localStorage.setItem('userName', values.name);
                localStorage.setItem('user_email', values.email);

                setToast('Profile updated successfully');
                setLoading(false);
                setSubmitting(false);
                setIsEditing(false);
            }, 1500);
        } catch (error) {
            console.error('Error updating profile:', error);
            setToast('Failed to update profile');
            setLoading(false);
            setSubmitting(false);
        }
    };

    // Handle wallet linking
    const handleLinkWallet = async () => {
        try {
            setLoading(true);
            
            // Initialize blockchain service
            await blockchainService.init();
            
            // Get current wallet address
            const account = await blockchainService.getCurrentAccount();
            
            if (!account) {
                setToast('No wallet detected. Please make sure your wallet is connected.');
                setLoading(false);
                return;
            }
            
            // Link wallet to user account
            const result = await linkWallet(account);
            
            if (result.success) {
                setToast('Wallet linked successfully!');
                setUserData({
                    ...userData,
                    walletAddress: account
                });
                
                // Update local storage
                localStorage.setItem('userAddress', account);
            } else {
                setToast('Failed to link wallet: ' + (result.error || 'Unknown error'));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error linking wallet:', error);
            setToast('Error linking wallet: ' + (error.message || 'Unknown error'));
            setLoading(false);
        }
    };

    // Handle role change request
    const handleRoleChange = async (newRole) => {
        try {
            setLoading(true);

            // This is a placeholder for actual role change logic
            console.log('Changing role to:', newRole);

            // Simulate successful role change
            setTimeout(() => {
                setUserRole(newRole);
                setUserData({
                    ...userData,
                    role: newRole
                });

                // Save to localStorage
                localStorage.setItem('userRole', newRole);

                setToast(`Role changed to ${newRole} successfully`);
                setLoading(false);
            }, 1500);
        } catch (error) {
            console.error('Error changing role:', error);
            setToast('Failed to change role');
            setLoading(false);
        }
    };

    // Get role icon class
    const getRoleIconClass = (role) => {
        switch (role) {
            case 'manufacturer':
                return 'bi bi-building';
            case 'seller':
                return 'bi bi-shop';
            default:
                return 'bi bi-person';
        }
    };

    // Get role display name
    const getRoleName = (role) => {
        switch (role) {
            case 'manufacturer':
                return 'Manufacturer';
            case 'seller':
                return 'Seller';
            default:
                return 'Consumer';
        }
    };

    if (loading) {
        return <div className="loading-container">Loading profile data...</div>;
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
                                <i className={getRoleIconClass(userData.role)}></i>
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
                                                <i className="bi bi-x-lg"></i>
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
                                        {userData.walletAddress ? (
                                            <p className="wallet-address">
                                                <i className="bi bi-wallet2"></i>
                                                {userData.walletAddress}
                                            </p>
                                        ) : (
                                            <div className="wallet-action">
                                                <p className="text-muted">No wallet linked to your account</p>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={handleLinkWallet}
                                                    className="link-wallet-btn"
                                                >
                                                    <i className="bi bi-link-45deg me-1"></i> Link Wallet
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-actions">
                                        <Button
                                            variant="outline-primary"
                                            onClick={() => setIsEditing(true)}
                                            className="edit-button"
                                        >
                                            <i className="bi bi-pencil"></i> Edit Profile
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
                                                <i className="bi bi-person"></i>
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
                                                <i className="bi bi-shop"></i>
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
                                                <i className="bi bi-building"></i>
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
    );
}

export default Profile;
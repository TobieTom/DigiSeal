// src/AppRoutes.jsx
import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { loginState, userRoleState } from './store/atoms'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Loader from './components/common/Loader'
import ErrorBoundary from './components/common/ErrorBoundary'

// Lazy-loaded page components
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Profile = lazy(() => import('./pages/Profile'))
const ProductInfo = lazy(() => import('./pages/ProductInfo'))
const BuyProduct = lazy(() => import('./pages/BuyProduct'))
const AddProduct = lazy(() => import('./pages/AddProduct'))
const SellProduct = lazy(() => import('./pages/SellProduct'))
const ProductsList = lazy(() => import('./pages/ProductsList'))
const ScanQR = lazy(() => import('./pages/ScanQR'))
const QRCode = lazy(() => import('./pages/QRCode'))
const AddOwner = lazy(() => import('./pages/AddOwner'))
const RegisterSeller = lazy(() => import('./pages/RegisterSeller'))
const ReportCounterfeit = lazy(() => import('./pages/ReportCounterfeit'))

// Auth wrapper component
const RequireAuth = ({ children }) => {
    const isLoggedIn = useRecoilValue(loginState)
    const location = useLocation()

    if (!isLoggedIn) {
        // Redirect to login page but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return children
}

// Role-based access control wrapper
const RequireRole = ({ children, allowedRoles }) => {
    const userRole = useRecoilValue(userRoleState)
    const location = useLocation()

    if (!allowedRoles.includes(userRole)) {
        // If user doesn't have the required role, redirect to dashboard
        return <Navigate to="/dashboard" replace />
    }

    return children
}

function AppRoutes() {
    return (
        <Router>
            <Header />
            <main className="main-content">
                <ErrorBoundary>
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            {/* Public routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/scan" element={<ScanQR />} />
                            <Route path="/qrcode/:id" element={<QRCode />} />
                            <Route path="/product/:id" element={<ProductInfo />} />

                            {/* Dashboard - requires authentication */}
                            <Route
                                path="/dashboard"
                                element={
                                    <RequireAuth>
                                        <Dashboard />
                                    </RequireAuth>
                                }
                            />

                            {/* Protected routes (require authentication) */}
                            <Route
                                path="/profile"
                                element={
                                    <RequireAuth>
                                        <Profile />
                                    </RequireAuth>
                                }
                            />

                            <Route
                                path="/buy"
                                element={
                                    <RequireAuth>
                                        <BuyProduct />
                                    </RequireAuth>
                                }
                            />

                            {/* Routes that require manufacturer role */}
                            <Route
                                path="/add"
                                element={
                                    <RequireAuth>
                                        <RequireRole allowedRoles={['manufacturer']}>
                                            <AddProduct />
                                        </RequireRole>
                                    </RequireAuth>
                                }
                            />

                            {/* Routes that require seller or manufacturer role */}
                            <Route
                                path="/sell"
                                element={
                                    <RequireAuth>
                                        <RequireRole allowedRoles={['seller', 'manufacturer']}>
                                            <SellProduct />
                                        </RequireRole>
                                    </RequireAuth>
                                }
                            />

                            <Route
                                path="/products"
                                element={
                                    <RequireAuth>
                                        <RequireRole allowedRoles={['seller', 'manufacturer']}>
                                            <ProductsList />
                                        </RequireRole>
                                    </RequireAuth>
                                }
                            />

                            <Route
                                path="/addowner"
                                element={
                                    <RequireAuth>
                                        <RequireRole allowedRoles={['seller', 'manufacturer']}>
                                            <AddOwner />
                                        </RequireRole>
                                    </RequireAuth>
                                }
                            />

                            <Route
                                path="/registerSeller"
                                element={
                                    <RequireAuth>
                                        <RequireRole allowedRoles={['manufacturer']}>
                                            <RegisterSeller />
                                        </RequireRole>
                                    </RequireAuth>
                                }
                            />

                            <Route
                                path="/report/:id"
                                element={<ReportCounterfeit />}
                            />

                            {/* Fallback route - redirect to home page */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </Suspense>
                </ErrorBoundary>
            </main>
            <Footer />
        </Router>
    )
}

export default AppRoutes
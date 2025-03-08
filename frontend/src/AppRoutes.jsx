import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useRecoilValue } from 'recoil'
import { loginState } from './store/atoms'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Loader from './components/common/Loader'

// Lazy-loaded page components
const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const ProductInfo = lazy(() => import('./pages/ProductInfo'))
const BuyProduct = lazy(() => import('./pages/BuyProduct'))
const AddProduct = lazy(() => import('./pages/AddProduct'))
const SellProduct = lazy(() => import('./pages/SellProduct'))
const ProductsList = lazy(() => import('./pages/ProductsList'))
const ScanQR = lazy(() => import('./pages/ScanQR'))
const QRCode = lazy(() => import('./pages/QRCode'))
const AddOwner = lazy(() => import('./pages/AddOwner'))
const RegisterSeller = lazy(() => import('./pages/RegisterSeller'))

// Protected route component
const ProtectedRoute = ({ children }) => {
const isLoggedIn = useRecoilValue(loginState)

if (!isLoggedIn) {
    return <Navigate to="/login" replace />
}

return children
}

function AppRoutes() {
return (
    <Router>
    <Header />
    <main className="main-content">
        <Suspense fallback={<Loader />}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/scan" element={<ScanQR />} />
            <Route path="/qrcode/:id" element={<QRCode />} />
            <Route path="/product/:id" element={<ProductInfo />} />
            
            {/* Protected routes */}
            <Route 
            path="/buy" 
            element={
                <ProtectedRoute>
                <BuyProduct />
                </ProtectedRoute>
            } 
            />
            <Route 
            path="/add" 
            element={
                <ProtectedRoute>
                <AddProduct />
                </ProtectedRoute>
            } 
            />
            <Route 
            path="/sell" 
            element={
                <ProtectedRoute>
                <SellProduct />
                </ProtectedRoute>
            } 
            />
            <Route 
            path="/products" 
            element={
                <ProtectedRoute>
                <ProductsList />
                </ProtectedRoute>
            } 
            />
            <Route 
            path="/addowner" 
            element={
                <ProtectedRoute>
                <AddOwner />
                </ProtectedRoute>
            } 
            />
            <Route 
            path="/registerSeller" 
            element={
                <ProtectedRoute>
                <RegisterSeller />
                </ProtectedRoute>
            } 
            />
        </Routes>
        </Suspense>
    </main>
    <Footer />
    </Router>
)
}

export default AppRoutes